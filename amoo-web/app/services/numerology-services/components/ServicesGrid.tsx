"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../../../../lib/api";
import {
  UserRound,
  Type,
  Baby,
  Briefcase,
  Tag,
  Smartphone,
  Car,
  HeartHandshake,
  TrendingUp,
  DollarSign,
  CalendarDays,
  Palette,
  LucideIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface NumerologyServiceCard {
  name: string;
  sub?: string | null;
  description?: string | null;
  category?: string;
}

function HorseshoeGlyph() {
  return (
    <svg viewBox="0 0 40 40" className="w-6 h-6">
      <path
        d="M12 34 L12 20 A8 8 0 0 1 28 20 L28 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SignatureGlyph() {
  return (
    <svg viewBox="0 0 40 40" className="w-6 h-6">
      <path
        d="M6 28c3-8 6-14 9-14s2 10 5 10 4-8 7-8 3 6 7 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const STATIC_ICONS: Record<string, { Icon?: LucideIcon; glyph?: string }> = {
  "Personal Numerology": { Icon: UserRound },
  "Name Numerology": { Icon: Type },
  "Name Correction": { glyph: "A→Z" },
  "Baby Name Numerology": { Icon: Baby },
  "Business Numerology": { Icon: Briefcase },
  "Brand Name Numerology": { Icon: Tag },
  "Mobile Number Analysis": { Icon: Smartphone },
  "Vehicle Number Analysis": { Icon: Car },
  "Marriage Compatibility": { Icon: HeartHandshake },
  "Career Numerology": { Icon: TrendingUp },
  "Financial Numerology": { Icon: DollarSign },
  "Personal Year Prediction": { Icon: CalendarDays },
  "Lucky Numbers": { glyph: "horseshoe" },
  "Lucky Colors": { Icon: Palette },
  "Signature Numerology": { glyph: "signature" },
};

export default function ServicesGrid() {
  const [services, setServices] = useState<NumerologyServiceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getServices()
      .then((res: unknown) => {
        const payload = res as
          { data?: NumerologyServiceCard[] } | NumerologyServiceCard[];
        const items = Array.isArray(payload)
          ? (payload as NumerologyServiceCard[])
          : (payload?.data ?? []);
        setServices(items.filter((s) => s.category === "Numerology"));
      })
      .catch(() => setError("Failed to load services. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-[#FBF6EE] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-purple-950" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#FBF6EE] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FBF6EE] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-amber-500">✦</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-950">
              Explore Our Numerology Services
            </h2>
            <span className="text-amber-500">✦</span>
          </div>
          <p className="text-gray-500 text-sm">
            Find the right numerology solution for every area of your life.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {services.map((svc) => {
            const match = STATIC_ICONS[svc.name] || {};
            const Icon = match.Icon;
            const glyph = match.glyph;
            const desc = svc.sub || svc.description || "";
            return (
              <div
                key={svc.name}
                className="bg-white border border-amber-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-purple-950 text-amber-400 flex items-center justify-center mx-auto mb-4">
                  {Icon ? (
                    <Icon className="w-6 h-6" />
                  ) : glyph === "horseshoe" ? (
                    <HorseshoeGlyph />
                  ) : glyph === "signature" ? (
                    <SignatureGlyph />
                  ) : (
                    <span className="text-sm font-bold">{glyph || "★"}</span>
                  )}
                </div>
                <h3 className="font-semibold text-purple-950 mb-2">
                  {svc.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {desc}
                </p>
                <a
                  href="/consultation/select-service"
                  className="text-amber-600 text-xs font-semibold flex items-center justify-center gap-1 hover:text-amber-700 transition-colors"
                >
                  Learn More <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
