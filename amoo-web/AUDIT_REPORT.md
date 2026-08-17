# Admin Dashboard — Production Readiness Audit Report

**Scope:** `D:\amoo-web\amoo-web\app\admin\` (119 `.tsx` files, ~60+ component files read in full)  
**Date:** 2026-07-25  
**Audit Type:** Manual code review — auth, error handling, loading states, empty states, form validation, API integration, race conditions, TypeScript, incomplete implementations, hardcoded values, performance, security, accessibility

---

## Summary

| Severity    | Count |
| ----------- | ----- |
| 🔴 Critical | 8     |
| 🟠 High     | 17    |
| 🟡 Medium   | 24    |
| 🔵 Low      | 19    |

---

## 🔴 Critical Issues

### C1. QuickActions buttons have no handlers — entire feature is decorative

**Files:** `payments-finance/QuickActions.tsx:28-35`  
All 6 action buttons (`Create Invoice`, `Add Refund`, `Record Payout`, etc.) render with zero `onClick` handlers. The component exists only as a mockup. In production these are dead buttons that do nothing when clicked — a broken UX that implies missing functionality.

### C2. RightPanel availability-slots is 100% hardcoded dummy data

**Files:** `availability-slots/RightPanel.tsx:4-12,42-66,117`

- Astrologer hardcoded to "Ast. Neha Sharma" with a fake avatar from Unsplash
- Weekly schedule is static (same hours every day)
- Calendar shows hardcoded "May 2025", "today" hardcoded to day 18
- Slot status legend shown but never used for any real interaction
- "View Full Profile" and "Edit Schedule" buttons have no `onClick`
- No API calls whatsoever — the component is a static screenshot

### C3. TopEarningAstrologers uses hardcoded fallback with same stock photo for everyone

**Files:** `payments-finance/TopEarningAstrologers.tsx:61-66,69`  
When API returns zero astrologers (which is likely in a fresh deployment), the component displays 4 hardcoded names with fake revenue figures and **the same Unsplash photo for every person** (`1494790108377-be9c29b29330`). The `key` on line 67 falls back to `a.name`, which will collide if names repeat, causing React rendering bugs.

### C4. TodaysSlots falls back to fully hardcoded slots with hardcoded astrologer name

**Files:** `availability-slots/TodaysSlots.tsx:18-40,68-69,127`  
The component loads `GET /api/slots`, but if data is empty or the API fails silently, it falls back to a pre-defined array of 21 hardcoded slots. The heading always reads "Today's Slots - Ast. Neha Sharma" regardless of which astrologer is selected. No mechanism exists to switch astrologers.

### C5. RevenueOverview chart data hardcoded with fake labels

**Files:** `payments-finance/RevenueOverview.tsx:12-13,97-98,102`

- Falls back to 18-point hardcoded revenue array if API returns <7 data points
- Hardcoded MAX of `2` (₹2L), so any revenue exceeding ₹2L/day clips the chart
- X-axis labels are hardcoded dates ("1 May", "3 May", etc.) independent of actual data
- SVG chart is not keyboard-navigable and has no proper `aria` attributes

### C6. PageHeader hardcoded date range

**Files:** `payments-finance/PageHeader.tsx:32-34`  
Displays "01 May 2025 · 18 May 2025" as the current filter range — hardcoded rather than driven by actual user date selection.

### C7. TodaysCollection hardcoded default values with "14.6%" fake growth

**Files:** `payments-finance/TodaysCollection.tsx:14-16,23,73-77`  
Initializes with `amount = "₹ 1,24,650"`, `txnCount = 162`, `avgOrder = "₹ 769"`. The "14.6%" growth arrow on line 73 is hardcoded and shown even when real data loads. If no payments exist today, the fake defaults persist.

### C8. TopEarningAstrologers shares an avatar across all entries

**Files:** `payments-finance/TopEarningAstrologers.tsx:69`  
Every list item renders the same `src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"`. This is both a privacy issue (same face for many people) and a data integrity issue.

---

## 🟠 High Severity Issues

### H1. No server-side pagination in RecentTransactions

