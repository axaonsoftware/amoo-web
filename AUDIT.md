# Amoo Guru — Full-Stack Audit

**Audited:** 23 July 2026 against `main` @ `20e75cb`
**Scope:** `amoo-web/` (Next.js — main site, user dashboard, admin dashboard) + `amoo-backend/` (Express + MySQL)

> Build, type-check, and backend test results in this document were **executed**, not inferred.
> `D1` is reasoned from reading `schema.sql` and could **not** be executed — no MySQL instance was available. Verify it against an empty database before trusting it either way.
> `Website/` contains 45 PNG design mockups and no code. All three frontend surfaces live in the single Next.js app.

---

## The headline

Your manager left you a **genuinely competent backend** — 22 route modules, ~100 endpoints, real transactions with row locking, bcrypt, audit logging, working Razorpay integration, thorough indexes. That is not the problem.

**The problem is that the frontend and backend were never actually connected.** The frontend never sends the auth token the backend requires, so every logged-in feature returns 401. And `npm run build` currently fails, so the app cannot be deployed at all.

Both are fixable in days, not weeks — but nothing else on this list matters until they are.

| Count | Category                                            |
| ----: | --------------------------------------------------- |
|     6 | Launch blockers                                     |
|    10 | Security issues                                     |
|    10 | Logic & data bugs                                   |
|     8 | Infra gaps                                          |
|    43 | Backend tests passing (27 unit + 16/18 integration) |
|  ~130 | Frontend components wired to the API                |

---

# ❌ Launch blockers

_Each one independently prevents the product from functioning or from being deployed._

## B1 — The frontend never sends the auth token, so every logged-in feature 401s

**This is the single most important finding.**

The backend only accepts credentials via an `Authorization: Bearer <token>` request header (`amoo-backend/src/middleware/auth.js:31-36`). Login correctly returns a token in the response body (`amoo-backend/src/routes/auth.js:136`) — but `amoo-web/lib/api.ts` throws it away. It sets only `Content-Type` and relies on `credentials: "include"`, which sends cookies, not the header.

I grepped the entire frontend for `Authorization`, `Bearer`, `localStorage` and `sessionStorage` token handling: **zero matches.** The token is never stored anywhere.

**User-visible symptom:** a login loop. You sign in, it appears to succeed, then `/api/auth/me` returns 401 → the client silently refreshes → retries _still without the header_ → 401 again → redirects you back to the login page.

**Recommended fix:** have the backend set the access token as an `httpOnly` cookie at login (alongside the refresh cookie it already sets), and teach `extractToken()` to read that cookie. This is less work than threading a header through the client, and it's more secure — JavaScript can't read an httpOnly cookie, so an XSS bug can't steal the token.

> ⚠️ **Caveat:** cookie auth needs CSRF protection — see **S5**, where the middleware is already written and just needs wiring in. Do B1 and S5 together.

---

## B2 — The production build fails; the app cannot be deployed today

I ran it. `npm run build` exits 1 with _"Failed to type check"_, and `tsc --noEmit` reports 27 errors across 14 files. Next.js fails the production build on type errors by default.

Three of these are real runtime bugs, not just type noise:

- **`api.forgotPassword` and `api.resetPassword` are called but don't exist** in `lib/api.ts`. Password recovery is dead on arrival — the backend endpoints exist and work, the client just never got the methods.
  `amoo-web/app/forgot-password/ForgotPasswordForm.tsx:34`, `amoo-web/app/reset-password/ResetPasswordForm.tsx:57`
- **`ChevronLeft` / `ChevronRight` used but never imported** — crashes at runtime when admin package pagination renders.
  `amoo-web/app/admin/packages-offers/PackagesPanel.tsx:494,522`
- **`api.verifyEmailSend()` passes 4 arguments to a 3-argument function.**
  `amoo-web/lib/api.ts:84`

> **Do not** reach for `ignoreBuildErrors: true` to make this go away — it would hide the two genuinely broken features above.

---

## B3 — `dompurify` is used in 28 files but missing from package.json

`amoo-web/lib/sanitize.ts` imports `dompurify`, and 28 components depend on it. Version 3.4.12 is sitting in your `node_modules` — but it is **not listed in `package.json`**. It works on your machine only because someone installed it without saving it.

