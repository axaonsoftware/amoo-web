"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "../../../components/home-icons";
import { ArrowFlourish } from "./icons";
import {
  CalmMindIcon,
  ChakraBodyIcon,
  DistanceHealingIcon,
  EmotionalHeartIcon,
  PersonalHealingIcon,
  RelationshipIcon,
} from "./icons";
import { api } from "../../../../lib/api";
import { Loader2, AlertCircle } from "lucide-react";

const ICON_TONE_MAP: Record<string, { icon: React.FC<React.SVGProps<SVGSVGElement>>; tone: "purple" | "gold" }> = {
  "Personal Reiki Healing": { icon: PersonalHealingIcon, tone: "purple" },
  "Distance Reiki Healing": { icon: DistanceHealingIcon, tone: "gold" },
  "Chakra Balancing": { icon: ChakraBodyIcon, tone: "purple" },
  "Emotional Healing": { icon: EmotionalHeartIcon, tone: "gold" },
  "Stress & Anxiety Healing": { icon: CalmMindIcon, tone: "purple" },
  "Relationship Healing": { icon: RelationshipIcon, tone: "gold" },
};

export function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <ArrowFlourish flip />
      <h2 className="font-display text-center text-[22px] leading-tight font-bold whitespace-nowrap text-[#2c0c47] sm:text-[26px]">
        {children}
      </h2>
      <ArrowFlourish />
    </div>
  );
}

export default function ServicesGrid() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getServices()
      .then((res: any) => {
        const items = res?.data ?? Array.isArray(res) ? res : [];
        setServices(items.filter((s: any) => s.category === "Healing"));
      })
      .catch((err) => setError("Failed to load services. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="rounded-t-[16px] bg-white">
        <div className="mx-auto w-full max-w-[1336px] px-5 pt-[30px] pb-[26px] text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#4b2583]" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-t-[16px] bg-white">
        <div className="mx-auto w-full max-w-[1336px] px-5 pt-[30px] pb-[26px]">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-t-[16px] bg-white">
      <div className="mx-auto w-full max-w-[1336px] px-5 pt-[30px] pb-[26px]">
        <SectionHeading>Our Reiki Healing Services</SectionHeading>

        <div className="mt-[24px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {services.map((svc: any) => {
            const match = ICON_TONE_MAP[svc.name] || ICON_TONE_MAP[Object.keys(ICON_TONE_MAP).find(k => svc.name.includes(k.replace(/ .*/, ""))) || ""] || { icon: PersonalHealingIcon, tone: svc.name.length % 2 === 0 ? "purple" : "gold" as const };
            const Icon = match.icon;
            const tone = match.tone;
            const titleA = svc.name.includes(" ") ? svc.name.substring(0, svc.name.indexOf(" ")) : svc.name;
            const titleB = svc.name.includes(" ") ? svc.name.substring(svc.name.indexOf(" ") + 1) : "";
            const desc = svc.sub || svc.description || "";
            return (
            <article
              key={svc.name}
              className="rounded-[12px] border border-[#eee4d4] bg-white px-[14px] pt-[24px] pb-[18px] text-center shadow-[0_2px_14px_rgba(75,37,131,0.06)]"
            >
              <span
                className={`mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-full ${
                  tone === "purple"
                    ? "bg-[radial-gradient(120%_120%_at_50%_20%,#5a1a86_0%,#3b1160_55%,#2a0a45_100%)] text-[#f6e3b4]"
                    : "bg-[radial-gradient(120%_120%_at_50%_20%,#a97a2e_0%,#8a5a1f_55%,#6b4514_100%)] text-[#fdf3dd]"
                }`}
              >
                <Icon className="h-[32px] w-[32px]" />
              </span>

              <h3 className="font-display mt-[14px] text-[15px] leading-[1.35] font-bold text-[#4b2583]">
                {titleA}
                {titleB && <><br />{titleB}</>}
              </h3>

              <p className="mt-[10px] text-[11px] leading-[1.65] text-[#6c6b78]">
                {desc}
              </p>

              <Link
                href="/consultation/consultation-mode?service=Reiki%20Healing%20Session"
                className="mt-[12px] inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#b5711a] transition-colors hover:text-gold-3"
              >
                Learn More
                <ArrowRightIcon className="h-[12px] w-[12px]" />
              </Link>
            </article>
          )})}
        </div>
      </div>
    </section>
  );
}
