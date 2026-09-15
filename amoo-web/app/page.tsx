import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHeader, OfferBar } from "./components/home-header";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { SiteFooter } from "./components/site-footer";
import { WHATSAPP_URL, SITE_NAME } from "../lib/constants";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChatIcon,
  ClipboardCheckIcon,
  ClipboardClockIcon,
  ClockIcon,
  CreditCardIcon,
  DiamondIcon,
  FormPenIcon,
  LotusIcon,
  LotusSolidIcon,
  MedalIcon,
  PhoneCallIcon,
  RupeeCoinIcon,
  SparkBulletIcon,
  StarOutlineIcon,
  UsersIcon,
  VideoCallIcon,
  WhatsAppCircleIcon,
} from "./components/home-icons";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Numerology, Reiki Healing & Tarot Guidance`,
  description:
    "Transform your life through Numerology, Reiki Healing, Tarot Guidance and Spiritual Consultation with Reiki Grand Master Dr. Surinder Kaur Sehgal.",
  openGraph: {
    title: `${SITE_NAME} — Numerology, Reiki Healing & Tarot Guidance`,
    description:
      "Transform your life through Numerology, Reiki Healing, Tarot Guidance and Spiritual Consultation with Reiki Grand Master Dr. Surinder Kaur Sehgal.",
  },
};

/* ---------------- data ---------------- */

const HERO_POINTS = [
  {
    icon: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/hero-ico-1.png",
    lines: ["Numerology", "Insight"],
  },
  {
    icon: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/hero-ico-2.png",
    lines: ["Reiki", "Healing"],
  },
  {
    icon: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/hero-ico-3.png",
    lines: ["Tarot", "Guidance"],
  },
];

const MODES = [
  {
    icon: PhoneCallIcon,
    title: "Audio Call Consultation",
    desc: ["Connect through voice call for", "personal guidance."],
    time: "15 - 60 Min",
    price: "₹499 Onwards",
    tone: "purple" as const,
  },
  {
    icon: VideoCallIcon,
    title: "Video Call Consultation",
    desc: ["Face-to-face consultation for", "deeper understanding."],
    time: "15 - 60 Min",
    price: "₹999 Onwards",
    tone: "gold" as const,
  },
  {
    icon: ChatIcon,
    title: "Chat Consultation",
    desc: ["Type your questions and get", "detailed written guidance."],
    time: "15 - 60 Min",
    price: "₹299 Onwards",
    tone: "purple" as const,
  },
];

const CHAKRAS = [
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/chakra_1.png",
    name: "Muladhara",
    sub: "Root Chakra",
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/chakra_2.png",
    name: "Swadhisthana",
    sub: "Sacral Chakra",
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/chakra_3.png",
    name: "Manipura",
    sub: "Solar Plexus",
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/chakra_4.png",
    name: "Anahata",
    sub: "Heart Chakra",
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/chakra_5.png",
    name: "Vishuddha",
    sub: "Throat Chakra",
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/chakra_6.png",
    name: "Ajna",
    sub: "Third Eye Chakra",
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/chakra_7.png",
    name: "Sahasrara",
    sub: "Crown Chakra",
  },
];

const CREDENTIALS = [
  "Reiki Grand Master",
  "Numerology Expert",
  "Tarot Card Reader",
  "Spiritual Healer & Guide",
];

const STATS = [
  { icon: MedalIcon, value: "20+", label: ["Years of", "Experience"] },
  { icon: UsersIcon, value: "25K+", label: ["Happy", "Clients"] },
  { icon: LotusIcon, value: "50K+", label: ["Consultations", "Completed"] },
  { icon: StarOutlineIcon, value: "98%", label: ["Client", "Satisfaction"] },
];

const STEPS = [
  {
    icon: ClipboardCheckIcon,
    title: "1. Choose Service",
    desc: ["Select the service you", "need guidance on."],
  },
  {
    icon: ClipboardClockIcon,
    title: "2. Pick Mode & Time",
    desc: ["Choose your preferred", "mode and time slot."],
  },
  {
    icon: FormPenIcon,
    title: "3. Share Details",
    desc: ["Fill the booking form", "and share details."],
  },
  {
    icon: CreditCardIcon,
    title: "4. Make Payment",
    desc: ["Secure your booking", "with online payment."],
  },
  {
    icon: WhatsAppCircleIcon,
    title: "5. Get Confirmation",
    desc: ["Receive confirmation", "on WhatsApp & Email."],
    plain: true,
  },
  {
    icon: LotusSolidIcon,
    title: "6. Join & Transform",
    desc: ["Join your session and", "transform your life."],
  },
];

const SERVICES = [
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/svc-1.png",
    lines: ["Numerology", "Guidance"],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/svc-2.png",
    lines: ["Reiki", "Healing"],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/svc-3.png",
    lines: ["Tarot", "Reading"],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/svc-4.png",
    lines: ["Chakra", "Balancing"],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/svc-5.png",
    lines: ["Kundali", "Analysis"],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/svc-6.png",
    lines: ["Love & Relationship", "Guidance"],
  },
];

const SOFTWARE = [
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/sw-1.png",
    title: "Numerology Software",
    desc: ["Complete numerology solution for", "professionals and learners."],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/sw-2.png",
    title: "Name Numerology Software",
    desc: ["Advanced name analysis and", "suggestion software."],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/sw-3.png",
    title: "Tarot Reading Software",
    desc: ["Professional tarot reading software", "with multiple spreads."],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/sw-4.png",
    title: "Basic Kundali Software",
    desc: ["Generate accurate kundali and", "basic astrological reports."],
  },
];

const TRUST = [
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/badge_1.png",
    lines: ["Certified Reiki", "Grand Master"],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/badge_2.png",
    lines: ["Professional", "Numerology Expert"],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/badge_3.png",
    lines: ["Certified Tarot", "Reader"],
  },
  {
    img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/badge_4.png",
    lines: ["Trusted By", "Thousands"],
  },
];

/* ---------------- section heading ---------------- */

function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <span
      aria-hidden
      className={`hidden items-center gap-1.5 text-gold sm:flex ${
        flip ? "flex-row-reverse" : ""
      }`}
    >
      <DiamondIcon className="h-[9px] w-[9px] rotate-90" />
      <span className="block h-px w-[46px] bg-gold/70" />
      <DiamondIcon className="h-[7px] w-[7px] rotate-90 opacity-80" />
    </span>
  );
}

function Heading({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Flourish flip />
      <h2
        className={`font-display text-center text-[20px] leading-tight font-bold sm:text-[24px] sm:whitespace-nowrap lg:text-[28px] ${
          tone === "dark" ? "text-white" : "text-[#2c0c47]"
        }`}
      >
        {children}
      </h2>
      <Flourish />
    </div>
  );
}

/* ---------------- page ---------------- */

export default function Home() {
  return (
    <>
      <OfferBar />

      <main id="main-content" className="flex-1 bg-white">
        {/* ---------------- HERO ---------------- */}
        <section className="relative overflow-hidden rounded-b-[16px] bg-[radial-gradient(120%_130%_at_18%_50%,#33124f_0%,#22083a_45%,#170426_100%)]">
          <HomeHeader />

          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/amooHomeHeroBgP.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#1c0730_0%,rgba(28,7,48,0.9)_15%,rgba(28,7,48,0.35)_40%,rgba(28,7,48,0)_60%)] md:bg-[linear-gradient(90deg,#1c0730_0%,rgba(28,7,48,0.9)_6%,rgba(28,7,48,0.35)_20%,rgba(28,7,48,0)_36%)]" />

          <div className="relative mx-auto w-full max-w-[1336px] px-5">
            <div className="w-full max-w-[560px] pt-[100px] pb-[62px] sm:pt-[128px]">
              <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-gold uppercase">
                <LotusIcon className="h-[13px] w-[13px]" />
                Welcome to {SITE_NAME}
              </p>

              <h1 className="font-display mt-[14px] text-[28px] leading-[1.28] font-bold text-[#f6e3b4] sm:text-[46px]">
                Discover the Divine
                <br />
                Guidance Within You
              </h1>

              <p className="mt-[18px] text-[15px] leading-[1.75] text-white/90">
                Transform your life through Numerology, Reiki Healing,
                <br />
                Tarot Guidance and Spiritual Consultation with
                <br />
                Reiki Grand Dr. Master Surinder Kaur Sehgal.
              </p>

              <ul className="mt-[26px] flex items-center">
                {HERO_POINTS.map(({ icon, lines }, index) => (
                  <li
                    key={lines.join(" ")}
                    className={`flex items-center gap-2.5 pr-6 ${
                      index === 0 ? "" : "border-l border-white/20 pl-6"
                    }`}
                  >
                    <Image
                      src={icon}
                      alt=""
                      width={125}
                      height={125}
                      className="h-[30px] w-[30px] shrink-0 object-contain"
                    />
                    <p className="text-[12.5px] leading-[1.45] text-white">
                      {lines[0]}
                      <br />
                      {lines[1]}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-[28px] flex flex-wrap items-center gap-[26px]">
                <Link
                  href="/consultation/select-service"
                  className="flex h-[52px] items-center gap-2.5 rounded-[8px] bg-gradient-to-b from-gold-2 to-gold-3 px-[26px] text-[15px] font-semibold text-[#2b0a3d]"
                >
                  <CalendarIcon className="h-[18px] w-[18px]" />
                  Book Consultation
                </Link>
                <Link
                  href="/services"
                  className="flex h-[52px] items-center gap-3 rounded-[8px] border border-white/50 px-[26px] text-[15px] font-medium text-white"
                >
                  Explore Services
                  <ArrowRightIcon className="h-[17px] w-[17px]" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- CONSULTATION MODE ---------------- */}
        <section className="rounded-[16px] bg-sand">
          <div className="mx-auto w-full max-w-[1336px] px-5 pt-[36px] pb-[42px]">
            <Heading>Choose Your Consultation Mode</Heading>

            <div className="mt-[52px] grid grid-cols-1 gap-[33px] sm:grid-cols-2 lg:grid-cols-3 lg:px-[20px]">
              {MODES.map(({ icon: Icon, title, desc, time, price, tone }) => {
                const gold = tone === "gold";
                return (
                  <article
                    key={title}
                    className={`relative rounded-[14px] border px-6 pt-[46px] pb-[26px] text-center ${
                      gold
                        ? "border-[#e8cfa0] bg-[#fdf3e2]"
                        : "border-[#e6d9f2] bg-[#faf6fd]"
                    }`}
                  >
                    <span
                      className={`absolute -top-[28px] left-1/2 flex h-[56px] w-[56px] -translate-x-1/2 items-center justify-center rounded-full text-white ${
                        gold
                          ? "bg-[radial-gradient(circle_at_35%_30%,#e2ac4e,#b5771a)]"
                          : "bg-[radial-gradient(circle_at_35%_30%,#7b2a9d,#4d1173)]"
                      }`}
                    >
                      <Icon className="h-[26px] w-[26px]" />
                    </span>

                    <h3
                      className={`font-display text-[19px] font-bold ${
                        gold ? "text-[#b5771a]" : "text-[#5b1a8c]"
                      }`}
                    >
                      {title}
                    </h3>

                    <p className="mt-[10px] text-[13px] leading-[1.65] text-[#5f5e6b]">
                      {desc[0]}
                      <br />
                      {desc[1]}
                    </p>

                    <div className="mt-[16px] flex items-center justify-center">
                      <span className="flex items-center gap-2 pr-[18px] text-[12.5px] text-[#4a4956]">
                        <ClockIcon
                          className={`h-[15px] w-[15px] ${
                            gold ? "text-[#c08a2c]" : "text-[#7b2a9d]"
                          }`}
                        />
                        {time}
                      </span>
                      <span className="h-[16px] w-px bg-[#d8d2c8]" />
                      <span className="flex items-center gap-2 pl-[18px] text-[12.5px] text-[#4a4956]">
                        <RupeeCoinIcon
                          className={`h-[15px] w-[15px] ${
                            gold ? "text-[#c08a2c]" : "text-[#7b2a9d]"
                          }`}
                        />
                        {price}
                      </span>
                    </div>

                    <Link
                      href="/consultation/select-service"
                      className={`mt-[20px] flex h-[32px] w-auto min-w-[120px] items-center justify-center rounded-[6px] px-4 text-[13px] font-medium text-white sm:w-[172px] ${
                        gold
                          ? "bg-gradient-to-b from-[#c8901f] to-[#a06a12]"
                          : "bg-gradient-to-b from-[#5e1c8f] to-[#3f0f55]"
                      }`}
                    >
                      Book Now
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- CHAKRAS ---------------- */}
        <section className="relative overflow-hidden rounded-[16px] bg-[radial-gradient(120%_150%_at_50%_40%,#3a1560_0%,#2a0f46_50%,#1b0a2e_100%)]">
          <div className="haze pointer-events-none absolute inset-0 opacity-70" />
          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-chakra-left.png"
            alt=""
            width={174}
            height={438}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[58px] object-cover md:block"
          />
          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-chakra-right.png"
            alt=""
            width={174}
            height={438}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[58px] object-cover md:block"
          />

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[24px] pb-[26px]">
            <h2 className="font-display text-center text-[24px] leading-tight font-bold text-white sm:text-[27px]">
              Balance Your Energy. Align Your Life.
            </h2>
            <p className="mt-[6px] text-center text-[13.5px] text-white/85">
              Explore the 7 Chakras and restore harmony in your mind, body and
              soul.
            </p>

            <div className="mt-[14px] flex items-center justify-center gap-2">
              <ul className="flex flex-1 flex-wrap items-start justify-center gap-x-4 gap-y-6 sm:gap-x-[42px] lg:flex-nowrap lg:justify-between lg:px-[30px]">
                {CHAKRAS.map(({ img, name, sub }) => (
                  <li
                    key={name}
                    className="flex w-1/3 sm:w-[110px] flex-col items-center"
                  >
                    <Image
                      src={img}
                      alt=""
                      width={216}
                      height={216}
                      className="h-[77px] w-[77px] object-contain"
                    />
                    <p className="mt-[8px] text-[13px] font-semibold text-gold">
                      {name}
                    </p>
                    <p className="mt-[3px] text-[11.5px] text-white/85">
                      {sub}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------------- ABOUT ---------------- */}
        <section className="rounded-[16px] bg-[#faf7f2]">
          <div className="mx-auto grid w-full max-w-[1336px] grid-cols-1 items-center gap-8 px-5 py-[26px] lg:grid-cols-[380px_1fr_400px] lg:gap-[38px]">
            <div className="flex justify-center">
              <Image
                src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/amooLadyP.png"
                alt="Surinder Kaur Sehgal"
                width={890}
                height={878}
                className="h-[350px] w-full max-w-[550px] object-cover sm:h-[545px] lg:w-[550px]"
              />
            </div>

            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em] text-[#c08a2c] uppercase">
                <DiamondIcon className="h-[9px] w-[9px] rotate-90" />
                Meet Your Spiritual Guide
              </p>

              <h2 className="font-display mt-[12px] text-[24px] lg:text-[30px] leading-[1.25] font-bold text-[#2c0c47]">
                Reiki Grand Master
                <br />
                Dr. Surinder Kaur Sehgal
              </h2>

              <p className="mt-[16px] w-full max-w-[400px] text-[13.5px] leading-[1.75] text-[#5f5e6b]">
                With over 20+ years of experience in Reiki Healing, Numerology
                and Tarot Guidance, Surinder Kaur Sehgal has helped thousands of
                people transform their lives.
              </p>

              <ul className="mt-[18px] space-y-[10px]">
                {CREDENTIALS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[13px] text-[#3f3e4a]"
                  >
                    <SparkBulletIcon className="h-[14px] w-[14px] shrink-0 text-[#c08a2c]" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/about"
                className="mt-[22px] inline-flex h-[36px] items-center rounded-[6px] bg-gradient-to-r from-[#4a1273] to-[#7a2ba3] px-[22px] text-[13px] font-semibold text-gold-2"
              >
                Know More About Surinder Ji
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 overflow-hidden rounded-[12px] border border-[#e8dcc8]">
              {STATS.map(({ icon: Icon, value, label }, index) => (
                <div
                  key={value}
                  className={`flex flex-col items-center justify-center px-4 py-[26px] text-center ${
                    index % 2 === 0 ? "sm:border-r border-[#e8dcc8]" : ""
                  } ${index < 2 ? "border-b border-[#e8dcc8] sm:border-b-0" : index >= STATS.length - 2 ? "" : ""}`}
                >
                  <Icon className="h-[30px] w-[30px] text-[#6b2a9c]" />
                  <p className="font-display mt-[12px] text-[26px] leading-none font-bold text-[#b5471a]">
                    {value}
                  </p>
                  <p className="mt-[10px] text-[12.5px] leading-[1.5] text-[#4a4956]">
                    {label[0]}
                    <br />
                    {label[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <section className="relative overflow-hidden rounded-[16px] bg-[radial-gradient(120%_150%_at_50%_30%,#37135a_0%,#2a0f45_55%,#1e0a34_100%)]">
          <div className="haze pointer-events-none absolute inset-0 opacity-60" />

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[22px] pb-[26px]">
            <h2 className="font-display text-center text-[25px] leading-tight font-bold text-white sm:text-[27px]">
              How Consultation Works
            </h2>

            <ul className="mt-[22px] grid grid-cols-2 items-start gap-y-8 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-0">
              {STEPS.map(({ icon: Icon, title, desc, plain }, index) => (
                <li key={title} className="flex items-start lg:flex-1">
                  <div className="flex w-full flex-col items-center text-center">
                    <span
                      className={`flex h-[60px] w-[60px] items-center justify-center rounded-full ${
                        plain
                          ? ""
                          : "border border-gold/55 bg-white/[0.03] text-gold-2"
                      }`}
                    >
                      <Icon
                        className={
                          plain ? "h-[60px] w-[60px]" : "h-[30px] w-[30px]"
                        }
                      />
                    </span>
                    <p className="mt-[14px] text-[12.5px] font-semibold text-gold-2">
                      {title}
                    </p>
                    <p className="mt-[6px] text-[11px] leading-[1.6] text-white/80">
                      {desc[0]}
                      <br />
                      {desc[1]}
                    </p>
                  </div>

                  {index < STEPS.length - 1 && (
                    <ArrowRightIcon
                      aria-hidden
                      className="mt-[22px] hidden h-[16px] w-[16px] shrink-0 text-gold-2 lg:block"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------- TOP SERVICES + SOFTWARE ---------------- */}
        <section className="rounded-[16px] bg-sand-2">
          <div className="mx-auto w-full max-w-[1336px] px-5 pt-[30px] pb-[18px]">
            <Heading>Our Top Services</Heading>

            <div className="relative mt-[26px] pb-[18px]">
              <div className="grid grid-cols-2 gap-[17px] sm:grid-cols-3 lg:grid-cols-6">
                {SERVICES.map(({ img, lines }) => (
                  <Link
                    key={lines.join(" ")}
                    href="/services"
                    className="overflow-hidden rounded-[12px] bg-[#280f42] block"
                  >
                    <Image
                      src={img}
                      alt=""
                      width={360}
                      height={195}
                      className="h-[118px] w-full object-cover"
                    />
                    <div className="flex flex-col items-center px-3 pt-[10px] pb-[14px]">
                      <h3 className="font-display text-center text-[15px] leading-[1.3] font-bold text-white">
                        {lines[0]}
                        <br />
                        {lines[1]}
                      </h3>
                      <span className="mt-[10px] block h-px w-[74px] bg-gold/50" />
                      <span className="mt-[9px] flex items-center gap-2 text-[12px] font-medium text-gold-2">
                        Explore
                        <ArrowRightIcon className="h-[13px] w-[13px]" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/services"
                className="absolute -bottom-[2px] left-1/2 flex h-[32px] w-auto -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-[6px] bg-gradient-to-b from-gold-2 to-gold-3 px-5 text-[13px] font-semibold text-[#2b0a3d]"
              >
                View All Services
              </Link>
            </div>
          </div>

          {/* Software */}
          <div className="mx-auto w-full max-w-[1336px] px-5 pt-[10px] pb-[30px]">
            <div className="relative">
              <div className="relative z-10 flex justify-center pb-[14px]">
                <span className="bg-sand-2 px-4">
                  <Heading>Spiritual Software for Spiritual Seekers</Heading>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_253px]">
                {SOFTWARE.map(({ img, title, desc }) => (
                  <Link
                    key={title}
                    href="/software-hub"
                    className="rounded-[12px] border border-[#eadfcd] bg-[#fdfaf5] px-5 pt-[30px] pb-[22px] text-center block"
                  >
                    <Image
                      src={img}
                      alt=""
                      width={264}
                      height={264}
                      className="mx-auto h-[68px] w-auto object-contain"
                    />
                    <h3 className="font-display mt-[16px] text-[15px] font-bold text-[#2c0c47]">
                      {title}
                    </h3>
                    <p className="mt-[10px] text-[12px] leading-[1.6] text-[#5f5e6b]">
                      {desc[0]}
                      <br />
                      {desc[1]}
                    </p>
                    <span className="mt-[18px] flex items-center justify-center gap-2 text-[12.5px] font-medium text-[#b5711a]">
                      Explore Now
                      <ArrowRightIcon className="h-[13px] w-[13px]" />
                    </span>
                  </Link>
                ))}

                {/* Bundle promo */}
                <article className="relative flex flex-col items-center overflow-hidden rounded-[12px] bg-[radial-gradient(120%_120%_at_50%_20%,#5a1a86_0%,#3d1060_45%,#2a0a45_100%)] px-5 pt-[18px] pb-[18px] text-center">
                  <p className="text-[13px] font-medium text-white">
                    Special Bundle Offer
                  </p>
                  <h3 className="font-display mt-[8px] text-[21px] leading-[1.25] font-bold text-gold-2">
                    Get All Software
                    <br />
                    at Best Price
                  </h3>
                  <Image
                    src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/sw-box.png"
                    alt=""
                    width={392}
                    height={208}
                    className="mt-[6px] h-[86px] w-auto object-contain"
                  />
                  <Link
                    href="/consultation/consultation-pricing"
                    className="mt-[8px] flex h-[32px] w-auto items-center justify-center gap-2 rounded-[6px] bg-gradient-to-b from-gold-2 to-gold-3 px-5 text-[13px] font-semibold text-[#2b0a3d]"
                  >
                    View Pricing
                    <ArrowRightIcon className="h-[13px] w-[13px]" />
                  </Link>
                </article>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection />

        {/* ---------------- TRUST BADGES ---------------- */}
        <section className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(90deg,#fdf6e6_0%,#fbf3e4_60%,#f7ecd8_100%)]">
          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/badge_5.png"
            alt=""
            width={417}
            height={222}
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-[232px] object-cover object-left lg:block"
          />

          <div className="relative mx-auto w-full max-w-[1336px] px-5 py-[18px]">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 lg:grid-cols-4 lg:pr-[240px]">
              {TRUST.map(({ img, lines }, index) => (
                <li
                  key={lines.join(" ")}
                  className={`flex items-center gap-[14px] px-[18px] ${
                    index === 0 ? "" : "sm:border-l border-[#e6d9c2]"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={160}
                    height={176}
                    className="h-[46px] w-[42px] shrink-0 object-contain"
                  />
                  <p className="font-display text-[15px] leading-[1.5] font-bold text-[#2c0c47]">
                    {lines[0]}
                    <br />
                    {lines[1]}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />

      <Link
        href={WHATSAPP_URL}
        aria-label="Chat on WhatsApp"
        className="fixed right-6 bottom-6 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      >
        <WhatsAppCircleIcon className="h-[52px] w-[52px]" />
      </Link>
    </>
  );
}
