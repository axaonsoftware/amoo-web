# 014 — Working password reset was unreachable; dead OAuth buttons; fabricated admin data

- **Category**: Integration (Frontend-Backend) / Bug Fix
- **Severity**: Medium
- **File(s) affected**:
  - `amoo-web/app/user-login/UserRightSection.tsx`
  - `amoo-web/app/astrologer-login/AstrologerRightSection.tsx`
  - `amoo-web/app/admin-login/RightPanel.tsx`
  - `amoo-web/app/admin/availability-slots/AvailabilityTable.tsx`
  - `amoo-backend/src/routes/slots.js`
  - `amoo-backend/src/routes/experts.js`
  - `amoo-web/lib/api.ts`

Four integration gaps: a complete feature nobody could reach, buttons for a
feature that does not exist, an admin table showing invented numbers, and an
admin endpoint that rejected the only client that calls it.

---

## 14a. "Forgot Password?" pointed at /contact while a full reset flow sat unused

### Problem

All three login screens linked password recovery to the contact form:

```tsx
<Link href="/contact" className="text-xs font-medium text-[#5B2A9D]">
  Forgot Password?
</Link>
```

Meanwhile the entire flow existed and worked:

| Piece | Status |
|---|---|
| `amoo-web/app/forgot-password/page.tsx` + `ForgotPasswordForm.tsx` | implemented |
| `amoo-web/app/reset-password/page.tsx` + `ResetPasswordForm.tsx` | implemented |
| `POST /api/auth/forgot-password` (OTP generation, enumeration-safe, rate-limited) | implemented |
| `POST /api/auth/reset-password` (OTP verification, bcrypt rehash) | implemented |
| `api.forgotPassword` / `api.resetPassword` in `lib/api.ts` | implemented |

Every locked-out user was routed to a support queue instead of a working
self-service reset. That is avoidable support load, and a slow recovery path for
the user.

### Solution

Point the **user** login at `/forgot-password`.

Admin and expert logins keep `/contact` — deliberately. `POST /api/auth/reset-password`
only ever operates on the `users` table; admins are provisioned by seed and
expert passwords are set by an admin via `POST /api/experts/:id/set-password`.
Pointing those at `/forgot-password` would produce a form that always fails. The
labels now say "Forgot Password? Contact support" and carry a comment marking
the choice as intentional, so it does not look like the bug that was just fixed.

### Before / After

```diff
 <div className="flex justify-end -mt-2">
-  <Link href="/contact" className="text-xs font-medium text-[#5B2A9D]">
+  {/* /forgot-password and POST /api/auth/forgot-password are both
+      fully implemented; this used to point at /contact, leaving a
+      working self-service reset flow completely unreachable. */}
+  <Link href="/forgot-password" className="text-xs font-medium text-[#5B2A9D] hover:underline">
     Forgot Password?
   </Link>
 </div>
```

---

## 14b. Google / Apple / Microsoft sign-in buttons with no backend

### Problem

`user-login` rendered "Continue with Google" and "Continue with Apple";
`admin-login` rendered "Continue with Google" and "Continue with Microsoft".

None of it existed:
- no OAuth route in `amoo-backend/src/routes/auth.js`
- no provider client id or secret in `config/env.js` or `.env.example`
- no `oauth_provider` / `oauth_id` columns on `users` or `admins`
- no `onClick` handler on any of the four buttons

They were styled, focusable, hoverable, and did nothing at all when clicked — no
error, no message. On the **admin** login screen this is worse than a dead end:
a non-functional SSO button implies a federated identity control that is not
there, which is exactly the sort of thing a security questionnaire asks about.

The admin buttons additionally loaded their icons from `upload.wikimedia.org`,
making the admin login page depend on a third-party CDN at render time.

### Solution

Removed all four, with a comment at each site recording what would be needed to
bring them back. Also removed the now-unused `GoogleIcon` / `AppleIcon`
components.

This is a removal of user-visible UI, so to be explicit: nothing was lost,
because nothing worked. Re-add them together with the backend routes.

### Before / After

```diff
-<div className="flex items-center gap-3 my-6">
-  <span className="flex-1 h-px bg-gray-200" />
-  <span className="text-xs text-gray-400">or continue with</span>
-  <span className="flex-1 h-px bg-gray-200" />
-</div>
-
-<div className="flex gap-3">
-  <button className="...">  <GoogleIcon /> Continue with Google </button>
-  <button className="...">  <AppleIcon />  Continue with Apple  </button>
-</div>
+{/* "Continue with Google / Apple" buttons were removed here.
+    There is no OAuth support anywhere in the stack: no provider client
+    id, no /api/auth/google or /api/auth/apple route, and no oauth
+    columns on `users`. The buttons rendered, were clickable, and did
+    absolutely nothing — a dead end on the primary sign-in path.
+    Re-add them together with the backend routes, not before. */}
```

---

## 14c. Admin availability table invented every number it displayed

### Problem

```tsx
api.admin.getSlots()          // GET /api/slots -> individual slot ROWS
  .then((data) => {
    const items = data?.data ?? data;
    setRows(items.map((s) => {
      const total  = s.total_slots  || s.slots  || 24;                 // ← invented
      const booked = s.booked_slots || s.booked || Math.floor(total * 0.6);  // ← invented
      return {
        chips: [allChips[Math.floor(Math.random() * allChips.length)]], // ← random per render
        days:  s.available_days  || "Mon - Sun",                        // ← invented
        hours: s.available_hours || "09:00 AM - 06:00 PM",              // ← invented
        // ...
      };
    }));
  })
```

