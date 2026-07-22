import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarot Reading",
  description:
    "Get accurate tarot card readings for career, love, relationships and life guidance from certified tarot readers at Amoo Guru.",
  openGraph: {
    title: "Tarot Reading | Amoo Guru",
    description:
      "Get accurate tarot card readings for career, love, relationships and life guidance.",
  },
};

export default function TarotReadingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
