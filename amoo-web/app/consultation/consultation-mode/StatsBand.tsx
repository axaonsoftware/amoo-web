import Image from "next/image";
import { Star } from "lucide-react";

import { LotusIcon } from "../../components/home-icons";

type Stat = {
  value: string;
  label: string[];
  rating?: boolean;
};

const STATS: Stat[] = [
  { value: "25K+", label: ["Happy Clients", "Guided"] },
  { value: "4.9/5", label: ["Client Rating"], rating: true },
  { value: "50K+", label: ["Consultations", "Completed"] },
  { value: "5+ Years", label: ["Of Trust &", "Experience"] },
];

function LaurelBranch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 66"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M22 3C11.5 12 5.5 26 5.5 40.5c0 8.4 2.3 16.4 6.9 22.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {[
        { x: 17.6, y: 9, r: -34 },
        { x: 11.6, y: 17.6, r: -20 },
        { x: 7.8, y: 27, r: -6 },
        { x: 6.2, y: 37, r: 8 },
        { x: 7.6, y: 47, r: 22 },
        { x: 10.8, y: 56.6, r: 36 },
      ].map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.x}
          cy={leaf.y}
          rx="6.4"
          ry="2.6"
          fill="currentColor"
          fillOpacity="0.9"
          transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`}
        />
      ))}
    </svg>
  );
}

export default function StatsBand() {
  return (
    <section className="relative overflow-hidden rounded-t-[30px] bg-[#2a1046]">
      <div className="stars pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col items-center gap-[24px] px-[30px] pt-[26px] lg:flex-row lg:justify-between lg:gap-[20px]">
        {/* stats */}
        <div className="flex flex-wrap items-center justify-center gap-[26px] pb-[26px]">
          <LotusIcon className="h-[72px] w-[86px] shrink-0 text-gold" />

          {STATS.map(({ value, label, rating }) => (
            <div key={value} className="flex items-center gap-[4px]">
              <LaurelBranch className="h-[58px] w-[22px] shrink-0 text-gold/80" />

              <div className="flex flex-col items-center px-[2px]">
                <p className="font-display text-[27px] leading-none font-bold whitespace-nowrap text-gold">
                  {value}
                </p>

                {rating && (
                  <div className="mt-[5px] flex items-center gap-[2px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className="fill-gold text-gold"
                      />
                    ))}
                  </div>
                )}

                <p className="mt-[6px] text-center text-[11px] leading-[1.4] whitespace-nowrap text-white/85">
                  {label.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              <LaurelBranch className="h-[58px] w-[22px] shrink-0 scale-x-[-1] text-gold/80" />
            </div>
          ))}
        </div>

        {/* quote + portrait */}
        <div className="flex items-end gap-[16px] self-stretch">
          <div className="flex flex-1 items-start gap-[10px] pb-[26px] lg:pt-[10px]">
            <span className="font-display text-[38px] leading-[0.7] font-bold text-gold">
              &ldquo;
            </span>

            <div>
              <p className="w-full max-w-[400px] text-[15px] leading-[1.6] text-white">
                Our mission is to bring clarity, peace and positivity in your
                life through divine guidance.
              </p>
              <p className="mt-[8px] text-[12.5px] font-medium text-gold">
                – Grand Master Surinder Kaur Sehgal
              </p>
            </div>

            <span className="font-display self-end text-[38px] leading-[0.7] font-bold text-gold">
              &rdquo;
            </span>
          </div>

          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/guru-portrait.png"
            alt="Grand Master Surinder Kaur Sehgal"
            width={320}
            height={400}
            className="hidden h-[134px] w-[160px] shrink-0 self-end object-contain object-bottom lg:block"
          />
        </div>
      </div>
    </section>
  );
}
