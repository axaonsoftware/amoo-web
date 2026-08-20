import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

// The Content-Security-Policy header is intentionally NOT set here. It is set
// per-request in middleware.ts, which generates a fresh nonce and propagates it
// to every inline script Next.js renders. A static policy here would conflict
// with the nonce-based one (browsers enforce both headers, so the nonce-less
// policy would still block the nonced inline scripts).

const securityHeaders = [
  // The API sets these via helmet, but helmet only covers API responses — every
  // HTML document this app serves previously went out with no security headers
  // at all.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No page uses these APIs; denying them stops an injected script from asking.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // Only meaningful over HTTPS; harmless on plain-http localhost because
  // browsers ignore HSTS from non-secure origins.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // Dev-only proxy: in production nginx routes /api/* straight to the backend,
  // so this rewrite only ever runs under `next dev` (or a standalone frontend
  // that is not sitting behind nginx). Keeps API calls same-origin.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
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
