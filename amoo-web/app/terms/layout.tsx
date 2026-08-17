import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Service",
  description:
    "Read the terms and conditions governing your use of Amoo Guru's spiritual consultation services and website.",
  openGraph: {
    title: "Terms & Service | Amoo Guru",
    description:
      "Read the terms and conditions governing your use of Amoo Guru's services.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
