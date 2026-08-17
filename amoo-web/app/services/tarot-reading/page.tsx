"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeHeader, OfferBar } from "../../components/home-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/ornament";
import { sanitize } from "../../../lib/sanitize";
import { api } from "../../../lib/api";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  WhatsAppIcon,
} from "../../components/home-icons";
import {
  CalendarIcon,
  ChevronLeftThin,
  ChevronRightThin,
  StarSolidIcon,
  StarOutlineIcon,
} from "../../components/home-icons";
import { WHATSAPP_URL } from "../../../lib/constants";
import {
  EyeIcon,
  ShieldStarIcon,
  HeartHandIcon,
  LockShieldIcon,
  TarotCardIcon,
  HeartIcon,
  BriefcaseIcon,
  CoinIcon,
  YesNoIcon,
  CompassIcon2,
  CalendarCardIcon,
  ThreeCardIcon,
  OneCardIcon,
  SpiritualIcon,
  SpreadIcon,
  TAROT_ICON_MAP,
  defaultTarotIcon,
} from "./icons";

/* ─── Service cards data ─── */

interface TarotServiceCard {
  id?: number;
  name?: string;
  icon?: React.FC<{ className?: string }>;
  title?: string;
  desc?: string;
  sub?: string | null;
  description?: string | null;
  img?: string | null;
  category?: string;
}

interface TarotTestimonialCard {
  id?: number;
  name?: string;
  img?: string;
  comment?: string;
  text?: string;
}

const SERVICES_ROW1: TarotServiceCard[] = [
  {
    icon: TarotCardIcon,
    title: "General Tarot Reading",
    desc: "Get answers to your questions and understand your current situation clearly.",
  },
  {
    icon: HeartIcon,
    title: "Love & Relationship Reading",
    desc: "Understand your love life, relationships and emotional connections.",
  },
  {
    icon: BriefcaseIcon,
    title: "Career Tarot Reading",
    desc: "Discover the best career path and opportunities awaiting you.",
  },
  {
    icon: CoinIcon,
    title: "Money & Finance Reading",
    desc: "Gain clarity about your financial situation and wealth opportunities.",
  },
  {
    icon: YesNoIcon,
    title: "Yes or No Reading",
    desc: "Get clear and direct answers to your specific questions.",
  },
  {
    icon: CompassIcon2,
    title: "Decision Making Reading",
    desc: "Receive guidance to make important life decisions with confidence.",
  },
];

const SERVICES_ROW2: TarotServiceCard[] = [
  {
    icon: CalendarCardIcon,
    title: "Monthly Guidance Reading",
    desc: "Know what the month holds for you in love, career, money & health.",
  },
  {
    icon: CalendarCardIcon,
    title: "Yearly Guidance Reading",
    desc: "Discover the overall energy and important events of the year ahead.",
  },
  {
    icon: ThreeCardIcon,
    title: "Three Card Reading",
    desc: "Past, Present and Future insights in a simple and powerful spread.",
  },
  {
    icon: OneCardIcon,
    title: "One Card Reading",
    desc: "Quick insight and guidance for your current situation.",
  },
  {
    icon: SpiritualIcon,
    title: "Spiritual Path Reading",
    desc: "Understand your soul purpose and spiritual journey with clarity.",
  },
  {
    icon: SpreadIcon,
    title: "Personalized Tarot Spread",
    desc: "Customized tarot spread based on your unique questions and needs.",
  },
];

const BENEFITS = [
  "Clarity in confusing situations",
  "Emotional healing and reassurance",
  "Better understanding of yourself and others",
  "Direction towards your true purpose",
  "Guidance for important life decisions",
  "Practical solutions and remedies",
  "Awareness of opportunities and challenges",
  "Positive energy and inner strength",
];

const STEPS = [
  {
    num: 1,
    title: "Book Your Session",
    desc: "Choose your preferred tarot reading and time slot.",
  },
  {
    num: 2,
    title: "Share Your Questions",
    desc: "Tell us your concerns and what you seek guidance on.",
  },
  {
    num: 3,
    title: "Reading & Guidance",
    desc: "Our expert reads the cards and provides insights.",
  },
  {
    num: 4,
    title: "Receive Clarity",
    desc: "Get clear answers, guidance and practical suggestions.",
  },
  {
    num: 5,
    title: "Transform Your Life",
    desc: "Move forward with confidence and positive energy.",
  },
];

const TESTIMONIALS: TarotTestimonialCard[] = [
  {
    name: "Neha Sharma",
    text: '"Tarot reading by Surinder Ji gave me clarity when I was completely confused about my career. Highly accurate!"',
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/t-1.png",
  },
  {
    name: "Rohit Malhotra",
    text: '"The love reading was so accurate and helped me understand my relationship much better."',
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/t-2.png",
  },
  {
    name: "Priya Verma",
    text: '"I always get positive energy and guidance after every tarot session. Thank you Amoo Guru!"',
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/t-3.png",
  },
];