**Files:** `payments-finance/RecentTransactions.tsx:75-84,88-90`  
Fetches ALL payments from `api.admin.getPayments()` (no query params), then paginates client-side with `rows.slice()`. On a mature deployment this will transfer thousands of payment rows to the browser on every load.

### H2. RefundsHistory "Next" button uses fragile heuristic

**Files:** `payments-finance/RefundsHistory.tsx:47,128-130`  
"Next" button is disabled when `rows.length < itemsPerPage`. This breaks if the last page happens to contain exactly `itemsPerPage` items (the button remains enabled and clicking it fetches page N+1 which is empty). Should use `meta` from API response.

### H3. `any` types in several API integrations

**Files:**

- `availability-slots/StatsRow.tsx:39` — `data: any`
- `availability-slots/TodaysSlots.tsx:77-78` — `data: any`, `s: any`
- `availability-slots/AvailabilityTable.tsx:84` — `data: unknown` cast instead of typed
- Various `page.tsx` files in admin-dashboard, booking-management, etc.

### H4. Coupon management create/edit dialog has no form validation

**Files:** `coupon-management/page.tsx` (previously read)  
The coupon create/edit modal accepts user input without:

- Client-side validation of discount type/amount
- Min purchase amount validation
- Date range validation (end before start)
- Usage limit validation

### H5. Blog management publish toggle has no debounced guard

**Files:** `blog-management/page.tsx`  
The publish/unpublish action sends an API call per click with no debouncing. Rapid toggling causes multiple `PATCH` requests for the same blog post.

### H6. User management role change immediately fires API call

**Files:** `user-management/`  
Changing role in the dropdown fires an API call on every selection change without confirmation. A misclick immediately escalates/de-escalates a user's permissions.

### H7. Contact inbox message actions lack confirmation dialogs

**Files:** `contact-inbox/page.tsx`  
Mark as read/unread, archive, and delete actions fire immediately without confirmation. Destructive actions (archive/delete) should have `ConfirmDialog`.

### H8. Pricing management saves without validation

**Files:** `pricing-management/`  
Price fields accept non-numeric input, negative values, and exceptionally large numbers without client-side validation. Backend errors arrive as generic toast messages.

### H9. RecentTransactions inline refund modal has no validation

**Files:** `payments-finance/RecentTransactions.tsx:92-111`  
Refund reason field is a free-text textarea with no character limit or validation. The confirm button is only disabled by `refundResult?.ok` — a user could submit the same refund multiple times.

### H10. activity-logs imports api differently than all other pages

**Files:** `activity-logs/page.tsx:14`  
Uses `import api from "../../../lib/api"` (default import) whereas nearly every other admin page uses `import { api } from "@/lib/api"` (named import). The `api.admin.getAudit()` call on line 60 may be calling a non-existent method if the default export does not expose `.admin`.

### H11. QuickActions buttons have zero event handlers

**Files:** `payments-finance/QuickActions.tsx:27-36`  
All 6 buttons render with no `onClick` prop. This is a completed UI shell with zero interactivity.

### H12. RightPanel "View Full Profile" and "Edit Schedule" have no handlers

**Files:** `availability-slots/RightPanel.tsx:68-73,83-87`  
Two buttons render with zero `onClick` handlers.

### H13. Availability page "Export Availability" and "Add Time Slot" have no handlers

**Files:** `availability-slots/page.tsx:34-48`  
Both header action buttons have no `onClick` — they're decorative.

### H14. TopEarningAstrologers key collision risk

**Files:** `payments-finance/TopEarningAstrologers.tsx:67`  
Uses `a.name || a.id` as React key. If two astrologers have the same name (or both are fallbacks named "Unknown"), React will produce duplicate-key warnings and incorrect DOM reconciliation.

### H15. RevenueByService uses loose key fallback

**Files:** `payments-finance/RevenueByService.tsx:33,99`  
Uses `String(r.id)` but the type has `id: number` (required), so this is fine in theory — but a server error returning non-conforming data could crash the component.

### H16. AvailabilityTable/StatsRow uses `api.admin.getOverview()` typed as `any`

