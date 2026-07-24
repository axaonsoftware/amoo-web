import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHeader, OfferBar } from "../../components/home-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/ornament";
import {
  ArrowRightIcon,
  BoltIcon,
  ChartDashaIcon,
  ChartGridIcon,
  ChartHouseIcon,
  ChartLagnaIcon,
  ChartYogaIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  CompassIcon,
  DocCheckIcon,
  DocIcon,
  HomeIcon,
  PlayIcon,
  ShieldIcon,
  ShieldCheckIcon,
  SmileIcon,
  StarIcon,
  TargetIcon,
  WhatsAppIcon,
} from "../../components/icons";
import { WHATSAPP_URL } from "../../../lib/constants";

export const metadata: Metadata = {
  title: "Basic Kundali Software",
  description:
    "Generate accurate Vedic birth charts with planetary positions, houses, aspects and important astrological details instantly. Free kundali software for beginners and professionals.",
  openGraph: {
    title: "Basic Kundali Software | Amoo Guru",
    description:
      "Generate accurate Vedic birth charts with planetary positions, houses, aspects and important astrological details instantly.",
  },
};

const HERO_POINTS = [
  { icon: ClockIcon, lines: ["Instant", "Kundali Generation"] },
  { icon: TargetIcon, lines: ["Accurate Planetary", "Positions"] },
  { icon: DocIcon, lines: ["Detailed Charts", "& Reports"] },
  { icon: ShieldIcon, lines: ["Easy to Use", "& Reliable"] },
];

const WHY_CARDS = [
  {
    icon: ClockIcon,
    title: "Accurate & Reliable",
    desc: "Precise planetary calculations using authentic Vedic astrological algorithms.",
  },
  {
    icon: DocCheckIcon,
    title: "Instant Results",
    desc: "Generate complete Kundali instantly with just birth details.",
  },
  {
    icon: DocIcon,
    title: "Complete Kundali",
    desc: "Lagna Chart, Planetary Positions, Aspects & House Details.",
  },
  {
    icon: ShieldIcon,
    title: "Dasha Information",
    desc: "Get Vimshottari Dasha details with start & end dates.",
  },
  {
    icon: CompassIcon,
    title: "Divisional Charts",
    desc: "View important divisional charts like Navamsa (D9) and more.",
  },
  {
    icon: BoltIcon,
    title: "Easy & User Friendly",
    desc: "Simple interface for beginners and advanced astrologers.",
  },
];

const KEY_FEATURES = [
  "Birth Chart (Lagna Chart) Generation",
  "Planetary Positions with Sign, Degree & Nakshatra",
  "House Details & Cusps",
  "Planetary Aspects & Conjunctions",
  "Vimshottari Dasha & Bhukti",
  "Divisional Charts (D9, D10, D11, D12, D16, D20, D24, D30)",
  "Save, Print & Share Kundalis",
  "Clean PDF Reports",
];

const REPORT_ROWS = [
  {
    icon: ChartLagnaIcon,
    title: "Lagna Chart (D1)",
    desc: "Complete birth chart with houses & planets",
  },
  {
    icon: ChartGridIcon,
    title: "Planetary Positions",
    desc: "Detailed positions with degrees & nakshatras",
  },
  {
    icon: ChartHouseIcon,
    title: "House & Lord Details",
    desc: "House cusps, lords & strengths",
  },
  {
    icon: ChartYogaIcon,
    title: "Aspects & Yogas",
    desc: "Major aspects and important yogas",
  },
  {
    icon: ChartDashaIcon,
    title: "Dasha Details",
    desc: "Vimshottari dasha with timelines",
  },
];

const STATS = [
  { icon: SmileIcon, value: "1000+", label: "Happy Users" },
  { icon: StarIcon, value: "50,000+", label: "Kundalis Generated" },
  { icon: DocIcon, value: "25,000+", label: "Reports Created" },
  { icon: ShieldCheckIcon, value: "100%", label: "Accurate Calculations" },
];

