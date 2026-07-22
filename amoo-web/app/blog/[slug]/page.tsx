"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { HomeHeader, OfferBar } from "../../components/home-header";
import { ArrowRightIcon, LotusSolidIcon } from "../../components/home-icons";
import { WHATSAPP_URL, CONTACT_EMAIL, SITE_NAME } from "../../../lib/constants";
import api from "../../../lib/api";
import {
  ChevronRightIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  WhatsAppIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
} from "../icons";

/* ---------------- Types ---------------- */

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  image?: string;
  author?: string;
  authorAvatar?: string;
  date?: string;
  readTime?: string;
}

/* ---------------- Constants ---------------- */

const CATEGORY_COLORS: Record<string, string> = {
  Numerology: "bg-[#e9b85c]/20 text-[#b5711a]",
  Tarot: "bg-[#6b3fa0]/15 text-[#6b3fa0]",
  Kundali: "bg-[#4a90d9]/15 text-[#4a90d9]",
  "Reiki & Healing": "bg-[#25D366]/15 text-[#1a8a4a]",
  Vastu: "bg-[#e67e22]/15 text-[#c0601a]",
  Spirituality: "bg-[#833ab4]/15 text-[#833ab4]",
};

const SOCIAL_LINKS = [
  { label: "Facebook", Icon: FacebookIcon, bg: "bg-[#3b5998]", href: "https://facebook.com/amoooguru" },
  {
    label: "Instagram",
    Icon: InstagramIcon,
    bg: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    href: "https://instagram.com/amooguru_official",
  },
  { label: "YouTube", Icon: YoutubeIcon, bg: "bg-[#ff0000]", href: "https://youtube.com/@amoooguru" },
  { label: "WhatsApp", Icon: WhatsAppIcon, bg: "bg-[#25D366]", href: WHATSAPP_URL },
  { label: "Telegram", Icon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ), bg: "bg-[#0088cc]", href: "https://t.me/amoooguru" },
];

/* ---------------- Page ---------------- */

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    api
      .getBlogPost(slug)
      .then((data) => {
        if (!cancelled) {
          setPost(data as BlogPost);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <>
        <OfferBar />
        <HomeHeader absolute={false} />
        <main className="flex flex-1 items-center justify-center bg-[#fdf8f0] py-[120px]">
          <Loader2 className="h-10 w-10 animate-spin text-[#6b3fa0]" />
        </main>
      </>
    );
  }

  /* ---------- Error ---------- */
  if (error || !post) {
    return (
      <>
        <OfferBar />
        <HomeHeader absolute={false} />
        <main className="flex flex-1 items-center justify-center bg-[#fdf8f0] py-[120px]">
          <div className="text-center">
            <h1 className="font-display text-[32px] font-bold text-[#2c0c47]">
              Post Not Found
            </h1>
            <p className="mt-3 text-[15px] text-[#6c6b78]">
              The article you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 rounded-[8px] bg-[#2c0c47] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#1e0a38] transition-colors"
            >
              <ArrowRightIcon className="h-[14px] w-[14px] rotate-180" />
              Back to Blog
            </Link>
          </div>
        </main>
      </>
    );
  }

  /* ---------- Render ---------- */

  const formattedDate =
    post.date ||
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const readTime = post.readTime || "5 min read";
  const category = post.category || "Spirituality";
  const author = post.author || SITE_NAME;
  const badgeClass =
    CATEGORY_COLORS[category] || "bg-gray-100 text-gray-600";

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[radial-gradient(130%_140%_at_20%_50%,#2d0f4f_0%,#1e0a38_45%,#130525_100%)]">
          <div className="haze pointer-events-none absolute inset-0 opacity-50" />

          {post.image && (
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover object-center opacity-30"
              priority
            />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,#1c0730_0%,rgba(28,7,48,0.95)_15%,rgba(28,7,48,0.6)_40%,rgba(28,7,48,0.2)_60%)]" />

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[40px] pb-[50px] sm:pt-[50px] sm:pb-[60px] lg:pt-[60px] lg:pb-[70px]">
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
              <span className="text-white/90">{category}</span>
              <ChevronRightIcon className="h-[14px] w-[14px]" />
              <span className="max-w-[260px] truncate text-white/60">
                {post.title}
              </span>
            </nav>

            {/* Category badge */}
            <span
              className={`mt-[20px] inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${badgeClass}`}
            >
              {category}
            </span>

            {/* Title */}
            <h1 className="mt-[14px] max-w-[760px] font-display text-[30px] leading-[1.25] font-bold text-white sm:text-[40px] lg:text-[48px]">
              {post.title}
            </h1>

            <div className="mt-[12px] flex items-center gap-2 text-gold">
              <span className="block h-px w-[25px] bg-gold/60" />
              <LotusSolidIcon className="h-[14px] w-[14px]" />
              <span className="block h-px w-[25px] bg-gold/60" />
            </div>

            {/* Meta */}
            <div className="mt-[18px] flex flex-wrap items-center gap-4 text-[13px] text-white/80">
              {post.authorAvatar && (
                <div className="flex items-center gap-2.5">
                  <Image
                    src={post.authorAvatar}
                    alt={author}
                    width={80}
                    height={80}
                    className="h-[32px] w-[32px] rounded-full border-2 border-gold/50 object-cover"
                  />
                  <span className="font-medium text-white">{author}</span>
                </div>
              )}
              {!post.authorAvatar && (
                <span className="font-medium text-white">{author}</span>
              )}
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-[14px] w-[14px]" />
                {readTime}
              </span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </section>

        {/* ARTICLE CONTENT */}
        <section className="bg-[#fdf8f0]">
          <div className="mx-auto w-full max-w-[780px] px-5 py-[40px] sm:py-[56px]">
            {post.excerpt && (
              <p className="mb-[28px] text-[16px] leading-[1.75] font-medium italic text-[#6c6b78] border-l-4 border-gold pl-5">
                {post.excerpt}
              </p>
            )}

            <article
              className="prose prose-lg max-w-none
                prose-headings:font-display prose-headings:text-[#2c0c47]
                prose-p:text-[#6c6b78] prose-p:leading-[1.8]
                prose-a:text-[#6b3fa0] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[#2c0c47]
                prose-img:rounded-[12px]
                prose-blockquote:border-gold prose-blockquote:text-[#6c6b78]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Back link */}
            <div className="mt-[48px] border-t border-[#e8e2d8] pt-[28px]">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#2c0c47] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#1e0a38] transition-colors"
              >
                <ArrowRightIcon className="h-[14px] w-[14px] rotate-180" />
                Back to Blog
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative overflow-hidden bg-[#0c0620] text-white">
          <div className="haze pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[40px] pb-[24px]">
            <div className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-[220px_1fr_1fr_1fr_1fr]">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <Image
                  src="/images/logo-footer.png"
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

              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Our Services
                </h3>
                <ul className="space-y-[8px]">
                  {[
                    { label: "Numerology", href: "/services/numerology-services" },
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

              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Resources
                </h3>
                <ul className="space-y-[8px]">
                  {[
                    { label: "Blogs", href: "/blog" },
                    { label: "FAQs", href: "/faq" },
                    { label: "Testimonials", href: "/about" },
                    { label: "Terms & Conditions", href: "/terms" },
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Refund Policy", href: "/refund" },
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

          <div className="relative border-t border-white/10">
            <div className="mx-auto flex w-full max-w-[1336px] items-center justify-center px-5 py-[14px]">
              <p className="text-[12px] text-white/65">
                &copy; 2025 {SITE_NAME}. All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>

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
