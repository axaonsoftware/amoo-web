# Frontend ↔ Backend Wiring Notes

Frontend: `amoo-web/` (Next.js 16.2.10, App Router) · Backend: `amoo-backend/` (Express 4 + MySQL)

> **File-recovery note.** This document was deleted from disk part-way through Phase 2 by
> concurrent work in the repo (three commits — `c15dba0`, `1cf881b`, `540b992` — landed during
> the session; `AUDIT.md` was deleted the same way and has been restored from git).
> `WIRING_NOTES.md` had never been committed, so it has been reconstructed here: the Phase 1
> sections are restored from the previous revision, and Phase 2 is new. **Commit this file.**

---

## Phase 1 — API client, auth, CSRF (completed earlier)

### Starting state (correction to the Phase 1 brief)

The Phase 1 brief assumed the two codebases were "not connected at all". They already were:

| Brief assumed | Actually present |
| --- | --- |
| No API client | [`lib/api.ts`](amoo-web/lib/api.ts) — fetch wrapper + ~110 typed endpoint methods |
| No auth flow | [`lib/auth-context.tsx`](amoo-web/lib/auth-context.tsx) — `AuthProvider`, `useAuth`, `RequireAuth`, `RequireAdmin` |
| No fetch calls | ~130 components import `lib/api.ts` |
| Route protection missing | `RequireAdmin` wraps `app/admin/layout.tsx`; `RequireAuth` wraps `app/user-dashboard/layout.tsx` |

The client is one flat module rather than 22 resource files under `app/lib/api/`. Rebuilding it
that way would have meant rewriting imports in ~130 files for no functional gain, so the existing
layer was audited and fixed instead. It already does what the brief asked: `NEXT_PUBLIC_API_URL`
with a `http://localhost:4000` fallback, `credentials: "include"` on every call, CSRF header on
mutations, centralised `fail()`-envelope error handling, single-flight 401→refresh→retry.

### Phase 1 changes

1. **`lib/api.ts`** — the 401 fallback sent admins to `/user-login`; now picks `/admin-login` for
   `/admin*` paths (admins live in a separate table with `kind:"admin"` tokens).
