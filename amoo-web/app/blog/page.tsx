"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { HomeHeader, OfferBar } from "../components/home-header";
import {
  ArrowRightIcon,
  CalendarIcon,
  LotusSolidIcon,
} from "../components/home-icons";
import { WHATSAPP_URL, CONTACT_EMAIL, SITE_NAME } from "../../lib/constants";
import { api } from "../../lib/api";
import { sanitize } from "../../lib/sanitize";
import {
  SearchIcon,
  GridIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  ClockIcon,
  SendIcon,
  ChevronRightIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  WhatsAppIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
} from "./icons";

/* ---------------- Data ---------------- */

const CATEGORIES = [
  { label: "All Articles", icon: GridIcon, active: true },
  { label: "Numerology", active: false },
  { label: "Tarot", active: false },
  { label: "Kundali", active: false },
  { label: "Reiki & Healing", active: false },
  { label: "Vastu", active: false },
  { label: "Spirituality", active: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  Numerology: "bg-[#e9b85c]/20 text-[#b5711a]",
  Tarot: "bg-[#6b3fa0]/15 text-[#6b3fa0]",
  Kundali: "bg-[#4a90d9]/15 text-[#4a90d9]",
  "Reiki & Healing": "bg-[#25D366]/15 text-[#1a8a4a]",
  Vastu: "bg-[#e67e22]/15 text-[#c0601a]",
  Spirituality: "bg-[#833ab4]/15 text-[#833ab4]",
};

const POPULAR_ARTICLES = [
  {
    title: "Life Path Numbers 1 to 9: Meaning and Characteristics",
    date: "May 12, 2025",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&q=80",
  },
  {
    title: "How Tarot Cards Can Guide You in Daily Life",
    date: "May 10, 2025",
    image:
      "https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=200&q=80",
  },
  {
    title: "Understanding Your Kundali: Planets & Their Impact",
    date: "May 8, 2025",
    image:
      "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=200&q=80",
  },
  {
    title: "Reiki Healing Benefits for Mind, Body and Soul",
    date: "May 5, 2025",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80",
  },
  {
    title: "Vastu Tips for Wealth, Health and Happiness",
    date: "May 3, 2025",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&q=80",
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

const ITEMS_PER_PAGE = 6;

/* ---------------- Types ---------------- */

interface BlogArticle {
  slug: string;
  title: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  author?: string;
  authorAvatar?: string;
  excerpt?: string;
}

interface BlogApiResponse {
  data?: BlogArticle[];
  meta?: { total?: number; totalPages?: number };
}

/* ---------------- Page ---------------- */

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All Articles");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<BlogArticle | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [totalFromApi, setTotalFromApi] = useState(0);
  const [totalPagesFromApi, setTotalPagesFromApi] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== "All Articles")
      params.set("category", activeCategory);
    if (searchQuery.trim()) params.set("search", searchQuery);
    params.set("page", String(currentPage));
    params.set("pageSize", String(ITEMS_PER_PAGE));
    const query = `?${params.toString()}`;
    api
      .getBlogs(query)
      .then((res: BlogApiResponse | BlogArticle[]) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setArticles(list as BlogArticle[]);
        setTotalFromApi(!Array.isArray(res) ? (res?.meta?.total ?? 0) : 0);
        setTotalPagesFromApi(
          !Array.isArray(res) ? (res?.meta?.totalPages ?? 1) : 1,
        );
      })
      .catch(() => {
        setArticles([]);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery, currentPage]);

  const totalPages = totalPagesFromApi;
  const safePage = Math.min(currentPage, totalPages);

  const toggleBookmark = useCallback((title: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }, []);

  function handleSidebarCategory(category: string) {
    setActiveCategory(category);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const showFeatured =
    featuredArticle && activeCategory === "All Articles" && !searchQuery.trim();

  if (loading) {
    return (
      <>
        <OfferBar />
        <HomeHeader absolute={false} />
        <main
          id="main-content"
          className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#fdf8f0]"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#6d28d9]" />
        </main>
      </>
    );
  }

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      <main id="main-content" className="flex-1 overflow-x-hidden">
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

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[40px] pb-[50px] sm:pt-[50px] sm:pb-[60px] lg:pt-[60px] lg:pb-[70px]">
            <nav className="flex items-center gap-2 text-[13px] text-white/70">
              <Link href="/" className="hover:text-gold transition-colors">
                Home
              </Link>
              <ChevronRightIcon className="h-[14px] w-[14px]" />
              <span className="text-white/90">Blog</span>
            </nav>

            <h1 className="mt-[16px] font-display text-[36px] leading-[1.2] font-bold text-white sm:text-[48px] lg:text-[56px]">
              {SITE_NAME} <span className="text-gold italic">Blog</span>
            </h1>

            <div className="mt-[8px] flex items-center gap-2 text-gold">
              <span className="block h-px w-[25px] bg-gold/60" />
              <LotusSolidIcon className="h-[14px] w-[14px]" />
              <span className="block h-px w-[25px] bg-gold/60" />
            </div>

            <p className="mt-[18px] max-w-[480px] text-[15px] leading-[1.7] text-white/85">
              Explore spiritual wisdom, astrology insights, and practical
              guidance to transform your life.
            </p>

            <div className="mt-[24px] flex max-w-[380px] items-center rounded-[10px] border border-white/20 bg-white/[0.08] backdrop-blur-sm">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[46px] flex-1 bg-transparent px-4 text-[14px] text-white placeholder-white/50 outline-none"
              />
              <button
                type="submit"
                onClick={(e) => e.preventDefault()}
                className="flex h-[46px] w-[46px] items-center justify-center text-white/70 hover:text-gold transition-colors"
              >
                <SearchIcon className="h-[20px] w-[20px]" />
              </button>
            </div>

            {(searchQuery || activeCategory !== "All Articles") && (
              <p className="mt-3 text-[13px] text-white/60">
                Found {totalFromApi} article
                {totalFromApi !== 1 ? "s" : ""}
                {searchQuery && ` for "${searchQuery}"`}
                {activeCategory !== "All Articles" && ` in ${activeCategory}`}
              </p>
            )}
          </div>
        </section>

        {/* CATEGORY TABS */}
        <section className="bg-[#fdf8f0] border-b border-[#e8e2d8]">
          <div className="mx-auto w-full max-w-[1336px] px-5">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-[16px]">
              {CATEGORIES.map(({ label, icon: Icon }) => {
                const isActive = activeCategory === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setActiveCategory(label);
                      setCurrentPage(1);
                    }}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-[18px] py-[9px] text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-[#2c0c47] text-white shadow-[0_2px_8px_rgba(44,12,71,0.2)]"
                        : "bg-white text-[#5f5e6b] border border-[#e8e2d8] hover:border-[#c9b89a] hover:text-[#2c0c47]"
                    }`}
                  >
                    {Icon && <Icon className="h-[14px] w-[14px]" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="bg-[#fdf8f0]">
          <div className="mx-auto w-full max-w-[1336px] px-5 py-[30px] sm:py-[40px]">
            <div className="grid grid-cols-1 gap-[36px] lg:grid-cols-[1fr_320px]">
              {/* LEFT COLUMN */}
              <div>
                {showFeatured && (
                  <article className="overflow-hidden rounded-[14px] border border-[#e8e2d8] bg-white sm:flex">
                    <div className="relative h-[220px] shrink-0 sm:h-auto sm:w-[380px]">
                      <Image
                        src={featuredArticle.image}
                        alt={sanitize(featuredArticle.title)}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute left-[14px] top-[14px] rounded-full bg-[#25D366] px-3 py-1 text-[11px] font-semibold text-white">
                        Featured
                      </span>
                    </div>
                    <div className="flex flex-col justify-center p-[24px]">
                      <span
                        className={`inline-block w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                          CATEGORY_COLORS[featuredArticle.category] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {featuredArticle.category}
                      </span>
                      <h2 className="mt-[12px] font-display text-[20px] leading-[1.35] font-bold text-[#2c0c47] sm:text-[22px]">
                        {sanitize(featuredArticle.title)}
                      </h2>
                      <p className="mt-[12px] text-[13.5px] leading-[1.7] text-[#6c6b78]">
                        {sanitize(featuredArticle.excerpt)}
                      </p>
                      <div className="mt-[16px] flex items-center gap-3">
                        <Image
                          src={featuredArticle.authorAvatar ?? ""}
                          alt={featuredArticle.author ?? ""}
                          width={80}
                          height={80}
                          className="h-[36px] w-[36px] rounded-full border-2 border-gold/50 object-cover"
                        />
                        <div>
                          <p className="text-[13px] font-medium text-[#2c0c47]">
                            {featuredArticle.author}
                          </p>
                          <p className="text-[11.5px] text-[#9a98a5]">
                            {featuredArticle.date} &bull;{" "}
                            {featuredArticle.readTime}
                          </p>
                        </div>
                        <Link
                          href={`/blog/${featuredArticle.slug}`}
                          className="ml-auto flex items-center gap-1.5 text-[13px] font-semibold text-[#6b3fa0] hover:text-[#4b2583] transition-colors"
                        >
                          Read More
                          <ArrowRightIcon className="h-[14px] w-[14px]" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )}

                {articles.length === 0 ? (
                  <div className="mt-[40px] flex flex-col items-center justify-center rounded-[14px] border border-[#e8e2d8] bg-white py-[60px] text-center">
                    <SearchIcon className="h-[40px] w-[40px] text-[#c9c5d0]" />
                    <h3 className="mt-[16px] font-display text-[18px] font-bold text-[#2c0c47]">
                      No articles found
                    </h3>
                    <p className="mt-[8px] text-[13px] text-[#6c6b78]">
                      Try adjusting your search or category filter.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("All Articles");
                      }}
                      className="mt-[16px] rounded-[8px] bg-[#2c0c47] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#1e0a38] transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="mt-[28px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                      <Link
                        key={sanitize(article.title)}
                        href={`/blog/${article.slug}`}
                        className="group overflow-hidden rounded-[12px] border border-[#e8e2d8] bg-white transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                      >
                        <div className="relative h-[170px] overflow-hidden">
                          <Image
                            src={article.image}
                            alt={sanitize(article.title)}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-[18px]">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${
                              CATEGORY_COLORS[article.category] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {article.category}
                          </span>
                          <h3 className="mt-[10px] text-[14.5px] leading-[1.45] font-semibold text-[#2c0c47] line-clamp-2">
                            {sanitize(article.title)}
                          </h3>
                          <div className="mt-[12px] flex items-center justify-between">
                            <p className="text-[11.5px] text-[#9a98a5]">
                              {article.date} &bull; {article.readTime}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleBookmark(article.title);
                              }}
                              className={`transition-colors ${
                                bookmarks.has(article.title)
                                  ? "text-[#6b3fa0]"
                                  : "text-[#c9c5d0] hover:text-[#6b3fa0]"
                              }`}
                              aria-label={
                                bookmarks.has(article.title)
                                  ? "Remove bookmark"
                                  : "Bookmark article"
                              }
                            >
                              {bookmarks.has(article.title) ? (
                                <BookmarkFilledIcon className="h-[16px] w-[16px]" />
                              ) : (
                                <BookmarkIcon className="h-[16px] w-[16px]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-[32px] flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`flex h-[36px] w-[36px] items-center justify-center rounded-[8px] text-[13px] font-medium transition-all ${
                            safePage === page
                              ? "bg-[#2c0c47] text-white shadow-[0_2px_8px_rgba(44,12,71,0.2)]"
                              : "bg-white text-[#6c6b78] border border-[#e8e2d8] hover:border-[#c9b89a]"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(p + 1, totalPages));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-[#e8e2d8] bg-white text-[#6c6b78] hover:border-[#c9b89a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowRightIcon className="h-[14px] w-[14px]" />
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT SIDEBAR */}
              <aside className="space-y-[24px]">
                <div className="rounded-[14px] border border-[#e8e2d8] bg-white p-[22px]">
                  <h3 className="font-display text-[18px] font-bold text-[#2c0c47]">
                    About {SITE_NAME}
                  </h3>
                  <p className="mt-[10px] text-[13px] leading-[1.7] text-[#6c6b78]">
                    {SITE_NAME} is a spiritual platform providing guidance
                    through Numerology, Tarot, Reiki, Kundali, Vastu and more.
                    Our mission is to help you find clarity, peace and purpose
                    in life.
                  </p>
                  <Link
                    href="/consultation"
                    className="mt-[16px] flex h-[40px] items-center justify-center gap-2 rounded-[8px] bg-[#2c0c47] text-[13px] font-semibold text-white hover:bg-[#1e0a38] transition-colors"
                  >
                    Book a Consultation
                    <CalendarIcon className="h-[15px] w-[15px]" />
                  </Link>
                </div>

                <div className="rounded-[14px] border border-[#e8e2d8] bg-white p-[22px]">
                  <h3 className="font-display text-[18px] font-bold text-[#2c0c47]">
                    Popular Articles
                  </h3>
                  <div className="mt-[16px] space-y-[16px]">
                    {POPULAR_ARTICLES.map((article, index) => (
                      <div
                        key={sanitize(article.title)}
                        className="flex items-start gap-[14px]"
                      >
                        <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#f0eaf5] text-[12px] font-bold text-[#6b3fa0]">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] leading-[1.45] font-medium text-[#2c0c47] line-clamp-2">
                            {sanitize(article.title)}
                          </h4>
                          <p className="mt-[4px] text-[11px] text-[#9a98a5]">
                            {article.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[14px] border border-[#e8e2d8] bg-white p-[22px]">
                  <h3 className="font-display text-[18px] font-bold text-[#2c0c47]">
                    Categories
                  </h3>
                  <div className="mt-[16px] space-y-[10px]">
                    {SIDEBAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => handleSidebarCategory(cat.label)}
                        className={`flex w-full items-center gap-3 rounded-[8px] px-[12px] py-[10px] text-left transition-colors ${
                          activeCategory === cat.label
                            ? "bg-[#f0eaf5] border border-[#c9b89a]"
                            : "hover:bg-[#faf6fd]"
                        }`}
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
              </aside>
            </div>
          </div>
        </section>

        {/* NEWSLETTER SECTION */}
        <section className="relative overflow-hidden bg-[radial-gradient(130%_140%_at_50%_30%,#3a1560_0%,#2a0f46_50%,#1b0a2e_100%)]">
          <div className="haze pointer-events-none absolute inset-0 opacity-40" />

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 opacity-25 md:opacity-40">
            <Image
              src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/lotus_candles_no_bg.png"
              alt={SITE_NAME}
              width={460}
              height={460}
              className="h-[120px] w-auto object-contain"
            />
          </div>

          <div className="relative mx-auto flex w-full max-w-[1336px] flex-col items-center gap-[24px] px-5 py-[40px] sm:flex-row sm:justify-between sm:py-[48px]">
            <div className="max-w-[480px] text-center sm:text-left">
              <h2 className="font-display text-[22px] font-bold text-white sm:text-[24px] lg:text-[26px]">
                Stay Updated with Spiritual Insights
              </h2>
              <p className="mt-[8px] text-[13.5px] leading-[1.65] text-white/75">
                Subscribe to our newsletter and never miss new articles, offers
                and spiritual updates.
              </p>
              {newsletterSubmitted && (
                <p
                  role="alert"
                  className="mt-2 text-[13px] text-green-400 font-medium"
                >
                  Subscribed successfully! Thank you.
                </p>
              )}
            </div>
            <div className="flex w-full max-w-[400px] items-center rounded-[10px] border border-white/20 bg-white/[0.08] backdrop-blur-sm sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
                className="h-[46px] flex-1 bg-transparent px-4 text-[13.5px] text-white placeholder-white/50 outline-none sm:w-[260px]"
              />
              <button
                type="button"
                onClick={handleNewsletter}
                className="flex h-[46px] items-center gap-2 rounded-[10px] bg-gradient-to-b from-gold-2 to-gold-3 px-5 text-[13.5px] font-semibold text-[#2b0a3d] hover:shadow-[0_4px_12px_rgba(233,184,92,0.3)] transition-shadow"
              >
                Subscribe
                <SendIcon className="h-[14px] w-[14px]" />
              </button>
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
