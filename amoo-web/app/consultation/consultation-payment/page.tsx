"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { loadConsultationData } from "../lib/consultation-storage";
import { HomeHeader, OfferBar } from "../../components/home-header";
import Stepper from "./Stepper";
import PaymentPageHeader from "./PaymentPageHeader";
import PaymentMethodCard from "./PaymentMethodCard";
import CouponCard from "./CouponCard";
import ImportantNotesCard from "./ImportantNotesCard";
import TrustBadges from "./TrustBadges";
import BookingSummary from "./BookingSummary";
import { NeedHelpCard, SecurePaymentCard } from "./SideInfoCards";
import BottomActionBar from "./BottomActionBar";
import { SiteFooter } from "../../components/site-footer";
import WhatsAppFloatButton from "./WhatsAppFloatButton";

function getInitialParams() {
  if (typeof window === "undefined") {
    return { service: "Reiki Healing Session", mode: "Video Call", date: "Tuesday, 10 June 2026", time: "08:00 AM" };
  }
  const stored = loadConsultationData();
  const urlParams = new URLSearchParams(window.location.search);
  return {
    service: stored.service || urlParams.get("service") || "Reiki Healing Session",
    mode: stored.mode || urlParams.get("mode") || "Video Call",
    date: stored.date || urlParams.get("date") || "Tuesday, 10 June 2026",
    time: stored.time || urlParams.get("time") || "08:00 AM",
  };
}

function PaymentPageInner() {
  const [params] = useState(getInitialParams);
  const { service, mode, date, time } = params;

  return (
    <main className="min-h-screen bg-[#FCF9F3]">
      <OfferBar />
      <HomeHeader absolute={false} />
      <Stepper />
      <PaymentPageHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <PaymentMethodCard />
          <CouponCard />
          <ImportantNotesCard />
          <TrustBadges />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <BookingSummary service={service} mode={mode} date={date} time={time} />
          <NeedHelpCard />
          <SecurePaymentCard />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <BottomActionBar service={service} mode={mode} date={date} time={time} />
      </div>

      <SiteFooter />
      <WhatsAppFloatButton />
    </main>
  );
}

export default function ConsultationPaymentPage() {
  return <PaymentPageInner />;
}
