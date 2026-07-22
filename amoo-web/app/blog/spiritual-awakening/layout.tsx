import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spiritual Awakening Guide",
  description:
    "Learn about the signs, stages and transformative journey of spiritual awakening. A comprehensive guide to embracing your higher consciousness.",
  openGraph: {
    title: "Spiritual Awakening Guide | Amoo Guru",
    description:
      "Learn about the signs, stages and transformative journey of spiritual awakening.",
  },
};

export default function SpiritualAwakeningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
