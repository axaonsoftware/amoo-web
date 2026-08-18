"use client";

import {  useState,  useCallback,  useRef  } from "react";
import Image from "next/image";
import Link from "next/link";
import {  HomeHeader,  OfferBar  } from "../../components/home-header";
import { 
  CalendarIcon, 
  LotusSolidIcon } from "../../components/home-icons";
import {  WHATSAPP_URL,  CONTACT_EMAIL,  SITE_NAME  } from "../../../lib/constants";
import { 
  ClockIcon, 
  SendIcon, 
  ChevronRightIcon, 
  EyeIcon, 
  FacebookIcon, 
  TwitterIcon, 
  WhatsAppIcon, 
  LinkIcon, 
  CheckCircleIcon, 
  SearchIcon, 
  PhoneIcon, 
  MailIcon, 
  MapPinIcon, 
  InstagramIcon, 
  YoutubeIcon, 
  BookOpenIcon, 
  StarIcon, 
  HeartIcon, 
  CheckCircleFilledIcon } from "./icons";

/* ---------------- Data ---------------- */

const ARTICLE = {
  category: "Spirituality",
  title: "What is Spiritual Awakening? Signs, Stages & How to Embrace It",
  excerpt:
    "Spiritual awakening is the first step towards understanding your true self and the universe. Learn the signs, stages and ways to embrace this beautiful journey.",
  author: "Surinder Kaur Sehgal",
  authorAvatar:
    "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/t-1.png",
  date: "May 15, 2025",
  readTime: "8 min read",
  views: "1.2K views",
  heroImage:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
};

const TABLE_OF_CONTENTS = [
  "What is Spiritual Awakening?",
  "Signs of Spiritual Awakening",
  "Stages of Spiritual Awakening",
  "How to Embrace Spiritual Awakening",
  "Benefits of Spiritual Awakening",
  "Final Thoughts",
];

const SIGNS = [
  "Heightened intuition and inner knowing",
  "Seeing synchronicities",
  "Feeling of inner peace and joy",
  "Compassion and empathy increase",
  "Deep desire for truth and self-discovery",
  "Questioning old beliefs and patterns",
  "Detachment from negativity and toxic people",
  "Connection with nature and the universe",
];

const STAGES = [
  {
    number: "Stage 1",
    title: "Seeking",
    description: "A deep inner search begins.",
    icon: SearchIcon,
  },
  {
    number: "Stage 2",
    title: "Awakening",
    description: "You start noticing the signs.",
    icon: EyeIcon,
  },
  {
    number: "Stage 3",
    title: "Transformation",
    description: "Old patterns start to fade.",
    icon: StarIcon,
  },
  {
    number: "Stage 4",
    title: "Growth",
    description: "You embrace your higher self.",
    icon: HeartIcon,
  },
  {
    number: "Stage 5",
    title: "Alignment",
    description: "You live in harmony and purpose.",
    icon: LotusSolidIcon,
  },
];

const HOW_TO_EMBRACE = [
  "Meditate daily and connect with your inner self",
  "Practice gratitude and mindfulness",
  "Let go of fear, guilt and limiting beliefs",
  "Surround yourself with positive and uplifting energy",
  "Listen to your intuition and trust the journey",
];

const TAGS = [
  "Spiritual Awakening",
  "Inner Peace",
  "Self Discovery",
  "Mindfulness",
  "Universe",
];

const RELATED_POSTS = [
  {
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
    title: "Life Path Numbers 1 to 9: Meaning and Characteristics",
    date: "May 12, 2025",
    readTime: "6 min read",
    slug: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=400&q=80",
    title: "How Tarot Cards Can Guide You in Daily Life",
    date: "May 10, 2025",
    readTime: "7 min read",
    slug: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=400&q=80",
    title: "Understanding Your Kundali: Planets & Their Impact",
    date: "May 8, 2025",
    readTime: "9 min read",
    slug: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",
    title: "Reiki Healing Benefits for Mind, Body and Soul",
    date: "May 5, 2025",
    readTime: "6 min read",
    slug: "#",
  },
];

