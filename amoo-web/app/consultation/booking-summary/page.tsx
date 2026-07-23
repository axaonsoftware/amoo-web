"use client";

import React, { useState, useEffect, useMemo } from "react";
import { loadConsultationData } from "../lib/consultation-storage";
import Link from "next/link";
import { WHATSAPP_URL, CONTACT_PHONE, CONTACT_EMAIL, SITE_NAME } from "../../../lib/constants";
import { HomeHeader, OfferBar } from "../../components/home-header";
import { sanitize } from "../../../lib/sanitize";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "../../components/icons";
import {
  Check,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Video,
  Clock,
  Flower2,
  IndianRupee,
  ShieldCheck,
  Users,
  CalendarClock,
  Star,
  ShieldAlert,
  Lock,
  Gift,
  Headphones,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  FileIcon,
  Phone,
  Mail,
  Clock3,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const STEPS = [
  { label: "Select Service", status: "done" },
  { label: "Select Mode", status: "done" },
  { label: "Select Date & Time", status: "done" },
  { label: "Your Details", status: "done" },
  { label: "Booking Summary", status: "current", number: 5 },
  { label: "Payment", status: "upcoming", number: 6 },
  { label: "Confirmation", status: "upcoming", number: 7 },
];

const WHY_BOOK = [
  {
    icon: ShieldCheck,
    title: "100% Secure & Private",
    desc: "Your information is safe with us.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    desc: "Consult with experienced experts.",
  },
  {
    icon: CalendarClock,
    title: "Flexible Rescheduling",
    desc: "Reschedule or change slots easily.",
  },
  {
    icon: Star,
    title: "Trusted by 25K+ Clients",
    desc: "Highly rated by our happy clients.",
  },
];

const FOOTER_COLS = [
  {
    title: "Quick Links",
    links: [
      "Home",
      "About Us",
      "Services",
      "Consultation",
      "Pricing",
      "Blog",
      "Contact Us",
    ],
  },
  {
    title: "Our Services",
    links: [
      "Numerology",
      "Reiki Healing",
      "Tarot Reading",
      "Kundali & Astrology",
      "Chakra Healing",
      "Spiritual Guidance",
      "Combo Packages",
    ],
  },
  {
    title: "Consultation",
    links: [
      "Audio Call",
      "Video Call",
      "Chat Consultation",
      "Distance Healing",
      "In-Person Meeting",
      "Packages",
    ],
  },
  {
    title: "Support",
    links: [
      "FAQ",
      "Privacy Policy",
      "Terms & Conditions",
      "Refund Policy",
      "Cancellation Policy",
    ],
  },
];

const MODE_PRICES: Record<string, { price: number; discount: number }> = {
  "Audio Call": { price: 499, discount: 50 },
  "Video Call": { price: 999, discount: 100 },
  Chat: { price: 349, discount: 35 },
};

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function SectionHeading({
  icon: Icon,
  number,
  title,
}: {
  icon: React.ElementType;
  number: number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-8 h-8 rounded-full bg-purple-950 text-white flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <h3 className="font-bold text-purple-950 text-base">
        {number}. {title}
      </h3>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-sm mb-3 last:mb-0">
      <span className="text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-gray-500 mr-2">:</span>
      <span className="text-purple-950 font-medium">{value}</span>
    </div>
  );
}

function OverviewRow({
  icon: Icon,
  label,
  value,
  error,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  error?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="flex items-center gap-2 text-gray-600">
        <Icon className="w-4 h-4 text-amber-600" />
        {label}
      </span>
      <span className={`font-semibold text-right ${error ? "text-red-500" : "text-purple-950"}`}>
{sanitize(value)}
        {error && <span className="block text-red-500 text-xs font-normal">{error}</span>}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inner component with search params                                 */
/* ------------------------------------------------------------------ */

function BookingSummaryContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [data] = useState(() => {
    try {
      const stored = loadConsultationData();
      const params = new URLSearchParams(window.location.search);
      return {
        service: stored.service || params.get("service") || "Reiki Healing Session",
        mode: stored.mode || params.get("mode") || "Video Call",
        date: stored.date || params.get("date") || "Tuesday, 10 June 2026",
        time: stored.time || params.get("time") || "08:00 AM",
        fullName: stored.fullName || "",
        email: stored.email || "",
        phone: stored.phone || "",
        dob: stored.dob || "",
        gender: stored.gender || "",
        maritalStatus: stored.maritalStatus || "",
        language: stored.language || "",
        foundUs: stored.foundUs || "",
        concern: stored.concern || "",
        specialRequests: stored.specialRequests || "",
      };
    } catch {
      return {
        service: "Reiki Healing Session",
        mode: "Video Call",
        date: "Tuesday, 10 June 2026",
        time: "08:00 AM",
        fullName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        maritalStatus: "",
        language: "",
        foundUs: "",
        concern: "",
        specialRequests: "",
      };
    }
  });

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!data.service) errors.service = "Please select a service";
    if (!data.mode) errors.mode = "Please select a consultation mode";
    if (!data.date) errors.date = "Please select a date";
    if (!data.time) errors.time = "Please select a time";
    return errors;
  }, [data]);

  useEffect(() => {
    const errs = Object.values(validationErrors);
    if (errs.length > 0) {
      setError("Some required details are missing. Please go back and complete the form.");
    }
    setLoading(false);
  }, [validationErrors]);

  if (loading) {
    return (
      <div className="bg-[#FBF6EE] min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-950" />
      </div>
    );
  }

  const { service, mode, date, time, fullName, email, phone, dob, gender, maritalStatus, language, foundUs, concern, specialRequests } = data;

  const personalInfoLeft = [
    { label: "Full Name", value: fullName || "—" },
    { label: "Email Address", value: email || "—" },
    { label: "Mobile Number", value: phone || "—" },
    { label: "Date of Birth", value: dob || "—" },
  ];

  const personalInfoRight = [
    { label: "Gender", value: gender || "—" },
    { label: "Marital Status", value: maritalStatus || "—" },
    { label: "Preferred Language", value: language || "—" },
    { label: "How did you find us?", value: foundUs || "—" },
  ];

  const pricing = MODE_PRICES[mode] || MODE_PRICES["Video Call"];
  const total = pricing.price - pricing.discount;

  const dateShort = date ? date.replace(/,?\s*\d{4}/, "") : "";

  const CONSULTATION_DETAILS_RIGHT = [
    { icon: Video, label: "Consultation Mode", value: mode || "—", error: validationErrors.mode },
    {
      icon: Calendar,
      label: "Date & Time",
      value: date ? `${date}\n${time} (IST)` : "—",
      error: validationErrors.date || validationErrors.time,
    },
    { icon: Clock, label: "Duration", value: "60 Minutes" },
  ];

  const BOOKING_OVERVIEW = [
    { icon: Sparkles, label: "Service", value: service || "—", error: validationErrors.service },
    { icon: Video, label: "Mode", value: mode ? `${mode} Consultation` : "—", error: validationErrors.mode },
    { icon: Calendar, label: "Date", value: dateShort || "—", error: validationErrors.date },
    { icon: Users, label: "Time", value: time ? `${time} (IST)` : "—", error: validationErrors.time },
    { icon: Clock, label: "Duration", value: "60 Minutes" },
  ];

  return (
    <div className="bg-[#FBF6EE] min-h-screen font-sans text-[#2b1b3d]">
      <OfferBar />
      <HomeHeader absolute={false} />

      {/* ---------------------------------------------------------- */}
      {/* Stepper card                                                */}
      {/* ---------------------------------------------------------- */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 -mt-1">
        <div className="bg-[#FBF6EE] rounded-b-3xl border-x border-b border-amber-200/60 shadow-sm px-3 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-4 sm:pb-6">
          <div className="flex items-start justify-between max-w-4xl mx-auto">
            {STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center flex-1 min-w-0">
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0
                      ${
                        step.status === "done"
                          ? "bg-purple-950 text-white"
                          : step.status === "current"
                            ? "bg-amber-500 text-white"
                            : "bg-white border border-gray-300 text-gray-400"
                      }`}
                  >
                    {step.status === "done" ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <p
                    className={`text-[9px] sm:text-xs mt-2 font-medium hidden sm:block ${
                      step.status === "upcoming"
                        ? "text-gray-400"
                        : "text-purple-950"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-amber-300 mt-3 sm:mt-4 mx-0.5 sm:mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Title */}
      {/* ---------------------------------------------------------- */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-8 pb-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-amber-500">⚜</span>
          <h1 className="text-3xl font-bold text-purple-950">
            Booking Summary
          </h1>
          <span className="text-amber-500">⚜</span>
        </div>
        <p className="text-gray-600 text-sm">
          Please review your consultation details before proceeding to payment.
        </p>
      </div>

      {/* Info banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-amber-100/70 border border-amber-300/70 rounded-lg px-5 py-3 flex items-center gap-3 text-sm text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          Your booking is not confirmed until the payment is completed.
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-3 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Main content                                                */}
      {/* ---------------------------------------------------------- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
        {/* -------------------- LEFT COLUMN -------------------- */}
        <div className="space-y-5">
          {/* 1. Personal information */}
          <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
            <SectionHeading
              icon={User}
              number={1}
              title="Personal Information"
            />
            <div className="grid sm:grid-cols-2 gap-x-8">
              <div>
                {personalInfoLeft.map((f) => (
                  <FieldRow key={f.label} label={f.label} value={f.value} />
                ))}
              </div>
              <div>
                {personalInfoRight.map((f) => (
                  <FieldRow key={f.label} label={f.label} value={f.value} />
                ))}
              </div>
            </div>
          </div>

          {/* 2. Consultation details */}
          <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
            <SectionHeading
              icon={Calendar}
              number={2}
              title="Consultation Details"
            />
            <div className="grid sm:grid-cols-[1fr_1.2fr] gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Flower2 className="w-8 h-8 text-purple-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="font-bold text-purple-950">{sanitize(service)}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Selected consultation service
                  </p>
                </div>
              </div>
              <div>
                {CONSULTATION_DETAILS_RIGHT.map((d: any) => (
                  <div
                    key={d.label}
                    className="flex items-start gap-2 text-sm mb-3 last:mb-0"
                  >
                    <d.icon className="w-4 h-4 text-purple-700 mt-0.5 shrink-0" />
                    <span className="text-gray-500 w-32 shrink-0">
                      {d.label}
                    </span>
                    <span className="text-gray-500">:</span>
                    <span className={`font-medium whitespace-pre-line ml-1 ${d.error ? "text-red-500" : "text-purple-950"}`}>
                      {sanitize(d.value)}
                    </span>
                    {d.error && (
                      <span className="text-red-500 text-xs ml-1">{d.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Your concern */}
          <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
            <SectionHeading
              icon={MessageSquare}
              number={3}
              title="Your Concern"
            />
            <p className="text-sm text-gray-500 mb-1 font-medium">
              Your Concern / Question
            </p>
            <p className="text-sm text-purple-950 leading-relaxed">
              {concern || "No concern provided."}
            </p>
          </div>

          {/* 4. Additional information */}
          <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
            <SectionHeading
              icon={FileText}
              number={4}
              title="Additional Information"
            />
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">
                  Uploaded Documents
                </p>
                <div className="flex items-center justify-between bg-[#FBF6EE] border border-amber-100 rounded-lg px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-purple-950 font-medium">
                    <FileIcon className="w-4 h-4 text-purple-700" />
                    Birth Chart.pdf
                  </span>
                  <span className="text-xs text-gray-400">245 KB</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">
                  Special Requests
                </p>
                <p className="text-sm text-purple-950 leading-relaxed">
                  {specialRequests || "No special requests."}
                </p>
              </div>
            </div>
          </div>

          {/* review banner */}
          <div className="bg-amber-100/70 border border-amber-300/70 rounded-lg px-5 py-3 flex items-center gap-3 text-sm text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            Please review all details carefully. You can go back and make
            changes if needed.
          </div>

          {/* action buttons */}
          <div className="flex items-center justify-between pt-1">
            <Link
              href={`/consultation/consultation-booking?service=${encodeURIComponent(service)}&mode=${encodeURIComponent(mode)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`}
              className="flex items-center gap-2 border border-gray-300 bg-white text-purple-950 font-medium rounded-lg px-6 py-3 text-sm hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <Link
              href={`/consultation/consultation-payment?service=${encodeURIComponent(service)}&mode=${encodeURIComponent(mode)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#2a0f3f] font-semibold rounded-lg px-6 py-3 text-sm"
            >
              Proceed to Payment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* bottom banners */}
          <div className="grid sm:grid-cols-2 gap-5 pt-2">
            <div className="bg-[#2a0f3f] rounded-xl p-6 flex items-start gap-4">
              <span className="w-11 h-11 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <p className="text-amber-400 font-semibold mb-1">
                  Special Offer for You!
                </p>
                <p className="text-gray-300 text-sm">
                  You saved ₹{pricing.discount} with code{" "}
                  <span className="text-amber-300 font-semibold">FIRST10</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Thank you for choosing {SITE_NAME}.
                </p>
              </div>
            </div>

            <div className="bg-purple-100/60 rounded-xl p-6 flex items-start gap-4">
              <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-purple-700" />
              </span>
              <div>
                <p className="text-purple-950 font-semibold mb-1">Need Help?</p>
                <p className="text-gray-600 text-sm mb-3">
                  Our support team is here to assist you anytime.
                </p>
                <Link
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-purple-950 hover:bg-purple-900 text-white text-xs font-medium rounded px-4 py-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- RIGHT COLUMN -------------------- */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
            {/* hero image */}
            <div className="relative h-44 bg-gradient-to-br from-[#2a0f3f] via-[#4a1f6b] to-[#1c0b2e] flex items-center justify-center overflow-hidden">
              <div className="absolute left-6 bottom-6 w-3 h-10 rounded-sm bg-gradient-to-b from-amber-200 to-amber-500" />
              <div className="absolute right-8 bottom-8 w-3 h-8 rounded-sm bg-gradient-to-b from-amber-200 to-amber-500" />
              <Flower2
                className="w-20 h-20 text-amber-300/90"
                strokeWidth={1}
              />
              <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_60%,rgba(251,191,36,0.25),transparent_60%)]" />
            </div>

            <div className="p-6">
              <p className="flex items-center gap-2 font-bold text-purple-950 mb-3">
                <Calendar className="w-4 h-4 text-amber-600" />
                Booking Overview
              </p>
              {BOOKING_OVERVIEW.map((row) => (
                <OverviewRow
                  key={row.label}
                  icon={row.icon}
                  label={row.label}
                  value={row.value}
                  error={row.error}
                />
              ))}
            </div>

            <div className="border-t border-amber-100 p-6">
              <p className="flex items-center gap-2 font-bold text-purple-950 mb-3">
                <IndianRupee className="w-4 h-4 text-amber-600" />
                Price Details
              </p>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Consultation Fee</span>
                <span className="text-purple-950 font-medium">₹{pricing.price}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-600">Discount (FIRST10)</span>
                <span className="text-green-600 font-medium">- ₹{pricing.discount}</span>
              </div>
              <div className="border-t border-dashed border-amber-200 pt-3 flex items-center justify-between">
                <span className="font-bold text-purple-950">Total Amount</span>
                <span className="font-bold text-xl text-purple-950">₹{total}</span>
              </div>
            </div>

            <div className="border-t border-amber-100 p-6">
              <p className="flex items-center gap-2 font-bold text-purple-950 mb-4">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Why Book With Us?
              </p>
              <div className="space-y-4">
                {WHY_BOOK.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-amber-600" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-purple-950">
                        {title}
                      </p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6 flex items-start gap-4">
            <span className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
            </span>
            <div>
              <p className="font-semibold text-purple-950 mb-1">
                100% Secure Booking
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your transaction and personal details are protected with
                top-level security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Footer                                                      */}
      {/* ---------------------------------------------------------- */}
      <footer className="bg-[#150826] text-gray-300 pt-14 pb-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-6 gap-10 relative">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Flower2
                className="w-9 h-9 text-amber-400 shrink-0"
                strokeWidth={1.5}
              />
              <div className="leading-tight">
                <p className="text-amber-400 font-bold text-xl tracking-wide">
                  AMOO{" "}
                  <span className="text-white font-semibold text-base">
                    GURU
                  </span>
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Guiding You Towards Clarity,
              <br />
              Healing &amp; Abundance
            </p>
            <div className="flex gap-3 mt-5">
              {[FacebookIcon, InstagramIcon, YoutubeIcon].map((Icon, i) => (
                <span
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-[#2a0f3f] transition-colors cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                </span>
              ))}
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-[#2a0f3f] transition-colors cursor-pointer text-xs font-bold">
                P
              </span>
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-amber-400 font-semibold text-sm mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {col.links.map((link) => {
                  const hrefMap: Record<string, string> = {
                    Home: "/",
                    "About Us": "/about",
                    Services: "/services",
                    Consultation: "/consultation",
                    Pricing: "/consultation/consultation-pricing",
                    Blog: "/blog",
                    "Contact Us": "/contact",
                    Numerology: "/services/numerology-services",
                    "Reiki Healing": "/services/reiki-healing",
                    "Tarot Reading": "/services/tarot-reading",
                    "Kundali & Astrology": "/services",
                    "Chakra Healing": "/services/reiki-healing",
                    "Spiritual Guidance": "/services",
                    "Combo Packages": "/consultation",
                    "Audio Call": "/consultation/booking-summary",
                    "Video Call": "/consultation/booking-summary",
                    "Chat Consultation": "/consultation/booking-summary",
                    "Distance Healing": "/consultation/booking-summary",
                    "In-Person Meeting": "/consultation/booking-summary",
                    Packages: "/consultation/consultation-pricing",
                    FAQ: "/faq",
                    "Privacy Policy": "/privacy",
                    "Terms & Conditions": "/terms",
                    "Refund Policy": "/refund",
                    "Cancellation Policy": "/cancellation",
                  };
                  return (
                    <li key={link} className="flex items-center gap-1.5">
                      <span className="text-amber-500 text-xs">›</span>
                      <Link
                        href={hrefMap[link] || "#"}
                        className="hover:text-amber-400 transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-amber-400 font-semibold text-sm mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" /> {CONTACT_PHONE}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />{" "}
                {CONTACT_EMAIL}
              </li>
              <li className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-amber-400 shrink-0" /> Mon -
                Sat: 10 AM - 8 PM
              </li>
            </ul>
          </div>

          <Flower2
            className="w-40 h-40 text-amber-500/10 absolute -right-4 bottom-0 hidden lg:block"
            strokeWidth={1}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 relative">
          <p>© 2025 {SITE_NAME}. All Rights Reserved.</p>
          <p>Designed with ❤ for Spiritual Seekers</p>
        </div>

        {/* floating whatsapp button */}
        <div className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/40 cursor-pointer">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return <BookingSummaryContent />;
}