Any clean install — CI, Docker, a new laptop, your host's build step — runs `npm ci`, which installs strictly from the lockfile and manifest. The package won't be there and the build will fail. This is called a _phantom dependency_.

**Fix:** `npm install --save dompurify @types/dompurify`, then commit both files.

---

## B4 — The consultation booking flow (your revenue path) sends payloads the API rejects

Both booking entry points fail validation before a payment can ever start:

- `amoo-web/app/consultation/consultation-payment/BottomActionBar.tsx:71` sends `amount: 719` with `payment: "Pending"`. The backend explicitly rejects this: _"Pending bookings must have amount 0"_ (`amoo-backend/src/routes/bookings.js:88`). The request 400s and Razorpay never opens.
- `amoo-web/app/consultation/consultation-booking/page.tsx:188` sends `service_name`, `user_name`, `email`, `phone` — none of which the API accepts — and omits `service_id`, which is **required**. Guaranteed 400.

Prices are also hardcoded in the frontend (`719`, `999`, `499`, `349`) with a fallback of `serviceId = match?.id || 4` — a magic number pointing at whatever row 4 happens to be. Prices should come from the `services` table, which already stores them.

> ✅ **Good news:** the rest of the payment chain is real and correct — create-order → Razorpay checkout → HMAC signature verification → booking activation. Only the payload construction is wrong.

---

## B5 — New users hit a dead end: they can't book, and can't verify their email either

A three-link chain, each individually small, that together locks out every new signup:

1. Registration creates users with `verified = 0`.
2. `POST /api/bookings` and `/api/payments` sit behind `verifiedRequired` → new users get **403**.
3. The escape hatch is broken: `/api/auth/verify-email/send` reads `req.user.email`, but the JWT only carries `{ id, kind, tokenVersion }` — **there is no email field**. The verification mail is addressed to `undefined`.
   `amoo-backend/src/routes/auth.js:283-288` vs `:32`
4. And `EMAIL_ENABLED` defaults to `false`, so nothing sends regardless.

**Fix:** look the email up from the database in that handler rather than trusting the token, and configure SMTP before launch. In development you're shielded by the `dev_token` the endpoint returns — which is why this probably looked fine locally.

---

## B6 — No frontend environment config exists

There is no `.env` or `.env.example` anywhere in `amoo-web/`. `NEXT_PUBLIC_API_URL` falls back to `http://localhost:4000`, and because `NEXT_PUBLIC_*` values are baked into the JavaScript bundle _at build time_, a production build made today would ship pointing at localhost.

**Fix:** add `amoo-web/.env.example` documenting the variable, and set the real value in your host's build environment. The backend does this well already — copy that pattern.

---

# 🔒 Security

_The fundamentals are handled: every query I read is parameterized (no SQL injection), passwords use bcrypt at cost 12, and rate limiting is layered properly. These are the gaps._

## S1 — Anyone can create a fully paid booking without paying 🔴

`POST /api/bookings` accepts `payment: "Paid"` from the client. When it sees that, it inserts a `payments` row with `status = 'success'` — **without any gateway involvement whatsoever** (`amoo-backend/src/routes/bookings.js:110-116`).

The code carefully validates that `amount` matches the real service price, and the comment says _"never trust the client-supplied amount"_ — but it never checks that money actually moved. A single crafted request produces a confirmed, paid consultation for free.

**Fix:** remove `payment` from the accepted request fields entirely. Bookings should always be created as pending; only `/api/payments/verify` and the gateway webhook should ever mark something paid. That logic already exists and is correct — this path just bypasses it.

---

## S2 — Users can refund their own payments 🔴

`POST /api/payments/:id/refund` is guarded by `authRequired`, not `adminRequired` (`amoo-backend/src/routes/payments.js:270`). The ownership check passes for the payment's owner, so any user can refund themselves — and it calls the **real Razorpay refund API**, moving real money, with no approval step.

Combined with **S1**: book free, then refund for a net credit.

**Fix:** change the guard to `adminRequired`. One word.

---

