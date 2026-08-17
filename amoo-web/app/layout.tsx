import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Playfair_Display, Poppins } from "next/font/google";
// NOTE: <ContentProtection /> was unmounted here. It is a no-op — its own
// `ENABLE_INSPECT = true` constant makes the effect return before registering
// anything — so it added a client component to every page for no effect. Its
// disabled behaviour (blocking right-click, Ctrl+C/X/A/U and copy) would also
// break copy-paste for legitimate users and assistive technology, and is
// trivially bypassed. The file is kept at app/components/ContentProtection.tsx
// if you want to revisit it; see docs/changes/019.
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "../lib/auth-context";
import { SITE_NAME } from "../lib/constants";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

// Absolute base for every relative URL in metadata. Without it, Open Graph and
// Twitter image/URL fields resolve against localhost in a production build, so
// social previews and canonical URLs point at a machine nobody can reach.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amooguru.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Numerology, Reiki Healing & Spiritual Guidance`,
    template: `%s | ${SITE_NAME}`,
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  description:
    "Transform your life through Numerology, Reiki Healing, Tarot Guidance and Spiritual Consultation with Reiki Grand Master Surinder Kaur Sehgal.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Numerology, Reiki Healing & Spiritual Guidance`,
    description:
      "Transform your life through Numerology, Reiki Healing, Tarot Guidance and Spiritual Consultation with Reiki Grand Master Surinder Kaur Sehgal.",
    images: [{ url: "/apple-touch-icon.png", width: 180, height: 180 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Numerology, Reiki Healing & Spiritual Guidance`,
    description:
      "Transform your life through Numerology, Reiki Healing, Tarot Guidance and Spiritual Consultation with Reiki Grand Master Surinder Kaur Sehgal.",
    images: [{ url: "/apple-touch-icon.png", width: 180, height: 180 }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0410",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The per-request CSP nonce is only injected during server-side rendering,
  // so every page must render dynamically (wait for the request) instead of
  // being prerendered at build time. See proxy.ts.
  await connection();
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-white">
        {/* Lets a keyboard or screen-reader user jump past the header and
            sidebar, which are repeated on every page. Targets #main-content. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#3E1E7A] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
