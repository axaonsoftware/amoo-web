"use client";

import { HomeHeader, OfferBar } from "../../components/home-header";
import Hero from "./components/Hero";
import ServicesGrid from "./components/ServicesGrid";
import WhatYouReceive from "./components/WhatYouReceive";
import Testimonials from "./components/Testimonials";
import { SiteFooter } from "../../components/site-footer";

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
