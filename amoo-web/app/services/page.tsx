import type { Metadata } from "next";
import CtaBanner from "./components/CtaBanner";
import { SiteFooter } from "../components/site-footer";
import Hero from "./components/Hero";
import { OfferBar } from "../components/home-header";
import ServicesGrid from "./components/ServicesGrid";
import StatsBand from "./components/StatsBand";
import WhyChoose from "./components/WhyChoose";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore Numerology, Reiki Healing, Tarot Reading, Kundali Analysis, Chakra Healing and Spiritual Guidance services at Amoo Guru.",
  openGraph: {
    title: "Our Services | Amoo Guru",
    description:
      "Explore Numerology, Reiki Healing, Tarot Reading, Kundali Analysis, Chakra Healing and Spiritual Guidance services at Amoo Guru.",
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#170426] font-sans">
      <OfferBar />
      <Hero />

      <main id="main-content" className="relative rounded-t-[16px] bg-sand">
        <ServicesGrid />
        <StatsBand />
        <WhyChoose />
      </main>

      <CtaBanner />
      <SiteFooter />
    </div>
  );
}
