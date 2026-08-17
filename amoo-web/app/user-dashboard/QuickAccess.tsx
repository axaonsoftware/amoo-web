import Link from "next/link";
import { LayoutGrid, Layers, Flower2, Compass, Zap, Bot } from "lucide-react";

const items = [
  {
    Icon: LayoutGrid,
    title: "Numerology",
    sub: "Software",
    href: "/software-hub/numerology-software",
    comingSoon: false,
  },
  {
    Icon: Layers,
    title: "Tarot",
    sub: "Reading",
    href: "/services/tarot-reading",
    comingSoon: false,
  },
  {
    Icon: Flower2,
    title: "Kundli",
    sub: "Generate",
    href: "/software-hub/basic-kundali-software",
    comingSoon: false,
  },
  {
    Icon: Compass,
    title: "Vastu",
    sub: "Analyzer",
    href: "/software-hub",
    comingSoon: true,
  },
  {
    Icon: Zap,
    title: "Reiki",
    sub: "Healing",
    href: "/services/reiki-healing",
    comingSoon: false,
  },
  {
    Icon: Bot,
    title: "AI Astro",
    sub: "Chat",
    href: "/software-hub",
    comingSoon: true,
  },
];

export default function QuickAccess() {
  return (
    <section className="rounded-[16px] border border-[#efe6d6] bg-white px-5 pb-5 pt-4 shadow-[0_2px_10px_rgba(42,17,72,.05)]">
      <h2 className="font-display text-[17px] font-bold text-[#4a1c7d]">
        Quick Access
      </h2>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map(({ Icon, title, sub, href, comingSoon }) => (
          <Link
            key={title}
            href={href}
            className="relative flex flex-col items-center rounded-[12px] border border-[#eee4d2] bg-white px-2 py-4 text-center transition-shadow hover:shadow-[0_6px_16px_rgba(42,17,72,.08)]"
          >
            {comingSoon ? (
              <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#f0c877] px-2 py-[2px] text-[8.5px] font-bold text-[#3d1268]">
                Coming Soon
              </span>
            ) : null}
            <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-b from-[#5a2496] to-[#3d1268] shadow-[0_4px_10px_rgba(61,18,104,.28)]">
              <Icon
                className="h-[20px] w-[20px] text-[#f0c877]"
                strokeWidth={1.7}
              />
            </span>
            <p className="mt-2.5 text-[12.5px] font-semibold text-[#2b0f47]">
              {title}
            </p>
            <p className="mt-[2px] text-[11px] text-[#8b8697]">{sub}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