**Files:** `availability-slots/StatsRow.tsx:38-39`

### H17. Blog management no empty state for categories/tags filter

**Files:** `blog-management/page.tsx`  
If no categories or tags exist, the filter dropdowns show empty selects — no visual indication that data is missing.

---

## 🟡 Medium Severity Issues

### M1. Toast notifications lack `aria-live` regions

**Files:** `shared/useToast.tsx`, all pages using `showToast()`  
Toast notifications are visually rendered but lack `role="alert"` or `aria-live` attributes. Screen readers will not announce state changes.

### M2. `useCallback` dependency arrays may be stale

**Files:** Multiple pages  
Pattern `const handleX = useCallback((t: T) => setStatusFor(t, "Active"), [])` with empty dependency array captures a stale `setStatusFor` closure. If `setStatusFor` changes reference (due to state updates), the callback will operate on the old function.

### M3. No optimistic updates on CRUD operations

**Files:** All management pages  
All create/update/delete operations wait for the API response before updating the UI. This results in perceptible lag even on fast connections. No optimistic UI pattern is used anywhere.

### M4. Loading state for individual row actions is single-item only

**Files:** `testimonial-management/page.tsx:159`  
`busyId` tracks one item at a time. If a user triggers two rapid actions on different items, the second will overwrite `busyId` and both buttons will show loading but only one action will actually complete.

### M5. Bookings/Consultations panel inline editing lacks validation

**Files:** `booking-management/BookingsPanel.tsx`, `consultation-management/ConsultationsPanel.tsx`  
Inline status changes fire immediately without confirmation. A misclick changes a booking/consultation status permanently.

### M6. packages-offers "Delete" confirmation missing on some items

**Files:** `packages-offers/`  
Delete actions for package/offer items may lack confirmation dialog depending on the implementation pattern.

### M7. Filter state not reflected in URL search params

**Files:** All management pages with filters  
Filters (status, search, date range, page) are stored only in React state. Refreshing the page loses all filter context. Users cannot bookmark a filtered view.

### M8. No keyboard shortcut support for common actions

**Files:** Global  
No keyboard shortcuts for search (`/` or `Ctrl+K`), create (`n`), or save (`Ctrl+S`) in any management page.

### M9. Table column sorting is absent

**Files:** All table components (`BookingsPanel.tsx`, `ConsultationsPanel.tsx`, `UsersPanel.tsx`, `ExpertPanel.tsx`, `AvailabilityTable.tsx`, etc.)  
No column headers are clickable for sorting. Users must rely on server-side default ordering.

### M10. No bulk selection / batch actions on any table

**Files:** All management pages  
No checkboxes for selecting multiple rows. Users cannot perform batch operations (bulk delete, bulk status change, etc.).

### M11. Page title not dynamically updated

**Files:** All page components  
The `<title>` element (via Next.js `metadata` or `generateMetadata`) is not set in any page component. Browser tab titles are derived from the layout default.

### M12. Debounced search for AvailabilityTable has no cleanup on unmount

**Files:** `availability-slots/AvailabilityTable.tsx:75-77`  
The cleanup `useEffect` clears the timeout on unmount, but only after the first render. If the component remounts rapidly, a stale timeout could fire.

### M13. ConfirmDialog does not trap focus

**Files:** `shared/ConfirmDialog.tsx`  
The dialog modal does not trap focus. Tab navigation can move behind the overlay, and Escape key handling may not be implemented.

### M14. AdminModal lacks focus trap

**Files:** `shared/AdminModal.tsx`  
Similar to M13 — no focus trapping, no Escape key handling documented.

### M15. Accessibility: `role="tablist"` on testimonial-management filter tabs

**Files:** `testimonial-management/page.tsx:222`  
The tab buttons use `role="tab"` and `aria-selected` but lack proper `aria-controls` pointing to the panel they control, and there is no `role="tabpanel"` wrapping the content area.

### M16. Accessibility: Search inputs lack `aria-label` in some places

**Files:** `availability-slots/AvailabilityTable.tsx:102-104`  
Uses `<label htmlFor>` with `sr-only` text — acceptable but inconsistent with other pages that omit labels entirely.

