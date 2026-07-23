# 011 — Checkout displayed fabricated prices and coupons never reduced the bill

- **Category**: Integration (Frontend-Backend) / Bug Fix
- **Severity**: High
- **File(s) affected**:
  - `amoo-web/app/consultation/consultation-payment/page.tsx`
  - `amoo-web/app/consultation/consultation-payment/BookingSummary.tsx`
  - `amoo-web/app/consultation/consultation-payment/CouponCard.tsx`
  - `amoo-web/app/consultation/consultation-payment/BottomActionBar.tsx`
  - `amoo-web/app/consultation/lib/consultation-storage.ts`
  - `amoo-web/lib/api.ts`

## Problem

The checkout page had four independent components that each invented their own
version of the truth, and none of them agreed with the backend.

**1. The displayed total was fiction.** `BookingSummary` priced the booking from
a hardcoded map and applied an imaginary discount:

```tsx
const MODE_PRICES: Record<string, { price: number }> = {
  "Audio Call": { price: 499 },
  "Video Call": { price: 999 },
  Chat:         { price: 349 },
};
// ...
const pricing  = MODE_PRICES[mode] || MODE_PRICES["Video Call"];
const discount = Math.round(pricing.price * 0.1);        // invented 10%
const total    = pricing.price - discount;
```

rendered as:

```tsx
<span>Discount (FIRST10)</span>            {/* a coupon nobody entered */}
<span>- ₹{discount}</span>
<span>Total Amount</span> <span>₹{total}</span>
```

Meanwhile `BottomActionBar` charged `services.price` from the database, via
`POST /api/bookings` with `amount: 0` (server-priced) and then
`POST /api/payments/create-order`. **The number on the screen and the number
charged came from completely different sources** and matched only by
coincidence. It also promised a 10% discount labelled with a coupon code the
customer never applied. Charging a different amount than the one displayed at
checkout is a consumer-protection problem, not just a bug.

The summary also claimed a flat **"60 Minutes"** duration for every service,
ignoring `services.duration`.

**2. Coupons were decorative.** `CouponCard` called:

```tsx
const res: any = await api.validateCoupon(code.trim());
setApplied({ code: ..., savings: res?.discount ?? 0 });
```

and `api.validateCoupon` sent only the code:

```ts
validateCoupon: (code: string) => request("POST", "/api/coupons/validate", { code }),
```

But the backend computes the discount from the amount:

```js
const discount = amount
  ? (c.discount_type === "percent" ? (Number(amount) * Number(c.discount_value)) / 100 : Number(c.discount_value))
  : 0;                                    // ← no amount ⇒ always 0
```

So a valid coupon always returned `discount: 0`, and the UI cheerfully rendered
**"SUMMER20 Applied — You saved ₹0"**.

Worse, `POST /api/coupons/apply` — which is fully implemented, transactional,
idempotent per booking, and writes the discounted total back to
`bookings.amount` — **was never called from anywhere in the application**. Even a
correctly-previewed discount would not have reduced the charge. `CouponCard`
held its state locally, so `BottomActionBar` could not have known about it
anyway.

**3. A fabricated fallback booking.** Both the page and the action bar defaulted
to a complete, plausible booking:

```tsx
service: stored.service || urlParams.get("service") || "Reiki Healing Session",
mode:    stored.mode    || urlParams.get("mode")    || "Video Call",
date:    stored.date    || urlParams.get("date")    || "Tuesday, 10 June 2026",
time:    stored.time    || urlParams.get("time")    || "08:00 AM",
```

Anyone landing on `/consultation/consultation-payment` directly — a bookmark, a
back-button, a shared link, a crawler — saw a real-looking booking they had
never made, with a live Pay button that would have created and charged it.

**4. Errors went to `alert()`.** `alert(err.message || "Payment failed…")` —
blocking, unstyled, truncated on mobile, and impossible to style or test.

## Solution

One source of truth, resolved once, passed down.

`page.tsx` resolves the chosen service to its real row (`services.price`,
`services.duration`) and owns the coupon state. `BookingSummary` becomes purely
presentational. `CouponCard` receives the amount and lifts its result up.
`BottomActionBar` receives both and drives the payment.

**Ordering matters** in the pay flow, and the new sequence is deliberate:

1. `POST /api/bookings` — creates the booking at `services.price`
2. `POST /api/coupons/apply` — **rewrites `bookings.amount` inside a transaction**
3. `POST /api/payments/create-order` — prices the Razorpay order *from that column*
4. Razorpay checkout
5. `POST /api/payments/verify`

The coupon must be redeemed between steps 1 and 3, because `/apply` needs a
booking id (which does not exist before step 1) and `/create-order` reads the
amount it wrote (so it cannot run before step 2).

If `/apply` fails, the flow stops rather than silently charging full price after
the summary promised a saving.

The fallback booking is gone: with no selection in progress the page renders a
"No booking in progress" state linking back to `/consultation/select-service`.
If the service cannot be priced, it says so instead of guessing.

Errors render inline with `role="alert"`.

## Before / After

