# 004 — Email links pointed at the API origin instead of the website

- **Category**: Bug Fix / Integration (Frontend-Backend)
- **Severity**: High
- **File(s) affected**:
  - `amoo-backend/src/config/env.js`
  - `amoo-backend/src/routes/auth.js`
  - `amoo-backend/src/services/email.js`
  - `amoo-backend/.env.example`

## Problem

`POST /api/auth/verify-email/send` built the confirmation link from `APP_URL`:

```js
const link = `${env.appUrl}/verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;
```

`APP_URL` is documented in `.env.example` as *"Public base URL of this API"* and
defaults to `http://localhost:4000` — the **Express** origin. But
`/verify-email` is a Next.js page (`amoo-web/app/verify-email/page.tsx`) served
from a different origin (`:3000` in dev, a separate host in production).

So the generated link was `http://localhost:4000/verify-email?...`, which hits
the API's catch-all `404 Not found` handler. **Every verification email ever
sent contained a dead link**, and no user could complete email verification
through the intended flow.

This is not cosmetic. `middleware/auth.js` exposes `verifiedRequired`, which
gates `POST /api/bookings` and `POST /api/payments`. A user who cannot verify
their email **cannot make a booking or a payment at all** — the broken link sits
directly across the revenue path.

The same mistake was in `services/email.js`, where the notification template's
"View in Dashboard" button also used `appUrl`:

```js
const appUrl = opts.appUrl || env.appUrl || "https://amooguru.com";
// ...
`<a href="${appUrl}/user-dashboard" class="btn">View in Dashboard</a>`
```

`/user-dashboard` is likewise a frontend route, so that button 404'd too.

There was no configuration value for the frontend's public URL anywhere in the
backend — the concept simply did not exist.

## Solution

Add `env.clientUrl`, the public base URL of the Next.js app, and use it for
every link a **human** clicks. `appUrl` keeps its correct meaning (the API's own
address, for webhook callbacks).

`CLIENT_URL` defaults to the first non-wildcard entry of the existing
`CLIENT_ORIGIN` list. That is deliberate: `CLIENT_ORIGIN` must already name the
exact frontend origin for CORS to work, so a correctly-configured deployment
gets a correct email link with no extra variable to set — while still allowing
an explicit override when the browser origin and the public link origin differ
(e.g. behind a marketing domain).

A boot-time guard refuses to start in production if `clientUrl` still resolves
to localhost, so this class of failure surfaces at deploy time rather than in
users' inboxes. It matches the existing guards for `JWT_SECRET`,
`CLIENT_ORIGIN` and `PAYMENT_GATEWAY`.

## Before / After

**Before** — `config/env.js`
```js
// Public base URL of this API (used for links in emails, webhooks, etc.)
appUrl: required("APP_URL", `http://localhost:${required("PORT", 4000)}`),
```
*(the comment conflated two different things: webhook callbacks and email links)*

**After** — `config/env.js`
```js
// Public base URL of this API (webhook callbacks, absolute asset URLs).
appUrl: required("APP_URL", `http://localhost:${required("PORT", 4000)}`),

// Public base URL of the Next.js frontend. Every link a human clicks in an
// email must point here, NOT at appUrl.
clientUrl: (process.env.CLIENT_URL ||
  (required("CLIENT_ORIGIN", "*")
    .split(",").map((s) => s.trim()).filter((s) => s && s !== "*")[0]) ||
  "http://localhost:3000").replace(/\/$/, ""),
```

```js
if (env.isProd && /localhost|127\.0\.0\.1/.test(env.clientUrl)) {
  throw new Error(
    "CLIENT_URL (or the first CLIENT_ORIGIN entry) must be the public frontend URL in production, not localhost"
  );
}
```

**Before / After** — `routes/auth.js`
```diff
-const link = `${env.appUrl}/verify-email?email=...&token=${token}`;
+const link = `${env.clientUrl}/verify-email?email=...&token=${token}`;
```

**Before / After** — `services/email.js`
```diff
-const appUrl = opts.appUrl || env.appUrl || "https://amooguru.com";
+const appUrl = opts.appUrl || env.clientUrl || "https://amooguru.com";
```

## Testing notes

```bash
# dev: CLIENT_ORIGIN=http://localhost:3000,http://localhost:3001
curl -X POST $API/api/auth/verify-email/send -H "$AUTH" -H "$CSRF"
```

With `EMAIL_ENABLED=false` the response carries `dev_token`; check the server
log line for the composed link, or temporarily log it. It must read
`http://localhost:3000/verify-email?email=...` — port **3000**, not 4000.

Then follow the link end-to-end: the Next.js page reads `email` and `token` from
the query string, calls `POST /api/auth/verify-email`, and should render
"Email Verified!". Confirm `users.verified` flips to `1`.

Production guard:
```bash
NODE_ENV=production CLIENT_ORIGIN=http://localhost:3000 node src/server.js
# => Error: CLIENT_URL (or the first CLIENT_ORIGIN entry) must be the public frontend URL in production, not localhost
```

## Risk / impact

- **New boot-time failure mode.** A production deploy whose `CLIENT_ORIGIN` is
  only `*` or localhost will now refuse to start. That is intended — it was
  previously "starting fine while silently mailing dead links" — but it means
  the deploy checklist must set `CLIENT_ORIGIN` (and optionally `CLIENT_URL`)
  correctly. Added to `.env.example` and the manual-steps list in the final
  report.
- **Trailing slashes** are stripped, so `CLIENT_URL=https://amooguru.com/`
  and `https://amooguru.com` behave identically.
- **`APP_URL` is now genuinely unused for links.** It remains meaningful for
  gateway webhook registration. Left in place rather than removed.
- **Double-check**: any user who registered before this fix is still
  `verified = 0` and cannot book. They can request a fresh verification email
  from the dashboard banner (`VerifyEmailBanner.tsx`), which now generates a
  working link. If you want to unblock them in bulk, that is a data decision —
  do not blanket-set `verified = 1` without deciding whether unverified
  addresses are acceptable.
