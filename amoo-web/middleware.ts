import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

// Without a secret we can't verify tokens — refuse to start in production.
// Set JWT_SECRET in .env.local (same value as the backend's JWT_SECRET).
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error(
    "FATAL: JWT_SECRET is not set. Refusing to start in production.",
  );
  process.exit(1);
}
const key = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

/* ── Route classification ─────────────────────────────────────────────── */

// Routes that DO require authentication.
const PROTECTED_PREFIXES = [
  "/admin",
  "/user-dashboard",
  "/astrologer-dashboard",
  "/consultation/consultation-payment",
  "/consultation/booking-confirmation",
  "/consultation/booking-summary",
  "/consultation/consultation-booking",
];

/* ── Environment detection ────────────────────────────────────────────── */

// Fail-safe: only treat as dev when NODE_ENV is explicitly "development".
// Any other value (including undefined, "", "production", or typos) defaults
// to the strict production policy so that a misconfigured environment never
// ships unsafe directives.
const isDev = process.env.NODE_ENV?.toLowerCase() === "development";

if (isDev) {
  console.warn(
    "CSP: relaxed for development (unsafe-eval enabled). " +
    "This must never appear in production.",
  );
}

/* ── CSP helpers ──────────────────────────────────────────────────────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const RAZORPAY =
  "https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com";
const WS_URL = (API_URL || "").replace(/^http/, "ws");
function cspWithNonce(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    "img-src 'self' data: blob: https://images.unsplash.com https://upload.wikimedia.org https://res.cloudinary.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${API_URL} ${WS_URL} ${RAZORPAY} https://sentry.io https://browser.sentry-cdn.com https://*.ingest.sentry.io https://*.agora.io wss://*.agora.io https://*.sd-rtn.com wss://*.sd-rtn.com ws: wss:`,
    "frame-src https://api.razorpay.com https://checkout.razorpay.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");
}

/* ── Route classification utils ───────────────────────────────────────── */

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isProtectedRoute(pathname: string): boolean {
  return matchesAny(pathname, PROTECTED_PREFIXES);
}

/* ── Redirect helpers ─────────────────────────────────────────────────── */

function redirectToLogin(requestUrl: string, pathname: string): NextResponse {
  let loginPath: string;
  if (pathname.startsWith("/admin")) {
    loginPath = "/admin-login";
  } else if (pathname.startsWith("/astrologer-dashboard")) {
    loginPath = "/astrologer-login";
  } else if (
    pathname.startsWith("/user-dashboard") ||
    pathname.startsWith("/consultation")
  ) {
    loginPath = "/user-login";
  } else {
    loginPath = "/user-login";
  }
  const url = new URL(loginPath, requestUrl);
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
}

function htmlResponse(req: NextRequest, nonce: string): NextResponse {
  const csp = cspWithNonce(nonce);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-csp-nonce", nonce);
  // Next.js parses the CSP header from the *request* during server-side
  // rendering to extract the nonce and attach it to every inline script and
  // style it emits. Without it, framework scripts render without a nonce
  // attribute and are then blocked by the policy in the response header.
  requestHeaders.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

/* ── Middleware ───────────────────────────────────────────────────────── */

export async function middleware(req: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const { pathname } = req.nextUrl;

  // Protected routes: require authentication.
  if (isProtectedRoute(pathname)) {
    if (!key) {
      return new Response(
        "JWT_SECRET is not configured. Route protection is disabled.",
        { status: 503 },
      );
    }

    const token = req.cookies.get("access_token")?.value;
    if (!token) return redirectToLogin(req.url, pathname);

    try {
      const { payload } = await jwtVerify(token, key);
      if (pathname.startsWith("/admin") && payload.kind !== "admin")
        return redirectToLogin(req.url, pathname);
      if (pathname.startsWith("/astrologer-dashboard") && payload.kind !== "expert" && payload.kind !== "admin")
        return redirectToLogin(req.url, pathname);
      if (pathname.startsWith("/user-dashboard") && payload.kind !== "user" && payload.kind !== "expert")
        return redirectToLogin(req.url, pathname);
      if (pathname.startsWith("/consultation") && payload.kind !== "user")
        return redirectToLogin(req.url, pathname);
    } catch {
      return redirectToLogin(req.url, pathname);
    }
  }

  // Public (and unmatched) routes: add CSP and pass through.
  return htmlResponse(req, nonce);
}

// Only run on routes that serve HTML (skip API, static, etc.).
export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)",
  ],
};
