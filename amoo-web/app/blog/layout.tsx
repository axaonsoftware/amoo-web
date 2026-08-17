import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read insightful articles on Numerology, Reiki Healing, Tarot Reading, Vastu, Chakra Healing and Spiritual Growth from certified experts at Amoo Guru.",
  openGraph: {
    title: "Blog | Amoo Guru",
    description:
      "Read insightful articles on Numerology, Reiki Healing, Tarot Reading, Vastu, Chakra Healing and Spiritual Growth.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
