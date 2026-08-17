"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { HomeHeader, OfferBar } from "../../components/home-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/ornament";
import Stepper from "./Stepper";
import { WHATSAPP_URL } from "../../../lib/constants";
import { saveConsultationData } from "../lib/consultation-storage";
import { api } from "../../../lib/api";
import {
  SearchIcon,
  ChevronDownIcon,
  StarFillIcon,
  CheckCircleFillIcon,
  WhatsAppIcon,
  NumerologyIcon,
  CompassIcon,
  SparkleIcon,
  MonitorIcon,
  ReikiHandsIcon,
  TarotCardsIcon,
  KundaliWheelIcon,
  LotusSolidIcon,
  LockIcon,
  ShieldStarIcon,
  BadgeCheckIcon,
  CalendarIcon,
  HeadsetIcon,
} from "./icons";

/* ───────────── Data ───────────── */

const STATIC_CATEGORIES = [
  { label: "All Services", Icon: StarFillIcon },
  { label: "Numerology", Icon: NumerologyIcon },
  { label: "Tarot", Icon: TarotCardsIcon },
  { label: "Astrology", Icon: KundaliWheelIcon },
  { label: "Healing", Icon: ReikiHandsIcon },
  { label: "Vastu", Icon: CompassIcon },
  { label: "AI Services", Icon: MonitorIcon },
  { label: "Spiritual", Icon: SparkleIcon },
];

type Service = {
  id: number;
  name: string;
  desc: string;
  price: string;
  category: string;
  popular?: boolean;
  priceColor: string;
  iconBg: string;
  btnBg: string;
  btnText: string;
  icon: React.ReactNode;
};

interface ApiServiceRow {
  id: number;
  name: string;
  description?: string | null;
  price: string | number;
  category: string;
}

const CATEGORY_VISUALS: Record<
  string,
  {
    icon: React.ReactNode;
    popular?: boolean;
    priceColor: string;
    iconBg: string;
    btnBg: string;
    btnText: string;
  }