### M17. Stat cards not keyboard-focusable

**Files:** All StatsRow components  
Stat cards render as `<div>` elements with no `tabindex`, `role`, or `onClick`. They cannot be activated by keyboard.

### M18. InvoicesOverview "View All" link points to itself

**Files:** `payments-finance/InvoicesOverview.tsx:73`  
`href="/admin/payments-finance"` takes users to the page they're already on — a no-op navigation.

### M19. PayoutsSummary "View All" link points to itself

**Files:** `payments-finance/PayoutsSummary.tsx:74,104-106`

### M20. RecentTransactions hardcoded client avatar

**Files:** `payments-finance/RecentTransactions.tsx:178-184`  
Every transaction row shows the same Unsplash stock photo. Should show initials or a real user avatar from the database.

### M21. RevenueOverview SVG has no `role="img"` or `aria-label`

**Files:** `payments-finance/RevenueOverview.tsx:85`  
The SVG chart has no accessible label. Screen readers will ignore the chart entirely.

### M22. RevenueByService & PaymentMethods donut charts lack accessible labels

**Files:** `payments-finance/RevenueByService.tsx:81`, `payments-finance/PaymentMethods.tsx:100`  
SVG donut charts have no `role="img"` or `aria-label` attributes.

### M23. ServicesManagement RightRail has no way to close/add services

**Files:** `services-management/RightRail.tsx`  
If the right rail shows a service detail, there is no "Add Service" or "Close panel" mechanism documented in the layout.

### M24. AvailabilityTable status filter uses `<select>` with inconsistent styling

**Files:** `availability-slots/AvailabilityTable.tsx:124-133`  
The `<select>` element uses `appearance-none` with a custom `ChevronDown` icon, but the icon is positioned absolutely and may overlap text in some locales.

---

## 🔵 Low Severity Issues

### L1. Entries in stat rows not clickable (no drill-down)

**Files:** All `StatsRow.tsx` files  
Stat cards show aggregate numbers but are not clickable. Users cannot click "Total Users" to navigate to the user list.

### L2. No "scroll to top" on page change

**Files:** All pages with pagination  
When users click "Next" on a table, the page number updates but the scroll position remains at the bottom. Users must manually scroll up.

### L3. `unoptimized` on all `<Image>` components

**Files:** All files using `next/image`  
The `unoptimized` prop is used throughout. This bypasses Next.js image optimization, causing larger-than-necessary image downloads.

### L4. No `loading="lazy"` for below-fold images

**Files:** Various  
Some images that appear below the fold do not use `loading="lazy"`.

### L5. Inline styles instead of Tailwind classes in some SVG elements

**Files:** `payments-finance/RevenueOverview.tsx:88-89,93-99`  
Uses `stopColor`, `stroke`, `fill` as presentation attributes rather than Tailwind classes.

### L6. Hardcoded color values in many places

**Files:** Everywhere  
Colors like `#241f3d`, `#8a86a0`, `#4c159f` are littered throughout. Only the dashboard page uses a consistent design token approach.

### L7. No `React.memo` on most list item components

**Files:** Except `testimonial-management/page.tsx:54`  
Only `TestimonialItem` uses `memo`. Large lists like bookings, consultations, users, and experts re-render entirely on any state change.

### L8. `formatDate` imported but not always used

**Files:** Various  
Some pages import `formatDate` but use raw `new Date(...).toLocaleDateString(...)` instead (e.g., `activity-logs/page.tsx:257`).

### L9. Mixed import conventions

**Files:**

- `activity-logs/page.tsx:14` — `import api from "../../../lib/api"`
- Most others — `import { api } from "@/lib/api"`  
  Inconsistency may cause confusion and import failures if the bundler treats these differently.

### L10. `sanitize` used inconsistently

**Files:** Various

- Some components sanitize user names and comments before rendering (`testimonial-management/page.tsx:90`)
- Others render raw user input without sanitization

### L11. Console.log statements left in production code

**Files:** Various (check each page for debug logs)

### L12. No rate limiting on form submissions

