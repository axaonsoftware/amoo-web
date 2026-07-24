# 015 — Booking cancellation had no guards; `auto_renew` was silently discarded

- **Category**: Bug Fix
- **Severity**: Medium
- **File(s) affected**:
  - `amoo-backend/src/routes/bookings.js`
  - `amoo-backend/src/routes/subscriptions.js`
  - `amoo-backend/src/middleware/validate.js`
  - `amoo-backend/src/routes/activity.js`

## 15a. `DELETE /api/bookings/:id` cancelled anything, repeatedly, and forgot about refunds

### Problem

```js
const [rows] = await pool.query("SELECT user_id, slot_id FROM bookings WHERE id = ?", [req.params.id]);
if (assertFound(res, rows[0])) return;
if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) return fail(res, 403, "Forbidden");

if (rows[0].slot_id) {
  await pool.query("UPDATE slots SET status = 'available' WHERE id = ?", [rows[0].slot_id]);
}
await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
ok(res, { id: Number(req.params.id), cancelled: true });
```

Four problems:

1. **A completed booking could be cancelled.** The consultation has already been
   delivered. Cancelling it corrupts reporting (it drops out of every
   `status != 'cancelled'` aggregate in `dashboard.js`) and misrepresents what
   happened.

2. **Re-cancelling re-released the slot.** No check for an existing
   `cancelled` status, and the slot update was unconditional. Sequence:
   user cancels booking A (slot 5 → `available`) → user B books slot 5 (→
   `booked`) → user A hits Cancel again (double-click, stale tab, retry) → slot
   5 is forced back to `available` while B still holds a booking against it.
   Slot 5 can then be double-booked.

3. **No transaction and no row lock.** The two updates were separate statements
   on the pool. A double-click ran both paths concurrently.

4. **A paid booking was cancelled with no refund path.** `payment` was not even
   read. The customer's money stayed with the platform and nothing recorded that
   anything was owed — no flag, no audit detail, no notification. Silent
   financial loss to the customer.

### Solution

One transaction, `SELECT ... FOR UPDATE` for the row lock, plus explicit state
guards. The slot release is conditioned on `status = 'booked'` so it can only
ever free a slot this booking actually holds.

Refunds move real money through the gateway and are admin-only
(`POST /api/payments/:id/refund`), so this route cannot settle one itself. It
therefore **surfaces the obligation** rather than dropping it: the response
carries `refund_due`, the audit entry records `was_paid` and `amount`, and the
message tells the customer a refund is coming.

### Before / After

```diff
-const [rows] = await pool.query("SELECT user_id, slot_id FROM bookings WHERE id = ?", [req.params.id]);
-if (assertFound(res, rows[0])) return;
-if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) return fail(res, 403, "Forbidden");
-
-if (rows[0].slot_id) {
-  await pool.query("UPDATE slots SET status = 'available' WHERE id = ?", [rows[0].slot_id]);
-}
-await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
-ok(res, { id: Number(req.params.id), cancelled: true });
+const conn = await pool.getConnection();
+try {
+  await conn.beginTransaction();
+  const [rows] = await conn.query(
+    "SELECT id, user_id, slot_id, status, payment, amount FROM bookings WHERE id = ? FOR UPDATE",
+    [req.params.id]
+  );
+  const booking = rows[0];
+  if (!booking) { await conn.rollback(); return fail(res, 404, "Resource not found"); }
+  if (req.user.kind !== "admin" && booking.user_id !== req.user.id) {
+    await conn.rollback(); return fail(res, 403, "Forbidden");
+  }
+
+  if (booking.status === "cancelled") {
+    await conn.rollback();
+    return ok(res, { id: booking.id, cancelled: true, already_cancelled: true });
+  }
+  if (booking.status === "completed") {
+    await conn.rollback();
+    return fail(res, 409, "A completed booking cannot be cancelled. Request a refund instead.");
+  }
+
+  if (booking.slot_id) {
+    await conn.query(
+      "UPDATE slots SET status = 'available' WHERE id = ? AND status = 'booked'",
+      [booking.slot_id]
+    );
+  }
+  await conn.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [booking.id]);
+  await conn.commit();
+
+  req.audit("cancel", "booking", booking.id, { was_paid: booking.payment === "Paid", amount: booking.amount });
+
+  const refundDue = booking.payment === "Paid";
+  ok(res, {
+    id: booking.id, cancelled: true, refund_due: refundDue,
+    message: refundDue
+      ? "Booking cancelled. A refund is due and will be processed by our team."
+      : "Booking cancelled.",
+  });
+} catch (err) { await conn.rollback(); throw err; }
+finally { conn.release(); }
```

### Testing notes

