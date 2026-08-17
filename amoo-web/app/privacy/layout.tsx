import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Amoo Guru collects, uses and protects your personal information. Your privacy is our priority.",
  openGraph: {
    title: "Privacy Policy | Amoo Guru",
    description:
      "Learn how Amoo Guru collects, uses and protects your personal information.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
