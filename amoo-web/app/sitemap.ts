import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://amooguru.com";

const publicRoutes = [
  "/",
  "/about",
  "/blog",
  "/contact",
  "/consultation",
  "/consultation/consultation-pricing",
  "/services",
  "/services/tarot-reading",
  "/services/reiki-healing",
  "/services/numerology-services",
  "/software-hub",
  "/software-hub/basic-kundali-software",
  "/software-hub/tarot-software",
  "/software-hub/numerology-software",
  "/html-sitemap",
  "/privacy",
  "/terms",
  "/cancellation",
  "/refund",
  "/cookie",
  "/faq",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return publicRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1.0 : 0.7,
  }));
}
