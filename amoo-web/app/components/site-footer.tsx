import Image from "next/image";
import Link from "next/link";
import {
  CaretBulletIcon,
  ClockSolidIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "./home-icons";
import {
  WHATSAPP_URL,
  CONTACT_PHONE,
  CONTACT_EMAIL,
  SITE_NAME,
  SOCIAL_LINKS,
  BUSINESS_HOURS,
} from "../../lib/constants";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Consultation", href: "/consultation" },
  { label: "Pricing", href: "/consultation/consultation-pricing" },
  // { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

const OUR_SERVICES_LINKS = [
  { label: "Numerology", href: "/services/numerology-services" },
  { label: "Reiki Healing", href: "/services/reiki-healing" },
  { label: "Tarot Reading", href: "/services/tarot-reading" },
  { label: "Kundali Analysis", href: "/services" },
  { label: "Chakra Healing", href: "/services/reiki-healing" },
  { label: "Spiritual Guidance", href: "/services" },
  { label: "Combo Consultation", href: "/consultation" },
];

const CONSULTATION_LINKS = [
  { label: "Audio Call", href: "/consultation/select-service" },
  { label: "Video Call", href: "/consultation/select-service" },
  { label: "Chat Consultation", href: "/consultation/select-service" },
  { label: "Distance Healing", href: "/consultation/select-service" },
  { label: "In-Person Meeting", href: "/consultation/select-service" },
  { label: "Packages", href: "/consultation/consultation-pricing" },
];

const SUPPORT_LINKS = [
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Cancellation Policy", href: "/cancellation" },
  { label: "Contact Us", href: "/contact" },
];

const COLUMNS = [
  { title: "Quick Links", links: QUICK_LINKS },
  { title: "Our Services", links: OUR_SERVICES_LINKS },
  { title: "Consultation", links: CONSULTATION_LINKS },
  { title: "Support", links: SUPPORT_LINKS },
];

const BRAND_SOCIALS = [
  {
    label: "Facebook",
    Icon: FacebookIcon,
    className: "bg-[#3b5998] text-white",
    href: SOCIAL_LINKS.facebook,
  },
  {
    label: "Instagram",
    Icon: InstagramIcon,
    className:
      "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white",
    href: SOCIAL_LINKS.instagram,
  },
  {
    label: "YouTube",
    Icon: YoutubeIcon,
    className: "bg-[#ff0000] text-white",
    href: SOCIAL_LINKS.youtube,
  },
  {
    label: "WhatsApp",
    Icon: WhatsAppIcon,
    className: "bg-[#25D366] text-white",
    href: WHATSAPP_URL,
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#100820] text-white">
      <div className="haze pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[22px] pb-[14px]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[210px_repeat(4,1fr)_218px]">
          {/* Brand */}
          <div className="col-span-2 flex flex-col items-center text-center sm:col-span-1">
            <Image
              src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/logo-footer.png"
              alt={SITE_NAME}
              width={460}
              height={460}
              className="h-[84px] w-auto object-contain"
            />
            <p className="mt-[10px] text-[11.5px] leading-[18px] text-white/80">
              Guiding You Towards
              <br />
              Clarity, Healing &amp; Abundance
            </p>
            <div className="mt-[14px] flex items-center gap-[10px]">
              {BRAND_SOCIALS.map(({ label, Icon, className, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`flex h-[26px] w-[26px] items-center justify-center rounded-full ${className}`}
                >
                  <Icon className="h-[14px] w-[14px]" />
                </Link>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
                {column.title}
              </h3>
              <ul className="space-y-[9px]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-[11.5px] text-white/80 transition-colors hover:text-gold"
                    >
                      <CaretBulletIcon className="h-[8px] w-[8px] shrink-0 text-gold/90" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="mb-[14px] text-[14px] font-semibold text-gold">
              Contact Us
            </h3>
            <ul className="space-y-[10px]">
              {/* <li className="flex items-center gap-2.5 text-[11.5px] text-white/85">
                <PhoneIcon className="h-[14px] w-[14px] shrink-0 text-gold" />
                {CONTACT_PHONE}
              </li> */}
              <li className="flex items-center gap-2.5 text-[11.5px] text-white/85">
                <MailIcon className="h-[14px] w-[14px] shrink-0 text-gold" />
                {CONTACT_EMAIL}
              </li>
              <li className="flex items-center gap-2.5 text-[11.5px] text-white/85">
                <ClockSolidIcon className="h-[14px] w-[14px] shrink-0 text-gold" />
                {BUSINESS_HOURS}
              </li>
            </ul>

            <h3 className="mt-[18px] mb-[12px] text-[14px] font-semibold text-gold">
              Follow Us
            </h3>
            <div className="flex items-center gap-2.5">
              {BRAND_SOCIALS.map(({ label, Icon, className, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`flex h-[26px] w-[26px] items-center justify-center rounded-full ${className}`}
                >
                  <Icon className="h-[14px] w-[14px]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1336px] items-center justify-between px-5 py-[13px]">
          <p className="text-[11.5px] text-white/70">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All Rights Reserved.
          </p>
          <p className="hidden items-center gap-1.5 text-[11.5px] text-white/70 sm:flex">
            Developed by{" "}
            <Link
              href="https://www.axaonsoftware.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white"
            >
              Axaon Software
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
