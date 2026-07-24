"use client";

import Image from "next/image";
import { ArrowFlourish, CheckCircleIcon } from "./icons";
import { useApi, api } from "../../../lib/useApi";

const AMBER = "#b5711a";
const BLUE = "#2f6fb0";

// Static marketing copy keyed by service category (used to enrich live API data).
const COPY: Record<string, { tagline: string; accent: string; desc: string; points: string[]; tone: "purple" | "gold"; icon: string }> = {
  Numerology: { tagline: "Decode Your Numbers", accent: AMBER, tone: "purple", icon: "/imagesP/circle_1.png", desc: "Discover the power of numbers that influence your life, name, career, relationships and more.", points: ["Name Numerology", "Personal Numerology", "Business Numerology", "Mobile & Vehicle Number", "Baby Name Suggestion"] },
  Healing: { tagline: "Heal. Balance. Transform.", accent: AMBER, tone: "gold", icon: "/imagesP/circle_2.png", desc: "Experience divine healing energy that restores balance to your mind, body and soul.", points: ["Distance Reiki Healing", "Chakra Balancing", "Emotional Healing", "Stress & Anxiety Relief", "Energy Cleansing"] },
  Tarot: { tagline: "Get Clarity. Make Better Choices.", accent: BLUE, tone: "purple", icon: "/imagesP/circle_3.png", desc: "Gain insights and guidance for love, career, finance, relationships and important life decisions.", points: ["Love & Relationship", "Career Guidance", "Money & Finance", "Yes / No Reading", "Monthly & Yearly Guidance"] },
  Astrology: { tagline: "Understand Your Destiny", accent: AMBER, tone: "gold", icon: "/imagesP/circle_4.png", desc: "Vedic astrology insights through your birth chart for a better understanding of life.", points: ["Kundali Generation", "Basic Kundali Analysis", "Marriage Compatibility", "Dosha & Remedies", "Planetary Insights"] },
  Vastu: { tagline: "Balance Your Spaces", accent: BLUE, tone: "purple", icon: "/imagesP/circle_5.png", desc: "Align your home and workplace with positive cosmic energies for prosperity and peace.", points: ["Home Vastu", "Office Vastu", "Energy Mapping", "Remedies", "Layout Guidance"] },
  "AI Services": { tagline: "Instant Astro Answers", accent: BLUE, tone: "purple", icon: "/imagesP/circle_6.png", desc: "Chat with our AI astrologer for quick, personalised guidance anytime.", points: ["Ask Anything", "Instant Reply", "Personalised", "24x7", "Private"] },
  Spiritual: { tagline: "Holistic Life Guidance", accent: AMBER, tone: "gold", icon: "/imagesP/circle_6.png", desc: "Overall spiritual guidance to help you live a meaningful and purpose-driven life.", points: ["Life Purpose", "Relationship Guidance", "Career & Growth", "Financial Stability", "Spiritual Coaching"] },
};

export default function ServicesGrid() {
    const { data: services, loading } = useApi(() => api.getServices());

  const items: any[] = (services as any)?.data as any[] ?? [];
  const rows = items.map((s: any) => {
    const c = COPY[s.category] || COPY[s.category === "Astrology" ? "Astrology" : "Spiritual"];
    return {
      id: s.id,
      title: s.name,
      tagline: c.tagline,
      taglineColor: c.accent,
      accent: c.accent,
      desc: c.desc,
      points: c.points,
      tone: c.tone,
      icon: s.img || c.icon,
      price: s.price,
      bookings: s.bookings,
    };
  });

  return (
    <div className="mx-auto w-full max-w-[1336px] px-5 pt-[42px]">
      <div className="flex items-center justify-center gap-4">
        <ArrowFlourish flip />
        <h2 className="font-display text-center text-[24px] leading-tight font-bold text-[#2c0c47] sm:text-[28px]">
          Discover the Path That Resonates With You
        </h2>
        <ArrowFlourish />
      </div>

      <p className="mx-auto mt-[14px] max-w-[720px] text-center text-[13px] leading-[1.6] text-[#6c6b78]">
        {loading ? "Loading our services…" : "Whether you seek answers, healing, clarity or transformation, our services are here to guide you."}
      </p>

      <div className="mt-[30px] grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {rows.map((service) => (
          <article
            key={service.id || service.title}
            className="flex flex-col rounded-[12px] border border-[#efe3d2] bg-white px-[10px] pt-[22px] pb-[16px] shadow-[0_2px_14px_rgba(75,37,131,0.06)]"
          >
            <Image
              src={service.icon}
              alt=""
              width={240}
              height={240}
              unoptimized
              className="mx-auto h-[104px] w-[104px] rounded-full object-cover"
            />

            <h3 className="font-display mt-[14px] text-center text-[13px] leading-[1.25] font-bold tracking-[0.01em] text-[#4b2583] uppercase">
              {service.title}
            </h3>

            <p className="mt-[5px] text-center text-[9.5px] leading-[1.4] font-medium" style={{ color: service.taglineColor }}>
              {service.tagline}
            </p>

            <p className="mt-[9px] text-center text-[10.5px] leading-[1.7] text-[#6c6b78]">
              {service.desc}
            </p>

            <ul className="mt-[11px] mb-[14px] space-y-[6px]">
              {service.points.map((point: string) => (
                <li key={point} className="flex items-center gap-[6px] text-[10px] leading-[1.4] text-[#4a4757]">
                  <CheckCircleIcon className="h-[11px] w-[11px] shrink-0" style={{ color: service.accent }} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {service.price != null && (
                <p className="mb-[8px] text-center text-[11px] font-bold text-[#4b2583]">₹ {Number(service.price).toLocaleString("en-IN")}</p>
              )}
              <button
                type="button"
                className={`h-[32px] w-full rounded-[6px] text-[11px] font-semibold text-white ${
                  service.tone === "purple" ? "bg-gradient-to-b from-[#5e1c8f] to-[#3f0f55]" : "bg-gradient-to-b from-[#c8901f] to-[#a06a12]"
                }`}
              >
                Explore Services
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
