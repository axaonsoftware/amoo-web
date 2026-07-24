import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHeader, OfferBar } from "../../components/home-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/ornament";
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  ChevronRightIcon,
  DocIcon,
  HomeIcon,
  PlayIcon,
  ShieldCheckIcon,
  StarIcon,
  TargetIcon,
  WhatsAppIcon,
} from "../../components/icons";
import {
  AvatarIcon,
  BirthDateIcon,
  ChevronLeftIcon,
  DestinyIcon,
  DeviceIcon,
  LifePathIcon,
  LotusMarkIcon,
  PersonalityIcon,
  ProfessionalsIcon,
  QuoteIcon,
  ReportMarkIcon,
  SoulUrgeIcon,
} from "./components/icons";
import { WHATSAPP_URL } from "../../../lib/constants";

export const metadata: Metadata = {
  title: "Numerology Software",
  description:
    "Complete numerology software for Life Path, Destiny, Soul Urge and Personality number calculations. Professional reports for practitioners and learners.",
  openGraph: {
    title: "Numerology Software | Amoo Guru",
    description:
      "Complete numerology software for Life Path, Destiny, Soul Urge and Personality number calculations.",
  },
};

const HERO_POINTS = [
  { icon: TargetIcon, lines: ["Accurate", "Calculations"] },
  { icon: BoltIcon, lines: ["Instant", "Results"] },
  { icon: DocIcon, lines: ["Detailed", "Reports"] },
  { icon: ShieldCheckIcon, lines: ["Trusted by", "Experts"] },
];

const WHY_CARDS = [
  {
    icon: TargetIcon,
    title: "Highly Accurate",
    desc: "Advanced algorithms for precise and reliable numerology results.",
  },
  {
    icon: BoltIcon,
    title: "Instant Analysis",
    desc: "Get detailed reports in seconds and save valuable time.",
  },
  {
    icon: DocIcon,
    title: "Comprehensive Reports",
    desc: "In-depth analysis covering multiple aspects of life and personality.",
  },
  {
    icon: ProfessionalsIcon,
    title: "For Professionals",
    desc: "Designed for astrologers, counselors and spiritual practitioners.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure & Private",
    desc: "Your data and client information are 100% safe and confidential.",
  },
  {
    icon: DeviceIcon,
    title: "Access Anywhere",
    desc: "Cloud-based software. Use it on any device, anytime, anywhere.",
  },
];

const POWERFUL_FEATURES = [
  {
    title: "Complete Numerology Calculation",
    desc: "Life Path, Destiny, Soul Urge, Personality & more.",
  },
  {
    title: "Name & Birth Date Analysis",
    desc: "Analyze full name and date of birth with precision.",
  },
  {
    title: "Compatibility Report",
    desc: "Check compatibility between two names or birth dates.",
  },
  {
    title: "Remedies & Suggestions",
    desc: "Personalized remedies to balance numbers and energies.",
  },
  {
    title: "PDF Reports",
    desc: "Download and share professional reports instantly.",
  },
  {
    title: "Client Management",
    desc: "Save client details and their reports in one place.",
  },
];

const REPORT_ROWS = [
  {
    icon: LifePathIcon,
    title: "Life Path Number",
    desc: "Reveals your life purpose and journey.",
    value: "7",
  },
  {
    icon: DestinyIcon,
    title: "Destiny Number",
    desc: "Shows your goals, ambitions & future.",
    value: "5",
  },
  {
    icon: SoulUrgeIcon,
    title: "Soul Urge Number",
    desc: "Reveals your inner desires & motivations.",
    value: "3",
  },
  {
    icon: PersonalityIcon,
    title: "Personality Number",
    desc: "How others perceive you externally.",
    value: "1",
  },
  {
    icon: BirthDateIcon,
    title: "Birth Date Analysis",
    desc: "Detailed insights based on your birth date.",
    value: "8",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "This software has made my consultations faster and more accurate. Highly recommended for all numerologists!",
    name: "Neha Sharma",
    role: "Numerologist",
  },
  {
    quote:
      "Detailed reports, easy to use interface and super fast results. My client satisfaction has improved a lot.",
    name: "Arvind Mehta",
    role: "Spiritual Healer",
  },
  {
    quote:
      "Best numerology software I've used. The insights are deep and incredibly precise.",
    name: "Priya Iyer",
    role: "Astrology Consultant",
  },
];

