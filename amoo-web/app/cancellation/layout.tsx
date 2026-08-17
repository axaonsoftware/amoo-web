import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "Learn about Amoo Guru's cancellation policy for consultations, healing sessions and subscription plans.",
  openGraph: {
    title: "Cancellation Policy | Amoo Guru",
    description:
      "Learn about Amoo Guru's cancellation policy for consultations, healing sessions and subscription plans.",
  },
};

export default function CancellationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
