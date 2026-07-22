import type { Metadata } from "next";
import { OfferBar } from "../components/home-header";
import Certifications from "./components/Certifications";
import CtaBanner from "./components/CtaBanner";
import Expertise from "./components/Expertise";
import { SiteFooter } from "../components/site-footer";
import Hero from "./components/Hero";
import Impact from "./components/Impact";
import Journey from "./components/Journey";
import MissionVision from "./components/MissionVision";
import TabsBar from "./components/TabsBar";
import WhatsAppFloatButton from "./components/WhatsAppFloatButton";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Reiki Grand Master Surinder Kaur Sehgal and 20+ years of spiritual guidance through Numerology, Reiki Healing and Tarot Reading.",
  openGraph: {
    title: "About Us | Amoo Guru",
    description:
      "Learn about Reiki Grand Master Surinder Kaur Sehgal and 20+ years of spiritual guidance through Numerology, Reiki Healing and Tarot Reading.",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0f051e] font-sans">
      <OfferBar />
      <Hero />
      <TabsBar />
      <Journey />
      <Expertise />
      <MissionVision />
      <Impact />
      <Certifications />
      <CtaBanner />
      <SiteFooter />
      <WhatsAppFloatButton />
    </div>
  );
}