**Price — before** (`BookingSummary.tsx`)
```tsx
const MODE_PRICES = { "Audio Call": { price: 499 }, "Video Call": { price: 999 }, Chat: { price: 349 } };
const pricing  = MODE_PRICES[mode] || MODE_PRICES["Video Call"];
const discount = Math.round(pricing.price * 0.1);
const total    = pricing.price - discount;
```

**Price — after** (`page.tsx`, passed down as props)
```tsx
const price    = svc?.price ?? 0;                 // services.price
const discount = coupon?.discount ?? 0;           // from /api/coupons/validate
const total    = Math.max(0, Math.round((price - discount) * 100) / 100);
```

**Coupon preview — before / after** (`lib/api.ts`)
```diff
-validateCoupon: (code: string) => request("POST", "/api/coupons/validate", { code }),
+validateCoupon: (code: string, amount?: number) =>
+  request("POST", "/api/coupons/validate", { code, ...(amount != null ? { amount } : {}) }),
+
+applyCoupon: (code: string, bookingId: number) =>
+  request("POST", "/api/coupons/apply", { code, booking_id: bookingId }),
```

**Redemption — new** (`BottomActionBar.tsx`)
```tsx
const booking = await api.createBooking({ service_id: svc.id, /* … */ amount: 0 });

if (coupon) {
  setStatus("Applying coupon...");
  try {
    await api.applyCoupon(coupon.code, booking.id);
  } catch (couponErr) {
    throw new Error(
      `${(couponErr as Error)?.message || "Coupon could not be applied"}. ` +
        "Remove the coupon to continue at the full price."
    );
  }
}

const order = await api.createPaymentOrder({ booking_id: booking.id });   // now discounted
```

**Zero-discount coupons — new**
```tsx
if (discount <= 0) {
  setError("This coupon gives no discount on the current amount.");
  onChange(null);
  return;
}
```

**Fallback booking — before / after**
```diff
-service: stored.service || urlParams.get("service") || "Reiki Healing Session",
-date:    stored.date    || urlParams.get("date")    || "Tuesday, 10 June 2026",
+const service = stored.service || url.get("service") || "";
+const date    = stored.date    || url.get("date")    || "";
+if (!service || !date || !time) return null;      // → "No booking in progress"
```

**Errors — before / after**
```diff
-alert(err.message || "Payment failed. Please try again.");
+setError(message);   // rendered inline with role="alert"
```

Also: the selection is now cleared from browser storage on success
(`clearConsultationData()`, see change 012), and the params are read in a
`useEffect` rather than a `useState` initialiser — reading `window.location` and
`sessionStorage` during render produced different HTML on the server than the
client (a hydration mismatch).

## Testing notes

`tsc --noEmit` clean; production build passes.

Manual, against a seeded database:

```bash
npm run seed   # services with real prices, and coupon codes if seeded
```

1. **Price matches.** Go through `/consultation/select-service` → date/time →
   payment. The "Consultation Fee" and "Pay ₹… Securely" button must both equal
   `SELECT price FROM services WHERE id = <chosen>`. Previously the page showed
   ₹999/₹899 for everything.
2. **No phantom discount.** With no coupon entered, the summary must show **no**
   "Discount (FIRST10)" line and Total == Fee.
3. **Coupon preview is real.** Create a 20% coupon, enter it: the saving shown
   must be 20% of the actual service price, not ₹0.
4. **Coupon actually reduces the charge** — the important one:
   ```sql
   SELECT amount FROM bookings WHERE id = <new booking>;   -- discounted
   SELECT * FROM coupon_usages WHERE booking_id = <id>;    -- one row
   ```
   and the Razorpay order amount (devtools → `create-order` response) must equal
   the discounted total × 100 paise.
5. **Direct navigation.** Open `/consultation/consultation-payment` in a fresh
   private window. It must render "No booking in progress" with a link back —
   previously it showed a bookable "Reiki Healing Session, Tuesday, 10 June 2026".
6. **Coupon failure path.** Apply a coupon, then exhaust/deactivate it in the DB
   before pressing Pay: an inline error appears and no payment order is created.
   The booking row exists in `pending-payment` — expected, and cancellable.

## Risk / impact

- **An orphaned booking is created if the user abandons Razorpay.** That was
  already true before this change (step 1 has always preceded checkout). Such
  rows sit in `status='pending-payment'`, `payment='Pending'` and are harmless,
  but they accumulate. Consider a cron to cancel `pending-payment` bookings older
  than ~1 hour and release their slots. Flagged in the final report; not added
  here because the timeout is a business decision.
- **`/api/coupons/apply` is idempotent per booking** (UNIQUE on
  `coupon_usages.booking_id`), so a retried pay attempt on the same booking
  returns 409 rather than stacking discounts. The flow creates a fresh booking
  per attempt, so users are not blocked.
- **Coupon codes are still not restricted per user or per service.** The backend
  supports `max_uses` globally and `min_amount`, but not "one per customer".
  Worth adding before running a real promotion — noted in the final report.
- **`MODE_PRICES` is gone**, so mode no longer affects price. It never did on
  the backend (`services.price` is per-service, and `mode` is only stored on the
  booking), so this removes a discrepancy rather than a feature. If audio/video/
  chat should genuinely cost different amounts, model them as separate `services`
  rows or add a mode multiplier server-side — do not reintroduce a client-side
  price table.