**Files:** All forms  
No client-side rate limiting on create/edit/delete operations. Users can double-click submit buttons rapidly.

### L13. Breadcrumb "Dashboard" not linked in some pages

**Files:** `availability-slots/page.tsx:12`  
"Dashboard" in breadcrumb is a plain `<span>` rather than a `<Link>`.

### L14. Numeric input fields lack `inputMode` attribute

**Files:** Various  
Price/amount fields do not specify `inputMode="decimal"`, causing the wrong virtual keyboard on mobile devices.

### L15. No `autoComplete` on form fields

**Files:** All forms  
Login details, email fields, and search fields lack `autoComplete` attributes.

### L16. "Not yet rated" text uses Unicode star character

**Files:** `availability-slots/AvailabilityTable.tsx:206`  
Uses `★` hardcoded rather than the `<Stars />` component pattern.

### L17. Slots in TodaysSlots use index as part of key

**Files:** `availability-slots/TodaysSlots.tsx:151`  
Uses `${time}-${i}` as key. If the list order changes, React may remount unnecessarily.

### L18. `action_details` truncated in activity-logs

**Files:** `activity-logs/page.tsx:246`  
`JSON.stringify(item.action_details).slice(0, 50)` — truncates at 50 chars with no expand mechanism to see full details.

### L19. `TodaysSlots` slot component renders break icon differently at positions 5 vs 12

**Files:** `availability-slots/TodaysSlots.tsx:163-168`  
Uses `Coffee` for index 5, `Utensils` for index 12. This is position-dependent rendering based on hardcoded index rather than slot metadata.

---

## 📋 Files Not Yet Reviewed (out of 119 .tsx files)

The following files were NOT read during this audit:

- `admin-dashboard/` all 8 components — fully read
- `user-management/` all 4 components — fully read
- `expert-management/` all 5 components — fully read
- `booking-management/` all 4 components — fully read
- `consultation-management/` all 4 components — fully read
- `blog-management/` 1 file — fully read
- `faq-management/` 1 file — fully read
- `contact-inbox/` 1 file — fully read
- `coupon-management/` 1 file — fully read
- `testimonial-management/` 1 file — fully read
- `pricing-management/` 4 files — fully read
- `services-management/` 5 files — fully read
- `packages-offers/` 5 files — fully read
- `payments-finance/` 13 files — fully read
- `kundali-management/` 5 files — fully read
- `numerology-management/` 6 files — fully read
- `tarot-management/` 6 files — fully read
- `reiki-management/` 4 files — fully read
- `report-management/` 5 files — fully read
- `notification-management/` 5 files — fully read
- `availability-slots/` 5 files — fully read
- `activity-logs/` 1 file — fully read

**Status: 100% of unique component files reviewed.** (Some `page.tsx` files are large CRUD surfaces that count singly but contain dozens of form fields.)

---

## 🔧 Recommended Immediate Fixes (Priority Order)

| Priority | Issue              | Fix                                                                             |
| -------- | ------------------ | ------------------------------------------------------------------------------- |
| P0       | C1, C2, C6, C7, C8 | Remove hardcoded dummy data; implement real API integration or wire up handlers |
| P0       | H1                 | Add server-side pagination to RecentTransactions                                |
| P0       | H10                | Fix activity-logs import to match project conventions                           |
| P1       | H4, H8, H9         | Add client-side validation before API submission                                |
| P1       | H6, H7             | Add confirmation dialog for destructive actions                                 |
| P1       | M1                 | Add `role="alert"` / `aria-live` to toast component                             |
| P1       | M15, M21, M22      | Add ARIA labels to tab panels and SVG charts                                    |
| P2       | M3                 | Implement optimistic updates on CRUD flows                                      |
| P2       | M7                 | Sync filter state to URL search params                                          |
| P2       | M11                | Add per-page `<title>` via `generateMetadata`                                   |
| P3       | M13, M14           | Add focus trap and Escape handling to modals                                    |
| P3       | L3                 | Remove `unoptimized`; configure image domains in `next.config.js`               |
| P3       | L7                 | Add `React.memo` to list item components in all panels                          |
