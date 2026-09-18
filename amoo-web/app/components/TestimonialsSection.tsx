"use client";

import { useApi } from "../../lib/useApi";
import api from "../../lib/api";
import Image from "next/image";
import Link from "next/link";
import type { Testimonial } from "../../lib/types";

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M5.524.467a.4.4 0 0 1 .717 0l1.29 2.615 2.886.42a.4.4 0 0 1 .222.682l-2.088 2.035.492 2.873a.4.4 0 0 1-.58.421L6 7.944l-2.58 1.357a.4.4 0 0 1-.58-.422l.493-2.872L1.247 4.17a.4.4 0 0 1 .205-.68L4.237 3.08 5.524.467Z" />
    </svg>
  );
}

function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <span aria-hidden className="flex items-center gap-1.5">
      <svg
        width="44"
        height="5"
        viewBox="0 0 44 5"
        fill="none"
        className={flip ? "scale-x-[-1]" : ""}
        aria-hidden
      >
        <path
          d="M1 1.5c8 0 4 2.5 12 2.5s8-2.5 16-2.5 8 2.5 14 2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="currentColor"
        aria-hidden
      >
        <path d="M5 0l1.2 3.8L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.2z" />
      </svg>
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
        className={`font-display text-center text-[20px] leading-tight font-bold sm:text-[24px] sm:whitespace-nowrap lg:text-[28px] ${tone === "dark" ? "text-white" : "text-[#2c0c47]"}`}
      >
        {children}
      </h2>
      <Flourish />
    </div>
  );
}

export function TestimonialsSection() {
  const { data: response } = useApi<unknown>(() => api.getTestimonials(), []);

  const items: Testimonial[] = Array.isArray(response)
    ? response
    : Array.isArray((response as { data?: Testimonial[] })?.data)
      ? (response as { data: Testimonial[] }).data
      : [];

  const testimonials = items.slice(0, 4);

  const FALLBACK_AVATAR =
    "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/t-1.png";

  return (
    <section className="relative overflow-hidden rounded-[16px] bg-[radial-gradient(120%_150%_at_50%_40%,#3d1662_0%,#2c1049_50%,#200b36_100%)]">
      <div className="haze pointer-events-none absolute inset-0 opacity-60" />
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-testi-left.png"
        alt=""
        width={174}
        height={423}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[58px] object-cover md:block"
      />
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-testi-right.png"
        alt=""
        width={192}
        height={423}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[64px] object-cover md:block"
      />
      <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[22px] pb-[30px]">
        <Heading tone="dark">What Our Clients Say</Heading>
        <div className="relative mt-[24px] pb-[16px]">
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="flex items-start gap-[14px] rounded-[10px] border border-white/10 bg-white/[0.05] px-[16px] py-[18px]"
              >
                <div className="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-full">
                  <img
                    src={item.avatar || FALLBACK_AVATAR}
                    alt={item.name || "Client"}
                    width={62}
                    height={62}
                    className="h-[62px] w-[62px] shrink-0 rounded-full border-2 border-gold/70 object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-[3px] text-gold">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <StarIcon key={i} className="h-[12px] w-[12px]" />
                    ))}
                  </div>
                  <p className="mt-[10px] text-[11.5px] leading-[1.7] text-white/90">
                    {item.comment}
                  </p>
                  <p className="mt-[10px] text-[11.5px] text-white/75">
                    {item.name}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <Link
            href="/"
            className="absolute -bottom-[4px] left-1/2 flex h-[32px] w-auto -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-[6px] bg-gradient-to-b from-gold-2 to-gold-3 px-5 text-[13px] font-semibold text-[#2b0a3d]"
          >
            View More Reviews
          </Link>
        </div>
      </div>
    </section>
  );
}
