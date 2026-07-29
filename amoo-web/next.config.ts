import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

// The API origin must be reachable from the browser, so it has to appear in
// connect-src. Kept in sync with lib/api.ts, which reads the same variable.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Razorpay Checkout is loaded from the gateway's CDN at payment time and opens
// its own iframe, so its origins have to be allowed explicitly.
const RAZORPAY = "https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy (fallback — see middleware.ts for the per-request
 * nonce-based version that replaces this for HTML pages).
 *
 * 'unsafe-inline' is kept for style-src because Tailwind v4 and next/font both
 * emit inline <style> blocks that do not receive a nonce automatically in the
 * Next.js App Router.  script-src keeps 'unsafe-eval' in development for
 * React's refresh runtime.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' ${isDev ? "'unsafe-eval'" : ""} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://upload.wikimedia.org https://res.cloudinary.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${API_URL} ${RAZORPAY} https://sentry.io https://browser.sentry-cdn.com https://*.ingest.sentry.io`,
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Clickjacking defence for browsers that honour CSP over X-Frame-Options.
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  // The API sets these via helmet, but helmet only covers API responses — every
  // HTML document this app serves previously went out with no security headers
  // at all.
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No page uses these APIs; denying them stops an injected script from asking.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // Only meaningful over HTTPS; harmless on plain-http localhost because
  // browsers ignore HSTS from non-secure origins.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  // Hides the framework/version banner from responses.
  poweredByHeader: false,
  images: {
    // Cloudinary serves already-optimized images, so skip Next.js's
    // built-in optimizer to avoid timeouts fetching from the CDN.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Used by the admin login page's provider icon.
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Used by the site logo and other Cloudinary-hosted images.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        // Every route, including static assets and the 404 page.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Automatically tree-shake Sentry logger to reduce bundle size
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