## S3 — Testimonials can be posted by anyone, publish instantly, and can impersonate users 🔴

`POST /api/testimonials` has **no authentication middleware at all** (`amoo-backend/src/routes/testimonials.js:49`). It inserts with `status = 'Active'`, so submissions appear on the public marketing site immediately with no moderation queue. It also accepts a client-supplied `user_id` and `avatar`, so a testimonial can be attributed to any real account.

**Fix:** add `authRequired`, default new testimonials to `'Inactive'` pending admin approval, and take `user_id` from the token rather than the request body.

---

## S4 — Seeded admin password is `admin123`, and re-seeding silently resets it 🔴

`seed.js` creates `admin@amooguru.com` with password `admin123` and prints the credentials to the console (`amoo-backend/src/seed.js:10-15`, `:191`). Worse, it uses `ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)` — so running the seed against production would **reset a strong admin password back to `admin123`**.

**Fix:** make the seed refuse to run when `NODE_ENV=production`, and change that clause to `ON DUPLICATE KEY UPDATE id = id` so it never overwrites an existing password.

---

## S5 — CSRF protection is fully written, and never wired in ⚠️

`amoo-backend/src/middleware/csrf.js` implements a correct double-submit token check. I grepped the whole repo: it is **imported by nothing**. It's dead code.

Two things would also need fixing before it works:

- CORS `allowedHeaders` doesn't include `X-CSRF-Token`, so the browser would block the header (`amoo-backend/src/middleware/security.js:16`).
- The cookie is set `sameSite: "strict"`, which isn't sent cross-origin — and your frontend and API are on different origins.

> _CSRF, briefly:_ if auth lives in a cookie, the browser attaches it to requests automatically — including ones triggered by a malicious site. The token proves the request came from your own app.

This is currently moot because token auth is broken (**B1**) — but it becomes **load-bearing the moment you fix B1 with cookies**. Do these together.

---

## S6 — The payment webhook accepts unsigned requests when the gateway is `mock` ⚠️

Signature verification is skipped entirely if `PAYMENT_GATEWAY === "mock"` or no webhook secret is set (`amoo-backend/src/routes/payments.js:368`). Since `mock` is the **default** in `.env.example`, a deploy that forgets to change it exposes an endpoint where anyone can POST `{ event: "payment.captured", booking_id: N }` and mark bookings paid.

**Fix:** refuse to boot in production when the gateway is `mock`. `config/env.js` already has this exact pattern for JWT secrets and CORS — extend it.

---

## S7 — CSV exports are vulnerable to formula injection ⚠️

The escaping in `/api/dashboard/export/:type` handles quotes and commas but not leading `=`, `+`, `-`, or `@` (`amoo-backend/src/routes/dashboard.js:166`). A user who signs up with the name `=cmd|'/c calc'!A1` gets that executed when an admin opens the export in Excel.

**Fix:** prefix any value starting with those characters with a single quote.

---

## S8 — Report downloads can read arbitrary files off the server disk ⚠️

`/api/reports/:id/download` builds a path with `path.join(__dirname, "..", "..", fileUrl)` (`amoo-backend/src/routes/reports.js:244`), where `file_url` is free text an admin can set through `PATCH /api/reports/:id`. A value like `../../../../etc/passwd` escapes the uploads directory.

Admin-only, so it's a privilege-escalation path rather than a public hole — but a compromised admin account becomes arbitrary file read.

**Fix:** resolve the final path and confirm it still starts with your uploads directory before serving. The same pattern applies at `amoo-backend/src/routes/uploads.js:81`.

---

## S9 — Password reset doesn't log out existing sessions ⚠️

`/api/auth/reset-password` updates the password hash but never increments `token_version` (`amoo-backend/src/routes/auth.js:334`) — the mechanism this codebase uses to invalidate issued tokens. `change-password` does it correctly; reset was missed. Someone recovering a hijacked account doesn't actually evict the attacker.

**Fix:** copy the `token_version = token_version + 1` clause from `amoo-backend/src/routes/auth.js:243`.

---

## S10 — No security headers on the frontend

