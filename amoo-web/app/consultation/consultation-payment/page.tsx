"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { loadConsultationData } from "../lib/consultation-storage";
import { resolveService, type ConsultationService } from "../lib/services";
import { HomeHeader, OfferBar } from "../../components/home-header";
import Stepper from "./Stepper";
import PaymentPageHeader from "./PaymentPageHeader";
import PaymentMethodCard from "./PaymentMethodCard";
import CouponCard, { type AppliedCoupon } from "./CouponCard";
import ImportantNotesCard from "./ImportantNotesCard";
import TrustBadges from "./TrustBadges";
import BookingSummary from "./BookingSummary";
import { NeedHelpCard, SecurePaymentCard } from "./SideInfoCards";
import BottomActionBar from "./BottomActionBar";
import { SiteFooter } from "../../components/site-footer";
import WhatsAppFloatButton from "./WhatsAppFloatButton";

type BookingParams = {
  service: string;
  mode: string;
  date: string;
  time: string;
};

/**
 * Read the selection carried over from the earlier booking steps.
 *
 * There is deliberately NO fallback booking any more. The page used to default
 * to "Reiki Healing Session / Video Call / Tuesday, 10 June 2026 / 08:00 AM", so
 * anyone landing here directly — a bookmark, a back-button, a shared link — saw
 * a complete, plausible booking they had never made, and the Pay button would
 * have charged them for it.
 */
function readParams(): BookingParams | null {
  const stored = loadConsultationData();
  const url = new URLSearchParams(window.location.search);

  const service = stored.service || url.get("service") || "";
  const mode = stored.mode || url.get("mode") || "";
  const date = stored.date || url.get("date") || "";
  const time = stored.time || url.get("time") || "";

  if (!service || !date || !time) return null;
  return { service, mode: mode || "Video Call", date, time };
}

export default function ConsultationPaymentPage() {
  // Resolved on the client only: the selection lives in sessionStorage and the
  // query string, neither of which exists during prerender. Reading them in a
  // useState initialiser would render different HTML on server and client.
  const [params, setParams] = useState<BookingParams | null>(null);
  const [svc, setSvc] = useState<ConsultationService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    const p = readParams();
    setParams(p);
    if (!p) {
      setLoading(false);
      return;
    }
    let live = true;
    // The price shown here and the price charged must come from the same place:
    // services.price, resolved once and passed down. BookingSummary previously
    // had its own hardcoded MODE_PRICES map and invented a 10% discount, so the
    // total on screen bore no relation to what the API actually billed.
    resolveService(p.service)
      .then((row) => {
        if (live) {
          setSvc(row);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  if (loading) {
    return (
      <main id="main-content" className="min-h-screen bg-[#FCF9F3]">
        <OfferBar />
        <HomeHeader absolute={false} />
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2
            className="h-8 w-8 animate-spin text-[#5B2A9D]"
            aria-label="Loading your booking"
          />
        </div>
      </main>
    );
  }

  if (!params || error) {
    return (
      <main id="main-content" className="min-h-screen bg-[#FCF9F3]">
        <OfferBar />
        <HomeHeader absolute={false} />
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </span>
          <h1 className="font-serif text-xl font-bold text-[#3E1E7A]">
            {params
              ? "We couldn't price this consultation"
              : "No booking in progress"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {error ||
              "Start from the beginning so we can confirm your service, date and time before payment."}
          </p>
          <Link
            href="/consultation/select-service"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#3E1E7A] to-[#6B2FA0] px-6 py-3 text-sm font-medium text-white"
          >
            Choose a service
          </Link>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const { service, mode, date, time } = params;
  const price = svc?.price ?? 0;
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, Math.round((price - discount) * 100) / 100);

  return (
    <main id="main-content" className="min-h-screen bg-[#FCF9F3]">
      <OfferBar />
      <HomeHeader absolute={false} />
      <Stepper />
      <PaymentPageHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <PaymentMethodCard />
          <CouponCard amount={price} applied={coupon} onChange={setCoupon} />
          <ImportantNotesCard />
          <TrustBadges />
        </div>

        <div className="flex flex-col gap-5">
          <BookingSummary
            service={service}
            mode={mode}
            date={date}
            time={time}
            duration={svc?.duration}
            price={price}
            coupon={coupon}
            total={total}
          />
          <NeedHelpCard />
          <SecurePaymentCard />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <BottomActionBar
          service={service}
          mode={mode}
          date={date}
          time={time}
          svc={svc}
          coupon={coupon}
          total={total}
        />
      </div>

      <SiteFooter />
      <WhatsAppFloatButton />
    </main>
  );
}
