"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeHeader, OfferBar } from "../components/home-header";
import {
  ArrowRightIcon,
  CalendarIcon,
  LotusSolidIcon,
} from "../components/home-icons";
import {
  ShieldCheckIcon,
  LockIcon,
  ZapIcon,
  CrownIcon,
  UserIcon,
  MailIcon as MailIconOutline,
  PhoneIcon,
  PenIcon,
  MessageIcon,
  MapPinIcon,
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  SendIcon,
  PhoneCallIcon,
  ChatIcon,
} from "./icons";
import { api } from "../../lib/api";
import {
  WHATSAPP_URL,
  TEL_URL,
  CONTACT_PHONE,
  CONTACT_EMAIL,
  SITE_NAME,
} from "../../lib/constants";

const CONTACT_METHODS = [
  {
    icon: WhatsAppIcon,
    iconBg: "bg-[#25D366]",
    title: "WhatsApp",
    subtitle: "Chat with us instantly",
    value: CONTACT_PHONE,
    valueColor: "text-[#25D366]",
    buttonLabel: "Chat Now",
    buttonHref: WHATSAPP_URL,
    buttonText: "text-[#25D366]",
    borderColor: "border-[#25D366]/30",
  },
  {
    icon: MailIconOutline,
    iconBg: "bg-[#4a90d9]",
    title: "Email Us",
    subtitle: "Drop us an email",
    value: CONTACT_EMAIL,
    valueColor: "text-[#4a90d9]",
    buttonLabel: "Send Email",
    buttonHref: `mailto:${CONTACT_EMAIL}`,
    buttonText: "text-[#4a90d9]",
    borderColor: "border-[#4a90d9]/30",
  },
  {
    icon: PhoneCallIcon,
    iconBg: "bg-[#e67e22]",
    title: "Call Us",
    subtitle: "Mon - Sat | 10 AM - 7 PM",
    value: CONTACT_PHONE,
    valueColor: "text-[#e67e22]",
    buttonLabel: "Call Now",
    buttonHref: TEL_URL,
    buttonText: "text-[#e67e22]",
    borderColor: "border-[#e67e22]/30",
  },
  {
    icon: InstagramIcon,
    iconBg: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    title: "Instagram",
    subtitle: "Follow for daily updates",
    value: "@amooguru_official",
    valueColor: "text-[#833ab4]",
    buttonLabel: "Follow Us",
    buttonHref: "https://instagram.com/amooguru_official",
    buttonText: "text-[#833ab4]",
    borderColor: "border-[#833ab4]/30",
  },
  {
    icon: ChatIcon,
    iconBg: "bg-[#007bff]",
    title: "Live Chat",
    subtitle: "Get quick support",
    value: "(Available on website)",
    valueColor: "text-[#007bff]",
    buttonLabel: "Start Chat",
    buttonHref: `${WHATSAPP_URL}?text=Hi%2C%20I%20need%20help`,
    buttonText: "text-[#007bff]",
    borderColor: "border-[#007bff]/30",
  },
];

const TRUST_BADGES = [
  { icon: ShieldCheckIcon, label: "Trusted Experts" },
  { icon: LockIcon, label: "Secure & Confidential" },
  { icon: ZapIcon, label: "Quick Response" },
];

