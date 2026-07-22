import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { WhatsAppIcon } from "../../components/home-icons";
import BenefitsChakras from "./components/BenefitsChakras";
import CtaBanner from "./components/CtaBanner";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import { HomeHeader, OfferBar } from "../../components/home-header";
import { WHATSAPP_URL } from "../../../lib/constants";
import Packages from "./components/Packages";
import ServicesGrid from "./components/ServicesGrid";
import Testimonials from "./components/Testimonials";

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

export default function ReikiHealingPage() {
  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      <main className="flex-1 bg-[#170426]">
        <Hero />
        <ServicesGrid />
        <BenefitsChakras />
        <Packages />
        <HowItWorks />
        <Testimonials />
        <CtaBanner />
      </main>

      <SiteFooter />

      <Link
        href={WHATSAPP_URL}
        aria-label="Chat on WhatsApp"
        className="fixed right-6 bottom-6 z-40 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      >
        <WhatsAppIcon className="h-[26px] w-[26px]" />
      </Link>
    </>
  );
}
