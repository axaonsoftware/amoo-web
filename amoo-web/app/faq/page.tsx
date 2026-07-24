"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OfferBar, HomeHeader } from "@/app/components/home-header";
import { SiteFooter } from "@/app/components/site-footer";
import { api } from "@/lib/api";
import { WHATSAPP_URL } from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { sanitize } from "../../lib/sanitize";

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

const FALLBACK_FAQS: Faq[] = [
  { id: 1, question: "What services does Amoo Guru offer?", answer: "We offer Numerology, Tarot Reading, Reiki Healing, Kundali Analysis, Chakra Healing, and Spiritual Guidance consultations via Audio Call, Video Call, Chat, Distance Healing, and In-Person meetings.", category: "General", sort_order: 1 },
  { id: 2, question: "How do I book a consultation?", answer: "Visit our Consultation page, select your preferred service and expert, choose a time slot, and complete the booking. You'll receive confirmation via WhatsApp and email.", category: "Booking", sort_order: 1 },
  { id: 3, question: "What payment methods are accepted?", answer: "We accept UPI, credit/debit cards, net banking, and popular wallets through our secure payment gateway. All transactions are encrypted and safe.", category: "Payment", sort_order: 1 },
  { id: 4, question: "Can I reschedule or cancel my booking?", answer: "Yes, you can reschedule or cancel up to 24 hours before your scheduled consultation. Please check our Cancellation Policy for details.", category: "Booking", sort_order: 2 },
  { id: 5, question: "How does distance healing work?", answer: "Distance healing uses quantum energy transmission techniques. Our certified healers channel healing energy remotely, and you can experience the session from the comfort of your home.", category: "Services", sort_order: 1 },
  { id: 6, question: "Are the consultations confidential?", answer: "Absolutely. All consultations are 100% confidential. We never share your personal information or session details with anyone without your explicit consent.", category: "General", sort_order: 2 },
];

const FaqPage = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(false);

  useEffect(() => {
    api
      .getFaqs()
      .then((data) => {
        setFaqs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setFaqs(FALLBACK_FAQS);
        setError(true);
        setLoading(false);
      });
  }, []);

  const grouped = faqs.reduce<Record<string, Faq[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: "#fdf8f0" }}>
      <OfferBar />
      <HomeHeader />

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1
          className="font-display text-4xl font-bold md:text-5xl"
          style={{ color: "#2c0c47" }}
        >
          Frequently Asked Questions
        </h1>
        <p className="mt-3 font-sans text-base" style={{ color: "#6c6b78" }}>
          Find answers to common questions about our spiritual consultation services
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6b3fa0] border-t-transparent" />
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-10">
              <h2
                className="font-display text-xl font-semibold mb-4"
                style={{ color: "#2c0c47" }}
              >
                {category}
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {items.map((faq) => (
                  <div key={faq.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="flex w-full items-center justify-between px-4 sm:px-6 py-4 text-left transition-colors hover:bg-gray-50"
                    >
                      <span
                        className="font-sans text-sm font-medium pr-4"
                        style={{ color: "#2c0c47" }}
                      >
                        {sanitize(faq.question)}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 transition-transform ${
                          openId === faq.id ? "rotate-180" : ""
                        }`}
                        style={{ color: "#6b3fa0" }}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openId === faq.id ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      <p
                        className="px-6 pb-4 font-sans text-sm leading-relaxed"
                        style={{ color: "#6c6b78" }}
                      >
                        {sanitize(faq.answer)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="mt-16 rounded-xl bg-white p-8 text-center shadow-sm">
          <h2
            className="font-display text-2xl font-semibold"
            style={{ color: "#2c0c47" }}
          >
            Still have questions?
          </h2>
          <p className="mt-3 font-sans text-sm" style={{ color: "#6c6b78" }}>
            Our team is here to help you with any other queries.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#6b3fa0] px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-[#5a3490]"
            >
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="rounded-lg border border-[#6b3fa0] px-6 py-2.5 font-sans text-sm font-medium transition-colors hover:bg-[#6b3fa0] hover:text-white"
              style={{ color: "#6b3fa0" }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
};

export default FaqPage;
