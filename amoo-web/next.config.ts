import type { NextConfig } from "next";

// The API origin must be reachable from the browser, so it has to appear in
// connect-src. Kept in sync with lib/api.ts, which reads the same variable.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Razorpay Checkout is loaded from the gateway's CDN at payment time and opens
// its own iframe, so its origins have to be allowed explicitly.
const RAZORPAY = "https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy.
 *
 * 'unsafe-inline' is present for styles because Tailwind v4 and next/font both
 * emit inline <style> blocks; removing it needs a nonce plumbed through the
 * document, which is a larger change than this pass.
 *
 * script-src keeps 'unsafe-inline' only in development, where React's refresh
 * runtime and the error overlay require eval. Production drops 'unsafe-eval'.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://upload.wikimedia.org",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${API_URL} ${RAZORPAY}`,
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
  // Hides the framework/version banner from responses.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Used by the admin login page's provider icon.
      { protocol: "https", hostname: "upload.wikimedia.org" },
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

export default nextConfig;