export default function BasicKundaliSoftwarePage() {
  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      <main id="main-content" className="flex-1 bg-cream">
        {/* ---------------- HERO ---------------- */}
        <section className="relative min-h-[420px] w-full overflow-hidden sm:min-h-[490px]">
          <Image
            src="/imagesP/numerologyHeroP.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_center] sm:object-center"
          />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(23,4,38,0.7)_0%,rgba(23,4,38,0.4)_32%,rgba(23,4,38,0)_58%)]" />

          <div className="relative mx-auto w-full max-w-[1400px] px-5 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2.5 pt-6 text-[13px]">
              <Link href="/" aria-label="Home" className="text-white/85">
                <HomeIcon className="h-[15px] w-[15px]" />
              </Link>
              <ChevronRightIcon className="h-3 w-3 text-white/45" />
              <Link href="/software-hub" className="text-white/80 hover:text-gold">
                Software Hub
              </Link>
              <ChevronRightIcon className="h-3 w-3 text-white/45" />
              <span className="text-white">Basic Kundali Software</span>
            </nav>

            <div className="w-full max-w-[560px] pt-9 pb-16">
              <span className="inline-flex items-center rounded-full bg-grape-2 px-4 py-[7px] text-[12px] font-semibold tracking-[0.08em] text-white uppercase">
                Basic Kundali Software
              </span>

              <h1 className="font-display mt-6 text-[28px] leading-[1.18] font-bold text-white sm:text-[46px] lg:text-[50px]">
                Generate Accurate
                <br />
                <span className="text-gold">Kundalis</span> in Seconds
              </h1>

              <p className="mt-5 w-full max-w-[460px] text-[15px] leading-[1.75] text-white/80">
                Our Basic Kundali Software helps you create precise Vedic birth
                charts (Kundalis) with planetary positions, houses, and important
                astrological details instantly.
              </p>

              <ul className="mt-8 flex flex-wrap gap-x-9 gap-y-6">
                {HERO_POINTS.map(({ icon: Icon, lines }) => (
                  <li key={lines.join(" ")} className="w-[112px] text-center">
                    <span className="mx-auto flex h-[42px] w-[42px] items-center justify-center rounded-full border border-gold/60 text-gold">
                      <Icon className="h-[21px] w-[21px]" />
                    </span>
                    <p className="mt-2.5 text-[11.5px] leading-[1.45] text-white/85">
                      {lines[0]}
                      <br />
                      {lines[1]}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/software-hub/basic-kundali-software"
                  className="flex h-[50px] items-center gap-2.5 rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 px-7 text-[15px] font-semibold text-ink shadow-[0_8px_24px_rgba(233,184,92,0.25)]"
                >
                  Try Kundali Software Now
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </Link>
                <button
                  type="button"
                  className="flex h-[50px] items-center gap-2.5 rounded-lg border border-white/35 px-6 text-[15px] font-medium text-white"
                >
                  <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-white/70">
                    <PlayIcon className="h-3.5 w-3.5 translate-x-px" />
                  </span>
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- WHY CHOOSE ---------------- */}
        <section className="mx-auto w-full max-w-[1400px] px-5 pt-14 lg:px-8">
          <SectionHeading>Why Choose Our Basic Kundali Software?</SectionHeading>
          <p className="mt-3 text-center text-[14px] text-body">
            Simple yet powerful software trusted by astrologers and learners.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="rounded-2xl border border-line bg-white px-5 py-7 text-center shadow-[0_2px_14px_rgba(75,37,131,0.05)]"
              >
                <span className="mx-auto flex h-[54px] w-[54px] items-center justify-center rounded-full bg-lilac text-grape">
                  <Icon className="h-[26px] w-[26px]" />
                </span>
                <h3 className="mt-5 text-[15px] font-semibold text-grape">
                  {title}
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.65] text-body">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- KEY FEATURES + REPORT ---------------- */}
        <section className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-5 px-5 pt-6 lg:grid-cols-2 lg:px-8">
          {/* Key Features */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-white px-7 py-7 shadow-[0_2px_14px_rgba(75,37,131,0.05)]">
            <div className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 sm:block">
              <Image
                src="/images/deco-chakra-left.png"
                alt=""
                width={300}
                height={300}
                className="h-[240px] w-[240px] rounded-full object-contain opacity-95"
              />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3">
                <ChartYogaIcon className="h-[22px] w-[22px] text-gold" />
                <h2 className="font-display text-[22px] font-bold text-grape">
                  Key Features
                </h2>
              </div>

              <ul className="mt-6 space-y-[14px]">
                {KEY_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-grape-2 text-white">
                      <CheckIcon className="h-[11px] w-[11px]" />
                    </span>
                    <span className="text-[13.5px] text-[#3b3a45]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* What's Included */}
          <div className="rounded-2xl border border-line bg-white px-7 py-7 shadow-[0_2px_14px_rgba(75,37,131,0.05)]">
            <div className="flex items-center gap-3">
              <StarIcon className="h-[22px] w-[22px] text-gold" />
              <h2 className="font-display text-[22px] font-bold text-grape">
                What&apos;s Included in Basic Kundali Report
              </h2>
            </div>

            <ul className="mt-5">
              {REPORT_ROWS.map(({ icon: Icon, title, desc }, index) => (
                <li
                  key={title}
                  className={`flex items-center gap-4 py-[13px] ${
                    index === 0 ? "" : "border-t border-line/70"
                  }`}
                >
                  <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-lilac text-grape-2">
                    <Icon className="h-[21px] w-[21px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13.5px] font-semibold text-grape">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-body">{desc}</p>
                  </div>
                  <CheckIcon className="h-[17px] w-[17px] shrink-0 text-gold" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------- TRUSTED / STATS ---------------- */}
        <section className="mx-auto w-full max-w-[1400px] px-5 pt-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(120%_140%_at_50%_0%,#2a1148_0%,#1a0b2e_60%,#14082a_100%)] px-6 py-9 lg:px-10">
            <div className="stars pointer-events-none absolute inset-0 opacity-70" />

            <div className="relative">
              <SectionHeading tone="dark">
                Trusted by Astrologers &amp; Students
              </SectionHeading>

              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 rounded-xl border border-gold/25 bg-white/[0.04] px-5 py-5"
                  >
                    <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
                      <Icon className="h-[25px] w-[25px]" />
                    </span>
                    <div>
                      <p className="font-display text-[24px] leading-none font-bold text-gold">
                        {value}
                      </p>
                      <p className="mt-2 text-[12.5px] text-white/80">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SPECIAL OFFER ---------------- */}
        <section className="mx-auto w-full max-w-[1400px] px-5 py-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(120%_160%_at_50%_50%,#2c1250_0%,#1b0c30_70%,#150826_100%)] px-6 py-7 lg:px-10">
            <div className="stars pointer-events-none absolute inset-0 opacity-60" />

            {/* Right decorative wheel */}
            <div className="pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 xl:block">
              <Image
                src="/images/deco-chakra-right.png"
                alt=""
                width={160}
                height={160}
                className="h-[120px] w-[120px] rounded-full object-contain opacity-90"
              />
            </div>

            <div className="relative flex flex-col items-center gap-7 lg:flex-row lg:gap-9 xl:pr-[150px]">
              {/* Gift + copy */}
              <div className="flex flex-1 items-center gap-5">
                <Image
                  src="/images/sw-box.png"
                  alt=""
                  width={120}
                  height={120}
                  className="h-[84px] w-[84px] shrink-0 object-contain"
                />
                <div>
                  <h2 className="font-display text-[26px] leading-tight font-bold text-gold">
                    Special Launch Offer!
                  </h2>
                  <p className="mt-2 text-[14px] leading-[1.6] text-white/85">
                    Get 15% OFF on all plans
                    <br />
                    for a limited time only.
                  </p>
                </div>
              </div>

              <span className="hidden h-[92px] w-px bg-white/15 lg:block" />

              {/* Coupon */}
              <div className="flex h-[92px] w-full max-w-[280px] flex-col items-center justify-center rounded-xl border border-gold/40 bg-white/[0.03] px-6">
                <p className="text-[13px] text-white/85">Use Code:</p>
                <p className="mt-1.5 text-[22px] font-bold tracking-[0.02em] text-gold">
                  KUNDALI15
                </p>
              </div>

              <span className="hidden h-[92px] w-px bg-white/15 lg:block" />

              {/* CTA */}
              <div className="flex flex-col items-center">
                <Link
                  href="/software-hub/basic-kundali-software"
                  className="flex h-[52px] w-[260px] items-center justify-center gap-2.5 rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 text-[16px] font-semibold text-ink shadow-[0_8px_24px_rgba(233,184,92,0.2)]"
                >
                  Get Started Now
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </Link>
                <p className="mt-3 text-[12.5px] text-white/75">
                  Start generating accurate Kundalis today!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Floating WhatsApp */}
      <Link
        href={WHATSAPP_URL}
        aria-label="Chat on WhatsApp"
        className="fixed right-6 bottom-6 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[#25D366] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      >
        <WhatsAppIcon className="h-[30px] w-[30px]" />
      </Link>
    </>
  );
}