/* ─── Page ─── */

export default function TarotReadingPage() {
  const [services, setServices] = useState<TarotServiceCard[]>([]);
  const [testimonials, setTestimonials] = useState<TarotTestimonialCard[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [, setErrorServices] = useState<string | null>(null);
  const [, setErrorTestimonials] = useState<string | null>(null);
  const [testimonialPage, setTestimonialPage] = useState(0);
  const PAGE_SIZE = 3;

  useEffect(() => {
    api
      .getServices()
      .then((res: unknown) => {
        const payload = res as
          { data?: TarotServiceCard[] } | TarotServiceCard[];
        const items = Array.isArray(payload)
          ? (payload as TarotServiceCard[])
          : (payload?.data ?? []);
        setServices(items.filter((s) => s.category === "Tarot"));
      })
      .catch(() =>
        setErrorServices("Failed to load services. Please try again."),
      )
      .finally(() => setLoadingServices(false));

    api
      .getTestimonials()
      .then((res: unknown) => {
        const payload = res as
          { data?: TarotTestimonialCard[] } | TarotTestimonialCard[];
        const list = Array.isArray(payload)
          ? (payload as TarotTestimonialCard[])
          : (payload?.data ?? []);
        setTestimonials(list.length ? list : []);
      })
      .catch(() =>
        setErrorTestimonials("Failed to load testimonials. Please try again."),
      )
      .finally(() => setLoadingTestimonials(false));
  }, []);

  const apiServicesRow1 = services.slice(0, 6);
  const apiServicesRow2 = services.slice(6, 12);

  const staticTestimonials = TESTIMONIALS;
  const allTestimonials = loadingTestimonials
    ? staticTestimonials
    : testimonials.length
      ? testimonials
      : staticTestimonials;
  const totalPages = Math.max(1, Math.ceil(allTestimonials.length / PAGE_SIZE));
  const safePage = Math.min(testimonialPage, totalPages - 1);
  const visibleTestimonials = allTestimonials.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  const prevTestimonials = () => setTestimonialPage((p) => Math.max(0, p - 1));
  const nextTestimonials = () =>
    setTestimonialPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      <main id="main-content" className="flex-1 bg-cream">
        {/* ── Top Promo Banner ── */}

        {/* ── Hero Section ── */}
        <section className="relative min-h-[420px] w-full overflow-hidden sm:min-h-[490px]">
          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/serviceHeroBg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(23,4,38,0.7)_0%,rgba(23,4,38,0.4)_32%,rgba(23,4,38,0)_58%)]" />

          {/* Stats badge */}
          <div className="pointer-events-none absolute top-20 right-[8%] hidden lg:block">
            <div className="rounded-full border border-gold/40 bg-ink/60 px-5 py-3 text-center backdrop-blur-sm">
              <p className="font-display text-[28px] font-bold leading-none text-gold">
                25K+
              </p>
              <p className="mt-1 text-[11px] leading-tight text-white/80">
                People Guided
                <br />
                Through Tarot
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[1400px] px-5 lg:px-8">
            <div className="w-full max-w-[560px] pt-10 pb-20">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-[6px] text-[12px] font-semibold tracking-[0.06em] text-gold uppercase">
                <StarOutlineIcon className="h-3.5 w-3.5" />
                Tarot Reading
              </span>

              {/* Heading */}
              <h1 className="font-display mt-6 text-[38px] leading-[1.12] font-bold text-white sm:text-[44px] lg:text-[50px]">
                REVEAL THE CARDS.
                <br />
                DISCOVER YOUR PATH.
              </h1>

              {/* Description */}
              <p className="mt-5 w-full max-w-[460px] text-[15px] leading-[1.75] text-white/80">
                Tarot opens the door to clarity, insight and divine guidance.
                Let the cards illuminate your journey and help you make
                confident decisions for a better tomorrow.
              </p>

              {/* Feature badges */}
              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-5">
                {[
                  { icon: EyeIcon, label: ["Accurate", "Insights"] },
                  { icon: ShieldStarIcon, label: ["Trusted", "Guidance"] },
                  {
                    icon: HeartHandIcon,
                    label: ["Positive", "Transformations"],
                  },
                  {
                    icon: LockShieldIcon,
                    label: ["100% Confidential", "& Safe"],
                  },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label.join(" ")}
                    className="w-1/3 sm:w-1/4 lg:w-[100px] text-center"
                  >
                    <span className="mx-auto flex h-[42px] w-[42px] items-center justify-center rounded-full border border-gold/50 text-gold">
                      <Icon className="h-[22px] w-[22px]" />
                    </span>
                    <p className="mt-2.5 text-[11px] leading-[1.4] text-white/85">
                      {label[0]}
                      <br />
                      {label[1]}
                    </p>
                  </li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/consultation/select-service"
                  className="flex h-[50px] items-center gap-2.5 rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 px-7 text-[15px] font-semibold text-ink shadow-[0_8px_24px_rgba(233,184,92,0.25)]"
                >
                  <CalendarIcon className="h-[18px] w-[18px]" />
                  Book Tarot Reading
                </Link>
                <Link
                  href="/services"
                  className="flex h-[50px] items-center gap-2.5 rounded-lg border border-white/35 px-6 text-[15px] font-medium text-white"
                >
                  Explore Tarot Services
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Tarot Reading Services ── */}
        <section className="mx-auto w-full max-w-[1400px] px-5 pt-14 pb-4 lg:px-8">
          <SectionHeading>Our Tarot Reading Services</SectionHeading>
          <p className="mt-3 text-center text-[14px] text-body">
            Each reading is designed to bring clarity, guidance and positive
            transformation in your life.
          </p>

          {/* Row 1 */}
          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {(loadingServices
              ? SERVICES_ROW1
              : apiServicesRow1.length
                ? apiServicesRow1
                : SERVICES_ROW1
            ).map((item) => {
              const Icon = (item.icon ||
                TAROT_ICON_MAP[item.name ?? ""] ||
                defaultTarotIcon) as React.FC<{ className?: string }>;
              const title = item.name || item.title || "";
              const desc = item.sub || item.description || item.desc || "";
              return (
                <article
                  key={title}
                  className="rounded-2xl border border-line bg-white px-4 py-6 text-center shadow-[0_2px_14px_rgba(75,37,131,0.05)]"
                >
                  <span className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-gold/30 bg-lilac">
                    <Icon className="h-[36px] w-[36px]" />
                  </span>
                  <h3 className="mt-4 text-[14px] font-semibold text-grape">
                    {title}
                  </h3>
                  <p className="mt-2 text-[12px] leading-[1.6] text-body">
                    {desc}
                  </p>
                  <Link
                    href="/consultation/select-service"
                    className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-grape-2 hover:text-gold transition-colors"
                  >
                    Learn More <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Row 2 */}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {(loadingServices
              ? SERVICES_ROW2
              : apiServicesRow2.length
                ? apiServicesRow2
                : SERVICES_ROW2
            ).map((item) => {
              const Icon = (item.icon ||
                TAROT_ICON_MAP[item.name ?? ""] ||
                defaultTarotIcon) as React.FC<{ className?: string }>;
              const title = item.name || item.title || "";
              const desc = item.sub || item.description || item.desc || "";
              return (
                <article
                  key={title}
                  className="rounded-2xl border border-line bg-white px-4 py-6 text-center shadow-[0_2px_14px_rgba(75,37,131,0.05)]"
                >
                  <span className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-gold/30 bg-lilac">
                    <Icon className="h-[36px] w-[36px]" />
                  </span>
                  <h3 className="mt-4 text-[14px] font-semibold text-grape">
                    {title}
                  </h3>
                  <p className="mt-2 text-[12px] leading-[1.6] text-body">
                    {desc}
                  </p>
                  <Link
                    href="/consultation/select-service"
                    className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-grape-2 hover:text-gold transition-colors"
                  >
                    Learn More <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── What You Gain + Not Sure ── */}
        <section className="mx-auto w-full max-w-[1400px] px-5 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto_340px]">
            {/* Benefits list */}
            <div className="rounded-2xl bg-[radial-gradient(120%_140%_at_50%_0%,#2a1148_0%,#1a0b2e_60%,#14082a_100%)] px-8 py-8">
              <h3 className="font-display text-[22px] font-bold text-gold">
                What You Gain From Tarot Reading
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {BENEFITS.map((b) => (
                  <div key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
                      <CheckIcon className="h-[11px] w-[11px]" />
                    </span>
                    <span className="text-[13px] text-white/90">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative image */}
            <div className="hidden items-center justify-center lg:flex">
              <Image
                src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/trust-candles.png"
                alt=""
                width={200}
                height={200}
                className="h-[180px] w-[180px] rounded-xl object-contain"
              />
            </div>

            {/* Not Sure card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white px-6 py-8 text-center shadow-[0_2px_14px_rgba(75,37,131,0.05)]">
              <h3 className="font-display text-[20px] font-bold text-grape leading-tight">
                Not Sure Which Reading
                <br />
                is Right for You?
              </h3>
              <p className="mt-3 text-[13px] text-body">
                Chat with our expert and get personalized guidance.
              </p>
              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex h-[44px] items-center gap-2 rounded-lg bg-[#25D366] px-6 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(37,211,102,0.3)]"
              >
                <WhatsAppIcon className="h-[20px] w-[20px]" />
                Chat on WhatsApp
              </Link>
            </div>
          </div>
        </section>

        {/* ── How a Tarot Reading Works ── */}
        <section className="mx-auto w-full max-w-[1400px] px-5 py-8 lg:px-8">
          <SectionHeading>How a Tarot Reading Works</SectionHeading>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:flex lg:items-start lg:justify-between lg:gap-2">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="flex items-start justify-center lg:flex-1"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step circle */}
                  <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full border-2 border-grape/30 bg-lilac text-[22px] font-bold text-grape">
                    {step.num}
                  </span>
                  <h4 className="mt-3 text-[13px] font-semibold text-grape">
                    {step.title}
                  </h4>
                  <p className="mt-1.5 text-[11.5px] leading-[1.5] text-body sm:max-w-[140px]">
                    {step.desc}
                  </p>
                </div>
                {/* Arrow */}
                {i < STEPS.length - 1 && (
                  <div className="mt-6 hidden lg:block flex-1 px-2">
                    <ChevronRightIcon className="mx-auto h-5 w-5 text-grape/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── What Our Clients Say ── */}
        <section className="mx-auto w-full max-w-[1400px] px-5 py-8 lg:px-8">
          <SectionHeading>What Our Clients Say</SectionHeading>

          <div className="relative mt-9">
            {/* Navigation arrows */}
            <button
              type="button"
              onClick={prevTestimonials}
              disabled={safePage === 0}
              className="absolute -left-2 top-1/2 z-10 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-grape shadow-md hover:bg-lilac transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeftThin className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextTestimonials}
              disabled={safePage >= totalPages - 1}
              className="absolute -right-2 top-1/2 z-10 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-grape shadow-md hover:bg-lilac transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRightThin className="h-5 w-5" />
            </button>

            <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-5 sm:grid-cols-3">
              {visibleTestimonials.map((t, idx) => (
                <div
                  key={t.name || t.id || `t-${idx}`}
                  className="rounded-2xl border border-line bg-white p-6 text-center shadow-[0_2px_14px_rgba(75,37,131,0.05)]"
                >
                  {/* Avatar */}
                  <div className="mx-auto h-[60px] w-[60px] overflow-hidden rounded-full border-2 border-gold/30">
                    <Image
                      src={
                        t.img ||
                        "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/t-1.png"
                      }
                      alt={t.name || "Client"}
                      width={60}
                      height={60}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Stars */}
                  <div className="mt-3 flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarSolidIcon key={s} className="h-4 w-4 text-gold" />
                    ))}
                  </div>
                  {/* Text */}
                  <p className="mt-3 text-[13px] leading-[1.65] text-body">
                    {sanitize(t.comment || t.text)}
                  </p>
                  <p className="mt-3 text-[13px] font-semibold text-grape">
                    – {sanitize(t.name || "Client")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA Banner ── */}
        <section className="mx-auto w-full max-w-[1400px] px-5 py-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(120%_160%_at_50%_50%,#2c1250_0%,#1b0c30_70%,#150826_100%)] px-8 py-10">
            <div className="stars pointer-events-none absolute inset-0 opacity-60" />

            <div className="relative flex flex-col items-center gap-7 lg:flex-row lg:gap-10">
              {/* Left image */}
              <div className="hidden lg:block">
                <Image
                  src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/trust-candles.png"
                  alt=""
                  width={140}
                  height={140}
                  className="h-[120px] w-[120px] object-contain opacity-80"
                />
              </div>

              {/* Text */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="font-display text-[28px] font-bold leading-tight text-white lg:text-[32px]">
                  The Cards Have Answers.
                  <br />
                  Are You Ready to Discover Them?
                </h2>
                <p className="mt-3 text-[14px] text-white/75">
                  Book your tarot reading session with Reiki Grand Master
                  Surinder Kaur Sehgal today.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Link
                  href="/consultation/select-service"
                  className="flex h-[50px] items-center gap-2.5 rounded-lg bg-gradient-to-b from-gold-2 to-gold-3 px-7 text-[15px] font-semibold text-ink shadow-[0_8px_24px_rgba(233,184,92,0.2)]"
                >
                  Book Tarot Reading Now
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] items-center gap-2 rounded-lg border border-white/30 px-6 text-[14px] font-medium text-white"
                >
                  <WhatsAppIcon className="h-[20px] w-[20px]" />
                  Chat on WhatsApp
                </Link>
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
