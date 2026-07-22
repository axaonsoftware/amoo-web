import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import ContentProtection from "./components/ContentProtection";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "../lib/auth-context";
import { SITE_NAME } from "../lib/constants";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Numerology, Reiki Healing & Spiritual Guidance`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Transform your life through Numerology, Reiki Healing, Tarot Guidance and Spiritual Consultation with Reiki Grand Master Surinder Kaur Sehgal.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Numerology, Reiki Healing & Spiritual Guidance`,
    description:
      "Transform your life through Numerology, Reiki Healing, Tarot Guidance and Spiritual Consultation with Reiki Grand Master Surinder Kaur Sehgal.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Numerology, Reiki Healing & Spiritual Guidance`,
    description:
      "Transform your life through Numerology, Reiki Healing, Tarot Guidance and Spiritual Consultation with Reiki Grand Master Surinder Kaur Sehgal.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0410",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-white">
        <ContentProtection />
        <AuthProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
