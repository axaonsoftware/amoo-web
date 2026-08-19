"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { saveConsultationData, loadConsultationData } from "../lib/consultation-storage";
import { api } from "../../../lib/api";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/ornament";
import { ArrowRightIcon } from "../../components/home-icons";
import { HomeHeader, OfferBar } from "../../components/home-header";
import Stepper from "./Stepper";
import DateTimeCard from "./DateTimeCard";
import SummaryCard from "./SummaryCard";
import TrustStrip from "./TrustStrip";
import { LockIcon, ShieldTickIcon } from "./icons";
import { RequireAuth } from "../../../lib/auth-context";

function SelectDateTimeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const service = searchParams.get("service") || "Selected Service";
  const mode = searchParams.get("mode") || "Selected Mode";
  const storedData = loadConsultationData();
  const duration = storedData.duration || undefined;

  const now = new Date();
  // Default to tomorrow: the backend rejects bookings for today/past dates
  // (booking schema `date.min("now")`), so today must not be the starting pick.
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const [selectedDate, setSelectedDate] = useState<number>(tomorrow.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    tomorrow.getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    tomorrow.getFullYear(),
  );
  const [selectedPeriod, setSelectedPeriod] = useState("Morning");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>();
  const [validationError, setValidationError] = useState("");

  const handleBack = () => {
    router.push(
      `/consultation/consultation-mode?service=${encodeURIComponent(service)}`,
    );
  };

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleSlotSelect = async (slot: string, slotId?: number) => {
    setSelectedSlot(slot);
    setSelectedSlotId(slotId);
    
    // Reserve the slot immediately to prevent double-booking if slotId present
    if (slotId) {
      try {
        await api.reserveSlot(slotId);
      } catch (err) {
        // If reservation fails (e.g., slot already booked), clear selection
        setSelectedSlot("");
        setSelectedSlotId(undefined);
        setValidationError("Sorry, this slot is no longer available. Please select a different time.");
      }
    }
  };

  const handleContinue = () => {
    setValidationError("");
    if (!selectedSlot) {
      setValidationError("Please select a time slot before continuing.");
      return;
    }
    const dateObj = new Date(selectedYear, selectedMonth, selectedDate);
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][dateObj.getDay()];
    const dateStr = `${weekday}, ${selectedDate} ${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    saveConsultationData({ date: dateStr, time: selectedSlot, slot_id: selectedSlotId });
    router.push(
      `/consultation/consultation-booking?service=${encodeURIComponent(service)}&mode=${encodeURIComponent(mode)}&date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(selectedSlot)}`,
    );
  };

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      {/* ═══ Dark band: curved cream stepper shelf ═══ */}
      <div className="relative overflow-hidden bg-[radial-gradient(120%_150%_at_50%_35%,#2e1150_0%,#210a38_55%,#190429_100%)]">
        <div className="stars pointer-events-none absolute inset-0 opacity-60" />
        <Image
          src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-chakra-left.png"
          alt=""
          width={174}
          height={438}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[140px] object-cover opacity-90 md:block"
        />
        <Image
          src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-chakra-right.png"
          alt=""
          width={174}
          height={438}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[140px] object-cover opacity-90 md:block"
        />
        <div className="relative">
          <div className="absolute inset-0 bg-cream rounded-tl-[270px_100px] rounded-tr-[270px_100px]" />
          <Stepper />
        </div>
      </div>

      <main id="main-content" className="flex-1 bg-cream">
        {/* ═══ Heading ═══ */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-[14px]">
          <SectionHeading>Select Date &amp; Time</SectionHeading>
          <p className="mt-[8px] text-center text-[14px] text-body">
            Choose a convenient date and time for your consultation.
          </p>

          {/* IST notice */}
          <div className="mt-[14px] flex justify-center">
            <div className="flex min-h-[42px] max-w-full items-center gap-2.5 rounded-full border border-[#ecdfc4] bg-[#fdf6e6] px-5 py-2 sm:px-[22px]">
              <ShieldTickIcon className="h-[17px] w-[17px] shrink-0 text-gold-3" />
              <p className="text-[13.5px] text-[#4a4553]">
                All times are shown in Indian Standard Time (IST)
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Picker + Summary ═══ */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_368px] lg:items-start">
            <DateTimeCard
              selectedDate={selectedDate}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onSelectDate={setSelectedDate}
              onSelectMonth={setSelectedMonth}
              onSelectYear={setSelectedYear}
              selectedPeriod={selectedPeriod}
              selectedSlot={selectedSlot}
              onSelectPeriod={setSelectedPeriod}
              onSelectSlot={handleSlotSelect}
            />
            <SummaryCard
              service={service}
              mode={mode}
              date={selectedDate}
              month={selectedMonth}
              year={selectedYear}
              time={selectedSlot}
              duration={duration}
            />
          </div>
        </div>

        {/* ═══ Trust strip ═══ */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-5">
          <TrustStrip />
        </div>

        {/* ═══ Bottom actions ═══ */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-5 pb-7">
          <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="order-2 flex h-[50px] items-center gap-2.5 rounded-xl border border-line bg-white px-7 text-[14.5px] font-medium text-[#2f1a52] transition-colors hover:bg-cream md:order-1"
            >
              <ArrowRightIcon className="h-[17px] w-[17px] rotate-180" />
              Back
            </button>

            <p className="order-3 flex items-center gap-2.5 text-[13px] text-body md:order-2">
              <LockIcon className="h-[17px] w-[17px] shrink-0 text-grape-2" />
              Your booking is safe and secure with end-to-end encryption.
            </p>

            {validationError && (
              <div className="order-1 flex w-full items-center justify-center gap-2 text-[13px] text-red-600 md:order-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {validationError}
              </div>
            )}
            <button
              type="button"
              onClick={handleContinue}
              className="order-1 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-gold-2 to-gold-3 px-8 text-[15px] font-semibold text-[#2f1a52] shadow-[0_6px_20px_rgba(208,155,56,0.32)] transition-shadow hover:shadow-[0_8px_24px_rgba(208,155,56,0.42)] md:order-3 md:w-auto"
            >
              Continue to Details
              <ArrowRightIcon className="h-[17px] w-[17px]" />
            </button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

export default function SelectDateTimePage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B2A9D] border-t-transparent" />
          </div>
        }
      >
        <SelectDateTimeInner />
      </Suspense>
    </RequireAuth>
  );
}
