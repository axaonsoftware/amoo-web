# 019 — Accessibility pass and resilient error handling

- **Category**: Accessibility / UX / Bug Fix
- **Severity**: Medium
- **File(s) affected**:
  - `amoo-web/app/layout.tsx`
  - `amoo-web/app/global-error.tsx` *(new)*
  - `amoo-web/app/components/ErrorBoundary.tsx`
  - `amoo-web/app/components/ContentProtection.tsx` *(unmounted)*
  - `amoo-web/app/admin/shared/AdminModal.tsx`
  - ~13 form files (label/input association)
  - 66 page files (skip-link target)
  - the three login pages (dead "Remember Me" removed)

## 19a. Form inputs were not associated with their labels

### Problem

The app had **65 `<input>` elements and 2 `htmlFor` attributes**. Almost every
label was purely visual — positioned near its field but not programmatically
linked. A screen reader announces such a field as unlabelled ("edit text,
blank"), and clicking the label text does not focus the control. This spans the
login forms, signup, the whole consultation booking form, and every admin
create/edit modal.

### Solution

- **`AdminModal`** (shared by most admin create/edit forms) now generates a
  namespaced `id` per field, sets `htmlFor`, and wires `aria-invalid` /
  `aria-describedby` / `aria-required` plus `role="alert"` on the error text.
  One change covers ~12 admin panels.
- A codemod associated 31 unambiguous label/control pairs across the auth and
  booking forms, deriving the `id` from each control's `name` or its label text.
- The remaining ~10 ambiguous cases were done by hand. Three `<label>`s in the
  booking form actually headed **read-only summary boxes** (Selected Service,
  Consultation Mode, Date & Time) — a `<label>` on a non-control makes a screen
  reader announce a form field that isn't there, so those became `<p>`.
- The login email field additionally became `type="email"` with
  `autoComplete="email"`, and password fields got `autoComplete="current-password"`;
  the show/hide toggle got `aria-label` + `aria-pressed`.

Coverage went from **2 → 64 `htmlFor`** (127 controls total; the rest are
valid wrapping labels or non-form checkboxes).

## 19b. No skip link; no landmark target

### Problem

Every page repeats the header (and, on dashboards, a sidebar) before the main
content. A keyboard or screen-reader user had to tab through all of it on every
navigation, with no way to jump to the content — a WCAG 2.4.1 (Bypass Blocks)
failure.

### Solution

A visually-hidden "Skip to main content" link in the root layout that becomes
visible on focus, targeting `#main-content`. A codemod added
`id="main-content"` to the first `<main>` in all 66 page files (and hand-fixes
for the three pages with multiple return branches).

## 19c. `ErrorBoundary` leaked internals and reported nothing

### Problem

```tsx
<p>{this.state.error?.message || "An unexpected error occurred."}</p>
```

It rendered the raw error message to the user. React and API-layer errors carry
internal detail (module paths, prop names, server messages) — the exact thing
the *backend* takes care never to leak. And with no `componentDidCatch`, every
client-side crash in production was invisible: no log, no counter, no report.

### Solution

- Production shows a generic message; the real message is kept for development
  only.
- `componentDidCatch` logs the error + component stack (a clearly-marked
  integration seam for Sentry/Datadog/Bugsnag — a one-line change).
- "Try again" (reload) and "Go Home" both use full navigation, since the React
  tree is in an unknown state after a render crash.

## 19d. No `global-error.tsx`

### Problem

`app/error.tsx` and the root `<ErrorBoundary>` can only catch errors from their
*children* — neither can catch a crash in the **root layout** that renders them.
Such an error fell through to Next's built-in screen: unbranded, and a blank
page in a production build.

### Solution

`app/global-error.tsx` replaces the whole document (its own `<html>`/`<body>`,
inline-styled since no app styles are available at that level), shows a branded
message, logs `error.digest`, and surfaces that digest to the user as a support
reference — the only way to correlate what a user saw with the server log line.

## 19e. `metadataBase` was missing

### Problem

Open Graph and Twitter image/URL fields, and the canonical URL, resolve against
`metadataBase`. Without it, a production build resolves them against
`localhost`, so social previews and canonical tags pointed at an unreachable
machine.

### Solution

`metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://amooguru.com")`,
plus `alternates.canonical` and a `robots` block, in the root layout.

## 19f. Dead code removed

- **`ContentProtection`** was unmounted from the root layout. Its own
  `ENABLE_INSPECT = true` constant made the effect return before registering
  anything — a client component on every page for zero effect. Its *disabled*
  behaviour (blocking right-click, Ctrl+C/X/A/U, copy, image drag) would have
  broken copy-paste for legitimate users and assistive tech, is trivially
  bypassed, and is hostile UX. The file is left in place if anyone wants to
  revisit it.
- **"Remember Me"** on all three login pages captured state that was never read.
  The backend issues a 30-day refresh token on every login regardless
  (`JWT_REFRESH_EXPIRES_IN`), so the control promised a session-scoping it could
  not deliver — worst on the admin login. Removed, with a comment on how to
  reinstate it (a backend option to vary the refresh-token lifetime).

## Before / After (representative)

**AdminModal — label association**
```diff
-<label className="mb-[5px] block ...">{f.label} {f.required && <span>*</span>}</label>
-<input value={values[f.name] ?? ""} onChange={...} />
+<label htmlFor={`admin-field-${f.name}`} className="...">{f.label} ...</label>
+<input id={`admin-field-${f.name}`} aria-invalid={hasError || undefined}
+       aria-describedby={hasError ? `admin-field-${f.name}-error` : undefined}
+       value={values[f.name] ?? ""} onChange={...} />
```

**Root layout — skip link**
```diff
+<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed ...">
+  Skip to main content
+</a>
```

**ErrorBoundary — no leak, plus reporting**
```diff
-<p>{this.state.error?.message || "An unexpected error occurred."}</p>
+<p>We hit an unexpected problem loading this page. Please try again ...</p>
+{!isProd && this.state.message && <pre>{this.state.message}</pre>}
```
```diff
+componentDidCatch(error, info) {
+  console.error("[ErrorBoundary]", error, info.componentStack);
+  // window.__errorReporter?.(error, info)  <- integration point
+}
```

## Testing notes

`tsc --noEmit` clean; `eslint` 0 errors; production build passes.

Manual:
- Keyboard: load any page, press Tab once — the skip link appears; Enter jumps
  focus to the content.
- Screen reader (NVDA/VoiceOver): fields on `/user-login`, `/signup`, and any
  admin modal announce their label; an invalid field announces the error.
- Trigger a render error in dev vs a production build and confirm the boundary
  shows the message only in dev.
- Build and inspect `<head>`: `og:url` / canonical resolve against the real
  site URL, not localhost.

## Risk / impact

- **Two `<label>`→`<p>` swaps** in the booking summary are visual no-ops (same
  classes) but change the accessibility tree correctly.
- **Removing "Remember Me" and the SSO buttons (change 014)** removes visible
  UI. Both were non-functional; documented at each site.
- **`ContentProtection` is unmounted, not deleted.** If content protection is a
  real requirement, it needs a different approach (watermarking, DRM) — the
  JS-based version never worked and harmed accessibility.
- **`NEXT_PUBLIC_SITE_URL`** should be set in production or metadata falls back
  to `https://amooguru.com`. Added to the readiness report's manual steps.
- This pass covers association, landmarks and error handling. A full audit
  (colour contrast, focus-visible styling, keyboard traps in modals, ARIA on the
  custom dropdowns) is a larger effort, flagged as follow-up.
