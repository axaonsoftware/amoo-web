# 005 — Make payment verification atomic, ownership-checked and race-safe

- **Category**: Bug Fix / Security
- **Severity**: High
- **File(s) affected**: `amoo-backend/src/routes/payments.js`

## Problem

`POST /api/payments/verify` is what the browser calls after a successful
Razorpay checkout. It had three defects.

**1. The payment was settled outside the transaction.**

```js
// Update transaction ID
await pool.query(                                    // ← NOT in a transaction
  "UPDATE payments SET status = 'success', txn_id = ? WHERE id = ? AND status != 'success'",
  [razorpay_payment_id, payment.id]
);

const conn = await pool.getConnection();
try {
  await conn.beginTransaction();                     // ← transaction starts here
  if (payment.booking_id) {
    await conn.query("UPDATE bookings SET payment = 'Paid', status = 'upcoming' WHERE id = ?", ...);
  }
  // ...
  await conn.commit();
} catch (err) {
  await conn.rollback();                             // ← cannot undo the write above
```

The `payments` row was flipped to `success` *before* `beginTransaction()`, on a
different connection. If anything in the transaction then failed — a deadlock, a
constraint error, a dropped connection — the rollback reverted the booking
update but left the payment marked successful.

Result: **the customer is charged, the system records the payment as complete,
and the booking stays `pending-payment` / `Pending`.** The customer sees an
unpaid booking; reconciliation shows revenue with no service attached. Nothing
retries, because the idempotency check (`status === 'success'`) now short-
circuits every subsequent attempt.

**2. No ownership check.** The handler verified the HMAC signature, then acted
on whatever payment matched `gateway_order_id`. The signature proves *Razorpay*
authorised that order — not that the caller owns it. Any authenticated user who
obtained another customer's `razorpay_order_id` / `payment_id` / `signature`
triple (browser history on a shared machine, a shoulder-surfed devtools panel, a
leaked support screenshot) could settle that customer's booking from their own
session.

**3. Two concurrent verifies could both proceed.** The `SELECT` used
`pool.query` with no row lock. A double-clicked button, or a verify racing the
gateway webhook, could have both callers read `status = 'pending'` and both run
the activation block — double-granting `role = 'premium'` and re-running the
subscription activation.

## Solution

One connection, one transaction, for the whole handler. The `SELECT ... FOR
UPDATE` acquires a row lock so the second concurrent caller blocks until the
first commits, then reads `status = 'success'` and takes the already-processed
branch.

The ownership check compares `payments.user_id` against the caller (admins
exempt, matching the pattern used by `/api/payments` and `/api/bookings/:id`).

Every early return now rolls back explicitly before responding, so no
connection is returned to the pool holding an open transaction.

## Before / After

**Before**
```js
const [p] = await pool.query(
  "SELECT id, booking_id, subscription_id, status, amount FROM payments WHERE gateway_order_id = ?",
  [razorpay_order_id]
);
if (!p.length) return fail(res, 404, "Payment order not found");
const payment = p[0];

if (payment.status === "success") {
  return ok(res, { id: payment.id, status: "success", already_processed: true });
}

await pool.query(                                          // ← outside the txn
  "UPDATE payments SET status = 'success', txn_id = ? WHERE id = ? AND status != 'success'",
  [razorpay_payment_id, payment.id]
);

const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  // ... booking / subscription updates ...
  await conn.commit();
} catch (err) { await conn.rollback(); throw err; }
finally { conn.release(); }
```

**After**
```js
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();

  const [p] = await conn.query(
    "SELECT id, user_id, booking_id, subscription_id, status, amount FROM payments WHERE gateway_order_id = ? FOR UPDATE",
    [razorpay_order_id]
  );
  if (!p.length) { await conn.rollback(); return fail(res, 404, "Payment order not found"); }
  const payment = p[0];

  if (req.user.kind !== "admin" && payment.user_id && payment.user_id !== req.user.id) {
    await conn.rollback();
    return fail(res, 403, "Forbidden");
  }

  if (payment.status === "success") {
    await conn.rollback();
    return ok(res, { id: payment.id, status: "success", already_processed: true });
  }

  await conn.query(
    "UPDATE payments SET status = 'success', txn_id = ? WHERE id = ? AND status != 'success'",
    [razorpay_payment_id, payment.id]
  );
  // ... booking / subscription updates, same connection ...

  await conn.commit();
  req.audit("verify-payment", "payment", payment.id, { razorpay_order_id, razorpay_payment_id });
  ok(res, { id: payment.id, status: "success" });
} catch (err) { await conn.rollback(); throw err; }
finally { conn.release(); }
```

## Testing notes

Atomicity is hard to trigger from outside; verify by inspection of the diff plus
a fault injection run:

```js
// temporarily, after the payments UPDATE inside the transaction:
if (process.env.FAULT_INJECT === "1") throw new Error("boom");
```
Then run a checkout with `FAULT_INJECT=1`. Assert afterwards that
`payments.status` is still `'pending'` (previously it would read `'success'`)
and the booking is still `pending-payment` — i.e. the whole unit rolled back.

Ownership (repeatable without the gateway, using a real signature captured from
a sandbox checkout by user A):
```bash
curl -X POST $API/api/payments/verify -H "$AUTH_USER_B" -H "$CSRF" \
  -d '{"razorpay_order_id":"<A-order>","razorpay_payment_id":"<A-pay>","razorpay_signature":"<A-sig>"}'
# => 403 Forbidden      (was: 200, and A's booking settled from B's session)
```

Concurrency:
```bash
# fire two identical verifies at once
seq 2 | xargs -P2 -I{} curl -s -X POST $API/api/payments/verify -H "$AUTH" -H "$CSRF" -d "$BODY"
# => one { status: "success" }, one { already_processed: true }
# and exactly ONE row in audit_log with action = 'verify-payment'
```

Backend `npm test` (27 existing tests) still passes.

## Risk / impact

- **Longer lock hold.** The transaction now spans the gateway-independent DB
  work (4–6 statements). It holds a row lock on one `payments` row plus the
  related booking/subscription. No external HTTP call happens inside it, so the
  window stays sub-millisecond in practice.
- **`payment.user_id` may be NULL** on rows created before `user_id` was
  populated. The check is written `payment.user_id && payment.user_id !== req.user.id`
  so legacy rows are not locked out; they fall back to the previous
  signature-only behaviour. If you have no such rows, tighten it to reject NULL.
- **The webhook path (`POST /api/payments/webhook`) still has its own copy of
  the activation logic.** It was already correctly transactional. The duplication
  between `/verify` and the webhook is a refactor opportunity (one shared
  `settlePayment(conn, payment)` function) — flagged, not done here, to keep this
  change reviewable.
- **Double-check**: reconcile historical data for the failure this caused —
  `SELECT p.id, p.status, b.payment, b.status FROM payments p JOIN bookings b ON b.id = p.booking_id WHERE p.status = 'success' AND b.payment <> 'Paid';`
  Any rows returned are customers who paid but whose booking was never
  activated.
