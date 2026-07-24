# 016 — Build admin UIs for five fully-implemented but unreachable backend features

- **Category**: Missing Feature / Integration (Frontend-Backend)
- **Severity**: High (one item is a hard blocker for expert login)
- **File(s) affected**:
  - `amoo-web/app/admin/coupon-management/page.tsx` *(new)*
  - `amoo-web/app/admin/contact-inbox/page.tsx` *(new)*
  - `amoo-web/app/admin/blog-management/page.tsx` *(new)*
  - `amoo-web/app/admin/testimonial-management/page.tsx` *(new)*
  - `amoo-web/app/admin/expert-management/SetPasswordDialog.tsx` *(new)*
  - `amoo-web/app/admin/shared/AdminPageHeader.tsx` *(new)*
  - `amoo-web/app/admin/expert-management/ExpertPanel.tsx`
  - `amoo-web/app/admin/AdminSidebar.tsx`
  - `amoo-web/lib/api.ts`

## Problem

The Phase 1 audit found **17 backend endpoints with zero frontend callers**.
These were not stubs — every one was fully implemented, validated, audited and
exposed through a typed method in `lib/api.ts`. There was simply no page that
called them. Five clusters had real user-facing consequences:

| Feature | Backend | Consequence of no UI |
|---|---|---|
| **Expert passwords** | `POST /api/experts/:id/set-password` | **`experts.password_hash` was always NULL, so no expert could ever log in.** `/astrologer-login` was decorative. |
| **Coupons** | `GET/POST/PATCH/DELETE /api/coupons` | No coupon could be created, so the checkout coupon box could only ever reject what a customer typed. |
| **Contact enquiries** | `GET /api/contact`, `GET/PATCH/DELETE /:id` | The public contact form accepted messages from real customers into a table **nobody could read**. |
| **Blog** | `GET /api/blogs/all`, `POST/PATCH/DELETE` | The public `/blog` and `/blog/[slug]` pages were live but could only be populated by hand-written SQL. |
| **Testimonials** | `GET /api/testimonials/all`, `PATCH /:id` | `POST /api/testimonials` deliberately inserts as `Inactive` for approval — but nothing could approve. A moderation queue with no moderator. |

The expert-password gap is the sharpest: experts have no self-service signup and
no password reset (`POST /api/auth/reset-password` only touches `users`), so
that single endpoint is the *only* way an expert credential can ever exist.
Without a UI, the entire expert role was unusable end to end.

The contact inbox is the most commercially damaging: enquiries have been
accumulating in `contacts` since launch with no way to see them.

## Solution

Four new admin pages plus one dialog, following the existing
`app/admin/faq-management/page.tsx` pattern so they read as part of the same
panel — while fixing that pattern's weaknesses:

- **`alert()` → shared `useToast`.** The FAQ page used `alert("Failed to save
  FAQ.")`, which is blocking and unstyled.
- **Real loading/empty/error states** from `app/components/states.tsx`, with a
  working retry, instead of a bare `"Loading..."` cell and a swallowed `catch`.
- **Server-side filtering and pagination.** The FAQ page fetches everything and
  filters in JavaScript, which stops working past a page of data.
- **`htmlFor`-associated labels** on every input, `role="dialog"` +
  `aria-modal` on modals, `role="alert"` on errors.
- **A shared `AdminPageHeader`**, since each page had ~30 lines of duplicated
  breadcrumb/title markup.

### Notable per-page decisions

**Coupons** — the API returns `active` alone, which would show an expired or
exhausted coupon as "Active". The status badge derives four real states
(Active / Expired / Exhausted / Inactive) from `active`, `expires_at` and
`used_count >= max_uses`. Percentage values are capped at 100 client-side to
mirror the server rule.

**Contact inbox** — `PATCH /api/contact/:id` stores a `reply` string and **sends
no email**. The UI says so explicitly rather than implying the customer was
contacted, and offers a `mailto:` link to actually reply. Presenting a stored
note as a sent reply would leave customers waiting for a message that never
arrives.

**Blog** — the slug auto-derives from the title for new posts but is *frozen*
when editing, with a warning, because it is the permalink. Read time is
estimated from word count if left blank. The content field notes that HTML is
DOMPurify-sanitised on render, and the image field warns that
`images.remotePatterns` restricts hosts.

**Testimonials** — defaults to the **pending** queue rather than "all", because
reviewing submissions is the actual job.

**Expert set-password** — generates a 16-character password from a
crypto-random alphabet with ambiguous glyphs (`O/0`, `l/1/I`) excluded, since
the value gets retyped or read aloud. States plainly that it is shown once,
stored only as a bcrypt hash, and that setting it signs the expert out of
existing sessions (the endpoint bumps `token_version`).

### Sidebar

Added the five entries, and **removed three dead ones** — "Courses", "Content
Management" and "Settings" all pointed at `/admin/admin-dashboard`, so they
looked like features and silently bounced the admin back to the dashboard.

## Before / After

**Before** — `lib/api.ts` had the methods; nothing imported them:
```ts
getCoupons: () => request("GET", "/api/coupons"),          // 0 callers
createCoupon: (body) => request("POST", "/api/coupons", body),   // 0 callers
getContacts: () => request("GET", "/api/contact"),         // 0 callers
getBlogs: (query = "") => request("GET", `/api/blogs/all${query}`),  // 0 callers
getTestimonials: () => request("GET", "/api/testimonials/all"),     // 0 callers
// setExpertPassword did not exist at all
```

