"use client";

import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../../../lib/api";

const FALLBACK = [
  { name: "Neha Sharma", text: "The name correction suggested by Surinder Ji brought amazing changes in my career and confidence." },
  { name: "Rohit Malhotra", text: "Business numerology analysis helped us choose the right name and our growth increased rapidly." },
  { name: "Priya Verma", text: "Personal numerology reading was very accurate. It gave me clarity and peace of mind." },
];

export default function Testimonials() {
  const [items, setItems] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getTestimonials()
      .then((rows: any[]) => {
        if (Array.isArray(rows) && rows.length) {
          setItems(rows.map((r) => ({ name: r.name || "Client", text: r.comment })));
        }
      })
      .catch((err: any) => {
        setError(err?.message || "Failed to load testimonials");
      })
      .finally(() => setLoading(false));
  }, []);

  const TESTIMONIALS = items;

  return (
    <section className="bg-[#FBF6EE] pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="h-px w-8 bg-purple-300" />
          <h2 className="text-2xl sm:text-3xl font-bold text-purple-950">
            What Our Clients Say
          </h2>
          <span className="h-px w-8 bg-purple-300" />
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex w-9 h-9 rounded-full border border-gray-300 items-center justify-center text-gray-500 hover:bg-gray-100 shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {loading ? (
            <div className="flex-1 flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-950 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex-1 text-center py-12">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : (
          <div className="relative grid sm:grid-cols-3 gap-5 flex-1">
            <span className="absolute left-1/2 -top-3 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-500 hidden sm:flex">
              <Quote className="w-3.5 h-3.5" />
            </span>
            {TESTIMONIALS.map(({ name, text }) => (
              <div
                key={name}
                className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shrink-0" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic leading-relaxed mb-4">
                  &ldquo;{text}&rdquo;
                </p>
                <p className="text-purple-950 text-sm font-semibold">— {name}</p>
              </div>
            ))}
          </div>
          )}

          <button className="hidden sm:flex w-9 h-9 rounded-full border border-gray-300 items-center justify-center text-gray-500 hover:bg-gray-100 shrink-0">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
