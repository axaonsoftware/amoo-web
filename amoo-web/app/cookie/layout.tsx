import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how Amoo Guru uses cookies to improve your browsing experience and deliver personalized services.",
  openGraph: {
    title: "Cookie Policy | Amoo Guru",
    description:
      "Learn how Amoo Guru uses cookies to improve your browsing experience.",
  },
};

export default function CookieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
