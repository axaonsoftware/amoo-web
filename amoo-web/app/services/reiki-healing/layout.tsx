import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reiki Healing",
  description:
    "Experience powerful Reiki healing for stress relief, emotional balance, chakra balancing and spiritual growth with certified Reiki Grand Master Surinder Kaur Sehgal.",
  openGraph: {
    title: "Reiki Healing | Amoo Guru",
    description:
      "Experience powerful Reiki healing for stress relief, emotional balance, chakra balancing and spiritual growth with certified Reiki Grand Master Surinder Kaur Sehgal.",
  },
};

export default function ReikiHealingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
