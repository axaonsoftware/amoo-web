import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

// Without a secret we can't verify tokens — fall through to client-side auth.
// Set JWT_SECRET in .env.local (same value as the backend's JWT_SECRET).
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error("CRITICAL: JWT_SECRET is not set. Route protection is DISABLED.");
}
const key = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

/* ── Route classification ─────────────────────────────────────────────── */

// Routes that do NOT require authentication (everyone can view).
const PUBLIC_PREFIXES = [
  "/",            // home
  "/about",
  "/services",
  "/blog",
  "/contact",
  "/faq",
  "/privacy",
  "/refund",
  "/cookie",
  "/html-sitemap",
  "/terms",
  "/cancellation",
  "/software-hub",
  "/consultation/select-service",
  "/consultation/consultation-mode",
  "/consultation/select-date-time",
  "/consultation/consultation-pricing",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/user-login",
  "/admin-login",
  "/astrologer-login",
];

// Routes that DO require authentication.
const PROTECTED_PREFIXES = [
  "/admin",
  "/user-dashboard",
  "/consultation/consultation-payment",
  "/consultation/booking-confirmation",
  "/consultation/booking-summary",
  "/consultation/consultation-booking",
];

/* ── CSP helpers ──────────────────────────────────────────────────────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const RAZORPAY = "https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com";
function cspWithNonce(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://checkout.razorpay.com ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://upload.wikimedia.org https://res.cloudinary.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${API_URL} ${RAZORPAY} https://sentry.io https://browser.sentry-cdn.com https://*.ingest.sentry.io`,
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].filter(Boolean).join("; ");
}

/* ── Route classification utils ───────────────────────────────────────── */

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/* ── Redirect helpers ─────────────────────────────────────────────────── */

function redirectToLogin(pathname: string): NextResponse {
  let loginPath: string;
  if (pathname.startsWith("/admin")) {
    loginPath = "/admin-login";
  } else if (pathname.startsWith("/user-dashboard") || pathname.startsWith("/consultation")) {
    loginPath = "/user-login";
  } else {
    loginPath = "/user-login";
  }
  const url = new URL(loginPath, pathname);
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
}

function htmlResponse(req: NextRequest, nonce: string): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-csp-nonce", nonce);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", cspWithNonce(nonce));
  return res;
}

/* ── Middleware ────────────────────────────────────────────────────────── */

export async function middleware(req: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const { pathname } = req.nextUrl;

  // Public routes: add CSP and pass through immediately.
  if (!isProtectedRoute(pathname)) return htmlResponse(req, nonce);

  // Protected routes below — auth check first, then CSP.
  if (!key) return htmlResponse(req, nonce);

  const token = req.cookies.get("access_token")?.value;
  if (!token) return redirectToLogin(pathname);

  try {
    const { payload } = await jwtVerify(token, key);
    if (pathname.startsWith("/admin") && payload.kind !== "admin") return redirectToLogin(pathname);
    if (pathname.startsWith("/user-dashboard") && !payload.kind) return redirectToLogin(pathname);
    // Consultation routes are user-only.
    if (pathname.startsWith("/consultation") && payload.kind !== "user") return redirectToLogin(pathname);
    return htmlResponse(req, nonce);
  } catch {
    return redirectToLogin(pathname);
  }
}

// Only run on routes that serve HTML (skip API, static, etc.).
export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)",
  ],
};
