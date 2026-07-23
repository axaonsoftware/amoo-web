# 013 — No security headers on any HTML response; 3 dependency CVEs

- **Category**: Security / Config
- **Severity**: High
- **File(s) affected**:
  - `amoo-web/next.config.ts`
  - `amoo-web/package.json`
  - `amoo-web/package-lock.json`

## 13a. Every HTML response went out with no security headers

### Problem

`next.config.ts` was:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
};
```

No `headers()` function at all. The Express API is well protected — `helmet` in
`middleware/security.js` sets HSTS, `nosniff`, `Referrer-Policy` and disables
CSP with an explicit note that *"the Next.js frontend sets its own CSP"*. It did
not. Every page the user actually loads — login, admin, checkout — was served
with no CSP, no anti-framing header, no referrer policy and no permissions
policy.

What that allowed:

- **Clickjacking.** With no `X-Frame-Options` / `frame-ancestors`, any site
  could iframe `/admin` or the checkout page and overlay it to harvest clicks on
  the real controls. The admin panel performs destructive actions (delete user,
  refund payment) behind single clicks.
- **Unrestricted script origins.** With no CSP, any injected `<script src>` —
  through a stored XSS, a compromised dependency, or a malicious browser
  extension proxy — could exfiltrate to an arbitrary host. The app renders
  admin-authored HTML through `dangerouslySetInnerHTML` in the blog
  (DOMPurify-sanitised, but CSP is the defence-in-depth layer behind that).
- **Referrer leakage.** Default referrer policy sends the full URL cross-origin.
  Pages like `/verify-email?email=…&token=…` and
  `/consultation/booking-confirmation?bookingId=…` carry secrets and identifiers
  in the query string, which leaked to every third-party resource loaded.
- **`X-Powered-By: Next.js`** advertised the framework on every response.

### Solution

A `headers()` block applied to `/:path*`, with a CSP built from the origins the
app genuinely needs — the API (`NEXT_PUBLIC_API_URL`, read from the same
variable `lib/api.ts` uses, so they cannot drift) and Razorpay's checkout, API
and telemetry hosts.

`'unsafe-inline'` remains for `style-src`: Tailwind v4 and `next/font` both emit
inline `<style>` blocks, and removing it requires plumbing a nonce through the
document — a larger change than this pass, and a strictly smaller risk than
having no CSP. `'unsafe-eval'` is allowed only in development, where React
Refresh needs it; production drops it.

### Before / After

```diff
 const nextConfig: NextConfig = {
   output: "standalone",
+  poweredByHeader: false,
   images: {
     remotePatterns: [
       { protocol: "https", hostname: "images.unsplash.com" },
+      { protocol: "https", hostname: "upload.wikimedia.org" },
     ],
   },
+  async headers() {
+    return [{ source: "/:path*", headers: securityHeaders }];
+  },
 };
```

```ts
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://upload.wikimedia.org",
  "font-src 'self' data:",
  `connect-src 'self' ${API_URL} ${RAZORPAY}`,
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].filter(Boolean).join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
];
```

### Testing notes

```bash
npm run build && npm start
curl -sI http://localhost:3000/ | grep -iE "content-security|x-frame|referrer|permissions|strict-transport|x-powered"
```
All six headers present; `x-powered-by` absent.

Then exercise the paths CSP could break — these are the ones a too-strict policy
would silently kill:
- Home page fonts and images render (next/font, Unsplash remote images)
- Admin login page renders (its Wikimedia icon was removed in change 014, but
  the host stays allowed for any existing content)
- **Checkout end-to-end**: the Razorpay script loads, the modal opens, payment
  completes. This is the highest-risk path — verify with devtools Console open
  and confirm zero CSP violation reports.
- API calls succeed from the browser (`connect-src` includes the API origin)

### Risk / impact

- **A CSP can break things that are hard to see in a smoke test.** Watch the
  browser console for `Refused to load…` reports after deploying. If you add a
  third-party script (analytics, chat widget, Sentry), it must be added to
  `script-src` and `connect-src` or it will silently fail.
- **`connect-src` is built from `NEXT_PUBLIC_API_URL` at build time**, matching
  how `lib/api.ts` resolves it. If the API URL differs between build and
  runtime, the CSP will block API calls. Build with the production value set.
- **HSTS with `preload`** is a long-lived commitment: once submitted to the
  preload list, browsers refuse plain HTTP for the domain **and all subdomains**
  for up to a year, and removal is slow. The header is safe to serve
  immediately (browsers ignore it over HTTP), but do not submit to
  hstspreload.org until every subdomain is HTTPS. Flagged in the final report.
- **`'unsafe-inline'` in `style-src` and `script-src`** means this CSP mitigates
  script-injection less than a nonce-based one would. It is a meaningful
  improvement over no CSP, not a complete answer. Tightening it is listed as a
  recommended follow-up.

---

## 13b. Three dependency CVEs, two of them high

### Problem

```
next    16.2.10  → GHSA-955p-x3mx-jcvp  (unauthenticated disclosure of internal
                                         Server Function endpoints)
sharp   0.34.5   → GHSA-f88m-g3jw-g9cj  (HIGH) libvips CVE-2026-33327 /
                                         33328 / 35590 / 35591
postcss <8.5.10  → GHSA-qx2v-qp2m-jg93  (XSS via unescaped </style>)
```

`sharp` is the image processor behind `next/image`, which this app uses
including for **remote** images — so untrusted image bytes reach the vulnerable
libvips code path. That is the most directly reachable of the three.

`npm audit fix --force` proposed **`next@9.3.3`** — a downgrade across seven
major versions that would have destroyed the App Router application. Not a
usable remedy.

### Solution

Upgrade Next `16.2.10 → 16.2.11` (patch), which clears the Next advisory
directly. `sharp` and `postcss` are transitive dependencies pinned inside Next's
own tree, so bumping Next alone did not clear them — those needed npm
`overrides`:

```json
"overrides": {
  "sharp": "^0.35.3",
  "postcss": "^8.5.10"
}
```

A `"//overrides"` comment key documents why each entry exists and when to remove
it, so the next person does not delete them blindly.

### Before / After

```diff
   "dependencies": {
-    "next": "16.2.10",
+    "next": "16.2.11",
     ...
   },
+  "overrides": {
+    "sharp": "^0.35.3",
+    "postcss": "^8.5.10"
+  },
   "devDependencies": {
-    "eslint-config-next": "16.2.10",
+    "eslint-config-next": "16.2.11",
```

### Testing notes

```bash
npm audit --omit=dev
# => found 0 vulnerabilities        (was: 3 vulnerabilities, 1 moderate, 2 high)

node -p "require('sharp/package.json').version"     # 0.35.3
node -p "require('postcss/package.json').version"   # 8.5.22
npm run build                                        # succeeds
```

Because `sharp` was replaced, image optimisation is the thing to smoke-test:
load a page with a remote `next/image` (`/admin/availability-slots`, any expert
avatar) and confirm images render and are served as optimised WebP/AVIF rather
than 500ing.

### Risk / impact

- **`sharp` 0.34 → 0.35 is a minor bump** but it ships prebuilt native binaries
  per platform. If your deployment image is Alpine/musl or an unusual
  architecture, confirm the correct `@img/sharp-*` binary resolves at install
  time in CI, not just on a developer machine.
- **Overrides are a local pin, not an upstream fix.** When a future Next release
  depends on patched versions itself, remove the corresponding override entry so
  you stop holding back a dependency Next may want to move. The comment key
  says so.
- **`npm audit fix --force` must not be run on this project** — it still
  proposes `next@9.3.3`. Noted in the final report.
