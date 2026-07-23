# 010 — User dashboard was locked to experts; activity tracking was silently 403ing

- **Category**: Bug Fix / Integration (Frontend-Backend)
- **Severity**: Critical
- **File(s) affected**:
  - `amoo-web/app/user-dashboard/layout.tsx`
  - `amoo-web/lib/tracking.ts`
  - `amoo-web/lib/api.ts`

Two unrelated defects, both of which made a whole feature area silently
non-functional.

---

## 10a. Every regular user was redirected away from their own dashboard

### Problem

```tsx
import { RequireExpert } from "../../lib/auth-context";

export default function UserDashboardLayout({ children }) {
  return (
    <RequireExpert>
      ...
    </RequireExpert>
  );
}
```

`RequireExpert` permits only experts and admins:

```tsx
} else if (!isExpert && !isAdmin) {
  // Regular users hitting an expert-only route get sent home
  router.replace(fallbackPath);   // defaults to "/"
}
```

So a logged-in **customer** — the only audience the dashboard was built for —
was bounced to the homepage. Every page under `/user-dashboard` was affected:
the dashboard home, account profile, my reports, consultations, kundali, tarot,
reiki and numerology dashboards, payments & subscriptions, activity — roughly
**half the application's screens**, all unreachable by the people they exist for.

The sibling `app/admin/layout.tsx` correctly uses `RequireAdmin`, and
`auth-context.tsx` exports a `RequireAuth` that does exactly what was wanted, so
this was a wrong-import mistake rather than a design choice — the comment inside
`RequireExpert` ("Regular users hitting an expert-only route get sent home")
makes the intent of that component unambiguous.

### Solution

Swap to `RequireAuth`, which admits any authenticated account and redirects
anonymous visitors to `/user-login`.

### Before / After

```diff
-import { RequireExpert } from "../../lib/auth-context";
+import { RequireAuth } from "../../lib/auth-context";

-    <RequireExpert>
+    <RequireAuth>
       <div className="flex min-h-screen bg-[#faf7f2]">
       ...
-    </RequireExpert>
+    </RequireAuth>
```

### Testing notes

```bash
npm run seed   # creates vedika.desai@gmail.com / user123
```
Log in as that user and navigate to `/user-dashboard`. The dashboard must render
— previously the URL flashed and then redirected to `/`. Repeat for
`/user-dashboard/account-profile` and `/user-dashboard/my-reports`.

Also confirm the guard still works: log out and visit `/user-dashboard`
directly; you should land on `/user-login`.

### Risk / impact

`RequireAuth` admits experts and admins to the customer dashboard too. That is
consistent with how `useAuth` models roles today (one session, one `kind`) and
matches the previous behaviour for those two roles, so nothing is lost. If the
product later needs a distinct expert workspace, that is a new route tree under
its own `RequireExpert`, not a narrowing of this one.

---

## 10b. Every activity-tracking call was rejected with 403, silently

### Problem

```ts
export function trackEvent(action, actionDetails?, pageOrRoute?) {
  if (typeof window === "undefined") return;
  // ...
  fetch(`${API_URL}/api/activity/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },   // ← no X-CSRF-Token
    credentials: "include",
    body: JSON.stringify(body),
  }).catch(() => {});
}
```

The backend applies `csrfGuard` to every state-changing request except a short
bootstrap allow-list, and `/api/activity/log` is not on it:

```js
const EXEMPT_PATHS = new Set([
  "/api/auth/register", "/api/auth/login", ... "/api/payments/webhook",
]);
function csrfGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (EXEMPT_PATHS.has(req.path)) return next();
  return csrfProtection(req, res, next);   // 403 "Missing CSRF token"
}
```

So **100% of tracking calls returned 403**. The failure was invisible twice
over: `fetch` does not reject on a non-2xx response, and the `.catch(() => {})`
would have swallowed it anyway.

Consequences:
- `GET /api/activity/mine` and `/user-dashboard/activity` could only ever render
  "No activity recorded yet".
- `/admin/activity-logs` was permanently empty.
- The `PageViewTracker` component, mounted across the app, did nothing.
- Login/signup/booking events used for support and abuse investigation were
  never recorded.

The bare `fetch` also skipped the shared client's 401 → refresh → retry, so even
with CSRF fixed it would have dropped events whenever an access token expired.

### Solution

Route the call through `lib/api.ts` like every other mutation. `request()`
attaches `X-CSRF-Token` (bootstrapping one via `GET /api/health` if the session
has not seen a token yet), sends credentials, and handles token refresh.

### Before / After

**Before** — `lib/tracking.ts`
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
// ...
fetch(`${API_URL}/api/activity/log`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(body),
}).catch(() => {});
```

**After** — `lib/tracking.ts`
```ts
import api from "./api";
// ...
api
  .logActivity({
    action,
    ...(actionDetails ? { action_details: actionDetails } : {}),
    page_or_route: pageOrRoute || window.location.pathname,
  })
  .catch(() => {
    // Analytics is best-effort: a failure here must never surface to the user.
  });
```

**New** — `lib/api.ts`
```ts
logActivity: (body: {
  action: string;
  action_details?: Record<string, unknown>;
  page_or_route?: string;
}) => request("POST", "/api/activity/log", body),
```

### Testing notes

```bash
# Before: this returns 403 and nothing is stored.
```
Log in through the UI, open devtools → Network, and navigate between pages.
`POST /api/activity/log` should now return **200** with `{"success":true,
"data":{"logged":true}}` and carry an `X-CSRF-Token` request header.

Then confirm the data actually lands:
```bash
curl "$API/api/activity/mine?page=1&pageSize=20" -H "$AUTH"
# => rows with action "page_view" / "login"
```
and load `/user-dashboard/activity` — it should list events instead of the empty
state. As an admin, `/admin/activity-logs` should now be populated.

### Risk / impact

- **Write volume.** Tracking was effectively disabled, so `audit_log` will now
  grow at its intended rate for the first time — one row per page view per
  signed-in user. `POST /api/activity/log` is covered by the global rate limiter
  (200 req / 15 min per IP by default), which a heavy navigator could approach.
  Consider batching page views client-side, and add a retention policy for
  `audit_log`. Flagged in the final report.
- **`POST /api/activity/log` has no body validation** — `action` is only checked
  for being a non-empty string and `action_details` is stored as arbitrary JSON.
  Now that the endpoint actually receives traffic this matters more; addressed
  in change 011.
- Tracking only fires for authenticated users (`authRequired`), so anonymous
  page views are still not recorded. That is unchanged behaviour.