**After** — query support added where the pages need server-side filtering, plus
the missing method:
```diff
-getCoupons: () => request("GET", "/api/coupons"),
+getCoupons: (query = "") => request("GET", `/api/coupons${query}`),
-getContacts: () => request("GET", "/api/contact"),
+getContacts: (query = "") => request("GET", `/api/contact${query}`),
-getTestimonials: () => request("GET", "/api/testimonials/all"),
+getTestimonials: (query = "") => request("GET", `/api/testimonials/all${query}`),
+setExpertPassword: (id: number, password: string) =>
+  request("POST", `/api/experts/${id}/set-password`, { password }),
```

**Sidebar** — before/after
```diff
+{ label: "Coupons", Icon: Ticket, href: "/admin/coupon-management" },
+{ label: "Availability & Slots", Icon: CalendarClock, href: "/admin/availability-slots" },
 { label: "Users", Icon: User, href: "/admin/user-management" },
 { label: "Expert Management", Icon: UserCog, href: "/admin/expert-management" },
-{ label: "Courses", Icon: GraduationCap, href: "/admin/admin-dashboard" },
-{ label: "Content Management", Icon: FileText, href: "/admin/admin-dashboard" },
+{ label: "Blog Management", Icon: FileText, href: "/admin/blog-management" },
+{ label: "Testimonials", Icon: MessageSquareQuote, href: "/admin/testimonial-management" },
+{ label: "Contact Inbox", Icon: Inbox, href: "/admin/contact-inbox" },
 { label: "FAQ Management", Icon: HelpCircle, href: "/admin/faq-management" },
-{ label: "Settings", Icon: Settings, href: "/admin/admin-dashboard" },
```

**Expert row actions** — before/after
```diff
 <button onClick={() => openEdit(expert)} title="Edit"> <Pencil /> </button>
+<button onClick={() => setPasswordTarget(expert)} title="Set login password"
+        aria-label={`Set login password for ${sanitize(expert.name)}`}>
+  <KeyRound size={13} strokeWidth={2} />
+</button>
 <button onClick={() => { setDeleting(expert); setConfirmOpen(true); }} title="Delete"> <Trash2 /> </button>
```

## Testing notes

`tsc --noEmit` clean. Backend `npm test` 73/73.

End-to-end, as an admin (`admin@amooguru.com` / `admin123` after `npm run seed`):

**Expert login — the blocker.** This is the one to verify first:
```
1. /admin/expert-management → create an expert
2. Try /astrologer-login with that email      => "Invalid credentials"  (password_hash NULL)
3. Click the key icon → Set password → copy the generated value
4. /astrologer-login with the same email      => logs in ✅
```
```sql
SELECT password_hash IS NOT NULL AS has_pw, verified, token_version FROM experts WHERE id = <id>;
-- has_pw=1, verified=1, token_version incremented
```

**Coupons → checkout.** Create `TEST20`, 20% off, min order 0, active. Then run
a real consultation checkout: the coupon box must report a saving equal to 20%
of `services.price`, and after paying, `bookings.amount` must be the discounted
figure with one row in `coupon_usages`.

**Contact inbox.** Submit through the public `/contact` form, then confirm the
message appears at `/admin/contact-inbox`. Mark replied → `contacts.status`
becomes `replied`. Check the "does not email the customer" note is visible.

**Blog.** Create a post as **draft** → it must NOT appear on `/blog`. Switch to
**published** → it appears, and `/blog/<slug>` renders the sanitised HTML.

**Testimonials.** Submit one as a signed-in user (`POST /api/testimonials`), see
it in the **Pending** tab, click Publish, then confirm it appears in the public
carousel on `/services/tarot-reading`.

**Sidebar.** All five new links resolve; no entry lands back on the dashboard.

## Risk / impact

- **These pages are new surface area on privileged endpoints.** All five sit
  under `app/admin/layout.tsx`, which wraps everything in `RequireAdmin`, and
  every endpoint independently enforces `adminRequired` server-side — the client
  guard is convenience, not the control.
- **Blog content is admin-authored HTML** rendered via
  `dangerouslySetInnerHTML` after DOMPurify sanitisation, with CSP as the
  backstop (change 013). An admin is already trusted, but note that
  `sanitizeHtml` allows `style` attributes; tighten `ALLOWED_ATTR` in
  `lib/sanitize.ts` if untrusted authors ever get blog access.
- **The generated expert password is shown in the DOM.** It is `type="password"`
  by default but toggleable, and lands in the clipboard. That is inherent to an
  admin-set-credential flow; the alternative is an emailed invitation link,
  which needs a new backend route. Flagged in the final report.
- **`GET /api/coupons` has no `search`/`status` handling** beyond what
  `validateQuery` allows — `status=active|inactive` and `search` are supported;
  other values are ignored rather than erroring.
- **Removing the three dead sidebar entries removes visible UI.** They navigated
  nowhere; re-add them when the pages exist.
- **Not yet wired**: `/admin/expert-management?expert=<id>` deep links from the
  availability table are not read by that page (change 014), and the
  `getBooking`/`updateBooking`/`getUploads`/`exportCSV` client methods still
  have no caller. Listed in the final report.
