import Image from "next/image";
import { StarSolidIcon, WhatsAppIcon } from "../../../components/home-icons";
import { CheckCircleIcon, SparkleIcon } from "./icons";

const BENEFITS = [
  "Reduces stress, anxiety and depression",
  "Boosts energy, immunity and vitality",
  "Improves sleep and mental clarity",
  "Emotional balance and healing",
  "Pain relief and faster recovery",
  "Enhances intuition and spiritual growth",
  "Removes energy blocks and negativity",
  "Promotes overall well-being and peace",
];

const CHAKRAS = [
  {
    img: "/images/chakra-7.png",
    name: "Crown Chakra",
    color: "#a855f7",
    desc: "Spirituality & Divine Connection",
  },
  {
    img: "/images/chakra-6.png",
    name: "Third Eye Chakra",
    color: "#6366f1",
    desc: "Intuition & Wisdom",
  },
  {
    img: "/images/chakra-5.png",
    name: "Throat Chakra",
    color: "#38bdf8",
    desc: "Communication & Expression",
  },
  {
    img: "/images/chakra-4.png",
    name: "Heart Chakra",
    color: "#22c55e",
    desc: "Love & Compassion",
  },
  {
    img: "/images/chakra-3.png",
    name: "Solar Plexus Chakra",
    color: "#eab308",
    desc: "Confidence & Power",
  },
  {
    img: "/images/chakra-2.png",
    name: "Sacral Chakra",
    color: "#f97316",
    desc: "Creativity & Emotions",
  },
  {
    img: "/images/chakra-1.png",
    name: "Root Chakra",
    color: "#ef4444",
    desc: "Stability & Grounding",
  },
];

const AVATARS = ["/images/t-1.png", "/images/t-2.png", "/images/t-3.png"];

export default function BenefitsChakras() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(90deg,#fdf7ec_0%,#fbf6ef_45%,#f7f1e6_100%)]">
      {/* Soft aura silhouette watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[260px] bg-[radial-gradient(60%_46%_at_38%_52%,rgba(233,184,92,0.22)_0%,rgba(233,184,92,0.08)_45%,rgba(233,184,92,0)_75%)] lg:block"
      />

      <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[28px] pb-[26px]">
        <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-2 xl:grid-cols-[1fr_320px_300px_232px]">
          {/* Benefits */}
          <div>
            <h2 className="font-display flex items-center gap-2.5 text-[19px] font-bold text-[#4b2583]">
              <SparkleIcon className="h-[16px] w-[16px] text-gold-3" />
              Benefits of Reiki Healing
            </h2>

            <ul className="mt-[16px] space-y-[10px]">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5">
                  <CheckCircleIcon className="h-[15px] w-[15px] shrink-0 text-gold-3" />
                  <span className="text-[12px] leading-[1.5] text-[#5b4a6b]">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chakra body visual */}
          <div className="flex items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=640&q=80"
              alt="Seven chakras aligned on a meditating figure"
              width={640}
              height={520}
              unoptimized
              className="h-[236px] w-full max-w-[320px] object-contain"
            />
          </div>

          {/* 7 Chakras */}
          <div>
            <h2 className="font-display flex items-center gap-2 text-[15.5px] font-bold text-[#4b2583]">
              <svg
                viewBox="0 0 14 12"
                fill="currentColor"
                aria-hidden
                className="h-[10px] w-[12px] shrink-0 text-gold-3"
              >
                <path d="M0 6h9.4L6.1 2.5 7 1.5 12.5 6 7 10.5l-.9-1 3.3-3.5H0Z" />
              </svg>
              7 Chakras. 7 Gates of Energy.
            </h2>
            <p className="mt-[5px] pl-[20px] text-[10.5px] text-[#6c6b78]">
              Balanced Chakras, Balanced Life.
            </p>

            <ul className="mt-[12px] space-y-[8px]">
              {CHAKRAS.map(({ img, name, color, desc }) => (
                <li key={name} className="flex items-center gap-2.5">
                  <Image
                    src={img}
                    alt=""
                    width={64}
                    height={64}
                    className="h-[24px] w-[24px] shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <p
                      className="text-[11px] leading-[1.3] font-semibold"
                      style={{ color }}
                    >
                      {name}
                    </p>
                    <p className="text-[10px] leading-[1.35] text-[#6c6b78]">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Not sure card */}
          <div className="overflow-hidden rounded-[12px] border border-gold/25 bg-[radial-gradient(130%_120%_at_50%_0%,#4a1273_0%,#33104f_50%,#210b36_100%)]">
            <div className="px-[18px] pt-[18px] pb-[16px] text-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
                className="mx-auto h-[22px] w-[22px] text-gold"
              >
                <path d="M12 3c1.9 2 2.9 3.9 2.9 5.8 0 1.6-1.3 2.9-2.9 2.9S9.1 10.4 9.1 8.8C9.1 6.9 10.1 5 12 3Z" />
                <path d="M9 11.2c-2.2-1.5-4.4-2.1-6.6-1.8.5 3.1 2.6 5.2 6.2 6.1M15 11.2c2.2-1.5 4.4-2.1 6.6-1.8-.5 3.1-2.6 5.2-6.2 6.1" />
                <path d="M4.8 18.6c2.2-1.1 4.6-1.6 7.2-1.6s5 .5 7.2 1.6c-2.2 1.6-4.6 2.4-7.2 2.4s-5-.8-7.2-2.4Z" />
              </svg>

              <h3 className="font-display mt-[10px] text-[16px] leading-[1.3] font-bold text-[#f0c874]">
                Not Sure Which
                <br />
                Healing You Need?
              </h3>

              <p className="mt-[8px] text-[10.5px] leading-[1.6] text-white/80">
                Talk to our expert and get
                <br />
                personalized guidance.
              </p>

              <button
                type="button"
                className="mx-auto mt-[12px] flex h-[36px] w-full max-w-[176px] items-center justify-center gap-2 rounded-[6px] bg-gradient-to-b from-gold-2 to-gold-3 text-[12.5px] font-semibold text-[#2b0a3d]"
              >
                <WhatsAppIcon className="h-[15px] w-[15px]" />
                Chat on WhatsApp
              </button>
            </div>

            <div className="border-t border-white/10 bg-black/25 px-[18px] py-[12px]">
              <div className="flex items-center justify-center gap-2.5">
                <p className="font-display text-[19px] leading-none font-bold text-gold">
                  50K+
                </p>
                <span className="h-[16px] w-px bg-white/25" />
                <p className="text-[11px] text-white/85">Happy Clients</p>
              </div>

              <div className="mt-[10px] flex items-center justify-center gap-2.5">
                <div className="flex items-center">
                  {AVATARS.map((avatar, index) => (
                    <Image
                      key={avatar}
                      src={avatar}
                      alt=""
                      width={64}
                      height={64}
                      className={`h-[22px] w-[22px] rounded-full border border-gold/60 object-cover ${
                        index === 0 ? "" : "-ml-2"
                      }`}
                    />
                  ))}
                </div>

                <div>
                  <div className="flex items-center gap-[2px] text-gold">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarSolidIcon key={index} className="h-[10px] w-[10px]" />
                    ))}
                    <span className="ml-1 text-[11px] font-semibold text-white">
                      4.9
                    </span>
                  </div>
                  <p className="mt-[2px] text-[8.5px] text-white/60 italic">
                    *5.0 rating
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