`amoo-web/next.config.ts` defines no `headers()` — so no Content-Security-Policy, no `X-Frame-Options`, no `Referrer-Policy`. The API sets these properly via Helmet; the Next.js app sets none. A CSP is the main defense-in-depth layer if an XSS bug ever slips through.

> ✅ Related, and worth noting as **handled**: the one `dangerouslySetInnerHTML` in the codebase (blog post content) is DOMPurify-sanitized in a client component, so it does run properly in the browser. That one's fine.

---

# ⚠️ Logic & data-model bugs

_These have endpoints, UI, and no error message — they just quietly do nothing, or the wrong thing._

## D1 — `schema.sql` will not run on a fresh database 🔴

The `payments` table is created at line 138 with a foreign key referencing `subscriptions(id)` — but `subscriptions` isn't created until line 209. MySQL rejects a foreign key to a table that doesn't exist yet, and `migrate.js` executes statements strictly in file order, exiting 1 on failure.

Your current database works because it was built incrementally — `migrate.js` carries an `ALTER TABLE payments ADD COLUMN subscription_id` that patched it in later. A brand-new environment (a teammate, staging, CI, production day one) will fail.

> **I could not execute this** — there's no MySQL instance available — so verify it against an empty database before trusting either outcome.

**Fix:** move the `subscriptions` block above `payments` in the file.

---

## D2 — Chat links to the wrong table; it can attach conversations to unrelated users 🔴

`POST /api/chat/conversations` validates that `participant_id` is a row in the **`experts`** table, then stores it in `conversations.user_b` — a column whose foreign key points at **`users(id)`** (`amoo-backend/src/routes/chat.js:37-46`, `amoo-backend/src/schema.sql:257`).

Those are two separate tables with independent ID sequences. So either the insert fails outright, or — worse — expert #5 and user #5 both exist and the conversation silently attaches to **a completely unrelated customer's account**, who can then read the thread. That's a data leak, not just a bug.

**Fix:** this needs a real product decision — either give experts linked `users` rows, or restructure `conversations` to store a participant type alongside the ID. Chat has no frontend yet, so there's time.

---

## D3 — Admin "create report" always returns 400; the field it needs is stripped before it arrives

`POST /api/reports/admin` requires `user_id` and throws _"user_id required"_ without it (`amoo-backend/src/routes/reports.js:146`). But its validator runs `validate("report")`, and the `report` schema has no `user_id` field — with `stripUnknown: true`, Joi **deletes it** before the handler runs.

The check can therefore never pass. `api.admin.createReport` is unreachable code.

**Fix:** add `user_id: Joi.number().integer().positive().required()` to the report schema, or give the admin route its own.

---

## D4 — Coupons never actually discount anything

`POST /api/coupons/apply` increments `used_count`, computes a discount, returns it to the client — and then **never applies it to the booking**. The booking's `amount` is untouched, so the customer is charged full price (`amoo-backend/src/routes/coupons.js:126-133`).

It also writes a fake `payments` row (amount 0, `status: 'success'`) purely as a usage marker. Those rows are counted by `/api/payments/stats/overview`, so every coupon use inflates your transaction count in admin revenue reporting.

**Fix:** update `bookings.amount` inside the same transaction, and track coupon usage in its own table rather than in `payments`.

---

## D5 — Partial updates are rejected on blogs and FAQs

`PATCH /api/blogs/:id` validates against the full `blog` schema, which marks `slug` and `title` as required (`amoo-backend/src/routes/blogs.js:87`). `PATCH /api/faqs/:id` does the same with `question` and `answer` (`amoo-backend/src/routes/faqs.js:61`).

PATCH means "change these fields" — but toggling a blog post from draft to published without also resending the slug and title returns 400.

**Fix:** add partial variants of both schemas with nothing required. `reportUpdate` and `contactUpdate` already show the pattern.

---

## D6 — Astrologer login is entirely non-functional

The login page has a polished "Astrologer Login" tab. Every layer behind it is missing:

- It sends `role: "astrologer"`, which Joi strips (not in the login schema).
- It then checks `data.user.role !== "astrologer"` — but the database enum only allows `free`, `premium`, `consultant`. Never matches.
- On success it redirects to `/astrologer-dashboard`, **which does not exist** — a 404.

