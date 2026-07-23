import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Numerology Services",
  description:
    "Get accurate numerology readings, Life Path analysis, name correction and personalized reports from certified numerology experts at Amoo Guru.",
  openGraph: {
    title: "Numerology Services | Amoo Guru",
    description:
      "Get accurate numerology readings, Life Path analysis, name correction and personalized reports from certified numerology experts at Amoo Guru.",
  },
};

export default function NumerologyServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