2. **`app/user-login/UserRightSection.tsx`** — phone login could never succeed
   (`POST /api/auth/login` validates `email` with Joi's email rule). Field is now email-only.
3. **`app/user-login/UserRightSection.tsx`** — the "Astrologer Login" tab was fully dead: it sent
   `role:"astrologer"` (stripped by `stripUnknown:true`), then required `user.role === "astrologer"`,
   a value `users.role ENUM('free','premium','consultant')` can never produce, then pushed to a
   non-existent `/astrologer-dashboard`. Now checks `consultant` and routes to `/user-dashboard`.
4. **`amoo-web/.env.local.example`** (new) + a `!.env.local.example` negation in `.gitignore`.

### Phase 1 verification

Live against MySQL + the running API, simulating browser calls with `Origin: http://localhost:3000`:
`npm run migrate` (27 statements) · `npm run seed` · CORS preflight + `Access-Control-Allow-Credentials`
· `X-CSRF-Token` exposed cross-origin · CSRF bootstrap via `GET /api/health` · `POST /api/auth/login`
sets httpOnly cookies · `GET /api/auth/me` · `PATCH /api/users/me` 403 without CSRF / 200 with ·
`POST /api/auth/refresh` rotates both cookies · admin login → `GET /api/dashboard/overview` ·
`POST /api/faqs` · `POST /api/bookings`. Backend `npm test` 27/27. Frontend `tsc --noEmit` clean.

Cookies in dev are `SameSite=Lax; Secure=false` — fine because `localhost:3000` → `localhost:4000`
is cross-origin but **same-site** (port is not part of a "site").

### Production cookie/CORS checklist

- `utils/cookies.js` switches on `NODE_ENV`: dev `SameSite=Lax`; prod `SameSite=None; Secure`
  (requires HTTPS on both origins or browsers drop the cookie).
- `CLIENT_ORIGIN` must list exact origins; `env.js` throws at boot if it is `*` in production, and
  also on default JWT secrets, `PAYMENT_GATEWAY=mock`, and a missing `PAYMENT_WEBHOOK_SECRET`.
- Set `NEXT_PUBLIC_API_URL` at **build time** — Next.js inlines `NEXT_PUBLIC_*` into the bundle.

### Running locally

```bash
# backend
cd amoo-backend && cp .env.example .env   # set DB_PASSWORD; CLIENT_ORIGIN=http://localhost:3000
npm install && npm run migrate && npm run seed && npm run dev   # :4000

# frontend
cd amoo-web && cp .env.local.example .env.local
npm install && npm run dev                                      # :3000
```

---
---

# Phase 2 — Real data + real mutations

## Scope delivered vs. scope remaining

**This phase is partially complete and the remainder is scoped below, not hidden.** An agent
fan-out over the twelve frontend sections was launched to build the full inventory; it hit the
session token limit and all twelve inventory agents failed (19 of 22 backend-contract agents
completed). The inventory was therefore rebuilt by hand, and work was prioritised by severity
rather than by walking the component list top to bottom.

What that prioritisation surfaced is the important finding of this phase:

> **The problem was not mainly "static arrays waiting to be wired". It was components that
> already called the API, looked wired, and silently rendered fabricated numbers** — because they
> read response fields the endpoint never returns, then fell through `||` fallbacks to hardcoded
> values. Several of those are worse than an obviously-static placeholder, because nothing about
> the running page suggests the numbers are invented.

### Completed

| Area | Files | State |
| --- | --- | --- |
| Shared data-fetching architecture | 5 | Done |
| Admin analytics (`reports-analytics`) | 6 | Done — real aggregations |
| Admin finance (`payments-finance`) | 5 | Done — real aggregations |
| Admin dashboard chart | 1 | Done — axis scaling fixed |
| Paginated-envelope crash fixes | 10 | Done |
| Admin user-management filters + table states | 1 | Done |
| Backend: new/extended aggregations + filter fixes | 4 routers | Done |

### Not yet converted (roadmap, by priority)

| Priority | Files / area | Why it matters |
| --- | --- | --- |
| **P1** | `admin/*/RightRail.tsx` (×9) — `quickStats`, `donut`, `recentActivity` arrays | Fully static numbers presented as live stats, on nine admin pages |
| **P1** | `admin/availability-slots/TodaysSlots.tsx`, `RightPanel.tsx` | Hardcoded slot grid; `GET /api/slots` exists and is unused here |
| **P1** | `admin/user-management/RightRail.tsx` | `accountRows`, `activitySummary`, `recentActivity` all hardcoded |
| **P2** | Dead tab/select filters in `ServicesPanel`, `ReadingsPanel`, `KundaliPanel`, `ConsultationsPanel`, `report-management/ReportsPanel` | Same defect fixed in `UsersPanel`; backend supports the filters |
| **P2** | `user-dashboard/other-features/phones/*` (×6), `DailyHoroscope`, `FeaturedCourses` | Static; `DailyHoroscope`/`FeaturedCourses` have **no** backing endpoint (gaps G12, G13) |
| **P2** | `admin/booking-management/RightRail.tsx` `activity` | `GET /api/audit` exists and is unused here |
| **P3** | Public marketing pages (`about/`, `services/components/StatsBand`, `software-hub/`) | Largely genuine copy; the `StatsBand` counters are the real gap |
| **P3** | Chat UI | Entire `chat.js` router (5 endpoints) unwired; no chat UI exists at all |

Everything in the "Not yet converted" table is **unchanged, not silently broken** — those files
still render their original static content.

---

## Step 1 — Data-fetching architecture

One approach, used consistently: **client-side fetching via a small hook layer over the existing
`lib/api.ts`**. No SWR or React Query was introduced — every authenticated surface in this app is
behind `RequireAuth`/`RequireAdmin` client components, so a server-component fetch would have to
re-plumb cookie forwarding for no gain on pages that are already client-rendered.

### New / changed shared modules

| File | Purpose |
| --- | --- |
| [`lib/format.ts`](amoo-web/lib/format.ts) **(new)** | `formatCurrency`, `formatCurrencyExact`, `formatNumber`, `formatCompact`, `formatDate`, `formatTime`, `formatDateTime`, `formatRelative`, `titleCase`, `initials`, `toNumber` |
| [`lib/useApi.ts`](amoo-web/lib/useApi.ts) | Added `refetch` (for retry buttons), `setData` (optimistic updates), a generation guard against stale responses, and `useApiList` for the paginated envelope |
| [`lib/api.ts`](amoo-web/lib/api.ts) | Added `unwrapList`, `unwrapMeta`, `qs`, `PageMeta`, and 3 admin methods for the new endpoints |
| [`app/components/states.tsx`](amoo-web/app/components/states.tsx) **(new)** | `Skeleton`, `CardGridSkeleton`, `TableSkeletonRows`, `ListSkeleton`, `ChartSkeleton`, `Spinner`, `EmptyState`, `EmptyRow`, `ErrorState`, `ErrorRow` |
| [`app/admin/shared/useToast.tsx`](amoo-web/app/admin/shared/useToast.tsx) **(new)** | The toast pattern was copy-pasted into 10 admin panels, each leaking its timeout on unmount |

`states.tsx` takes a `tone` prop (`admin` | `dashboard`) because the app has two palettes that must
not be mixed: admin is violet `#6D28D9` on `#EDECF3` hairlines; the user dashboard is
`#3d1268`→`#5a2496` with gold `#f0c877` on `#efe6d6` borders.

### `useApi` defects fixed

The previous hook captured an `active` flag in its effect and **then never read it**, so a slow
response for page 1 could overwrite a fast response for page 2, and an in-flight response could
set state after unmount. Replaced with a generation counter. It also had no way to re-run a fetch,
which made Step 2's "error state with a retry action" impossible to build.

### Currency

`schema.sql` has exactly one currency column — `wallets.currency VARCHAR(8) NOT NULL DEFAULT 'INR'`.
Every other money column (`bookings.amount`, `payments.amount`, `services.price`, `packages.price`,
`coupons.discount_value`, …) is a bare `DECIMAL(10,2)` with no currency beside it, so **INR is the
implied platform currency**. `formatCurrency` defaults to `INR`/`en-IN` and accepts an explicit
currency only where a row actually carries one (wallet + wallet transactions). Note that mysql2
returns `DECIMAL` as a **string**, which is why `toNumber` exists and is used on every money field.

---

## Step 2 — The paginated-envelope class of bug

The backend has two response shapes and they are **not** consistent per resource:

- `paginated()` → `{ success, data: [...], meta: { page, pageSize, total, totalPages } }`
- `ok()` with an array → `{ success, data: [...] }`, which `lib/api.ts` unwraps to a bare array

`handleResponse` returns `{ data, meta }` for the first and the bare array for the second. Ten
components assumed the bare array on an endpoint that paginates.

**Every list endpoint paginates except `GET /api/faqs` and `GET /api/packages`.**

| File | Symptom before |
| --- | --- |
| `user-dashboard/StatsRow.tsx` | `.filter()` on `{data, meta}` → **TypeError at render** |
| `consultations-booking/CalendarCard.tsx` | `Array.isArray(slots)` always false → calendar never showed a single slot |
| `my-reports/FiltersCard.tsx`, `my-reports/ReportCategories.tsx` | `.forEach` over an object → no-op, categories always empty |
| `numerology-dashboard/PopularTools.tsx`, `tarot-dashboard/PopularSpreads.tsx` | Always rendered the "no services available" empty state |
| `account-profile/{AccountInformation,PremiumBanner,ProfileCard}.tsx` | `hasPremium` always `false` — premium users saw the upsell banner |

All now use `useApiList`, which returns `items` (always an array) plus `meta`. `user-dashboard/StatsRow`
additionally now uses `meta.total` for the report count rather than the current page's length.

---

## Step 4 — Analytics and charts

This is where the fabricated data was concentrated.

### `admin/reports-analytics/StatsRow.tsx`

Read `o.totalRevenue`, `o.totalBookings`, `o.totalUsers`, `o.activeExperts`, `o.revenueGrowth`,
`o.bookingGrowth`, `o.userGrowth`, `o.cancellationRate` off `GET /api/dashboard/overview`. That
endpoint returns `{ stats: { users, experts, services, bookings, revenue, pendingPayments,
todayBookings }, topServices, recent }` — **none of those eight keys exist**, so every `||` fallback
won and all six tiles permanently showed `₹12,45,780 / 1,856 / 1,542 / 2,348 / 27 / 6.32%`
regardless of the database. "Paid Consultations" was literally `totalBookings * 0.83`.

Now: revenue and transaction counts from `GET /api/payments/stats/overview`; totals from
`/overview`; **real period-over-period deltas** computed from the last two buckets of
`/dashboard/revenue`, `/dashboard/bookings/trends` and `/dashboard/users/growth`. Cancellation rate
is `cancelled/count` from the trends series, and its delta is in **percentage points**, not a
ratio-of-a-ratio. Where no prior period exists the tile renders `—` rather than a number.

### `admin/reports-analytics/QuickInsights.tsx`

Read `peakDay`, `peakDayPct`, `peakTime`, `peakTimePct`, `topService`, `topServicePct`, `topSource`,
`topSourcePct`, `cancellationRate`, `cancellationDelta` off `/overview`. All ten are absent, so the
card permanently displayed "Saturday / 7 PM–9 PM / Kundali Reading / WhatsApp / 6.32%".
Now backed by a new `GET /api/dashboard/bookings/patterns` plus `/overview` and the trends series.

### `admin/reports-analytics/TopServicesByBookings.tsx`

Fetched `GET /api/bookings` and grouped client-side — but that endpoint paginates at 20 rows by
default, so the "top services" ranking was computed from a 20-booking sample, then replaced
wholesale by a hardcoded six-row list whenever the fetch returned nothing. The brief's rule applies
directly here: `/dashboard/overview` **already returns** `topServices`. Now uses it.

### `admin/reports-analytics/TopPerformingAstrologers.tsx`

Rendered columns for `total_consultations`, `completed_bookings`, `total_revenue`, `new_clients`,
`repeat_clients` — `GET /api/dashboard/experts/top` returned only `{id, name, rating, bookings}`, so
on real data all five columns showed `0`/`₹0` while a fabricated five-astrologer list stood in when
empty. Every row also used the same hardcoded Unsplash portrait. The endpoint was extended
(below) and the table now uses real values plus `experts.avatar` with an initials fallback.

### `RevenueByService.tsx` (both copies) and `PaymentMethods.tsx`

- `RevenueByService` grouped `GET /api/payments` on `p.service_name`. **`payments` has no service
  column at all** (`id, booking_id, subscription_id, user_id, amount, method, gateway, status,
  txn_id, gateway_order_id, created_at`), so 100% of revenue fell into "Others". Fixed by a new
  server-side join endpoint.
- `PaymentMethods` grouped on `p.payment_method`; the column is `method`. Same always-"Others"
  outcome, over 20 rows. Now uses the `by_method` block of `/payments/stats/overview`, which
  aggregates `WHERE status='success' GROUP BY method` over the whole table.

### `admin/payments-finance/StatsRow.tsx`, `PayoutsSummary.tsx`

Both derived a payout ledger by multiplying payment totals by a hardcoded `0.63`/`0.37`, over the
first 20 payments, with all six deltas as multiples of a hardcoded `19.3%`. See gap **G8** — there
is no payouts model in the schema. Both now report the money movement the backend genuinely
tracks, under honest labels.

### `admin/admin-dashboard/OverviewAnalytics.tsx`

This one *was* fetching real data, but the chart geometry was hardcoded: `MAX = 1500`,
`yLeft = [1500,1200,...,0]`, `yRight = ["5L","4L",...,"0"]`, and **all three series — including
rupee revenue — were plotted through one `py()` clamped at 1500**. Any revenue above ₹1,500 pinned
flat against the top gridline, and neither axis label set related to the data drawn. Now computes
nice-rounded domains from the data with separate left (counts) and right (revenue) scales, adds
`<title>` tooltips, and drops a hardcoded down-arrow that made the Revenue tile always claim a
decline.

---

## Backend changes

Additive and read-only except where noted. `npm test` stays at **27/27**.

| Router | Change |
| --- | --- |
| `dashboard.js` | **New** `GET /api/dashboard/revenue/by-service` — joins payments→bookings→services, which the frontend cannot do without an N+1 |
| `dashboard.js` | **New** `GET /api/dashboard/reports/by-type` — groups `reports` by its real `type` column |
| `dashboard.js` | **New** `GET /api/dashboard/bookings/patterns` — peak booking day-of-week and hour-of-day |
| `dashboard.js` | Extended `GET /api/dashboard/experts/top` with `avatar`, `completed`, `revenue`, `clients` |
| `payments.js` | Extended `GET /api/payments/stats/overview` with `failed` and per-status counts (`success_count`, `pending_count`, `refunded_count`, `failed_count`) |
| `users.js` | **Fix:** search covered only `name`/`email` though the admin box is labelled "name, email or phone" — phone added |
| `users.js` | **New** `?verified=0\|1` filter, backing the admin "Verified Users" tab |
| `bookings.js` | **Fix:** the admin bookings table sent `?search=` to an endpoint that never parsed it. Added search over `booking_ref`, user name, service name — and corrected the `COUNT(*)` query, which lacked the joins the filter needs |

---

## Component → endpoint map (converted this phase)

| Component | Endpoint(s) |
| --- | --- |
| `admin/reports-analytics/StatsRow.tsx` | `/dashboard/overview`, `/payments/stats/overview`, `/dashboard/revenue`, `/dashboard/bookings/trends`, `/dashboard/users/growth` |
| `admin/reports-analytics/QuickInsights.tsx` | `/dashboard/bookings/patterns`, `/dashboard/overview`, `/dashboard/bookings/trends` |
| `admin/reports-analytics/TopServicesByBookings.tsx` | `/dashboard/overview` (`topServices`) |
| `admin/reports-analytics/TopPerformingAstrologers.tsx` | `/dashboard/experts/top?limit=5` |
| `admin/reports-analytics/ReportsSummary.tsx` | `/dashboard/reports/by-type` |
| `admin/reports-analytics/RevenueByService.tsx` | `/dashboard/revenue/by-service` |
| `admin/payments-finance/RevenueByService.tsx` | `/dashboard/revenue/by-service` |
| `admin/payments-finance/StatsRow.tsx` | `/payments/stats/overview`, `/dashboard/revenue` |
| `admin/payments-finance/PaymentMethods.tsx` | `/payments/stats/overview` (`by_method`) |
| `admin/payments-finance/PayoutsSummary.tsx` | `/payments/stats/overview` |
| `admin/payments-finance/InvoicesOverview.tsx` | `/payments/stats/overview` |
| `admin/admin-dashboard/OverviewAnalytics.tsx` | `/dashboard/bookings/trends`, `/dashboard/users/growth`, `/dashboard/revenue` |
| `admin/user-management/UsersPanel.tsx` | `/users?page&pageSize&search&role&status&verified&date_from`, `PATCH /users/:id`, `DELETE /users/:id` |
| `user-dashboard/StatsRow.tsx` | `/bookings`, `/reports`, `/wallet` |
| `user-dashboard/consultations-booking/CalendarCard.tsx` | `/slots` |
| `user-dashboard/my-reports/{FiltersCard,ReportCategories}.tsx` | `/services` |
| `user-dashboard/{numerology-dashboard/PopularTools,tarot-dashboard/PopularSpreads}.tsx` | `/services` |
| `user-dashboard/account-profile/{AccountInformation,PremiumBanner,ProfileCard}.tsx` | `/users/me`, `/subscriptions` |

---

## Gap list — frontend needs it, backend cannot serve it

Phase 1 gaps **G1–G5** are unchanged except where noted. Phase 2 adds **G6–G13**.

**G3 · resolved.** `users` now has `gender`, `language`, `country`, `state`, `city`, `address`
columns and `SELF_UPDATE_ALLOWED` accepts them, so the profile form no longer discards those fields.

**G6 · `GET /api/users` had no `verified` filter.** *Fixed this phase* — added.

**G7 · `GET /api/bookings` had no `search`.** *Fixed this phase* — added.

**G8 · No payouts / commission model.** No `payouts` table, no commission rate on `experts`, no
ledger of what is owed to a practitioner. Affects `payments-finance/PayoutsSummary.tsx` and two
tiles of `payments-finance/StatsRow.tsx`.
*Suggested:* `payouts(id, expert_id, period_start, period_end, gross, commission_rate, net, status
ENUM('pending','paid','failed'), paid_at)` + `GET /api/payouts` (admin, paginated) and
`GET /api/payouts/summary` returning `{total, paid, pending, failed}`.

**G9 · No acquisition-source tracking.** `users` has no `source`/`utm_source`/`referrer` column, so
the "Top Source" insight is not derivable at all. Replaced with today's booking count.
*Suggested:* `users.source VARCHAR(40)` captured at registration + `GET /api/dashboard/users/by-source`.

**G10 · No invoices.** The schema has `payments`, `refunds` and `coupon_usages` but no invoice
document, number, issue date or due date — so "Overdue Invoices" cannot be computed.
`InvoicesOverview.tsx` now reports payment-status counts under honest labels.
*Suggested:* either treat a payment as the billing record (rename the card, done) or add
`invoices(id, payment_id, number, issued_at, due_at, status)`.

**G11 · No rewards/loyalty points.** No points column on `users`, no ledger table. The "Reward
Points" tile in `user-dashboard/StatsRow.tsx` is held at `0` with a code comment.
*Suggested:* `reward_points(user_id, delta, reason, created_at)` + `GET /api/rewards/balance`.

**G12 · No horoscope content model.** `user-dashboard/DailyHoroscope.tsx` is static and there is no
table or generator for daily horoscope text.
*Suggested:* `horoscopes(sign, date, body)` + `GET /api/horoscopes/today?sign=`.

**G13 · No courses model.** `user-dashboard/FeaturedCourses.tsx` and
`other-features/phones/CoursesPhone.tsx` are static; there is no courses table.
*Suggested:* reuse `packages`, or add `courses(id, title, slug, price, thumbnail, status)`.

**G14 · No per-expert time series.** `/dashboard/experts/top` is a point-in-time aggregate, so the
"Active Astrologers" tile has no prior period and renders `—` instead of a delta.
*Suggested:* `GET /api/dashboard/experts/growth?period=` mirroring `/users/growth`.

---

## Verification performed

### Live endpoint checks

Backend on `:4000` against the seeded MySQL database, authenticated as
`admin@amooguru.com`. All returned `200` with real rows:

| Endpoint | Result |
| --- | --- |
| `GET /api/dashboard/revenue/by-service` | `[{id:3,name:"Kundli Reading",payments:1,revenue:"1499.00"},{id:1,name:"Numerology Report",payments:3,revenue:"0.00"}]` |
| `GET /api/dashboard/reports/by-type` | `[{type:"numerology",total:5,ready:"0",pending:"5"}]` |
| `GET /api/dashboard/bookings/patterns` | `{total:12, peakDay:{day:4,count:6}, peakHour:{hour:10,count:4}, …}` |
| `GET /api/dashboard/experts/top?limit=3` | now includes `avatar`, `completed`, `revenue:"2997.00"`, `clients:1` |
| `GET /api/payments/stats/overview` | now includes `failed`, `success_count:"8"`, `pending_count:"1"`, … |

### Regression found and fixed by tracing the admin user journey

`GET /api/userspage=1&pageSize=10` → **404**. `UsersPanel.buildQuery()` returned
`params.toString()` with no `?`, and `api.admin.getUsers(q)` interpolates straight after
`/api/users`. **Every load of the admin user-management table was failing** before this fix.
Confirmed against the live API:

```
/api/userspage=1&pageSize=2          -> 404
/api/users?page=1&pageSize=2         -> 200
/api/users?page=1&pageSize=2&verified=1 -> 200   (new filter)
/api/users?search=9876               -> 200   (phone search, new)
```

The new bookings search was verified the same way — `total` moves 15 → 9 → 0 across
no-filter / `?search=Vedika` / `?search=zzznomatch`, confirming the corrected `COUNT(*)` joins.

### Test suite and static checks

| Check | Result |
| --- | --- |
| Backend `npm test` | ✅ **27/27 pass** (re-run after every backend change) |
| Frontend `npx tsc --noEmit` | ✅ clean |
| `npx eslint lib app/components/states.tsx app/admin/shared/useToast.tsx` | ✅ 0 errors in new modules; the 10 remaining are pre-existing `no-explicit-any` in `lib/api.ts` and `lib/razorpay.ts` |

### End-to-end journeys — status

The three full user journeys the brief asks for (signup → verify → book → pay → history;
admin creates expert → appears on public services; contact form → admin panel) were **not** run as
complete browser traces this phase. What was verified is the API layer each journey depends on,
listed above. Completing them requires the P1/P2 conversions in the roadmap — in particular the
booking-confirmation screen and the admin availability/expert right-rails — since several steps in
those journeys still render static content today.
