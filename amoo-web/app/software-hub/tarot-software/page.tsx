import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHeader, OfferBar } from "../../components/home-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/ornament";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  DocIcon,
  HomeIcon,
  PlayIcon,
  StarIcon,
  WhatsAppIcon,
} from "../../components/icons";
import {
  AiChipIcon,
  BrandBadgeIcon,
  CareerSpreadIcon,
  CelticSpreadIcon,
  ClientsIcon,
  LotusMarkIcon,
  NotesIcon,
  RelationshipSpreadIcon,
  ReportPenIcon,
  SpreadsIcon,
  TarotCardsIcon,
  ThreeCardSpreadIcon,
  UserRatingIcon,
  UsersIcon,
  YearAheadSpreadIcon,
} from "./components/icons";
import { WHATSAPP_URL } from "../../lib/constants";

export const metadata: Metadata = {
  title: "Tarot Reading Software",
  description:
    "Professional tarot reading software with multiple spreads, AI interpretation, client management and detailed report generation for practitioners.",
  openGraph: {
    title: "Tarot Reading Software | Amoo Guru",
    description:
      "Professional tarot reading software with multiple spreads, AI interpretation, client management and detailed report generation.",
  },
};

const HERO_POINTS = [
  { icon: TarotCardsIcon, lines: ["78 Cards", "Digital Library"] },
  { icon: SpreadsIcon, lines: ["Multiple Spreads", "& Layouts"] },
  { icon: AiChipIcon, lines: ["AI Interpretation", "& Insights"] },
  { icon: ReportPenIcon, lines: ["Detailed Reports", "& Save"] },
  { icon: ClientsIcon, lines: ["Client Management", "Made Easy"] },
];

const WHY_CARDS = [
  {
    icon: TarotCardsIcon,
    title: ["Comprehensive", "78 Card Library"],
    desc: "All Major & Minor Arcana with beautiful artwork and detailed meanings.",
  },
  {
    icon: SpreadsIcon,
    title: ["Multiple Spreads", "& Layouts"],
    desc: "Celtic Cross, 3 Card, Relationship, Career, Year Ahead & more.",
  },
  {
    icon: AiChipIcon,
    title: ["AI-Powered", "Interpretations"],
    desc: "Get instant, deep and accurate interpretations with AI assistance.",
  },
  {
    icon: NotesIcon,
    title: ["Custom Notes", "& Journaling"],
    desc: "Add your own notes, reflections and intuitive insights.",
  },
  {
    icon: ClientsIcon,
    title: ["Client & Reading", "Management"],
    desc: "Manage clients, readings, history and follow-ups effortlessly.",
  },
  {
    icon: BrandBadgeIcon,
    title: ["Brand & Report", "Customization"],
    desc: "Create professional PDF reports with your brand and logo.",
  },
];

const POWERFUL_FEATURES = [
  "One Click Tarot Reading",
  "Daily Card & Guidance",
  "Yes / No Tarot Reading",
  "Love, Career, Finance & Health Spreads",
  "Reversed Card Meanings",
  "Save & Share Readings",
  "Client Management System",
  "Multi-language Support",
  "Mobile & Tablet Friendly",
];

const POPULAR_SPREADS = [
  {
    icon: CelticSpreadIcon,
    title: "Celtic Cross Spread",
    desc: "The most comprehensive spread.",
  },
  {
    icon: ThreeCardSpreadIcon,
    title: "3 Card Spread",
    desc: "Past, Present & Future.",
  },
  {
    icon: RelationshipSpreadIcon,
    title: "Relationship Spread",
    desc: "Insight into love & relationships.",
  },
  {
    icon: CareerSpreadIcon,
    title: "Career Spread",
    desc: "Guidance for your career path.",
  },
  {
    icon: YearAheadSpreadIcon,
    title: "Year Ahead Spread",
    desc: "12 months guidance ahead.",
  },
];

const STATS = [
  { icon: UsersIcon, value: "1000+", label: "Happy Users" },
  { icon: StarIcon, value: "50,000+", label: "Readings Generated" },
  { icon: DocIcon, value: "25,000+", label: "Reports Created" },
  { icon: UserRatingIcon, value: "4.9/5", label: "User Rating" },
];