const SIDEBAR_CATEGORIES = [
  { label: "Numerology", icon: "🔮", count: 18 },
  { label: "Tarot", icon: "🃏", count: 16 },
  { label: "Kundali", icon: "⭐", count: 14 },
  { label: "Reiki & Healing", icon: "✨", count: 12 },
  { label: "Vastu", icon: "🏠", count: 10 },
  { label: "Spirituality", icon: "🕉", count: 20 },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    Icon: FacebookIcon,
    bg: "bg-[#3b5998]",
    href: "https://facebook.com/amoooguru",
  },
  {
    label: "Instagram",
    Icon: InstagramIcon,
    bg: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    href: "https://instagram.com/amooguru_official",
  },
  {
    label: "YouTube",
    Icon: YoutubeIcon,
    bg: "bg-[#ff0000]",
    href: "https://youtube.com/@amoooguru",
  },
  {
    label: "WhatsApp",
    Icon: WhatsAppIcon,
    bg: "bg-[#25D366]",
    href: WHATSAPP_URL,
  },
  {
    label: "Telegram",
    Icon: SendIcon,
    bg: "bg-[#0088cc]",
    href: "https://t.me/amoooguru",
  },
];

/* ---------------- Page ---------------- */

export default function BlogArticlePage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [activeTocIndex, setActiveTocIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const scrollToSection = useCallback((index: number) => {
    setActiveTocIndex(index);
    sectionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  function handleShare(platform: string) {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title =
      "What is Spiritual Awakening? Signs, Stages & How to Embrace It";
    switch (platform) {
      case "WhatsApp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
          "_blank",
        );
        break;
      case "Facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "Twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "Copy Link":
        navigator.clipboard.writeText(url).then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        });
        break;
    }
  }

  function handleNewsletter() {
    if (
      !newsletterEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)
    )
      return;
    setNewsletterSubmitted(true);
    setNewsletterEmail("");
    setTimeout(() => setNewsletterSubmitted(false), 4000);
  }

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      <main id="main-content" className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-[radial-gradient(130%_140%_at_20%_50%,#2d0f4f_0%,#1e0a38_45%,#130525_100%)]">
          <div className="haze pointer-events-none absolute inset-0 opacity-50" />

          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/blogPageHeroBgN.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-40"
            priority
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,#1c0730_0%,rgba(28,7,48,0.95)_15%,rgba(28,7,48,0.6)_40%,rgba(28,7,48,0.2)_60%)]" />

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[30px] pb-[40px] sm:pt-[40px] sm:pb-[50px] lg:pt-[50px] lg:pb-[60px]">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-2 text-[13px] text-white/70">
              <Link href="/" className="hover:text-gold transition-colors">
                Home
              </Link>
              <ChevronRightIcon className="h-[14px] w-[14px]" />
              <Link href="/blog" className="hover:text-gold transition-colors">
                Blog
              </Link>
              <ChevronRightIcon className="h-[14px] w-[14px]" />
              <Link href="/blog" className="hover:text-gold transition-colors">
                Spirituality
              </Link>
              <ChevronRightIcon className="h-[14px] w-[14px]" />
              <span className="text-white/90 line-clamp-1">
                What is Spiritual Awakening? Signs, Stages & How to Embrace It
              </span>
            </nav>

            {/* Category Badge */}
            <span className="mt-[16px] inline-block rounded-full bg-[#833ab4]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#c084fc]">
              Spirituality
            </span>

            {/* Title */}
            <h1 className="mt-[12px] font-display text-[28px] leading-[1.25] font-bold text-white sm:text-[36px] lg:text-[42px]">
              What is Spiritual Awakening?
              <br className="hidden sm:block" />
              Signs, Stages & How to Embrace It
            </h1>

            {/* Excerpt */}
            <p className="mt-[16px] max-w-[580px] text-[14.5px] leading-[1.7] text-white/80">
              {ARTICLE.excerpt}
            </p>

            {/* Author + Meta + Share */}
            <div className="mt-[20px] flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={ARTICLE.authorAvatar}
                  alt={ARTICLE.author}
                  width={80}
                  height={80}
                  className="h-[40px] w-[40px] rounded-full border-2 border-gold/50 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13.5px] font-medium text-white">
                      {ARTICLE.author}
                    </span>
                    <svg
                      className="h-[14px] w-[14px] text-[#4a90d9]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[12.5px] text-white/65">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="h-[14px] w-[14px]" />
                  {ARTICLE.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="h-[14px] w-[14px]" />
                  {ARTICLE.readTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <EyeIcon className="h-[14px] w-[14px]" />
                  {ARTICLE.views}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[12.5px] text-white/65">Share:</span>
                {[
                  {
                    platform: "WhatsApp",
                    Icon: WhatsAppIcon,
                    bg: "bg-[#25D366]",
                  },
                  {
                    platform: "Facebook",
                    Icon: FacebookIcon,
                    bg: "bg-[#3b5998]",
                  },
                  {
                    platform: "Twitter",
                    Icon: TwitterIcon,
                    bg: "bg-[#1DA1F2]",
                  },
                  {
                    platform: "Copy Link",
                    Icon: linkCopied ? CheckCircleFilledIcon : LinkIcon,
                    bg: "bg-white/20",
                  },
                ].map(({ platform, Icon, bg }) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handleShare(platform)}
                    aria-label={`Share on ${platform}`}
                    className={`flex h-[32px] w-[32px] items-center justify-center rounded-full ${bg} text-white transition-opacity hover:opacity-80`}
                  >
                    <Icon className="h-[14px] w-[14px]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="bg-[#fdf8f0]">
          <div className="mx-auto w-full max-w-[1336px] px-5 py-[30px] sm:py-[40px]">
            <div className="grid grid-cols-1 gap-[36px] lg:grid-cols-[1fr_320px]">
              {/* LEFT COLUMN - Article */}
              <article>
                {/* Hero Image */}
                <div className="relative h-[240px] overflow-hidden rounded-[14px] sm:h-[380px]">
                  <Image
                    src={ARTICLE.heroImage}
                    alt={ARTICLE.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Intro Paragraph */}
                <p className="mt-[24px] text-[15px] leading-[1.85] text-[#3d3c4a]">
                  Spiritual awakening is a profound shift in consciousness. It
                  is the moment when you start seeing beyond the material world
                  and connect with your inner self. It is not about adopting a
                  religion, but about discovering the truth within you.
                </p>

                {/* Lotus Divider */}
                <div className="my-[28px] flex justify-center text-gold">
                  <LotusSolidIcon className="h-[22px] w-[22px]" />
                </div>

                {/* Section 1 */}
                <section
                  id="section-0"
                  ref={(el) => {
                    sectionRefs.current[0] = el;
                  }}
                  className="flex items-start gap-4 scroll-mt-24"
                >
                  <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#6b3fa0]/10 text-[#6b3fa0]">
                    <StarIcon className="h-[22px] w-[22px]" />
                  </span>
                  <div>
                    <h2 className="font-display text-[20px] font-bold text-[#2c0c47] sm:text-[22px]">
                      1. What is Spiritual Awakening?
                    </h2>
                    <p className="mt-[12px] text-[14.5px] leading-[1.8] text-[#4a4956]">
                      Spiritual awakening is the process of becoming aware of
                      your higher self and realizing that there is more to life
                      than what meets the eye. It brings clarity, purpose, and a
                      deep sense of connection with the universe.
                    </p>
                  </div>
                </section>

                {/* Section 2 */}
                <section
                  id="section-1"
                  ref={(el) => {
                    sectionRefs.current[1] = el;
                  }}
                  className="mt-[32px] flex items-start gap-4 scroll-mt-24"
                >
                  <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#e9b85c]/15 text-[#b5711a]">
                    <EyeIcon className="h-[22px] w-[22px]" />
                  </span>
                  <div>
                    <h2 className="font-display text-[20px] font-bold text-[#2c0c47] sm:text-[22px]">
                      2. Signs of Spiritual Awakening
                    </h2>
                    <p className="mt-[12px] text-[14.5px] leading-[1.8] text-[#4a4956]">
                      Everyone&apos;s journey is unique, but here are some
                      common signs:
                    </p>
                    <div className="mt-[16px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
                      {SIGNS.map((sign) => (
                        <div key={sign} className="flex items-center gap-2.5">
                          <CheckCircleIcon className="h-[16px] w-[16px] shrink-0 text-[#25D366]" />
                          <span className="text-[13.5px] text-[#4a4956]">
                            {sign}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Section 3 - Stages */}
                <section
                  id="section-2"
                  ref={(el) => {
                    sectionRefs.current[2] = el;
                  }}
                  className="mt-[32px] flex items-start gap-4 scroll-mt-24"
                >
                  <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#4a90d9]/10 text-[#4a90d9]">
                    <BookOpenIcon className="h-[22px] w-[22px]" />
                  </span>
                  <div className="flex-1">
                    <h2 className="font-display text-[20px] font-bold text-[#2c0c47] sm:text-[22px]">
                      3. Stages of Spiritual Awakening
                    </h2>
                    <p className="mt-[12px] text-[14.5px] leading-[1.8] text-[#4a4956]">
                      Spiritual awakening happens in different stages. You may
                      experience them in a unique order.
                    </p>

                    {/* Stages Cards */}
                    <div className="mt-[20px] grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-5">
                      {STAGES.map(
                        ({ number, title, description, icon: Icon }) => (
                          <div
                            key={number}
                            className="flex flex-col items-center rounded-[12px] border border-[#e8e2d8] bg-white p-[16px] text-center"
                          >
                            <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#6b3fa0]/10 text-[#6b3fa0]">
                              <Icon className="h-[20px] w-[20px]" />
                            </span>
                            <p className="mt-[8px] text-[11px] font-medium text-[#9a98a5]">
                              {number}
                            </p>
                            <p className="mt-[2px] text-[13px] font-bold text-[#2c0c47]">
                              {title}
                            </p>
                            <p className="mt-[4px] text-[11px] leading-[1.5] text-[#6c6b78]">
                              {description}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </section>

                {/* Section 4 - How to Embrace */}
                <section
                  id="section-3"
                  ref={(el) => {
                    sectionRefs.current[3] = el;
                  }}
                  className="mt-[32px] flex items-start gap-4 scroll-mt-24"
                >
                  <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#1a8a4a]">
                    <HeartIcon className="h-[22px] w-[22px]" />
                  </span>
                  <div className="flex-1">
                    <h2 className="font-display text-[20px] font-bold text-[#2c0c47] sm:text-[22px]">
                      4. How to Embrace Spiritual Awakening
                    </h2>

                    <div className="mt-[16px] flex flex-col gap-[16px] sm:flex-row sm:items-start sm:gap-[24px]">
                      <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-[12px] sm:h-[200px] sm:w-[280px]">
                        <Image
                          src="https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&q=80"
                          alt="Spiritual practices"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-[10px]">
                        {HOW_TO_EMBRACE.map((tip) => (
                          <div key={tip} className="flex items-center gap-2.5">
                            <CheckCircleIcon className="h-[16px] w-[16px] shrink-0 text-[#25D366]" />
                            <span className="text-[13.5px] text-[#4a4956]">
                              {tip}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Conclusion / Section 5 */}
                <section
                  id="section-4"
                  ref={(el) => {
                    sectionRefs.current[4] = el;
                  }}
                  className="mt-[32px] scroll-mt-24"
                >
                  <p className="text-[14.5px] leading-[1.85] text-[#3d3c4a]">
                    Spiritual awakening is not the end of the journey, but the
                    beginning of a beautiful transformation. Embrace it with an
                    open heart and let the universe guide you towards your
                    highest good.
                  </p>
                </section>

                {/* Section 6 - Final Thoughts (using section-5 ref) */}
                <div
                  id="section-5"
                  ref={(el) => {
                    sectionRefs.current[5] = el;
                  }}
                  className="mt-[28px] scroll-mt-24"
                >
                  {/* Tags */}
                  <div className="mt-[28px] flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium text-[#2c0c47]">
                      Tags:
                    </span>
                    {TAGS.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?category=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-[#e8e2d8] bg-white px-3 py-1 text-[11.5px] text-[#6c6b78] transition-colors hover:border-[#6b3fa0] hover:text-[#6b3fa0]"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>

              {/* RIGHT SIDEBAR */}
              <aside className="space-y-[24px]">
                {/* Table of Contents */}
                <div className="rounded-[14px] border border-[#e8e2d8] bg-white p-[22px]">
                  <h3 className="flex items-center gap-2 font-display text-[17px] font-bold text-[#2c0c47]">
                    <LotusSolidIcon className="h-[18px] w-[18px] text-gold" />
                    Table of Contents
                  </h3>
                  <nav className="mt-[14px] space-y-[10px]">
                    {TABLE_OF_CONTENTS.map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => scrollToSection(index)}
                        className={`flex w-full items-center gap-2.5 text-left text-[13px] transition-colors ${
                          activeTocIndex === index
                            ? "font-semibold text-[#6b3fa0]"
                            : "text-[#5f5e6b] hover:text-[#2c0c47]"
                        }`}
                      >
                        <span
                          className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            activeTocIndex === index
                              ? "bg-[#6b3fa0] text-white"
                              : "bg-[#f0eaf5] text-[#6b3fa0]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        {item}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Author Card */}
                <div className="overflow-hidden rounded-[14px] border border-[#e8e2d8] bg-white">
                  <div className="bg-[radial-gradient(130%_120%_at_50%_20%,#3a1560_0%,#2a0f46_50%,#1b0a2e_100%)] px-[22px] pt-[24px] pb-[40px] text-center">
                    <div className="relative mx-auto h-[72px] w-[72px]">
                      <Image
                        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/t-1.png"
                        alt="Surinder Kaur Sehgal"
                        fill
                        className="rounded-full border-3 border-gold/50 object-cover"
                      />
                    </div>
                    <h3 className="mt-[12px] flex items-center justify-center gap-1.5 text-[16px] font-bold text-white">
                      Surinder Kaur Sehgal
                      <svg
                        className="h-[16px] w-[16px] text-[#4a90d9]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </h3>
                    <p className="mt-[4px] text-[12.5px] text-gold">
                      Spiritual Guide &amp; Healer
                    </p>
                  </div>
                  <div className="relative -mt-[20px] px-[22px] pb-[20px]">
                    <p className="text-center text-[13px] leading-[1.7] text-[#6c6b78]">
                      With 20+ years of experience in Numerology, Tarot, Reiki,
                      Kundali and Vastu, Surinder Kaur Sehgal helps thousands of
                      people transform their lives with divine guidance.
                    </p>
                    <Link
                      href="/about"
                      className="mt-[16px] flex h-[38px] items-center justify-center rounded-[8px] bg-gradient-to-b from-[#c8901f] to-[#a06a12] text-[13px] font-semibold text-white hover:shadow-[0_4px_12px_rgba(200,144,31,0.3)] transition-shadow"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>

                {/* Related Posts */}
                <div className="rounded-[14px] border border-[#e8e2d8] bg-white p-[22px]">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-display text-[17px] font-bold text-[#2c0c47]">
                      <LotusSolidIcon className="h-[16px] w-[16px] text-gold" />
                      Related Posts
                    </h3>
                    <Link
                      href="/blog"
                      className="text-[12px] font-medium text-[#6b3fa0] hover:text-[#4b2583] transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="mt-[14px] space-y-[14px]">
                    {RELATED_POSTS.map((post) => (
                      <Link
                        key={post.title}
                        href={post.slug}
                        className="flex items-start gap-[12px] group"
                      >
                        <div className="relative h-[60px] w-[80px] shrink-0 overflow-hidden rounded-[8px]">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] leading-[1.4] font-medium text-[#2c0c47] line-clamp-2 group-hover:text-[#6b3fa0] transition-colors">
                            {post.title}
                          </h4>
                          <p className="mt-[4px] text-[11px] text-[#9a98a5]">
                            {post.date} &bull; {post.readTime}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="rounded-[14px] border border-[#e8e2d8] bg-white p-[22px]">
                  <h3 className="flex items-center gap-2 font-display text-[17px] font-bold text-[#2c0c47]">
                    <LotusSolidIcon className="h-[16px] w-[16px] text-gold" />
                    Categories
                  </h3>
                  <div className="mt-[14px] space-y-[8px]">
                    {SIDEBAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-[8px] px-[12px] py-[10px] text-left hover:bg-[#faf6fd] transition-colors"
                      >
                        <span className="text-[16px]">{cat.icon}</span>
                        <span className="flex-1 text-[13px] font-medium text-[#2c0c47]">
                          {cat.label}
                        </span>
                        <span className="flex h-[24px] items-center rounded-full bg-[#f0eaf5] px-2.5 text-[11px] font-semibold text-[#6b3fa0]">
                          {cat.count}
                        </span>
                        <ChevronRightIcon className="h-[14px] w-[14px] text-[#c9c5d0]" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="overflow-hidden rounded-[14px] bg-[radial-gradient(130%_120%_at_50%_20%,#3a1560_0%,#2a0f46_50%,#1b0a2e_100%)] p-[22px]">
                  <div className="flex items-center gap-2 text-gold">
                    <LotusSolidIcon className="h-[16px] w-[16px]" />
                  </div>
                  <h3 className="mt-[8px] font-display text-[17px] font-bold text-white">
                    Stay Updated
                    <br />
                    with Spiritual Insights
                  </h3>
                  <p className="mt-[8px] text-[12.5px] leading-[1.6] text-white/70">
                    Subscribe to our newsletter and get the latest articles,
                    offers and updates.
                  </p>
                  {newsletterSubmitted && (
                    <p
                      role="alert"
                      className="mt-2 text-[12px] text-green-400 font-medium"
                    >
                      Subscribed successfully!
                    </p>
                  )}
                  <div className="mt-[14px] space-y-[10px]">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
                      className="h-[40px] w-full rounded-[8px] border border-white/20 bg-white/[0.08] px-3 text-[13px] text-white placeholder-white/50 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleNewsletter}
                      className="flex h-[40px] w-full items-center justify-center gap-2 rounded-[8px] bg-gradient-to-b from-gold-2 to-gold-3 text-[13px] font-semibold text-[#2b0a3d]"
                    >
                      Subscribe
                      <SendIcon className="h-[13px] w-[13px]" />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative overflow-hidden bg-[#0c0620] text-white">
          <div className="haze pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[40px] pb-[24px]">
            <div className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-[220px_1fr_1fr_1fr_1fr]">
              {/* Brand Column */}
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <Image
                  src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/logo-footer.png"
                  alt={SITE_NAME}
                  width={460}
                  height={460}
                  className="h-[70px] w-auto object-contain"
                />
                <p className="mt-[12px] max-w-[200px] text-[11.5px] leading-[1.65] text-white/75">
                  Empowering lives with divine guidance through Numerology,
                  Tarot, Reiki, Kundali &amp; more.
                </p>
                <div className="mt-[16px] flex items-center gap-[10px]">
                  {SOCIAL_LINKS.map(({ label, Icon, bg, href }) => (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`flex h-[28px] w-[28px] items-center justify-center rounded-full ${bg} hover:opacity-80 transition-opacity`}
                    >
                      <Icon className="h-[14px] w-[14px] text-white" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Quick Links
                </h3>
                <ul className="space-y-[8px]">
                  {[
                    { label: "Home", href: "/" },
                    { label: "About Us", href: "/about" },
                    { label: "Services", href: "/services" },
                    { label: "Consultations", href: "/consultation" },
                    { label: "Software Hub", href: "/software-hub" },
                    { label: "Blog", href: "/blog" },
                    { label: "Contact Us", href: "/contact" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-[12px] text-white/75 transition-colors hover:text-gold"
                      >
                        <span className="h-[5px] w-[5px] shrink-0 rotate-45 bg-gold/70" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Our Services */}
              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Our Services
                </h3>
                <ul className="space-y-[8px]">
                  {[
                    {
                      label: "Numerology",
                      href: "/services/numerology-services",
                    },
                    { label: "Tarot Reading", href: "/services/tarot-reading" },
                    { label: "Reiki Healing", href: "/services/reiki-healing" },
                    { label: "Kundali Analysis", href: "/services" },
                    { label: "Vastu Consultation", href: "/services" },
                    { label: "All Services", href: "/services" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-[12px] text-white/75 transition-colors hover:text-gold"
                      >
                        <span className="h-[5px] w-[5px] shrink-0 rotate-45 bg-gold/70" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Resources
                </h3>
                <ul className="space-y-[8px]">
                  {[
                    { label: "Blogs", href: "/blog" },
                    { label: "FAQs", href: "/contact" },
                    { label: "Testimonials", href: "/about" },
                    { label: "Terms & Conditions", href: "/contact" },
                    { label: "Privacy Policy", href: "/contact" },
                    { label: "Refund Policy", href: "/contact" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-[12px] text-white/75 transition-colors hover:text-gold"
                      >
                        <span className="h-[5px] w-[5px] shrink-0 rotate-45 bg-gold/70" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Contact Info
                </h3>
                <ul className="space-y-[10px]">
                  <li className="flex items-center gap-2.5 text-[12px] text-white/80">
                    <MapPinIcon className="h-[14px] w-[14px] shrink-0 text-gold" />
                    Indore, Madhya Pradesh, India
                  </li>
                  <li className="flex items-center gap-2.5 text-[12px] text-white/80">
                    <PhoneIcon className="h-[14px] w-[14px] shrink-0 text-gold" />
                    +91 70004 12345
                  </li>
                  <li className="flex items-center gap-2.5 text-[12px] text-white/80">
                    <MailIcon className="h-[14px] w-[14px] shrink-0 text-gold" />
                    {CONTACT_EMAIL}
                  </li>
                  <li className="flex items-center gap-2.5 text-[12px] text-white/80">
                    <ClockIcon className="h-[14px] w-[14px] shrink-0 text-gold" />
                    Mon - Sat | 10 AM - 7 PM
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="relative border-t border-white/10">
            <div className="mx-auto flex w-full max-w-[1336px] items-center justify-center px-5 py-[14px]">
              <p className="text-[12px] text-white/65">
                &copy; {new Date().getFullYear()} {SITE_NAME}. All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className="fixed right-6 bottom-6 z-40 flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#2c0c47] text-white shadow-[0_4px_14px_rgba(44,12,71,0.35)] hover:bg-[#1e0a38] transition-colors"
      >
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </>
  );
}