export default function NumerologySoftwarePage() {
  return (
    <>
      <OfferBar />
      <main id="main-content" className="flex-1 bg-cream">
        {/* ---------------- HERO ---------------- */}
        <section className="relative min-h-[420px] w-full overflow-hidden bg-[#170426] sm:min-h-[490px]">
          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/numerologyHeroP.png"
            alt="Numerology Software report dashboard"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_center] sm:object-center"
          />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(23,4,38,0.85)_0%,rgba(23,4,38,0.6)_30%,rgba(23,4,38,0.1)_52%,rgba(23,4,38,0)_62%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[rgba(23,4,38,0.72)] lg:hidden" />

          <HomeHeader />

          <div className="relative mx-auto w-full max-w-[1400px] px-5 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2.5 pt-[108px] text-[13px]">
              <Link href="/" aria-label="Home" className="text-white/85">
                <HomeIcon className="h-[15px] w-[15px]" />
              </Link>
              <ChevronRightIcon className="h-3 w-3 text-white/45" />
              <Link
                href="/software-hub"
                className="text-white/80 hover:text-gold"
              >
                Software Hub
              </Link>
              <ChevronRightIcon className="h-3 w-3 text-white/45" />
              <span className="text-white">Numerology Software</span>
            </nav>

            <div className="w-full max-w-[560px] pt-8 pb-14">
              <span className="inline-flex items-center rounded-full bg-grape-2 px-4 py-[7px] text-[12px] font-semibold tracking-[0.08em] text-white uppercase">
                Numerology Software
              </span>

              <h1 className="font-display mt-6 text-[40px] leading-[1.2] font-bold text-white sm:text-[46px] lg:text-[50px]">
                Decode <span className="text-gold">Numbers.</span>
                <br />
                Discover <span className="text-gold">Destiny.</span>
              </h1>

              <p className="mt-5 w-full max-w-[420px] text-[15px] leading-[1.75] text-white/80">
                Our advanced Numerology Software helps you analyze names, numbers
                and dates to reveal accurate insights, life purpose and future
                possibilities.
              </p>

              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-6">
                {HERO_POINTS.map(({ icon: Icon, lines }) => (
                  <li key={lines.join(" ")} className="w-1/3 sm:w-[86px] text-center">
                    <Icon className="mx-auto h-[30px] w-[30px] text-gold" />
                    <p className="mt-2.5 text-[11.5px] leading-[1.45] font-medium text-gold">
                      {lines[0]}
                      <br />
                      {lines[1]}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="flex h-[50px] items-center gap-2.5 rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 px-7 text-[15px] font-semibold text-ink shadow-[0_8px_24px_rgba(233,184,92,0.25)]"
                >
                  Explore Numerology Software
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </button>
                <button
                  type="button"
                  className="flex h-[50px] items-center gap-2.5 rounded-lg border border-white/35 px-6 text-[15px] font-medium text-white"
                >
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-ink">
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
          <SectionHeading className="[&_h2]:whitespace-normal">
            Why Choose Our Numerology Software?
          </SectionHeading>
          <p className="mt-3 text-center text-[14px] text-body">
            Powerful insights. Easy to use. Trusted by professionals worldwide.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="rounded-2xl border border-line bg-white px-3 py-7 text-center shadow-[0_2px_14px_rgba(75,37,131,0.05)]"
              >
                <Icon className="mx-auto h-[32px] w-[32px] text-grape-2" />
                <h3 className="mt-5 text-[14.5px] leading-[1.4] font-semibold tracking-[-0.01em] text-grape">
                  {title}
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.65] text-body">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ------- POWERFUL FEATURES + SAMPLE REPORT ------- */}
        <section className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-5 pt-12 lg:grid-cols-2 lg:gap-10 lg:px-8">
          {/* Powerful Features */}
          <div className="relative">
            <div className="flex items-center gap-3">
              <LotusMarkIcon className="h-[24px] w-[24px] text-gold" />
              <h2 className="font-display text-[22px] font-bold text-grape">
                Powerful Features
              </h2>
            </div>

            {/* Numerology wheel visual */}
            <div className="pointer-events-none absolute top-1/2 right-0 hidden -translate-y-1/2 lg:block">
              <Image
                src="https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=320&q=80"
                alt="Numerology wheel with numbers and lotus"
                width={320}
                height={320}
                className="h-[300px] w-[300px] rounded-full object-cover"
              />
            </div>

            <ul className="relative mt-6 max-w-[330px] space-y-[14px]">
              {POWERFUL_FEATURES.map(({ title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-[3px] flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-grape text-white">
                    <CheckIcon className="h-[11px] w-[11px]" />
                  </span>
                  <div>
                    <h3 className="text-[13.5px] font-semibold text-grape">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-[12px] leading-[1.6] text-body">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample Numerology Report */}
          <div>
            <div className="flex items-center gap-3">
              <ReportMarkIcon className="h-[24px] w-[24px] text-gold" />
              <h2 className="font-display text-[22px] font-bold text-grape">
                Sample Numerology Report
              </h2>
            </div>

            <ul className="mt-6 space-y-[10px]">
              {REPORT_ROWS.map(({ icon: Icon, title, desc, value }) => (
                <li key={title}>
                  <Link
                    href="/software-hub/numerology-software"
                    className="flex items-center gap-3.5 rounded-xl border border-line bg-white px-3.5 py-[11px] shadow-[0_2px_14px_rgba(75,37,131,0.05)] transition-colors hover:border-gold/60"
                  >
                    <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#fbf3e3] text-gold-3">
                      <Icon className="h-[21px] w-[21px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13.5px] font-semibold text-grape">
                        {title}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-body">{desc}</p>
                    </div>
                    <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-grape text-[13px] font-semibold text-white">
                      {value}
                    </span>
                    <ArrowRightIcon className="h-[17px] w-[17px] shrink-0 text-gold" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="flex h-[42px] items-center justify-center gap-2.5 rounded-lg border border-gold/60 bg-white px-6 text-[13.5px] font-medium text-grape"
              >
                View Full Sample Report
                <ArrowRightIcon className="h-[16px] w-[16px] text-gold" />
              </button>
            </div>
          </div>
        </section>

        {/* ---------------- TESTIMONIALS ---------------- */}
        <section className="mx-auto w-full max-w-[1400px] px-5 pt-12 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(120%_140%_at_50%_0%,#2a1148_0%,#1a0b2e_60%,#14082a_100%)] px-6 py-9 lg:px-14">
            <div className="stars pointer-events-none absolute inset-0 opacity-70" />

            <div className="relative">
              <SectionHeading
                tone="dark"
                className="[&_h2]:whitespace-normal"
              >
                Trusted by Numerology Experts
              </SectionHeading>

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {TESTIMONIALS.map(({ quote, name, role }) => (
                  <article
                    key={name}
                    className="relative flex flex-col rounded-xl border border-gold/25 bg-white/[0.04] px-6 pt-6 pb-5"
                  >
                    <QuoteIcon className="absolute top-4 left-4 h-[15px] w-[15px] text-gold/70" />
                    <QuoteIcon className="absolute top-4 right-4 h-[15px] w-[15px] rotate-180 text-gold/70" />

                    <div className="flex items-center justify-center gap-[3px] text-gold">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <StarIcon
                          key={index}
                          className="h-[13px] w-[13px] fill-current"
                        />
                      ))}
                    </div>

                    <p className="mt-4 text-center text-[12.5px] leading-[1.75] text-white/85">
                      {quote}
                    </p>

                    <div className="mt-auto flex items-center gap-3 pt-6">
                      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-white/60">
                        <AvatarIcon className="h-[22px] w-[22px]" />
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-gold">
                          – {name}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-white/60">
                          {role}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Carousel controls */}
            <button
              type="button"
              aria-label="Previous"
              className="absolute top-1/2 left-3 hidden h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full text-white/70 lg:flex"
            >
              <ChevronLeftIcon className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Next"
              className="absolute top-1/2 right-3 hidden h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full text-white/70 lg:flex"
            >
              <ChevronRightIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </section>

        {/* ---------------- LAUNCH OFFER ---------------- */}
        <section className="mx-auto w-full max-w-[1400px] px-5 py-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(120%_160%_at_50%_50%,#2c1250_0%,#1b0c30_70%,#150826_100%)] px-6 py-7 lg:px-10">
            <div className="stars pointer-events-none absolute inset-0 opacity-60" />

            {/* Right decorative lotus */}
            <div className="pointer-events-none absolute top-1/2 right-8 hidden -translate-y-1/2 xl:block">
              <Image
                src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-footer-right.png"
                alt=""
                width={200}
                height={180}
                className="h-[110px] w-[150px] object-contain opacity-90 mix-blend-screen [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)]"
              />
            </div>

            <div className="relative flex flex-col items-center gap-7 lg:flex-row lg:gap-10 xl:pr-[140px]">
              {/* Gift + copy */}
              <div className="flex flex-1 items-center gap-5">
                <Image
                  src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/sw-box.png"
                  alt=""
                  width={120}
                  height={120}
                  className="h-[84px] w-[84px] shrink-0 object-contain"
                />
                <div>
                  <h2 className="font-display text-[26px] leading-tight font-bold text-gold">
                    Trusted Launch Offer!
                  </h2>
                  <p className="mt-2 text-[14px] leading-[1.6] text-white/85">
                    Get 15% OFF on all plans for a limited time.
                  </p>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex h-[80px] w-full max-w-[190px] flex-col items-center justify-center rounded-xl border border-gold/40 bg-white/[0.03] px-5">
                <p className="text-[13px] text-white/85">Use Code:</p>
                <p className="mt-1 text-[20px] font-bold tracking-[0.02em] text-gold">
                  NUMERO15
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className="flex h-[52px] w-full max-w-[240px] items-center justify-center gap-2.5 rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 text-[16px] font-semibold text-ink shadow-[0_8px_24px_rgba(233,184,92,0.2)]"
                >
                  Get Started Now
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </button>
                <p className="mt-3 text-[12.5px] text-white/75">
                  Empower your practice with powerful numerology insights.
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
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed right-6 bottom-6 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[#25D366] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      >
        <WhatsAppIcon className="h-[30px] w-[30px]" />
      </Link>
    </>
  );
}
