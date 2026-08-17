import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Amoo Guru for consultation bookings, queries and support. Reach us via WhatsApp, email or our contact form.",
  openGraph: {
    title: "Contact Us | Amoo Guru",
    description:
      "Get in touch with Amoo Guru for consultation bookings, queries and support.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
