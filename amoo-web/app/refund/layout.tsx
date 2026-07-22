import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Read Amoo Guru's refund policy for consultation bookings, digital products and spiritual services.",
  openGraph: {
    title: "Refund Policy | Amoo Guru",
    description:
      "Read Amoo Guru's refund policy for consultation bookings, digital products and spiritual services.",
  },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
