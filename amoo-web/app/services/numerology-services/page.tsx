import type { Metadata } from "next";
import { HomeHeader, OfferBar } from "../../components/home-header";
import Hero from "./components/Hero";
import ServicesGrid from "./components/ServicesGrid";
import WhatYouReceive from "./components/WhatYouReceive";
import Testimonials from "./components/Testimonials";
import { SiteFooter } from "../../components/site-footer";

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

export default function Page() {
  return (
    <div className="bg-[#FBF6EE] min-h-screen font-sans text-[#2b1b3d]">
      <OfferBar />
      <HomeHeader absolute={false} />
      <Hero />
      <ServicesGrid />
      <WhatYouReceive />
      <Testimonials />
      <SiteFooter />
    </div>
  );
}
