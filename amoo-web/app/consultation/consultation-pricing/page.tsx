import type { Metadata } from "next";
import { HomeHeader, OfferBar } from "../../components/home-header";
import Hero from "./Hero";
import ConsultationModes from "./ConsultationModes";
import SpecialPackages from "./SpecialPackages";
import PricingTableSection from "./PricingTableSection";
import WhyPricingWorthIt from "./WhyPricingWorthIt";
import CtaBanner from "./CtaBanner";
import { SiteFooter } from "../../components/site-footer";
import WhatsAppFloatButton from "./WhatsAppFloatButton";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Affordable consultation packages for Numerology, Reiki Healing, Tarot Reading and Spiritual Guidance. Choose from audio, video and chat modes.",
  openGraph: {
    title: "Pricing | Amoo Guru",
    description:
      "Affordable consultation packages for Numerology, Reiki Healing, Tarot Reading and Spiritual Guidance. Choose from audio, video and chat modes.",
  },
};

export default function ConsultationPricingPage() {
  return (
    <main className="min-h-screen bg-[#FCF9F3]">
      <OfferBar />
      <HomeHeader absolute={false} />
      <Hero />
      <ConsultationModes />
      <SpecialPackages />
      <PricingTableSection />
      <WhyPricingWorthIt />
      <CtaBanner />
      <SiteFooter />
      <WhatsAppFloatButton />
    </main>
  );
}