`GET /api/slots` returns rows of `{ id, expert_id, date, start_time, end_time,
status }`. It has never returned `total_slots`, `booked_slots`, `available_days`
or `available_hours`, so **every fallback fired, every time**. The result: each
astrologer displayed "24 Slots, 60% booked" over invented working hours, with a
service-category icon reshuffled on every render.

The avatar was a single hardcoded Unsplash stock photo used for every row:

```tsx
<Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt={r.name} />
```

so the table showed a stranger's face next to every real astrologer's name. The
date-range filter read "01 May 2025 - 18 May 2025", hardcoded.

An operations screen that fabricates its numbers is worse than an empty one:
staff make scheduling decisions from it.

### Solution

A new aggregate endpoint, `GET /api/slots/availability` (admin), doing the
grouping in SQL — one query rather than one request per expert:

```sql
SELECT e.id, e.name, e.avatar, e.specialties, e.status, e.rating,
       COUNT(s.id) AS total_slots,
       SUM(CASE WHEN s.status = 'booked'    THEN 1 ELSE 0 END) AS booked_slots,
       SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_slots,
       SUM(CASE WHEN s.status = 'blocked'   THEN 1 ELSE 0 END) AS blocked_slots,
       MIN(s.date) AS first_slot_date, MAX(s.date) AS last_slot_date
  FROM experts e
  LEFT JOIN slots s ON s.expert_id = e.id AND s.date >= CURDATE()
 WHERE e.deleted_at IS NULL
 GROUP BY e.id
```

`LEFT JOIN` so an expert with no slots shows zeroes instead of disappearing.
`utilisation_pct` is computed server-side so every consumer agrees.

The table now renders real data, real initials-based avatars when
`experts.avatar` is null, working search and status filters, the shared
loading/empty/error states from `app/components/states.tsx`, and a real slot
date window. Columns that had no backing data ("Weekly Availability",
"Today's Slots") were replaced with ones that do.

### Testing notes

```bash
curl "$API/api/slots/availability" -H "$ADMIN_AUTH" | jq '.data[0]'
# { id, name, avatar, specialties, status, rating,
#   total_slots, booked_slots, available_slots, blocked_slots,
#   first_slot_date, last_slot_date, utilisation_pct }
```
Cross-check one row against the source of truth:
```sql
SELECT status, COUNT(*) FROM slots WHERE expert_id = 1 AND date >= CURDATE() GROUP BY status;
```
An expert with zero slots must appear with `total_slots: 0` and
`utilisation_pct: 0` rather than "24 slots / 60%". Search and the status filter
must round-trip to the query string.

---

## 14d. `GET /api/experts?all=1` rejected the browser

### Problem

```js
if (req.query.all === "1") {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    try { isAdmin = verifyAccessToken(header.slice(7)).kind === "admin"; } catch (_) {}
  }
  if (!isAdmin) return fail(res, 401, "Admin authentication required");
}
```

It read the `Authorization` header **only**. But the frontend authenticates with
the httpOnly `access_token` **cookie** — `lib/api.ts` sends `credentials:
"include"` and never sets an `Authorization` header. So the admin expert-
management page always received `401` when it asked for inactive experts, and
could only ever show active ones.

Every other guard in the codebase uses `extractToken()`, which checks the header
first and falls back to the cookie. This route just did not use it.

### Solution

```diff
-const header = req.headers.authorization || "";
-if (header.startsWith("Bearer ")) {
-  try {
-    const decoded = verifyAccessToken(header.slice(7));
-    isAdmin = decoded.kind === "admin";
-  } catch (_) { /* token invalid — not admin */ }
-}
+const token = extractToken(req);
+if (token) {
+  try {
+    const decoded = verifyAccessToken(token);
+    isAdmin = decoded.kind === "admin";
+  } catch (_) { /* token invalid or expired — not admin */ }
+}
```

Unused `authRequired` import dropped in the same edit.

### Testing notes

```bash
# cookie auth (what the browser does) — previously 401
curl -b "access_token=$ADMIN_JWT" "$API/api/experts?all=1"     # => 200, includes inactive

# header auth still works
curl -H "Authorization: Bearer $ADMIN_JWT" "$API/api/experts?all=1"   # => 200

# a non-admin is still refused
curl -b "access_token=$USER_JWT" "$API/api/experts?all=1"      # => 401
```

## Risk / impact

- **14a**: admin/expert "Forgot Password?" still routes to `/contact`. Those
  roles have no self-service reset. If that becomes a requirement, it needs new
  backend routes — noted in the final report.
- **14b**: removes visible UI. Intentional; see above.
- **14c**: `GET /api/slots/availability` returns a bare array via `ok()`, not the
  paginated envelope. With a very large number of experts this should gain
  pagination; it is bounded by the expert roster, not by slot volume, so it is
  fine at realistic sizes.
- **14c**: the table's View/Edit actions deep-link to
  `/admin/expert-management?expert=<id>`. That page does not yet read the
  `expert` query parameter, so the links land on the list rather than the
  specific record. Listed as a follow-up in the final report.
- **14d**: `?all=1` now genuinely exposes inactive experts and their PII to
  cookie-authenticated admins, which is the intent — but it is the first time
  that path has actually been reachable. The `adminRequired`-equivalent check is
  in place and was verified above.