**Decide:** either build the astrologer surface, or hide the tab until you do. Right now it's a visible dead end for users.

---

## D7 — Smaller mismatches

- **Login by phone number is advertised but impossible.** The form accepts and validates a 10-digit mobile; the API requires a valid email and 400s on anything else.
- **"Forgot Password?" links to `/contact`** — even though a working `/forgot-password` page exists two directories away. `amoo-web/app/user-login/UserRightSection.tsx:181`
- **Google and Apple sign-in buttons have no click handlers.** Pure decoration — no OAuth anywhere in the codebase.
- **`auto_renew` on subscriptions is always false** — it's read from the body but isn't in the Joi schema, so it's stripped every time. `amoo-backend/src/routes/subscriptions.js:43`
- **2 of 18 backend integration tests fail** (403 where 201/400 expected). The tests predate the `verifiedRequired` middleware and were never updated — so `npm test` is red, which trains everyone to ignore it.

---

# 🏗 Infrastructure & deployment

| Area  | Status     | Detail                                                                                            |
| ----- | ---------- | ------------------------------------------------------------------------------------------------- |
| CI/CD | ❌ Missing | No `.github/workflows`, no pipeline of any kind. Nothing runs tests or the build before a deploy. |

| PM2 config | ⚠️ Risky | `instances: "max"` in cluster mode runs the in-process cron job **once per CPU core** — the subscription-expiry job fires N times concurrently. |
| Error monitoring | ❌ Missing | No Sentry or equivalent. OpenTelemetry tracing is wired up, but nothing captures or alerts on exceptions. |
| Logging | ⚠️ Basic | Clean leveled console logger + Morgan request logs. Fine for one box; no aggregation, so logs vanish on restart. |
| Frontend tests | ❌ Missing | Zero. No test runner installed. |
| Backend tests | ⚠️ Partial | 27 unit tests pass; 16/18 integration pass. Good foundation, currently red. |
| Env separation | ✅ Good | Backend `config/env.js` is genuinely strong — refuses to boot in production with default JWT secrets or wildcard CORS. Frontend has none (**B6**). |
| Docker | ✅ Good | Both Dockerfiles are correct multi-stage builds. Minor: the backend runs `npm run migrate` at _build_ time, when no database exists — it's `|| true` so it's harmless, just misleading. |
| DB indexes | ✅ Good | Genuinely thorough — every foreign key and filter column is indexed. No N+1 patterns found; list endpoints use JOINs, and the expiry job was deliberately written to avoid per-user queries. |
| Caching | ⚠️ None | No Redis or HTTP caching. Public reads (services, blogs, FAQs) hit MySQL every time. Fine at low traffic; the first thing to add under load. |

**One performance note:** the webhook's idempotency check queries `audit_log` with `meta->>'$.idempotency_key'` (`amoo-backend/src/routes/payments.js:384`). That's a JSON expression with no index behind it, so it full-scans a table that grows forever. It'll be fine for months and then suddenly won't.

---

# 📋 Fix in this order

_Sequenced so each step unblocks the next, and so you're never debugging two unknowns at once._

### 1. Make it build — _~half a day_

Add `dompurify` to `package.json` (**B3**), write the missing `forgotPassword`/`resetPassword` client methods, add the two missing icon imports, then clear the remaining type errors (**B2**). Until `npm run build` exits 0, you cannot deploy anything at all.

### 2. Make login actually work — _~1 day_

Fix the token transport (**B1**) and wire in the CSRF middleware at the same time (**S5**) — if you choose cookies, they're one change, not two. Every authenticated feature in both dashboards goes from broken to working in this single step. **This is your highest-leverage day of work on the project.**

### 3. Close the money holes — _~half a day_

**S1** (free paid bookings), **S2** (self-refund — a one-word fix), **S4** (default admin password), **S6** (unsigned webhook). Small diffs, direct financial exposure. Do these before anyone outside your team can reach the app.

### 4. Repair the booking flow — _~1 day_

Fix both booking payloads and pull prices from the `services` table instead of hardcoding them (**B4**). Then unblock signups by fixing the verification email and configuring SMTP (**B5**). After this step you have a working revenue path end to end.

