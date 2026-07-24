import type { Metadata } from "next";
import { SectionHeading } from "../components/ornament";
import { SiteFooter } from "../components/site-footer";
import Hero from "./components/Hero";
import { HomeHeader } from "../components/home-header";
import OfferBanner from "./components/OfferBanner";
import SoftwareGrid from "./components/SoftwareGrid";
import TrustBar from "./components/TrustBar";

export const metadata: Metadata = {
  title: "Spiritual Software",
  description:
    "Professional Numerology, Tarot Reading and Kundali software for practitioners and spiritual seekers. Generate accurate charts and reports instantly.",
  openGraph: {
    title: "Spiritual Software | Amoo Guru",
    description:
      "Professional Numerology, Tarot Reading and Kundali software for practitioners and spiritual seekers. Generate accurate charts and reports instantly.",
  },
};

export default function SoftwareHubPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#14032b]">
      <HomeHeader />
      <Hero />

      <section className="relative z-10 -mt-[30px] rounded-t-[30px] bg-[#fdf9f4] pt-[11px] pb-[30px]">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 xl:px-[45px]">
          <SectionHeading className="[&>h2]:whitespace-normal sm:[&>h2]:whitespace-nowrap">
            Our Spiritual Software Solutions
          </SectionHeading>

          <p className="-mt-[7px] text-center text-[13px] leading-[1.6] font-normal text-[#4a4750]">
            Empower your practice with advanced tools built on ancient wisdom
            and modern technology.
          </p>

          <SoftwareGrid />
          <TrustBar />
          <OfferBanner />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
