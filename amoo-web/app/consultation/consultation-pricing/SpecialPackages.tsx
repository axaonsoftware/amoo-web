"use client";

import { useState, useEffect } from "react";
import {
  Flower2,
  Hash,
  Layers,
  CircleDot,
  Infinity as InfinityIcon,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { WHATSAPP_URL } from "../../../lib/constants";

const STATIC_PACKAGES = [
  {
    icon: Flower2,
    title: "REIKI HEALING PACKAGES",
    desc: "Transform your energy and restore balance.",
    items: ["3 Sessions", "7 Sessions", "21 Day Program"],
  },
  {
    icon: Hash,
    title: "NUMEROLOGY PACKAGES",
    desc: "Discover numbers that shape your destiny.",
    items: ["Basic Reading", "Detailed Reading", "Premium Reading"],
  },
  {
    icon: Layers,
    title: "TAROT READING PACKAGES",
    desc: "Gain clarity and insight through divine cards.",
    items: ["3 Card Reading", "Love Reading", "Yearly Guidance"],
  },
  {
    icon: CircleDot,
    title: "KUNDALI & ASTROLOGY PACKAGES",
    desc: "Understand your cosmic blueprint.",
    items: ["Basic Kundali", "Detailed Kundali", "Premium Kundali"],
  },
  {
    icon: InfinityIcon,
    title: "COMBO PACKAGES",
    desc: "Combine multiple services for complete guidance.",
    items: ["Numerology + Tarot", "Reiki + Numerology", "All-in-One Guidance"],
  },
];

const PKG_ICONS = [Flower2, Hash, Layers, CircleDot, InfinityIcon];

export default function SpecialPackages() {
  const [packages, setPackages] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPackages()
      .then((res: any) => {
        const items = (res?.data ?? Array.isArray(res)) ? res : [];
        if (items.length) setPackages(items);
      })
      .catch(() => setError("Failed to load packages. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const displayPackages =
    packages && packages.length
      ? packages.map((pkg: any, i: number) => ({
          icon: PKG_ICONS[i % PKG_ICONS.length],
          title: (pkg.name || "Package").toUpperCase(),
          desc: pkg.description || "",
          items: pkg.sub
            ? pkg.sub.split(",").map((s: string) => s.trim())
            : ["Available"],
        }))
      : STATIC_PACKAGES;

  if (loading) {
    return (
      <section className="w-full bg-[#FCF9F3] px-6 md:px-10 pb-14">
        <div className="max-w-6xl mx-auto flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#3E1E7A]" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-[#FCF9F3] px-6 md:px-10 pb-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#FCF9F3] px-6 md:px-10 pb-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-amber-500">✦</span>
          <h2 className="text-2xl font-serif font-bold tracking-wide text-[#3E1E7A]">
            SPECIAL PACKAGES &amp; COMBO
          </h2>
          <span className="text-amber-500">✦</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(5,1fr)_260px] gap-5 items-stretch">
          {displayPackages.map((pkg: any) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
              >
                <span className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#5B2A9D]" />
                </span>
                <h3 className="text-[#3E1E7A] font-bold text-sm tracking-wide mb-2">
                  {pkg.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">
                  {pkg.desc}
                </p>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {pkg.items.map((item: string) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <span className="text-amber-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/consultation/select-service"
                  className="w-full block rounded-lg py-2 text-xs font-semibold text-[#3E1E7A] text-center"
                  style={{
                    background:
                      "linear-gradient(90deg,#F3D07A 0%,#C9932F 100%)",
                  }}
                >
                  View Packages
                </a>
              </div>
            );
          })}

          {/* CTA card */}
          <div
            className="relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden text-white"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, #3E1E7A 0%, #241535 60%, #150b21 100%)",
            }}
          >
            <div>
              <h3 className="font-serif font-bold text-lg leading-snug mb-3">
                Not Sure Which Service is Right for You?
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Talk to our expert and get personalized recommendation.
              </p>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-[#3E1E7A]"
              style={{
                background: "linear-gradient(90deg,#F3D07A 0%,#C9932F 100%)",
              }}
            >
              <MessageCircle size={15} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
