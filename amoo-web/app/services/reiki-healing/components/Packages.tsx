"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./ServicesGrid";
import {
  CalmMindIcon,
  ChakraBodyIcon,
  PersonalHealingIcon,
  StepTransformIcon,
} from "./icons";
import { api } from "../../../../lib/api";
import { Loader2, AlertCircle } from "lucide-react";

const PKG_ICON_MAP: Record<string, { icon: React.FC<React.SVGProps<SVGSVGElement>>; tone: "purple" | "gold" }> = {
  "3 Session Healing": { icon: PersonalHealingIcon, tone: "purple" },
  "7 Session Healing": { icon: StepTransformIcon, tone: "gold" },
  "21 Day Healing Program": { icon: ChakraBodyIcon, tone: "purple" },
  "Monthly Healing Plan": { icon: CalmMindIcon, tone: "gold" },
};

export default function Packages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPackages()
      .then((res: any) => {
        const items = res?.data ?? Array.isArray(res) ? res : [];
        setPackages(items);
      })
      .catch(() => setError("Failed to load packages. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <section className="bg-[linear-gradient(90deg,#fdf7ec_0%,#fbf6ef_45%,#f7f1e6_100%)]">
        <div className="mx-auto w-full max-w-[1336px] px-5 pt-[10px] pb-[30px]">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[linear-gradient(90deg,#fdf7ec_0%,#fbf6ef_45%,#f7f1e6_100%)]">
      <div className="mx-auto w-full max-w-[1336px] px-5 pt-[10px] pb-[30px]">
        <SectionHeading>Reiki Healing Packages</SectionHeading>

        <div className="mt-[22px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[repeat(4,1fr)_290px]">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#4b2583]" />
            </div>
          ) : (
            packages.map((pkg: any) => {
              const match = PKG_ICON_MAP[pkg.name] || {
                icon: pkg.name && pkg.name.length % 2 === 0 ? ChakraBodyIcon : CalmMindIcon,
                tone: (pkg.name && pkg.name.length % 2 === 0 ? "purple" : "gold") as "purple" | "gold",
              };
              const Icon = match.icon;
              const tone = match.tone;
              const desc = pkg.description || "";
              const isMostLoved = pkg.name?.toLowerCase().includes("3 session");
              const price = pkg.price ? `₹${Number(pkg.price).toLocaleString("en-IN")}` : "";
              return (
                <article
                  key={pkg.name || pkg.id}
                  className="relative overflow-hidden rounded-[12px] border border-[#eee4d4] bg-white px-[16px] pt-[26px] pb-[20px] text-center shadow-[0_2px_14px_rgba(75,37,131,0.06)]"
                >
                  {isMostLoved && (
                    <span className="absolute -left-[34px] top-[14px] w-[124px] -rotate-45 bg-[#4b2583] py-[3px] text-center text-[8.5px] font-semibold tracking-[0.06em] text-white uppercase">
                      Most Loved
                    </span>
                  )}

                  <span
                    className={`mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-full ${
                      tone === "purple"
                        ? "bg-[radial-gradient(120%_120%_at_50%_20%,#5a1a86_0%,#3b1160_55%,#2a0a45_100%)] text-[#f6e3b4]"
                        : "bg-[radial-gradient(120%_120%_at_50%_20%,#a97a2e_0%,#8a5a1f_55%,#6b4514_100%)] text-[#fdf3dd]"
                    }`}
                  >
                    <Icon className="h-[32px] w-[32px]" />
                  </span>

                  <h3 className="font-display mt-[14px] text-[15px] font-bold text-[#4b2583]">
                    {pkg.name}
                  </h3>

                  <p className="mt-[8px] text-[11px] leading-[1.6] text-[#6c6b78]">
                    {desc}
                  </p>

                  {price && (
                    <p className={`font-display mt-[12px] text-[20px] font-bold ${tone === "purple" ? "text-[#4b2583]" : "text-[#b5711a]"}`}>
                      {price}
                    </p>
                  )}

                  <Link
                    href="/consultation/consultation-mode?service=Reiki%20Healing%20Session"
                    className={`mt-[14px] flex h-[32px] w-full max-w-[150px] items-center justify-center rounded-[6px] text-[12.5px] font-semibold ${
                      tone === "purple"
                        ? "bg-gradient-to-b from-[#5f2199] to-[#3d1160] text-white"
                        : "bg-gradient-to-b from-gold-2 to-gold-3 text-[#2b0a3d]"
                    }`}
                  >
                    Book Now
                  </Link>
                </article>
              );
            })
          )}

          {/* Journey CTA card */}
          <article className="relative overflow-hidden rounded-[12px] bg-[#210b36] sm:col-span-2 lg:col-span-4 xl:col-span-1">
            <Image
              src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/trust-candles.png"
              alt=""
              width={417}
              height={222}
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_25%_30%,rgba(58,17,96,0.92)_0%,rgba(33,11,54,0.9)_60%,rgba(21,8,38,0.94)_100%)]" />
            <div className="stars pointer-events-none absolute inset-0 opacity-50" />

            <div className="relative px-[20px] py-[24px]">
              <h3 className="font-display text-[19px] leading-[1.3] font-bold text-[#f0c874]">
                Your Healing
                <br />
                Journey Starts
                <br />
                With One Step.
              </h3>

              <p className="mt-[10px] text-[11px] leading-[1.7] text-white/80">
                Book your Reiki session today
                <br />
                and feel the transformation
                <br />
                within.
              </p>

              <Link
                href="/consultation/consultation-mode?service=Reiki%20Healing%20Session"
                className="mt-[16px] flex h-[36px] items-center rounded-[6px] bg-gradient-to-b from-gold-2 to-gold-3 px-[18px] text-[12.5px] font-semibold text-[#2b0a3d]"
              >
                Book Reiki Session
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
