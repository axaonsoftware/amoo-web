"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Video,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../../lib/api";
import type { Service } from "../../../lib/types";

const durations = ["15 Min", "30 Min", "45 Min", "60 Min"];

interface BaseMode {
  key: string;
  icon: typeof Phone;
  title: string;
  desc: string;
  features: string[];
  defaultPrices: string[];
  cta: string;
  popular: boolean;
}

const baseModes: BaseMode[] = [
  {
    key: "Audio",
    icon: Phone,
    title: "AUDIO CALL CONSULTATION",
    desc: "Speak directly with Reiki Grand Master Surinder Kaur Sehgal and get powerful guidance.",
    features: [
      "1-to-1 Audio Call",
      "Clear Answers to Your Questions",
      "Personalized Remedies",
      "Secure & Private Session",
    ],
    defaultPrices: ["₹499", "₹799", "₹1,099", "₹1,499"],
    cta: "Book Audio Call",
    popular: false,
  },
  {
    key: "Video",
    icon: Video,
    title: "VIDEO CALL CONSULTATION",
    desc: "Face-to-face spiritual guidance for deeper connection and better understanding.",
    features: [
      "Live Video Interaction",
      "Detailed Consultation",
      "Screen Share Support",
      "Personalized Guidance",
    ],
    defaultPrices: ["₹799", "₹1,199", "₹1,699", "₹2,299"],
    cta: "Book Video Call",
    popular: true,
  },
  {
    key: "Chat",
    icon: MessageSquare,
    title: "CHAT CONSULTATION",
    desc: "Connect in a private chat and get written guidance at your convenience.",
    features: [
      "Real-time Private Chat",
      "Written Detailed Guidance",
      "Share Documents & Images",
      "Perfect for Quick Questions",
    ],
    defaultPrices: ["₹349", "₹549", "₹749", "₹999"],
    cta: "Book Chat",
    popular: false,
  },
];

export default function ConsultationModes() {
  const [modePrices, setModePrices] = useState<Record<string, string[]>>({
    Audio: ["₹499", "₹799", "₹1,099", "₹1,499"],
    Video: ["₹799", "₹1,199", "₹1,699", "₹2,299"],
    Chat: ["₹349", "₹549", "₹749", "₹999"],
  });

  useEffect(() => {
    api
      .getServices()
      .then((res: unknown) => {
        const payload = res as { data?: Service[] } | Service[];
        const items = Array.isArray(payload)
          ? (payload as Service[])
          : (payload?.data ?? []);
        if (items.length) {
          const updated: Record<string, string[]> = { ...modePrices };
          baseModes.forEach((m) => {
            const match = items.find(
              (s) =>
                s.type === m.key ||
                s.name.toLowerCase().includes(m.key.toLowerCase()),
            );
            if (match && match.price) {
              const base = Number(match.price);
              updated[m.key] = [
                `₹${Math.round(base).toLocaleString("en-IN")}`,
                `₹${Math.round(base * 1.6).toLocaleString("en-IN")}`,
                `₹${Math.round(base * 2.2).toLocaleString("en-IN")}`,
                `₹${Math.round(base * 3.0).toLocaleString("en-IN")}`,
              ];
            }
          });
          setModePrices(updated);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full bg-[#FCF9F3] px-6 md:px-10 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-amber-500">✦</span>
          <h2 className="text-2xl font-serif font-bold tracking-wide text-[#3E1E7A]">
            CHOOSE YOUR CONSULTATION MODE
          </h2>
          <span className="text-amber-500">✦</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {baseModes.map((mode) => {
            const Icon = mode.icon;
            const currentPrices = modePrices[mode.key] || mode.defaultPrices;
            return (
              <div
                key={mode.title}
                className="relative rounded-2xl p-6 flex flex-col overflow-hidden"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, #241535 0%, #150b21 70%, #0d0616 100%)",
                  border: "1px solid rgba(212,160,60,0.25)",
                }}
              >
                {mode.popular && (
                  <span className="absolute top-4 -right-9 rotate-45 bg-amber-500 text-[#150b21] text-[10px] font-bold px-9 py-1">
                    MOST POPULAR
                  </span>
                )}

                <span className="w-14 h-14 rounded-full border border-amber-500/60 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-amber-400" />
                </span>

                <h3 className="text-amber-400 font-serif font-bold text-lg leading-tight mb-2">
                  {mode.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  {mode.desc}
                </p>

                <ul className="space-y-2 mb-4">
                  {mode.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-white/80 text-sm"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-amber-400 shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-amber-500/20 pt-3 mb-3">
                  <p className="text-center text-amber-400 text-xs tracking-widest mb-2">
                    DURATION
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    {durations.map((d, i) => (
                      <div key={d}>
                        <p className="text-white/50 text-[11px]">{d}</p>
                        <p className="text-white font-semibold text-sm mt-0.5">
                          {currentPrices[i]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="/consultation/select-service"
                  className="mt-auto w-full block rounded-lg py-2.5 text-sm font-semibold text-[#3E1E7A] text-center"
                  style={{
                    background:
                      "linear-gradient(90deg,#F3D07A 0%,#C9932F 100%)",
                  }}
                >
                  {mode.cta}
                </a>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500">
          <ShieldCheck size={16} className="text-amber-600" />
          All consultations are private, secure and completely confidential.
        </div>
      </div>
    </section>
  );
}
