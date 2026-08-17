"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SectionHeading } from "./ServicesGrid";
import {
  ChevronLeftThin,
  ChevronRightThin,
  StarSolidIcon,
} from "../../../components/home-icons";
import { sanitize } from "../../../../lib/sanitize";
import { api } from "../../../../lib/api";

function wrapQuote(text: string, maxLen = 38): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxLen) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur += (cur ? " " : "") + w;
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.length ? lines : [text];
}

export default function Testimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTestimonials()
      .then((rows: any) => {
        const list = Array.isArray(rows) ? rows : (rows?.data ?? []);
        if (list.length) {
          setItems(
            list.map((r: any) => ({
              img:
                r.img ||
                "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/t-1.png",
              quote: wrapQuote(r.comment || r.text || ""),
              name: r.name || "Client",
            })),
          );
        }
      })
      .catch((err: Error) =>
        setError(err?.message || "Failed to load testimonials"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1336px] px-5 pt-[16px] pb-[30px]">
        <SectionHeading>What Our Clients Say</SectionHeading>

        <div className="relative mt-[22px] px-0 lg:px-[52px]">
          <button
            type="button"
            aria-label="Previous testimonial"
            className="absolute top-1/2 left-0 z-10 hidden h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full border border-[#e5d9c4] bg-white text-[#4b2583] shadow-[0_2px_10px_rgba(75,37,131,0.08)] transition-colors hover:bg-lilac lg:flex"
          >
            <ChevronLeftThin className="h-[16px] w-[16px]" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            className="absolute top-1/2 right-0 z-10 hidden h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full border border-[#e5d9c4] bg-white text-[#4b2583] shadow-[0_2px_10px_rgba(75,37,131,0.08)] transition-colors hover:bg-lilac lg:flex"
          >
            <ChevronRightThin className="h-[16px] w-[16px]" />
          </button>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4b2583] border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-[10.5px] text-red-500">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {items.length === 0 ? (
                <p className="col-span-full text-center text-[10.5px] text-[#6c6b78] py-8">
                  No testimonials yet.
                </p>
              ) : (
                items.map(({ img, quote, name }) => (
                  <article
                    key={name}
                    className="flex items-start gap-[14px] rounded-[10px] border border-[#eee4d4] bg-white px-[16px] py-[16px] shadow-[0_2px_14px_rgba(75,37,131,0.06)]"
                  >
                    <Image
                      src={img}
                      alt={name}
                      width={168}
                      height={168}
                      className="h-[46px] w-[46px] shrink-0 rounded-full border-2 border-gold/60 object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-[2px] text-gold">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <StarSolidIcon
                            key={index}
                            className="h-[11px] w-[11px]"
                          />
                        ))}
                      </div>
                      <p className="mt-[8px] text-[10.5px] leading-[1.7] text-[#6c6b78] italic">
                        {quote.map((line: string, i: number) => (
                          <span key={i}>
                            {sanitize(line)}
                            {i < quote.length - 1 ? <br /> : null}
                          </span>
                        ))}
                      </p>
                      <p className="mt-[8px] text-[10.5px] font-semibold text-[#4b2583]">
                        – {sanitize(name)}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
