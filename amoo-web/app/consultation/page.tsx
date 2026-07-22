import type { Metadata } from "next";
import { OfferBar } from "../components/home-header";
import { SITE_NAME } from "../../lib/constants";
import Hero from "./components/Hero";
import ConsultationModes from "./components/ConsultationModes";
import HowItWorks from "./components/HowItWorks";
import WhyConsult from "./components/WhyConsult";
import CtaBanner from "./components/CtaBanner";
import { SiteFooter } from "../components/site-footer";
import WhatsAppFloatButton from "./components/WhatsAppFloatButton";

export const metadata: Metadata = {
  title: "Consultation",
  description:
    "Choose the consultation mode that suits you best and connect with Reiki Grand Master Surinder Kaur Sehgal for accurate guidance and powerful healing.",
  openGraph: {
    title: "Consultation | Amoo Guru",
    description:
      "Choose the consultation mode that suits you best and connect with Reiki Grand Master Surinder Kaur Sehgal for accurate guidance and powerful healing.",
  },
};

export default function ConsultationPage() {
  return (
    <>
      <OfferBar />
      <Hero />

      <ConsultationModes />
      <HowItWorks />
      <WhyConsult />
      <CtaBanner />

      <SiteFooter />
      <WhatsAppFloatButton />
    </>
  );
}