```bash
# completed booking is protected
mysql> UPDATE bookings SET status='completed' WHERE id=1;
curl -X DELETE $API/api/bookings/1 -H "$AUTH" -H "$CSRF"
# => 409 A completed booking cannot be cancelled. Request a refund instead.

# double cancel is idempotent and does NOT re-free the slot
curl -X DELETE $API/api/bookings/2 -H "$AUTH" -H "$CSRF"   # {cancelled:true}
mysql> UPDATE slots SET status='booked' WHERE id=<that slot>;   -- simulate a re-book
curl -X DELETE $API/api/bookings/2 -H "$AUTH" -H "$CSRF"   # {already_cancelled:true}
mysql> SELECT status FROM slots WHERE id=<that slot>;      -- still 'booked'  ✅

# a paid cancellation flags the refund
curl -X DELETE $API/api/bookings/3 -H "$AUTH" -H "$CSRF"
# => { cancelled: true, refund_due: true, message: "... A refund is due ..." }
mysql> SELECT meta FROM audit_log WHERE action='cancel' ORDER BY id DESC LIMIT 1;
-- {"was_paid": true, "amount": "999.00"}
```

---

## 15b. `auto_renew` was read by the handler but stripped by the validator

### Problem

`POST /api/subscriptions` destructured it:

```js
const { package_id, plan_name, duration_days, auto_renew } = req.body;
// ...
[req.user.id, package_id || null, name, expires, status, auto_renew ? 1 : 0]
```

but the Joi schema did not declare it:

```js
subscription: Joi.object({
  package_id: optionalNumber.integer().positive(),
  plan_name: optionalString.max(120),
  duration_days: optionalNumber.integer().positive(),
}),          // ← no auto_renew
```

and `validate()` runs with `stripUnknown: true`:

```js
const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
req.body = value;
```

So Joi deleted the key before the handler ever saw it. `auto_renew` was
`undefined` on every request and the column was always written as `0`. **No user
could ever enable auto-renew**, and the API reported success while ignoring the
setting.

This is the failure mode worth remembering from this codebase: with
`stripUnknown: true`, a field missing from the schema is not "unvalidated", it is
**silently deleted**. The same class of bug hit the profile fields (migration
005's comment records it) and would have hit the new admin PATCH schemas in
change 007 had they omitted a column.

### Solution

```diff
 subscription: Joi.object({
   package_id: optionalNumber.integer().positive(),
   plan_name: optionalString.max(120),
   duration_days: optionalNumber.integer().positive(),
+  auto_renew: Joi.boolean().default(false),
 }),
```

Plus a `subscriptionUpdate` schema for the previously-unvalidated admin PATCH
(see change 007), which accepts `auto_renew`, `status`, `plan_name` and
`expires_at`.

### Testing notes

```bash
curl -X POST $API/api/subscriptions -H "$AUTH" -H "$CSRF" \
     -d '{"package_id":1,"auto_renew":true}'
mysql> SELECT auto_renew FROM subscriptions ORDER BY id DESC LIMIT 1;
-- 1        (was always 0)

# omitted still defaults to off
curl -X POST $API/api/subscriptions -H "$AUTH" -H "$CSRF" -d '{"package_id":1}'
-- 0
```

---

## 15c. `POST /api/activity/log` had no validation

### Problem

The route hand-checked one field and accepted everything else:

```js
const { action, action_details, page_or_route } = req.body;
if (!action || typeof action !== "string") {
  return fail(res, 400, "`action` (string) is required");
}
logAudit({ ..., meta: action_details || {}, page_or_route: page_or_route || null });
```

`action` had no length bound (the column is `VARCHAR(60)`), `action_details` was
serialised into a JSON column unbounded, and `page_or_route` was unbounded
against `VARCHAR(255)`.

This mattered little while every call to this endpoint was being rejected by the
CSRF guard (change 010) — but that is now fixed, so the endpoint receives a
request on every page view of every signed-in user.

### Solution

```js
activityLog: Joi.object({
  action: Joi.string().min(1).max(60).required(),
  action_details: Joi.object().max(30).unknown(true).default({}),
  page_or_route: optionalString.max(255),
}),
```

`.unknown(true)` keeps the payload free-form (it is analytics) while `.max(30)`
caps the number of keys, and the string bounds match the column widths.

### Testing notes

```bash
curl -X POST $API/api/activity/log -H "$AUTH" -H "$CSRF" \
     -d '{"action":"'"$(head -c 200 /dev/zero | tr '\0' 'x')"'"}'
# => 400 "action" length must be less than or equal to 60 characters long

curl -X POST $API/api/activity/log -H "$AUTH" -H "$CSRF" \
     -d '{"action":"page_view","page_or_route":"/user-dashboard"}'
# => 200 {"logged":true}
```

## Risk / impact

- **15a**: `refund_due: true` is currently only reported, not acted on. A paid
  cancellation still requires an admin to run
  `POST /api/payments/:id/refund` manually. Wiring an automatic refund (or an
  admin notification) is the natural follow-up — flagged in the final report.
  The frontend does not yet surface `refund_due`; `ActionButtons.tsx` on the
  confirmation page shows a generic cancel result.
- **15a**: cancelling is still allowed for `upcoming` bookings with no time
  restriction. A real cancellation policy (e.g. no cancellation within 24h of
  the slot) is a business rule that has not been specified.
- **15b**: `auto_renew` is now stored honestly, but **nothing acts on it**. The
  `expire-subscriptions` cron marks expired subscriptions and downgrades users
  regardless of the flag; there is no renewal charge. Storing it correctly is a
  prerequisite for that work, not the work itself. Flagged in the final report.
- **15c**: existing clients send only `action`, `action_details` and
  `page_or_route`, all within the new bounds — verified against `lib/tracking.ts`.
