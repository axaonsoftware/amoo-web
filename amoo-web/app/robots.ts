import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amooguru.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/user-dashboard", "/user-login", "/admin-login", "/astrologer-login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
