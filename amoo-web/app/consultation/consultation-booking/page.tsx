"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveConsultationData, loadConsultationData } from "../lib/consultation-storage";
import {
  resolveService,
  toApiMode,
  modeNote,
  parseDisplayDate,
  parseDisplayTime,
  type ConsultationService,
} from "../lib/services";
import { api } from "../../../lib/api";
import { HomeHeader, OfferBar } from "../../components/home-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/ornament";
import { WHATSAPP_URL } from "../../../lib/constants";
import { errorMessage } from "../../../lib/errors";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  WhatsAppIcon,
} from "../../components/icons";
import {
  CalendarIcon,
  ClockIcon,
  GiftIcon,
  LotusIcon,
  VideoCallIcon,
  StarOutlineIcon,
} from "../../components/home-icons";

/* ─── inline SVG helpers ─── */

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4.2" />
      <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

function CalendarFormIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3.6" y="5" width="16.8" height="15.4" rx="2" />
      <path d="M3.6 9.6h16.8M8.4 3.2v3.6M15.6 3.2v3.6" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1.8v2.4M12 19.8v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.6 3.4a2.1 2.1 0 0 1 3 3L7.4 19.6l-4 1 1-4Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function InfoCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8.4h.01M12 12v4" strokeWidth="2" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2.6 4.6 5.8v5.6c0 4.6 3.1 8.9 7.4 10 4.3-1.1 7.4-5.4 7.4-10V5.8Z" />
      <path d="m8.8 11.9 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 18.4V12a9 9 0 0 1 18 0v6.4" />
      <path d="M3 18a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2ZM21 18a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

/* ─── Step data ─── */

const STEPS = [
  { num: 1, label: "Select Service", done: true },
  { num: 2, label: "Select Mode", done: true },
  { num: 3, label: "Select Date & Time", done: true },
  { num: 4, label: "Your Details", active: true },
  { num: 5, label: "Booking Summary" },
  { num: 6, label: "Payment" },
  { num: 7, label: "Confirmation" },
];

/* ─── Inner Component ─── */

