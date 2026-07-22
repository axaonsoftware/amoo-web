import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Find answers to common questions about Amoo Guru's spiritual consultation services, booking process, payments and more.",
  openGraph: {
    title: "FAQ | Amoo Guru",
    description:
      "Find answers to common questions about Amoo Guru's spiritual consultation services.",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