export default function TarotSoftwarePage() {
  return (
    <>
      <OfferBar />
      <main className="flex-1 bg-cream">
        {/* ---------------- HERO ---------------- */}
        <section className="relative min-h-[420px] w-full overflow-hidden bg-[#150725] sm:min-h-[490px]">
          <div className="stars pointer-events-none absolute inset-0" />

          {/* full background image */}
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/imagesP/tarotSoftwareHero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
          {/* dark overlay for readability */}
          <div className="absolute inset-0 bg-[#150725]/70" />

          <HomeHeader />

          <div className="relative mx-auto w-full max-w-[1400px] px-5 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2.5 pt-[110px] text-[13px]">
              <Link href="/" aria-label="Home" className="text-white/85">
                <HomeIcon className="h-[15px] w-[15px]" />
              </Link>
              <ChevronRightIcon className="h-3 w-3 text-white/45" />
              <Link href="/software-hub" className="text-white/80 hover:text-gold">
                Software Hub
              </Link>
              <ChevronRightIcon className="h-3 w-3 text-white/45" />
              <span className="text-white">Tarot Software</span>
            </nav>

            <div className="w-full max-w-[560px] pt-9 pb-16">
              <span className="inline-flex items-center rounded-full border border-gold/70 px-4 py-[7px] text-[12px] font-semibold tracking-[0.08em] text-gold uppercase">
                Tarot Software
              </span>

              <h1 className="font-display mt-6 text-[28px] leading-[1.18] font-bold text-white sm:text-[46px] lg:text-[50px]">
                Professional <span className="text-gold">Tarot</span>
                <br />
                Reading <span className="text-gold">Software</span>
              </h1>

              <p className="mt-5 w-full max-w-[430px] text-[15px] leading-[1.75] text-white/80">
                Advanced, beautiful &amp; easy-to-use tarot software for readers,
                healers and spiritual businesses.
              </p>

              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-6">
                {HERO_POINTS.map(({ icon: Icon, lines }) => (
                  <li key={lines.join(" ")} className="w-[92px] text-center">
                    <Icon className="mx-auto h-[30px] w-[30px] text-gold" />
                    <p className="mt-2.5 text-[11px] leading-[1.5] text-white/85">
                      {lines[0]}
                      <br />
                      {lines[1]}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/software-hub/tarot-software"
                  className="flex h-[50px] items-center gap-2.5 rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 px-7 text-[15px] font-semibold text-ink shadow-[0_8px_24px_rgba(233,184,92,0.25)]"
                >
                  Explore Tarot Software
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
          <SectionHeading>Why Choose Our Tarot Software?</SectionHeading>
          <p className="mt-3 text-center text-[14px] text-body">
            Everything a tarot reader needs to deliver accurate insights and
            transform lives.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
              <article
                key={title.join(" ")}
                className="rounded-2xl border border-line bg-white px-5 py-7 text-center shadow-[0_2px_14px_rgba(75,37,131,0.05)]"
              >
                <span className="mx-auto flex h-[54px] w-[54px] items-center justify-center rounded-full bg-grape text-gold">
                  <Icon className="h-[26px] w-[26px]" />
                </span>
                <h3 className="mt-5 text-[15px] leading-[1.4] font-semibold text-grape">
                  {title[0]}
                  <br />
                  {title[1]}
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.65] text-body">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- FEATURES + CARDS + SPREADS ---------------- */}
        <section className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-5 pt-12 lg:grid-cols-[1fr_1.12fr_1fr] lg:px-8">
          {/* Powerful Features */}
          <div>
            <div className="flex items-center gap-3">
              <LotusMarkIcon className="h-[24px] w-[24px] text-gold" />
              <h2 className="font-display text-[22px] font-bold text-grape">
                Powerful Features
              </h2>
            </div>

            <ul className="mt-6 space-y-[15px]">
              {POWERFUL_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-grape-2 text-white">
                    <CheckIcon className="h-[11px] w-[11px]" />
                  </span>
                  <span className="text-[13.5px] text-[#3b3a45]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tarot cards visual */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(120%_120%_at_50%_20%,#3a1a5e_0%,#25104a_50%,#1a0b2e_100%)] px-6 pt-8 pb-9">
            <div className="stars pointer-events-none absolute inset-0 opacity-70" />

            <Image
              src="https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=460&q=80"
              alt="The Star, The Sun and The Magician tarot cards"
              width={460}
              height={420}
              className="relative h-[262px] w-auto object-contain"
            />

            <p className="relative mt-8 text-center text-[15px] leading-[1.7] text-white/90">
              Unlock the wisdom of cards.
              <br />
              Illuminate every path.
            </p>
          </div>

          {/* Popular Spreads */}
          <div>
            <h2 className="font-display text-[22px] font-bold text-grape">
              Popular Spreads
            </h2>

            <ul className="mt-6 space-y-[10px]">
              {POPULAR_SPREADS.map(({ icon: Icon, title, desc }) => (
                <li key={title}>
                  <Link
                    href="/software-hub/tarot-software"
                    className="flex items-center gap-3.5 rounded-xl border border-line bg-white px-3.5 py-3 shadow-[0_2px_14px_rgba(75,37,131,0.05)] transition-colors hover:border-gold/60"
                  >
                    <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-lg bg-grape text-gold">
                      <Icon className="h-[22px] w-[22px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13.5px] font-semibold text-grape">
                        {title}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-body">{desc}</p>
                    </div>
                    <ArrowRightIcon className="h-[17px] w-[17px] shrink-0 text-gold" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <Link
                href="/software-hub/tarot-software"
                className="flex h-[42px] items-center justify-center gap-2.5 rounded-lg border border-gold/60 bg-white px-8 text-[13.5px] font-medium text-grape"
              >
                View All Spreads
                <ArrowRightIcon className="h-[16px] w-[16px] text-gold" />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------- TRUSTED / STATS ---------------- */}
        <section className="mx-auto w-full max-w-[1400px] px-5 pt-12 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(120%_140%_at_50%_0%,#2a1148_0%,#1a0b2e_60%,#14082a_100%)] px-6 py-9 lg:px-10">
            <div className="stars pointer-events-none absolute inset-0 opacity-70" />

            <div className="relative">
              <SectionHeading tone="dark">
                Trusted by Tarot Readers &amp; Spiritual Businesses
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

            {/* Carousel next */}
            <button
              type="button"
              aria-label="Next"
              className="absolute top-1/2 right-3 hidden h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full text-white/70 lg:flex"
            >
              <ChevronRightIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </section>

        {/* ---------------- SPECIAL OFFER ---------------- */}
        <section className="mx-auto w-full max-w-[1400px] px-5 py-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(120%_160%_at_50%_50%,#2c1250_0%,#1b0c30_70%,#150826_100%)] px-6 py-7 lg:px-10">
            <div className="stars pointer-events-none absolute inset-0 opacity-60" />

            {/* Right decorative tarot cards */}
            <div className="pointer-events-none absolute top-1/2 right-8 hidden -translate-y-1/2 xl:block">
              <Image
                src="https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=160&q=80"
                alt=""
                width={160}
                height={120}
                className="h-[92px] w-[130px] object-contain opacity-90"
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
                    Get 15% OFF on all Tarot Software Plans
                  </p>
                </div>
              </div>

              <span className="hidden h-[92px] w-px bg-white/15 lg:block" />

              {/* Coupon */}
              <div className="flex h-[92px] w-full max-w-[250px] flex-col items-center justify-center rounded-xl border border-gold/40 bg-white/[0.03] px-6">
                <p className="text-[13px] text-white/85">Use Code:</p>
                <p className="mt-1.5 text-[22px] font-bold tracking-[0.02em] text-gold">
                  TAROT15
                </p>
              </div>

              <span className="hidden h-[92px] w-px bg-white/15 lg:block" />

              {/* CTA */}
              <div className="flex flex-col items-center">
                <Link
                  href="/software-hub/tarot-software"
                  className="flex h-[52px] w-[260px] items-center justify-center gap-2.5 rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 text-[16px] font-semibold text-ink shadow-[0_8px_24px_rgba(233,184,92,0.2)]"
                >
                  Get Started Now
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </Link>
                <p className="mt-3 text-[12.5px] text-white/75">
                  Empower your readings. Transform lives.
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