### 5. Fix the database and the silent features — _~1–2 days_

Reorder `schema.sql` and verify it against an empty database (**D1**) — do this before you ever provision staging. Then **D3** (admin reports), **D4** (coupons), **D5** (partial updates), and **S3** (testimonial spam, which is publicly reachable).

### 6. Make deployment real — _~1–2 days_

Pick _one_ host and fix that config — both are currently broken in different ways (Railway's is malformed, Render's provisions the wrong database engine). Add a CI workflow that runs build + tests on every push, fix the 2 stale integration tests, and add Sentry. **CI would have caught steps 1 and 2 on the day they were introduced.**

### 7. Harden and tidy — _ongoing_

**S7**–**S10**, the **D7** mismatches, a CSP, caching for public reads, and an index behind the webhook idempotency lookup. Decide what to do about astrologer login (**D6**) and chat (**D2**) — both need product decisions, not just code.

---

# ✅ What's genuinely solid

_Worth being specific about, because it's most of the system — and because you'll be tempted to rewrite things that don't need it._

- **SQL injection** — Every query I read is parameterized. Dynamic `UPDATE` clauses go through a shared allow-list helper. Clean.
- **Password handling** — bcrypt at cost 12, account lockout after repeated failures, token revocation via `token_version`, refresh-token rotation.
- **Transactions** — Bookings, wallet, and coupons use real transactions with `SELECT … FOR UPDATE` row locking. Slot double-booking is genuinely prevented.
- **Razorpay integration** — Real, not stubbed: order creation, HMAC signature verification, live refund API, webhook idempotency, raw-body capture done correctly.
- **Rate limiting** — Three tiers: global, auth endpoints, and a separate stricter one for registration. Correctly skipped in tests.
- **API consistency** — ~100 endpoints across 22 modules with one response shape, shared pagination, and consistent error handling. Easy to extend.
- **Validation** — Joi schemas on nearly every write endpoint, with `stripUnknown` so unexpected fields can't reach the database.
- **Operational basics** — Graceful shutdown, DB health check with boot retries, request correlation IDs, audit logging, soft deletes.
- **Report generators** — Tarot, numerology, kundali, and reiki generators are real implementations with substantial backing data files, not placeholders.
- **Frontend integration depth** — ~130 components genuinely call the API. Once **B1** is fixed, a large amount of this comes alive at once.

---

# 📖 Terms used above

| Term                   | Plain-language meaning                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Middleware**         | A function that runs before your route handler — checking auth, validating input, rate limiting. Order matters; skipping one is how **S2** and **S3** happened.  |
| **JWT / Bearer token** | A signed string proving who you are, sent on every request. The server verifies the signature instead of looking up a session.                                   |
| **httpOnly cookie**    | A cookie JavaScript cannot read. Browsers send it automatically, so an XSS bug can't steal it.                                                                   |
| **CSRF**               | An attack where another site triggers requests to yours using the cookies the browser attaches automatically. A token proves the request came from your own app. |
| **Webhook**            | The payment provider calling _your_ server to report an event. It's public, so it must be signature-verified — see **S6**.                                       |
| **Idempotency**        | Processing the same message twice has the same effect as once. Payment providers retry, so without it one payment can be credited repeatedly.                    |
| **Transaction**        | A group of database writes that all succeed or all roll back — so you never get a booking without its payment row.                                               |
| **Foreign key**        | A column pointing at another table's row, enforced by the database. **D2** is a foreign key aimed at the wrong table.                                            |
| **Migration**          | A versioned script that changes database structure, so every environment ends up with the same schema.                                                           |
| **Seed data**          | Starter rows inserted into a fresh database — sample services, a first admin account.                                                                            |
| **Soft delete**        | Marking a row deleted (`deleted_at`) instead of removing it, so it can be recovered and doesn't break historical references.                                     |
| **N+1 query**          | Fetching a list, then querying once per item — 101 queries where 2 would do. Not a problem here; this codebase avoids it.                                        |
| **Phantom dependency** | A package your code imports but `package.json` doesn't declare. Works locally, fails on any clean install — see **B3**.                                          |
