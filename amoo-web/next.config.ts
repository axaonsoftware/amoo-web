import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

// The Content-Security-Policy header is intentionally NOT set here. It is set
// per-request in proxy.ts, which generates a fresh nonce and propagates it
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