> = {
  Numerology: {
    icon: (
      <div className="grid h-[42px] w-[42px] grid-cols-3 place-items-center gap-x-[3px] rounded-[11px] bg-gradient-to-br from-[#6b3fa0] to-[#4b2583] text-[8.5px] font-semibold leading-none text-white">
        {[1, 4, 7, 2, 5, 8, 3, 6, 9].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    ),
    popular: true,
    priceColor: "#d6417f",
    iconBg: "#efe7fb",
    btnBg: "#f7eef6",
    btnText: "#8a3f86",
  },
  Tarot: {
    icon: <TarotCardsIcon className="h-[32px] w-[32px] text-[#7b3fb0]" />,
    popular: true,
    priceColor: "#7b3fb0",
    iconBg: "#efe6fb",
    btnBg: "#f2ecfb",
    btnText: "#6b3fa0",
  },
  Astrology: {
    icon: <KundaliWheelIcon className="h-[34px] w-[34px] text-[#e08a2e]" />,
    priceColor: "#e08a2e",
    iconBg: "#fdeede",
    btnBg: "#fcf1e2",
    btnText: "#c9791f",
  },
  Healing: {
    icon: <ReikiHandsIcon className="h-[34px] w-[34px] text-[#3aa564]" />,
    popular: true,
    priceColor: "#2f9e5f",
    iconBg: "#e4f4e9",
    btnBg: "#eef4ef",
    btnText: "#3f8158",
  },
  Vastu: {
    icon: <CompassIcon className="h-[34px] w-[34px] text-[#e08a2e]" />,
    priceColor: "#c9791f",
    iconBg: "#fdeede",
    btnBg: "#fcf1e2",
    btnText: "#a06010",
  },
  "AI Services": {
    icon: <MonitorIcon className="h-[34px] w-[34px] text-[#4a78d6]" />,
    popular: true,
    priceColor: "#3f6fd0",
    iconBg: "#e7effb",
    btnBg: "#eaf0fb",
    btnText: "#3f6fc9",
  },
  Spiritual: {
    icon: <SparkleIcon className="h-[34px] w-[34px] text-[#b5711a]" />,
    priceColor: "#b5711a",
    iconBg: "#fdf0da",
    btnBg: "#fcf1de",
    btnText: "#b5711a",
  },
};

const CATEGORY_DESCS: Record<string, string> = {
  Numerology:
    "Discover the power of numbers that influence your life path, career, relationships and more.",
  Tarot:
    "Get insights and guidance for your current situation and future path with Tarot card reading.",
  Astrology:
    "Detailed analysis of your birth chart and planetary positions by expert astrologers.",
  Healing:
    "Heal your mind, body and soul with divine energy from our expert healers.",
  Vastu:
    "Harmonize your living and working spaces with ancient Vastu principles.",
  "AI Services":
    "Get instant astrology answers and insights powered by AI technology.",
  Spiritual: "Connect with your inner self and explore your spiritual journey.",
};

const LIFE_INCLUDES = [
  "Numerology Report",
  "Tarot Reading",
  "Reiki Healing Session",
  "Kundli Reading",
  "Aura Report",
];

const TRUST_ITEMS = [
  {
    Icon: LotusSolidIcon,
    title: "Expert Guidance",
    sub: "by Surinder Kaur Sehgal",
  },
  {
    Icon: LockIcon,
    title: "Secure & Private",
    sub: "Your data is always safe",
  },
  {
    Icon: BadgeCheckIcon,
    title: "100% Satisfaction",
    sub: "Trusted by 25K+ clients",
  },
  { Icon: CalendarIcon, title: "Easy Booking", sub: "Quick & simple process" },
  { Icon: HeadsetIcon, title: "Multiple Modes", sub: "Audio, Video & Chat" },
];

const SORT_OPTIONS = [
  "Popular First",
  "Price: Low to High",
  "Price: High to Low",
];

const STATIC_SERVICES: Service[] = [
  {
    id: 1,
    name: "Numerology Report",
    desc: "Discover the power of numbers that influence your life path, career, relationships and more.",
    price: "₹999",
    category: "Numerology",
    popular: true,
    priceColor: "#d6417f",
    iconBg: "#efe7fb",
    btnBg: "#f7eef6",
    btnText: "#8a3f86",
    icon: (
      <div className="grid h-[42px] w-[42px] grid-cols-3 place-items-center gap-x-[3px] rounded-[11px] bg-gradient-to-br from-[#6b3fa0] to-[#4b2583] text-[8.5px] font-semibold leading-none text-white">
        {[1, 4, 7, 2, 5, 8, 3, 6, 9].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    ),
  },
  {
    id: 2,
    name: "Tarot Reading",
    desc: "Get insights and guidance for your current situation and future path with Tarot card reading.",
    price: "₹799",
    category: "Tarot",
    popular: true,
    priceColor: "#7b3fb0",
    iconBg: "#efe6fb",
    btnBg: "#f2ecfb",
    btnText: "#6b3fa0",
    icon: <TarotCardsIcon className="h-[32px] w-[32px] text-[#7b3fb0]" />,
  },
  {
    id: 3,
    name: "Kundli Reading",
    desc: "Detailed analysis of your birth chart and planetary positions by expert astrologers.",
    price: "₹1,499",
    category: "Astrology",
    priceColor: "#e08a2e",
    iconBg: "#fdeede",
    btnBg: "#fcf1e2",
    btnText: "#c9791f",
    icon: <KundaliWheelIcon className="h-[34px] w-[34px] text-[#e08a2e]" />,
  },
  {
    id: 4,
    name: "Reiki Healing Session",
    desc: "Heal your mind, body and soul with divine energy from our expert healers.",
    price: "₹999",
    category: "Healing",
    popular: true,
    priceColor: "#2f9e5f",
    iconBg: "#e4f4e9",
    btnBg: "#eef4ef",
    btnText: "#3f8158",
    icon: <ReikiHandsIcon className="h-[34px] w-[34px] text-[#3aa564]" />,
  },
  {
    id: 5,
    name: "Vastu Consultation",
    desc: "Harmonize your living and working spaces with ancient Vastu principles.",
    price: "₹1,299",
    category: "Vastu",
    priceColor: "#c9791f",
    iconBg: "#fdeede",
    btnBg: "#fcf1e2",
    btnText: "#a06010",
    icon: <CompassIcon className="h-[34px] w-[34px] text-[#e08a2e]" />,
  },
  {
    id: 6,
    name: "AI Astro Chat",
    desc: "Get instant astrology answers and insights powered by AI technology.",
    price: "₹199",
    category: "AI Services",
    popular: true,
    priceColor: "#3f6fd0",
    iconBg: "#e7effb",
    btnBg: "#eaf0fb",
    btnText: "#3f6fc9",
    icon: <MonitorIcon className="h-[34px] w-[34px] text-[#4a78d6]" />,
  },
  {
    id: 7,
    name: "Aura Report",
    desc: "Energy Aura Analysis — discover the energy field surrounding you.",
    price: "₹599",
    category: "Healing",
    priceColor: "#2f9e5f",
    iconBg: "#e4f4e9",
    btnBg: "#eef4ef",
    btnText: "#3f8158",
    icon: <ReikiHandsIcon className="h-[34px] w-[34px] text-[#3aa564]" />,
  },
  {
    id: 8,
    name: "Past Life Reading",
    desc: "Explore your past lives and understand the karmic patterns affecting your present.",
    price: "₹1,199",
    category: "Spiritual",
    priceColor: "#b5711a",
    iconBg: "#fdf0da",
    btnBg: "#fcf1de",
    btnText: "#b5711a",
    icon: <SparkleIcon className="h-[34px] w-[34px] text-[#b5711a]" />,
  },
];

/* ───────────── Page ───────────── */

export default function SelectServicePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Services");
  const [sort, setSort] = useState("Popular First");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [apiServices, setApiServices] = useState<ApiServiceRow[] | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState("");

  useEffect(() => {
    api
      .getServices("?pageSize=100")
      .then((res: unknown) => {
        const payload = res as { data?: ApiServiceRow[] } | ApiServiceRow[];
        const items = Array.isArray(payload)
          ? (payload as ApiServiceRow[])
          : (payload?.data ?? []);
        if (items.length) {
          setApiServices(items);
        }
      })
      .catch(() => {
        setServicesError("Failed to load services.");
      })
      .finally(() => setLoadingServices(false));
  }, []);

  const CATEGORIES = useMemo(() => {
    const derived = apiServices
      ? [...new Set(apiServices.map((s) => s.category).filter(Boolean))]
      : [];
    const staticLabels = STATIC_CATEGORIES.slice(1).map((c) => c.label);
    const allLabels = derived.length
      ? [...new Set([...derived, ...staticLabels])]
      : staticLabels;
    return [
      STATIC_CATEGORIES[0],
      ...allLabels.map((label: string) => {
        const found = STATIC_CATEGORIES.find((c) => c.label === label);
        return found || { label, Icon: StarFillIcon };
      }),
    ];
  }, [apiServices]);

  const allServices: Service[] = useMemo(() => {
    if (apiServices && apiServices.length) {
      return apiServices.map((s) => {
        const v = CATEGORY_VISUALS[s.category] || CATEGORY_VISUALS["Spiritual"];
        return {
          id: Number(s.id),
          name: s.name,
          desc: CATEGORY_DESCS[s.category] || s.description || "",
          price: `₹${Number(s.price).toLocaleString("en-IN")}`,
          category: s.category,
          popular: v.popular,
          priceColor: v.priceColor,
          iconBg: v.iconBg,
          btnBg: v.btnBg,
          btnText: v.btnText,
          icon: v.icon,
        };
      });
    }
    return STATIC_SERVICES;
  }, [apiServices]);

  const filtered = useMemo(() => {
    let list = allServices;

    if (activeCategory !== "All Services") {
      list = list.filter((s) => s.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q),
      );
    }

    if (sort === "Price: Low to High") {
      list = [...list].sort(
        (a, b) =>
          parseFloat(a.price.replace(/[^0-9]/g, "")) -
          parseFloat(b.price.replace(/[^0-9]/g, "")),
      );
    } else if (sort === "Price: High to Low") {
      list = [...list].sort(
        (a, b) =>
          parseFloat(b.price.replace(/[^0-9]/g, "")) -
          parseFloat(a.price.replace(/[^0-9]/g, "")),
      );
    } else {
      list = [...list].sort(
        (a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0),
      );
    }

    return list;
  }, [activeCategory, search, sort]);

  const handleContinue = () => {
    if (selectedService) {
      saveConsultationData({ service: selectedService });
      router.push(
        `/consultation/consultation-mode?service=${encodeURIComponent(selectedService)}`,
      );
    }
  };

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      {/* ═══ Dark band: curved cream stepper shelf ═══ */}
      <div className="relative overflow-hidden bg-[radial-gradient(120%_150%_at_50%_35%,#2e1150_0%,#210a38_55%,#190429_100%)]">
        <div className="stars pointer-events-none absolute inset-0 opacity-60" />

        <Image
          src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-chakra-left.png"
          alt=""
          width={174}
          height={438}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[140px] object-cover opacity-90 md:block"
        />
        <Image
          src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-chakra-right.png"
          alt=""
          width={174}
          height={438}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[140px] object-cover opacity-90 md:block"
        />

        {/* Cream shelf with the sweeping curved top edge */}
        <div className="relative">
          <div className="absolute inset-0 bg-cream rounded-tl-[270px_100px] rounded-tr-[270px_100px]" />
          <Stepper />
        </div>
      </div>

      <main id="main-content" className="flex-1 bg-cream">
        {/* ═══ Heading ═══ */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-[16px]">
          <SectionHeading>Select Your Consultation Service</SectionHeading>
          <p className="mx-auto mt-[10px] max-w-[760px] text-center text-[14px] text-body">
            Choose the service you need guidance on. Our expert will help you
            with clarity and solutions.
          </p>
        </div>

        {/* ═══ Toolbar row: search + filters + can't decide ═══ */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[214px_minmax(0,1fr)_248px]">
            <div className="hidden lg:block" />

            {/* Search + filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9a94a6]" />
                <input
                  type="text"
                  placeholder="Search for a service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[48px] w-full rounded-xl border border-line bg-white pl-11 pr-4 text-[13.5px] text-ink placeholder:text-[#9a94a6] focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/25"
                />
              </div>
              {/* Category dropdown (mobile/tablet) */}
              <div className="relative sm:w-[195px] lg:hidden">
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="h-[48px] w-full appearance-none rounded-xl border border-line bg-white pl-4 pr-9 text-[13.5px] text-ink focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/25"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.label} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
              </div>
              <div className="relative sm:w-[195px]">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-[48px] w-full appearance-none rounded-xl border border-line bg-white pl-4 pr-9 text-[13.5px] text-ink focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/25"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
              </div>
            </div>

            {/* Can't decide */}
            <div className="flex h-[48px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#3a1a5e] to-[#26113f] px-4 text-center">
              <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gold">
                <StarFillIcon className="h-[12px] w-[12px]" />
                Can&apos;t Decide?
              </p>
              <p className="text-[11px] leading-tight text-white/75">
                Our experts will help you choose
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Main 3-column layout ═══ */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-[214px_minmax(0,1fr)_248px] lg:items-start">
            {/* ── LEFT: category sidebar ── */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-2 shadow-[0_1px_2px_rgba(75,37,131,0.04)]">
                <nav className="space-y-1">
                  {CATEGORIES.map(({ label, Icon }) => {
                    const active = activeCategory === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setActiveCategory(label)}
                        className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                          active
                            ? "bg-gradient-to-r from-[#fbeecb] to-[#f7e4b4] font-semibold text-grape shadow-[inset_0_0_0_1px_rgba(224,163,62,0.4)]"
                            : "font-medium text-[#4a4553] hover:bg-lilac/60"
                        }`}
                      >
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            active ? "text-gold-3" : "text-grape-2"
                          }`}
                        />
                        {label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Confidential box */}
              <div className="flex items-center gap-3 rounded-2xl border border-[#ecdfc4] bg-[#fdf6e6] px-4 py-3.5">
                <ShieldStarIcon className="h-[26px] w-[26px] shrink-0 text-gold-3" />
                <div>
                  <p className="text-[12.5px] font-semibold text-grape">
                    100% Confidential &amp; Secure
                  </p>
                  <p className="mt-0.5 text-[11px] text-body">
                    Your privacy is our priority.
                  </p>
                </div>
              </div>
            </aside>

            {/* ── MIDDLE: services ── */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="flex items-center gap-2 text-[16px] font-semibold text-grape">
                  <span className="text-[15px]">🔥</span>
                  {activeCategory === "All Services"
                    ? "Popular Services"
                    : activeCategory}
                </h2>
                <span className="h-px flex-1 bg-line" />
              </div>

              {loadingServices ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-grape" />
                </div>
              ) : servicesError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-[13px] text-red-700">
                  {servicesError}
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-[14px] text-body">
                  No services found. Try a different category or search term.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((s) => {
                    const isSelected = selectedService === s.name;
                    return (
                      <article
                        key={s.id}
                        onClick={() => setSelectedService(s.name)}
                        className={`relative flex h-full cursor-pointer flex-col items-center rounded-2xl border bg-white px-3.5 pb-4 pt-5 text-center shadow-[0_1px_2px_rgba(75,37,131,0.04)] transition-all ${
                          isSelected
                            ? "border-gold-3 ring-2 ring-gold-3/40"
                            : "border-line hover:border-gold/60"
                        }`}
                      >
                        {s.popular && (
                          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#fdeede] px-2 py-[3px] text-[9.5px] font-semibold text-[#e08a2e]">
                            <span className="text-[9px]">🔥</span>
                            Popular
                          </span>
                        )}

                        <span
                          className="mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-full"
                          style={{ background: s.iconBg }}
                        >
                          {s.icon}
                        </span>

                        <h3 className="text-[14.5px] font-semibold text-grape">
                          {s.name}
                        </h3>
                        <p className="mt-1.5 text-[11.5px] leading-[1.55] text-body">
                          {s.desc}
                        </p>

                        <div className="mt-auto w-full">
                          <p
                            className="mt-3 text-[15px] font-bold"
                            style={{ color: s.priceColor }}
                          >
                            {s.price}{" "}
                            <span className="text-[11px] font-normal text-body">
                              Onwards
                            </span>
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Continue button */}
              {selectedService && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="flex h-[48px] items-center gap-2 rounded-xl bg-gradient-to-b from-[#f2cd76] to-[#dfa63f] px-8 text-[15px] font-semibold text-[#2b0a3d] shadow-[0_4px_16px_rgba(224,163,62,0.35)] transition-opacity hover:opacity-90"
                  >
                    Continue with {selectedService}
                    <ChevronDownIcon className="h-4 w-4 -rotate-90" />
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: featured + need help ── */}
            <div className="space-y-4">
              {/* Complete Life Guidance */}
              <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-[radial-gradient(120%_90%_at_50%_0%,#3a1a5e_0%,#26113f_55%,#190a2c_100%)] p-5">
                <div className="stars pointer-events-none absolute inset-0 opacity-50" />

                {/* "7" graphic */}
                <div className="relative mx-auto mb-4 flex h-[140px] w-full items-center justify-center">
                  <div className="absolute h-[128px] w-[128px] rounded-full bg-[radial-gradient(circle,rgba(233,184,92,0.30),transparent_68%)]" />
                  <div className="absolute h-[116px] w-[116px] rounded-full border border-gold/30" />
                  <div className="absolute h-[92px] w-[92px] rounded-full border border-gold/15" />
                  <span className="relative font-display text-[76px] font-bold leading-none text-gold drop-shadow-[0_0_14px_rgba(233,184,92,0.5)]">
                    7
                  </span>
                  <LotusSolidIcon className="absolute bottom-[6px] h-7 w-7 text-gold" />
                </div>

                <h3 className="relative whitespace-nowrap text-center text-[17px] font-bold text-gold">
                  Complete Life Guidance
                </h3>
                <p className="relative mt-2 text-center text-[11.5px] leading-[1.6] text-white/75">
                  A comprehensive consultation covering all major aspects of
                  your life with personalized guidance.
                </p>

                <p className="relative mt-4 text-[13px] font-semibold text-white">
                  What You Get:
                </p>
                <ul className="relative mt-2.5 space-y-2">
                  {LIFE_INCLUDES.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <CheckCircleFillIcon className="h-[16px] w-[16px] shrink-0 text-gold" />
                      <span className="text-[12px] text-white/85">{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="relative mt-4 text-center text-[26px] font-bold text-gold">
                  ₹2,999
                </p>

                <a
                  href="/consultation/select-date-time"
                  className="relative mt-3 block h-[42px] w-full rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 text-[14px] font-semibold text-ink shadow-[0_6px_18px_rgba(208,155,56,0.32)] text-center leading-[42px]"
                >
                  View Details
                </a>
              </div>

              {/* Need help choosing */}
              <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(75,37,131,0.04)]">
                <div className="flex items-start gap-3">
                  <Image
                    src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/amooLadyP.png"
                    alt="Expert"
                    width={96}
                    height={96}
                    className="h-[46px] w-[46px] shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[13.5px] font-semibold text-grape">
                      Need Help Choosing?
                    </p>
                    <p className="mt-1 text-[11px] leading-[1.5] text-body">
                      Chat with our expert on WhatsApp for personalized
                      recommendation.
                    </p>
                  </div>
                </div>
                <a
                  href={WHATSAPP_URL}
                  className="mt-3 inline-flex h-[34px] items-center gap-2 rounded-lg bg-[#25D366] px-4 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_rgba(37,211,102,0.3)]"
                >
                  <WhatsAppIcon className="h-[16px] w-[16px]" />
                  Chat Now
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Trust strip ═══ */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-7 pb-8">
          <div className="border-t border-line pt-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
              {TRUST_ITEMS.map(({ Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex items-center justify-center gap-2.5"
                >
                  <Icon className="h-[26px] w-[26px] shrink-0 text-gold-3" />
                  <div>
                    <p className="text-[12.5px] font-semibold text-ink">
                      {title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-body">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