const FOOTER_LINKS = {
  quickLinks: [
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Consultations", href: "/consultation" },
    { label: "Software Hub", href: "/software-hub" },
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
  ],
  ourServices: [
    { label: "Numerology", href: "/services/numerology-services" },
    { label: "Tarot Reading", href: "/services/tarot-reading" },
    { label: "Reiki Healing", href: "/services/reiki-healing" },
    { label: "Kundali Analysis", href: "/services" },
    { label: "Vastu Consultation", href: "/services" },
    { label: "All Services", href: "/services" },
  ],
  resources: [
    { label: "Blogs", href: "/blog" },
    { label: "FAQs", href: "/faq" },
    { label: "Testimonials", href: "/about" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

const CONTACT_INFO = [
  { icon: MapPinIcon, text: "Indore, Madhya Pradesh, India" },
  { icon: PhoneIcon, text: CONTACT_PHONE },
  { icon: MailIconOutline, text: CONTACT_EMAIL },
  { icon: PhoneIcon, text: "Mon - Sat | 10 AM - 7 PM" },
];

const SUBJECTS = [
  "General Inquiry",
  "Consultation Booking",
  "Numerology Services",
  "Reiki Healing",
  "Tarot Reading",
  "Software Support",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    honeypot: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit number";
    }
    if (!formData.subject) newErrors.subject = "Please select a subject";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Honeypot: silently discard if a bot filled the hidden field.
    if (formData.honeypot) {
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      await api.sendContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        honeypot: "",
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err: unknown) {
      setErrors({
        message:
          err instanceof Error
            ? err.message
            : "Failed to send. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />

      <main id="main-content" className="flex-1 overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-[radial-gradient(130%_140%_at_20%_50%,#2d0f4f_0%,#1e0a38_45%,#130525_100%)]">
          {/* Background meditation image - right side */}
          <div className="absolute right-0 top-0 h-full w-[40%] opacity-30 md:w-[55%] md:opacity-60 lg:opacity-80">
            <Image
              src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/lotus_candles_no_bg.png"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[50px] pb-[50px] sm:pt-[70px] sm:pb-[60px] lg:pt-[90px] lg:pb-[70px]">
            <div className="max-w-[600px]">
              <h1 className="font-display text-[32px] leading-[1.15] font-bold text-[#f6e3b4] sm:text-[56px] lg:text-[68px]">
                Contact Us
              </h1>

              {/* Ornament divider */}
              <div className="mt-[10px] flex items-center gap-2 text-gold">
                <span className="block h-px w-[30px] bg-gold/60" />
                <LotusSolidIcon className="h-[16px] w-[16px]" />
                <span className="block h-px w-[30px] bg-gold/60" />
              </div>

              <p className="mt-[22px] text-[15px] leading-[1.75] text-white/90">
                We&apos;re here to help you on your spiritual journey.
                <br />
                Reach out to us for any queries, support or collaborations.
              </p>

              {/* Trust badges */}
              <div className="mt-[28px] flex flex-wrap items-center gap-[30px]">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-gold/50 bg-white/[0.05]">
                      <Icon className="h-[16px] w-[16px] text-gold" />
                    </span>
                    <span className="text-[13px] font-medium text-white/90">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT FORM + INFO SECTION */}
        <section className="bg-[#fdf8f0]">
          <div className="mx-auto w-full max-w-[1336px] px-5 py-[40px] sm:py-[50px] lg:py-[60px]">
            <div className="grid grid-cols-1 gap-[40px] lg:grid-cols-[1fr_420px]">
              {/* Left: Contact Form */}
              <div>
                <div className="flex items-center gap-3">
                  <CrownIcon className="h-[28px] w-[28px] text-[#b5711a]" />
                  <h2 className="font-display text-[26px] font-bold text-[#2c0c47] sm:text-[30px]">
                    Send Us a Message
                  </h2>
                </div>
                <p className="mt-[8px] text-[14px] text-[#6c6b78]">
                  Fill out the form below and our team will get back to you
                  shortly.
                </p>

                {isSubmitted && (
                  <div
                    role="alert"
                    className="mt-4 flex items-center gap-2 rounded-[8px] bg-green-50 border border-green-200 p-3 text-green-700 text-[13px] font-medium"
                  >
                    <svg
                      className="h-5 w-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Message sent successfully! We&apos;ll get back to you soon.
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="mt-[28px] space-y-[18px]"
                >
                  {/* Row 1: Name + Email */}
                  <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                    <div className="relative">
                      <UserIcon
                        className={`absolute left-[14px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${errors.name ? "text-red-400" : "text-[#9a98a5]"}`}
                      />
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`h-[48px] w-full rounded-[8px] border bg-white pl-[42px] pr-4 text-[14px] text-[#333] placeholder-[#9a98a5] outline-none transition-colors focus:border-[#6b3fa0] focus:ring-1 focus:ring-[#6b3fa0]/30 ${errors.name ? "border-red-400" : "border-[#e8e2d8]"}`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-[12px] text-red-500">
                        {errors.name}
                      </p>
                    )}
                    <div className="relative">
                      <MailIconOutline
                        className={`absolute left-[14px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${errors.email ? "text-red-400" : "text-[#9a98a5]"}`}
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`h-[48px] w-full rounded-[8px] border bg-white pl-[42px] pr-4 text-[14px] text-[#333] placeholder-[#9a98a5] outline-none transition-colors focus:border-[#6b3fa0] focus:ring-1 focus:ring-[#6b3fa0]/30 ${errors.email ? "border-red-400" : "border-[#e8e2d8]"}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-[12px] text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Row 2: Phone + Subject */}
                  <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                    <div className="relative">
                      <PhoneIcon
                        className={`absolute left-[14px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${errors.phone ? "text-red-400" : "text-[#9a98a5]"}`}
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`h-[48px] w-full rounded-[8px] border bg-white pl-[42px] pr-4 text-[14px] text-[#333] placeholder-[#9a98a5] outline-none transition-colors focus:border-[#6b3fa0] focus:ring-1 focus:ring-[#6b3fa0]/30 ${errors.phone ? "border-red-400" : "border-[#e8e2d8]"}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-[12px] text-red-500">
                        {errors.phone}
                      </p>
                    )}
                    <div className="relative">
                      <PenIcon
                        className={`absolute left-[14px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${errors.subject ? "text-red-400" : "text-[#9a98a5]"}`}
                      />
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`h-[48px] w-full appearance-none rounded-[8px] border bg-white pl-[42px] pr-10 text-[14px] text-[#333] outline-none transition-colors focus:border-[#6b3fa0] focus:ring-1 focus:ring-[#6b3fa0]/30 ${errors.subject ? "border-red-400" : "border-[#e8e2d8]"}`}
                      >
                        <option value="">Subject</option>
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-[14px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#9a98a5]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9.5 6 6 6-6" />
                      </svg>
                    </div>
                    {errors.subject && (
                      <p className="mt-1 text-[12px] text-red-500">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Row 3: Message */}
                  <div className="relative">
                    <MessageIcon
                      className={`absolute left-[14px] top-[16px] h-[18px] w-[18px] ${errors.message ? "text-red-400" : "text-[#9a98a5]"}`}
                    />
                    <textarea
                      name="message"
                      placeholder="Your Message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full resize-none rounded-[8px] border bg-white pl-[42px] pr-4 pt-[14px] text-[14px] text-[#333] placeholder-[#9a98a5] outline-none transition-colors focus:border-[#6b3fa0] focus:ring-1 focus:ring-[#6b3fa0]/30 ${errors.message ? "border-red-400" : "border-[#e8e2d8]"}`}
                    />
                  </div>
                  {errors.message && (
                    <p className="text-[12px] text-red-500">{errors.message}</p>
                  )}

                  {/* Honeypot — hidden from humans, bots fill it automatically */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      opacity: 0,
                    }}
                    tabIndex={-1}
                  >
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[8px] bg-[radial-gradient(circle_at_35%_30%,#5e1c8f,#3f0f55)] text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(94,28,143,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(94,28,143,0.5)] sm:w-[260px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <svg
                        className="h-[18px] w-[18px] animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <>
                        Send Message
                        <svg
                          className="h-[18px] w-[18px]"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right: Info Cards */}
              <div className="space-y-[24px]">
                {/* Spiritual Journey Card */}
                <div className="overflow-hidden rounded-[14px] bg-[radial-gradient(130%_120%_at_50%_20%,#3a1560_0%,#2a0f46_50%,#1b0a2e_100%)]">
                  <div className="relative h-[200px] w-full">
                    <Image
                      src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/trust-candles.png"
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1b0a2e] via-[#1b0a2e]/60 to-transparent" />
                  </div>
                  <div className="relative -mt-[60px] px-[24px] pb-[28px]">
                    {/* Lotus ornament */}
                    <div className="mb-[12px] flex items-center gap-2 text-gold">
                      <span className="block h-px w-[20px] bg-gold/50" />
                      <LotusSolidIcon className="h-[14px] w-[14px]" />
                      <span className="block h-px w-[20px] bg-gold/50" />
                    </div>
                    <h3 className="font-display text-[20px] font-bold text-white">
                      Your Spiritual
                      <br />
                      Journey Matters
                    </h3>
                    <p className="mt-[10px] text-[13px] leading-[1.65] text-white/80">
                      We will connect with you and guide you in the best
                      possible way.
                    </p>
                  </div>
                </div>

                {/* Location Card */}
                <div className="rounded-[14px] border border-[#e8e2d8] bg-white px-[24px] py-[20px]">
                  <div className="flex items-center gap-2.5">
                    <MapPinIcon className="h-[22px] w-[22px] text-[#6b3fa0]" />
                    <h3 className="font-display text-[18px] font-bold text-[#2c0c47]">
                      Our Location
                    </h3>
                  </div>
                  <p className="mt-[6px] text-[13px] text-[#6c6b78]">
                    Indore, Madhya Pradesh, India
                  </p>
                  <div className="mt-[14px] h-[180px] w-full overflow-hidden rounded-[10px] border border-[#e8e2d8] bg-[#f5f0e8]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119063.54827605734!2d75.8571767!3d22.7177632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad19e1b1c3%3A0x2b21812c8787e3!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1721184000000!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${SITE_NAME} Location - Indore`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OTHER WAYS TO CONNECT */}
        <section className="bg-[#fdf8f0]">
          <div className="mx-auto w-full max-w-[1336px] px-5 pb-[50px] sm:pb-[60px]">
            <div className="flex items-center justify-center gap-4">
              <Flourish flip />
              <h2 className="font-display text-center text-[24px] leading-tight font-bold text-[#2c0c47] sm:text-[28px] lg:text-[32px]">
                Other Ways to Connect
              </h2>
              <Flourish />
            </div>

            <div className="mt-[40px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-5">
              {CONTACT_METHODS.map(
                ({
                  icon: Icon,
                  iconBg,
                  title,
                  subtitle,
                  value,
                  valueColor,
                  buttonLabel,
                  buttonHref,
                  buttonText,
                  borderColor,
                }) => (
                  <article
                    key={title}
                    className={`flex flex-col items-center rounded-[14px] border ${borderColor} bg-white px-[20px] py-[28px] text-center transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]`}
                  >
                    <span
                      className={`flex h-[52px] w-[52px] items-center justify-center rounded-full ${iconBg}`}
                    >
                      <Icon className="h-[26px] w-[26px] text-white" />
                    </span>
                    <h3 className="mt-[14px] text-[15px] font-bold text-[#2c0c47]">
                      {title}
                    </h3>
                    <p className="mt-[4px] text-[12px] text-[#6c6b78]">
                      {subtitle}
                    </p>
                    <p
                      className={`mt-[6px] text-[12.5px] font-medium ${valueColor}`}
                    >
                      {value}
                    </p>
                    <Link
                      href={buttonHref}
                      target={
                        buttonHref.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        buttonHref.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={`mt-[16px] inline-flex h-[34px] items-center gap-1.5 rounded-[6px] border ${borderColor} px-[16px] text-[12.5px] font-semibold ${buttonText} transition-colors hover:bg-gray-50`}
                    >
                      {buttonLabel}
                      <ArrowRightIcon className="h-[12px] w-[12px]" />
                    </Link>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="relative overflow-hidden bg-[radial-gradient(130%_140%_at_50%_30%,#3a1560_0%,#2a0f46_50%,#1b0a2e_100%)]">
          <div className="haze pointer-events-none absolute inset-0 opacity-50" />

          {/* Lotus decoration left */}
          <div className="absolute left-[5%] top-1/2 -translate-y-1/2 opacity-30 md:opacity-50">
            <Image
              src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/lotus_candles_no_bg.png"
              alt={SITE_NAME}
              width={460}
              height={460}
              className="h-[120px] w-auto object-contain"
            />
          </div>

          <div className="relative mx-auto flex w-full max-w-[1336px] flex-col items-center justify-between gap-[24px] px-5 py-[40px] sm:flex-row sm:py-[50px]">
            <div className="max-w-[600px] text-center sm:text-left">
              <h2 className="font-display text-[22px] font-bold text-white sm:text-[26px] lg:text-[28px]">
                Ready to Begin Your Transformation?
              </h2>
              <p className="mt-[10px] text-[14px] leading-[1.7] text-white/80">
                Book a consultation with our experts and take the first step
                towards a better, happier and balanced life.
              </p>
            </div>
            <Link
              href="/consultation"
              className="flex h-[48px] shrink-0 items-center gap-2.5 rounded-[8px] bg-gradient-to-b from-gold-2 to-gold-3 px-[28px] text-[14px] font-semibold text-[#2b0a3d] shadow-[0_4px_14px_rgba(233,184,92,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(233,184,92,0.5)]"
            >
              Book Your Consultation
              <CalendarIcon className="h-[17px] w-[17px]" />
            </Link>
          </div>
        </section>

        {/* CUSTOM FOOTER */}
        <footer className="relative overflow-hidden bg-[#0c0620] text-white">
          <div className="haze pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[40px] pb-[24px]">
            <div className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-[220px_1fr_1fr_1fr_1fr]">
              {/* Brand Column */}
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
                  {[
                    {
                      Icon: FacebookIcon,
                      label: "Facebook",
                      bg: "bg-[#3b5998]",
                      href: "https://facebook.com/amoooguru",
                    },
                    {
                      Icon: InstagramIcon,
                      label: "Instagram",
                      bg: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
                      href: "https://instagram.com/amooguru_official",
                    },
                    {
                      Icon: YoutubeIcon,
                      label: "YouTube",
                      bg: "bg-[#ff0000]",
                      href: "https://youtube.com/@amoooguru",
                    },
                    {
                      Icon: WhatsAppIcon,
                      label: "WhatsApp",
                      bg: "bg-[#25D366]",
                      href: WHATSAPP_URL,
                    },
                    {
                      Icon: SendIcon,
                      label: "Telegram",
                      bg: "bg-[#0088cc]",
                      href: "https://t.me/amoooguru",
                    },
                  ].map(({ Icon, label, bg, href }) => (
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

              {/* Quick Links */}
              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Quick Links
                </h3>
                <ul className="space-y-[8px]">
                  {FOOTER_LINKS.quickLinks.map((link) => (
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

              {/* Our Services */}
              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Our Services
                </h3>
                <ul className="space-y-[8px]">
                  {FOOTER_LINKS.ourServices.map((link) => (
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

              {/* Resources */}
              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Resources
                </h3>
                <ul className="space-y-[8px]">
                  {FOOTER_LINKS.resources.map((link) => (
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

              {/* Contact Info */}
              <div>
                <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                  Contact Info
                </h3>
                <ul className="space-y-[10px]">
                  {CONTACT_INFO.map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-center gap-2.5 text-[12px] text-white/80"
                    >
                      <Icon className="h-[14px] w-[14px] shrink-0 text-gold" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="relative border-t border-white/10">
            <div className="mx-auto flex w-full max-w-[1336px] items-center justify-center px-5 py-[14px]">
              <p className="text-[12px] text-white/65">
                &copy; 2025 {SITE_NAME}. All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <span
      aria-hidden
      className={`hidden items-center gap-1.5 text-gold sm:flex ${
        flip ? "flex-row-reverse" : ""
      }`}
    >
      <span className="h-[7px] w-[7px] rotate-45 border border-gold/70" />
      <span className="block h-px w-[40px] bg-gold/60" />
      <span className="h-[5px] w-[5px] rotate-45 bg-gold/70" />
    </span>
  );
}