function BookingForm() {
  const router = useRouter();
  const [params, setParams] = useState({
    service: "Reiki Healing Session",
    mode: "Video Call",
    date: "Tuesday, 10 June 2026",
    time: "08:00 AM",
  });
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [language, setLanguage] = useState("");
  const [foundUs, setFoundUs] = useState("");
  const [concern, setConcern] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [svcRow, setSvcRow] = useState<ConsultationService | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    const stored = loadConsultationData();
    const urlParams = new URLSearchParams(window.location.search);
    setParams({
      service: stored.service || urlParams.get("service") || "Reiki Healing Session",
      mode: stored.mode || urlParams.get("mode") || "Video Call",
      date: stored.date || urlParams.get("date") || "Tuesday, 10 June 2026",
      time: stored.time || urlParams.get("time") || "08:00 AM",
    });
  }, []);

  const { service, mode, date, time } = params;

  // Price comes from the services table, never from a constant in this file —
  // it's also what the API cross-checks the booking amount against.
  useEffect(() => {
    let live = true;
    resolveService(service)
      .then((row) => { if (live) setSvcRow(row); })
      .catch(() => {});
    return () => { live = false; };
  }, [service]);

  const price = svcRow ? `₹${svcRow.price.toLocaleString("en-IN")}` : "—";
  const total = svcRow
    ? `₹${Math.max(0, svcRow.price - couponDiscount).toLocaleString("en-IN")}`
    : "—";

  const handleBack = () => {
    router.push(`/consultation/select-date-time?service=${encodeURIComponent(service)}&mode=${encodeURIComponent(mode)}`);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email address";
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[+]?[\d\s()-]{7,15}$/.test(phone.trim())) errs.phone = "Please enter a valid phone number";
    if (!concern.trim()) errs.concern = "Please describe your concern";
    if (!agree) errs.agree = "You must confirm to proceed";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      // POST /api/bookings takes service_id (required) — not a service name —
      // and no name/email/phone: those already live on the authenticated user.
      // amount 0 marks it unpaid; the API stores the real services.price and
      // only /payments/verify may ever mark it Paid.
      const match = svcRow ?? (await resolveService(service));
      setSvcRow(match);

      const notes = [modeNote(mode), concern.trim(), specialRequests.trim()]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 2000);

      await api.createBooking({
        service_id: match.id,
        date: parseDisplayDate(date),
        time: parseDisplayTime(time),
        mode: toApiMode(mode),
        amount: 0,
        ...(notes ? { notes } : {}),
      });
      saveConsultationData({
        service, mode, date, time,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dob,
        gender,
        maritalStatus,
        language,
        foundUs,
        concern: concern.trim(),
        specialRequests: specialRequests.trim(),
      });
      router.push(`/consultation/booking-summary?service=${encodeURIComponent(service)}&mode=${encodeURIComponent(mode)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
    } catch (e: unknown) {
      setSubmitError(errorMessage(e, "Booking failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await api.validateCoupon(couponCode.trim());
      const discount = res?.discount ?? 0;
      if (discount > 0) {
        setCouponDiscount(discount);
      } else {
        setCouponError("Invalid or expired coupon code");
      }
    } catch (e: unknown) {
      setCouponError(errorMessage(e, "Invalid coupon code. Please try again."));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    setUploadError("");
    try {
      const result = await api.uploadFile(file);
      const url = result?.url || result?.data?.url || "";
      setUploadedFile({ name: file.name, url });
    } catch (e: unknown) {
      setUploadError(errorMessage(e, "Upload failed. Please try again."));
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadError("");
  };

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      <main id="main-content" className="flex-1 bg-cream">
        {/* ── Progress Stepper ── */}
        <div className="border-b border-line bg-white">
          <div className="mx-auto max-w-[1100px] px-3 sm:px-5 py-5 sm:py-7">
            <div className="flex items-start justify-between">
              {STEPS.map((step, i) => (
                <div key={step.num} className="flex flex-1 flex-col items-center relative min-w-0">
                  {/* Connector line */}
                  {i > 0 && (
                    <span
                      className={`absolute top-[13px] sm:top-[18px] right-1/2 h-[2px] w-full ${
                        step.done || step.active ? "bg-grape-2" : "bg-line"
                      }`}
                    />
                  )}
                  {/* Circle */}
                  <span
                    className={`relative z-10 flex h-[26px] w-[26px] sm:h-[36px] sm:w-[36px] items-center justify-center rounded-full text-[10px] sm:text-[14px] font-semibold ${
                      step.done
                        ? "bg-grape-2 text-white"
                        : step.active
                          ? "bg-gold text-ink"
                          : "border-2 border-line bg-white text-body"
                    }`}
                  >
                    {step.done ? (
                      <CheckIcon className="h-[12px] w-[12px] sm:h-[18px] sm:w-[18px] text-white" />
                    ) : (
                      step.num
                    )}
                  </span>
                  <span
                    className={`mt-1.5 sm:mt-2 text-center text-[9px] sm:text-[12.5px] hidden sm:block ${
                      step.active
                        ? "font-medium text-gold"
                        : step.done
                          ? "text-grape font-medium"
                          : "text-body"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form Title ── */}
        <div className="mx-auto max-w-[1100px] px-5 pt-8 pb-2">
          <SectionHeading>Consultation Booking Form</SectionHeading>
          <p className="mt-2 text-center text-[14px] text-body">
            Please fill in your details to confirm your consultation.
          </p>

          {/* Privacy notice */}
          <div className="mx-auto mt-5 flex max-w-[680px] items-center justify-center gap-2 rounded-lg bg-[#fdf6e3] py-3 px-4 text-[13px] text-[#8b6914]">
            <LockIcon className="h-[16px] w-[16px] shrink-0 text-[#b8941e]" />
            Your information is 100% secure and confidential. We respect your privacy.
          </div>
        </div>

        {/* ── Main Grid: Form + Sidebar ── */}
        <div className="mx-auto max-w-[1100px] px-5 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

            {/* ═══ LEFT: FORM ═══ */}
            <div className="space-y-6">

              {/* ── 1. Personal Information ── */}
              <section className="rounded-xl border border-line bg-white p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-gold text-[13px] font-bold text-ink">
                    1
                  </span>
                  <UserIcon className="h-[20px] w-[20px] text-grape" />
                  <h2 className="text-[17px] font-semibold text-grape">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="page-full-name" className="mb-1.5 block text-[13px] font-medium text-ink">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input id="page-full-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-[44px] w-full rounded-lg border border-line bg-white pl-4 pr-4 text-[13.5px] text-ink placeholder:text-body/60 focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500">
                          <AlertCircle className="h-[13px] w-[13px]" />{errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="page-email-address" className="mb-1.5 block text-[13px] font-medium text-ink">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input id="page-email-address"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-[44px] w-full rounded-lg border border-line bg-white pl-4 pr-4 text-[13.5px] text-ink placeholder:text-body/60 focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500">
                          <AlertCircle className="h-[13px] w-[13px]" />{errors.email}
                        </p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label htmlFor="page-mobile-number" className="mb-1.5 block text-[13px] font-medium text-ink">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <div className="flex h-[44px] items-center gap-1 rounded-l-lg border border-r-0 border-line bg-white pl-3 pr-2">
                          <span className="text-[14px]">🇮🇳</span>
                          <span className="text-[13px] text-ink">+91</span>
                        </div>
                        <input id="page-mobile-number"
                          type="tel"
                          placeholder="Enter mobile number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-[44px] flex-1 rounded-r-lg border border-line bg-white px-3 text-[13.5px] text-ink placeholder:text-body/60 focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500">
                          <AlertCircle className="h-[13px] w-[13px]" />{errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label htmlFor="page-date-of-birth" className="mb-1.5 block text-[13px] font-medium text-ink">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <CalendarFormIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-body" />
                        <input id="page-date-of-birth"
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="h-[44px] w-full rounded-lg border border-line bg-white pl-10 pr-4 text-[13.5px] text-ink focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30 [color-scheme:light]"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label htmlFor="page-gender" className="mb-1.5 block text-[13px] font-medium text-ink">
                        Gender
                      </label>
                      <div className="relative">
                        <select id="page-gender" value={gender} onChange={(e) => setGender(e.target.value)} className="h-[44px] w-full appearance-none rounded-lg border border-line bg-white pl-4 pr-10 text-[13.5px] text-body focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30">
                          <option value="">Select Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div>
                      <label htmlFor="page-marital-status-optional" className="mb-1.5 block text-[13px] font-medium text-ink">
                        Marital Status <span className="text-body">(Optional)</span>
                      </label>
                      <div className="relative">
                        <select id="page-marital-status-optional" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="h-[44px] w-full appearance-none rounded-lg border border-line bg-white pl-4 pr-10 text-[13.5px] text-body focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30">
                          <option value="">Select Status</option>
                          <option>Single</option>
                          <option>Married</option>
                          <option>Divorced</option>
                          <option>Widowed</option>
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                      </div>
                    </div>
                </div>
              </section>

              {/* ── 2. Consultation Details ── */}
              <section className="rounded-xl border border-line bg-white p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-gold text-[13px] font-bold text-ink">
                    2
                  </span>
                  <SettingsIcon className="h-[20px] w-[20px] text-grape" />
                  <h2 className="text-[17px] font-semibold text-grape">Consultation Details</h2>
                </div>

                {/* Selected Service */}
                <div className="mb-4">
                  <p className="mb-2 block text-[13px] font-medium text-ink">Selected Service</p>
                  <div className="flex items-center gap-4 rounded-xl border border-line bg-[#fdfaf5] p-4">
                    <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-lilac text-grape-2">
                      <LotusIcon className="h-[26px] w-[26px]" />
                    </span>
                    <div className="flex-1">
                      <p className="text-[14.5px] font-semibold text-grape">{service}</p>
                      <p className="mt-0.5 text-[12.5px] text-body">Selected consultation service</p>
                    </div>
                    <span className="text-[18px] font-bold text-grape">{price}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Consultation Mode */}
                  <div>
                    <p className="mb-2 block text-[13px] font-medium text-ink">Consultation Mode</p>
                    <div className="flex items-center gap-3 rounded-xl border border-line bg-[#fdfaf5] p-4">
                      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-lilac text-grape-2">
                        <VideoCallIcon className="h-[22px] w-[22px]" />
                      </span>
                      <div>
                        <p className="text-[13.5px] font-semibold text-grape">{mode} Consultation</p>
                        <p className="mt-0.5 text-[11.5px] text-body">Guidance with our expert via {mode}.</p>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="mb-2 block text-[13px] font-medium text-ink">Date & Time</p>
                    <div className="flex items-center gap-3 rounded-xl border border-line bg-[#fdfaf5] p-4">
                      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-lilac text-grape-2">
                        <CalendarIcon className="h-[22px] w-[22px]" />
                      </span>
                      <div className="flex-1">
                        <p className="text-[13.5px] font-semibold text-grape">{date}</p>
                        <p className="mt-0.5 text-[12px] text-body">{time} (IST)</p>
                      </div>
                      <button type="button" className="text-[13px] font-medium text-grape-2 underline underline-offset-2">
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label htmlFor="page-preferred-language-optional" className="mb-1.5 block text-[13px] font-medium text-ink">
                      Preferred Language <span className="text-body">(Optional)</span>
                    </label>
                    <div className="relative">
                      <select id="page-preferred-language-optional" value={language} onChange={(e) => setLanguage(e.target.value)} className="h-[44px] w-full appearance-none rounded-lg border border-line bg-white pl-4 pr-10 text-[13.5px] text-body focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30">
                        <option value="">Select Language</option>
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Tamil</option>
                        <option>Telugu</option>
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                    </div>
                  </div>

                  {/* How did you find us */}
                  <div>
                    <label htmlFor="booking-found-us" className="mb-1.5 block text-[13px] font-medium text-ink">
                      How did you find us? <span className="text-body">(Optional)</span>
                    </label>
                    <div className="relative">
                      <select id="booking-found-us" value={foundUs} onChange={(e) => setFoundUs(e.target.value)} className="h-[44px] w-full appearance-none rounded-lg border border-line bg-white pl-4 pr-10 text-[13.5px] text-body focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30">
                        <option value="">Select Option</option>
                        <option>Google Search</option>
                        <option>Social Media</option>
                        <option>Friend/Family</option>
                        <option>Advertisement</option>
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── 3. Your Concern ── */}
              <section className="rounded-xl border border-line bg-white p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-gold text-[13px] font-bold text-ink">
                    3
                  </span>
                  <PencilIcon className="h-[20px] w-[20px] text-grape" />
                  <h2 className="text-[17px] font-semibold text-grape">Your Concern</h2>
                </div>
                <p className="mb-3 text-[13px] text-body">
                  Please describe your concern or question in detail <span className="text-red-500">*</span>
                </p>
                <textarea
                  rows={4}
                  placeholder="Write your concern here..."
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white p-4 text-[13.5px] text-ink placeholder:text-body/60 focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30 resize-none"
                />
                <p className="mt-1.5 text-right text-[12px] text-body">{concern.length} / 500 characters</p>
                {errors.concern && (
                  <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500">
                    <AlertCircle className="h-[13px] w-[13px]" />{errors.concern}
                  </p>
                )}
              </section>

              {/* ── 4. Additional Information ── */}
              <section className="rounded-xl border border-line bg-white p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-gold text-[13px] font-bold text-ink">
                    4
                  </span>
                  <InfoCircleIcon className="h-[20px] w-[20px] text-grape" />
                  <h2 className="text-[17px] font-semibold text-grape">Additional Information (If Applicable)</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Upload */}
                  <div>
                    <label htmlFor="page-upload-birth-chart-relevant" className="mb-1.5 block text-[13px] font-medium text-ink">
                      Upload Birth Chart / Relevant Documents <span className="text-body">(Optional)</span>
                    </label>
                    <input id="page-upload-birth-chart-relevant"
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {uploadedFile ? (
                      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                        <CheckIcon className="h-[16px] w-[16px] shrink-0 text-green-600" />
                        <span className="flex-1 truncate text-[13px] text-ink">{uploadedFile.name}</span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-[12px] font-medium text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFileClick}
                        disabled={uploadLoading}
                        className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-[#fdfaf5] px-4 py-6 text-center hover:border-grape-2/50 transition-colors disabled:opacity-60"
                      >
                        {uploadLoading ? (
                          <Loader2 className="h-[32px] w-[32px] animate-spin text-grape-2" />
                        ) : (
                          <UploadIcon className="h-[32px] w-[32px] text-grape-2" />
                        )}
                        <p className="mt-2 text-[12.5px] text-ink">
                          <span className="font-medium text-grape-2">Click to upload</span> or drag and drop
                        </p>
                        <p className="mt-0.5 text-[11px] text-body">PNG, JPG, PDF (Max. 5MB)</p>
                      </button>
                    )}
                    {uploadError && (
                      <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-500">
                        <AlertCircle className="h-[13px] w-[13px]" />{uploadError}
                      </p>
                    )}
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label htmlFor="page-special-requests-optional" className="mb-1.5 block text-[13px] font-medium text-ink">
                      Special Requests <span className="text-body">(Optional)</span>
                    </label>
                    <textarea id="page-special-requests-optional"
                      rows={4}
                      placeholder="Any specific request for the expert?"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white p-4 text-[13.5px] text-ink placeholder:text-body/60 focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30 resize-none"
                    />
                    <p className="mt-1.5 text-right text-[12px] text-body">{specialRequests.length} / 200 characters</p>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <label htmlFor="page-setagree-agree-i-confirm" className="mt-5 flex items-start gap-3 cursor-pointer" onClick={() => setAgree(!agree)}>
                  <span className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded mt-0.5 ${agree ? 'bg-grape-2' : 'border border-line bg-white'}`}>
                    {agree && <CheckIcon className="h-[12px] w-[12px] text-white" />}
                  </span>
                  <span className="text-[13px] leading-[1.5] text-ink">
                    I confirm that the above information is correct and I want to proceed with booking this consultation.
                  </span>
                </label>
                {errors.agree && (
                  <p className="mt-2 flex items-center gap-1 text-[12px] text-red-500">
                    <AlertCircle className="h-[13px] w-[13px]" />{errors.agree}
                  </p>
                )}
              </section>
            </div>

            {/* ═══ RIGHT: BOOKING SUMMARY SIDEBAR ═══ */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_2px_16px_rgba(75,37,131,0.07)]">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-royal to-ink px-5 pt-5 pb-0">
                  <h3 className="text-center text-[18px] font-bold text-gold">Your Booking Summary</h3>
                  {/* Decorative image */}
                  <div className="mt-4 flex justify-center">
                    <Image
                      src="/images/trust-candles.png"
                      alt=""
                      width={280}
                      height={120}
                      className="h-[100px] w-[260px] rounded-t-lg object-cover"
                    />
                  </div>
                </div>

                <div className="px-5 py-5">
                  {/* Service Details */}
                  <h4 className="mb-3 text-[14px] font-semibold text-grape">Service Details</h4>
                  <div className="mb-4 flex items-start gap-3 rounded-lg bg-[#fdfaf5] p-3">
                    <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-lilac text-grape-2">
                      <LotusIcon className="h-[22px] w-[22px]" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-semibold text-grape">{service}</p>
                      <p className="mt-0.5 text-[11.5px] leading-[1.5] text-body">Selected consultation service</p>
                    </div>
                  </div>

                  {/* Details rows */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <VideoCallIcon className="h-[18px] w-[18px] shrink-0 text-grape-2" />
                      <span className="flex-1 text-[12.5px] text-body">Consultation Mode</span>
                      <span className="text-[12.5px] font-medium text-ink">{mode}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-[18px] w-[18px] shrink-0 text-grape-2" />
                      <span className="flex-1 text-[12.5px] text-body">Date & Time</span>
                      <span className="text-right text-[12.5px] font-medium text-ink">{date}<br/>{time} (IST)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ClockIcon className="h-[18px] w-[18px] shrink-0 text-grape-2" />
                      <span className="flex-1 text-[12.5px] text-body">Duration</span>
                      <span className="text-[12.5px] font-medium text-ink">{svcRow?.duration || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[14px] font-bold text-grape-2">₹</span>
                      <span className="flex-1 text-[12.5px] text-body">Price</span>
                      <span className="text-[14px] font-bold text-grape">{price}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-4 h-px bg-line" />

                  {/* Coupon */}
                  <p className="mb-2 text-[13px] font-medium text-ink">Have a Coupon Code?</p>
                  <div className="flex gap-2">
                    <input id="page-setagree-agree-i-confirm"
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-[40px] flex-1 rounded-lg border border-line bg-white px-3 text-[12.5px] text-ink placeholder:text-body/60 focus:border-grape-2 focus:outline-none focus:ring-1 focus:ring-grape-2/30"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className={`flex h-[40px] items-center justify-center gap-1.5 rounded-lg px-5 text-[13px] font-medium text-white transition-colors ${couponLoading ? 'bg-grape-2/60 cursor-not-allowed' : 'bg-grape hover:bg-grape-2'}`}
                    >
                      {couponLoading ? <Loader2 className="h-[16px] w-[16px] animate-spin" /> : null}
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-500">
                      <AlertCircle className="h-[13px] w-[13px]" />{couponError}
                    </p>
                  )}
                  {couponDiscount > 0 && (
                    <p className="mt-1.5 text-[12px] text-green-600">
                      Coupon applied! Discount: ₹{couponDiscount}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="my-4 h-px bg-line" />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-semibold text-grape">Total Amount</span>
                    <span className="text-[22px] font-bold text-grape">{total}</span>
                  </div>

                  {/* Divider */}
                  <div className="my-4 h-px bg-line" />

                  {/* 100% Secure */}
                  <div className="mb-4 flex items-start gap-3">
                    <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#fdf6e3]">
                      <ShieldIcon className="h-[20px] w-[20px] text-gold" />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-grape">100% Secure Booking</p>
                      <p className="mt-0.5 text-[11.5px] leading-[1.5] text-body">Your transaction and personal details are safe with us.</p>
                    </div>
                  </div>

                  {/* Need Help */}
                  <div className="flex items-start gap-3">
                    <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#fdf6e3]">
                      <HeadsetIcon className="h-[20px] w-[20px] text-gold" />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-grape">Need Help?</p>
                      <p className="mt-0.5 text-[11.5px] leading-[1.5] text-body">Our support team is here to assist you anytime you need.</p>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <button
                    type="button"
                    className="mt-4 flex h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(37,211,102,0.3)] hover:bg-[#20bd5a] transition-colors"
                  >
                    <WhatsAppIcon className="h-[22px] w-[22px]" />
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── First Time Banner ── */}
        <div className="mx-auto max-w-[1100px] px-5 pb-4">
          <div className="overflow-hidden rounded-xl bg-gradient-to-r from-royal via-grape to-royal px-6 py-5">
            <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
              {/* Left: Gift + Offer */}
              <div className="flex items-center gap-4">
                <GiftIcon className="h-[48px] w-[48px] shrink-0 text-gold" />
                <div>
                  <p className="text-[17px] font-bold text-white">First Time Here?</p>
                  <p className="mt-0.5 text-[13px] text-white/80">
                    Get 10% OFF on your first consultation.{" "}
                    <span className="font-semibold text-gold">Use Code: <span className="font-bold">FIRST10</span></span>
                  </p>
                </div>
              </div>

              {/* Right: Feature icons */}
              <div className="flex items-center gap-6">
                {[
                  { icon: StarOutlineIcon, label: "Expert Guidance" },
                  { icon: ShieldIcon, label: "100% Confidential" },
                  { icon: ClockIcon, label: "Flexible Timing" },
                  { icon: LotusIcon, label: "Holistic Healing" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-gold/40 text-gold">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-[11px] text-white/85">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Navigation ── */}
        <div className="mx-auto max-w-[1100px] px-5 pb-8">
          <div className="flex items-center justify-between">
            {/* Back */}
            <button
              type="button"
              onClick={handleBack}
              className="flex h-[48px] items-center gap-2 rounded-xl border border-line bg-white px-6 text-[14px] font-medium text-ink hover:bg-cream transition-colors"
            >
              <ArrowRightIcon className="h-[16px] w-[16px] rotate-180" />
              Back
            </button>

            {/* Security */}
            <div className="hidden items-center gap-2 text-center sm:flex">
              <LockIcon className="h-[16px] w-[16px] text-grape-2" />
              <div>
                <p className="text-[13px] font-medium text-ink">Your booking is safe and secure</p>
                <p className="text-[11px] text-body">End-to-end encrypted & confidential</p>
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                <AlertCircle className="h-[16px] w-[16px] shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            {/* Continue */}
            <button
              type="button"
              onClick={handleContinue}
              disabled={submitting}
              className={`flex h-[48px] items-center gap-2 rounded-xl px-7 text-[14px] font-semibold transition-shadow ${submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-b from-gold-2 to-gold-3 text-ink shadow-[0_6px_20px_rgba(233,184,92,0.25)] hover:shadow-[0_8px_24px_rgba(233,184,92,0.35)]'}`}
            >
              {submitting ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> Submitting...</> : "Continue to Booking Summary"}
              {!submitting && <ArrowRightIcon className="h-[16px] w-[16px]" />}
            </button>
          </div>
        </div>
      </main>

      <SiteFooter />

      {/* Floating WhatsApp */}
      <a
        href={WHATSAPP_URL}
        aria-label="Chat on WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 bottom-6 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[#25D366] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      >
        <WhatsAppIcon className="h-[30px] w-[30px]" />
      </a>
    </>
  );
}

export default function ConsultationBookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingForm />
    </Suspense>
  );
}
