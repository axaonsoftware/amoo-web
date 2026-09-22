import Link from "next/link";
import { Instagram, Facebook, Youtube, Phone, Mail, Clock } from "lucide-react";
import { CONTACT_PHONE, CONTACT_EMAIL, SITE_NAME } from "../../lib/constants";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Consultation", href: "/consultation" },
  // { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];
const software = [
  { label: "Numerology", href: "/services/numerology-services" },
  { label: "Tarot Reading", href: "/services/tarot-reading" },
  { label: "Kundali Analysis", href: "/services" },
  { label: "Reiki Healing", href: "/services/reiki-healing" },
  { label: "Chakra Healing", href: "/services/reiki-healing" },
  { label: "All Services", href: "/services" },
];
const support = [
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Cancellation Policy", href: "/cancellation" },
];

export default function UserFooter() {
  return (
    <footer className="w-full bg-[#150b21] text-white pt-14 pb-6 px-6 mt-0">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <h3
            className="text-2xl font-serif font-bold"
            style={{
              background: "linear-gradient(180deg,#F3D07A 0%,#C9932F 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AMOO
          </h3>
          <p className="text-xs tracking-[0.4em] text-amber-500 -mt-1">GURU</p>
          <p className="text-white/60 text-xs mt-3 leading-relaxed">
            Guiding You Towards Clarity, Healing &amp; Abundance
          </p>
          <div className="flex gap-3 mt-4">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <span
                key={i}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <Icon size={14} />
              </span>
            ))}
          </div>
        </div>

        <FooterColumn title="Quick Links" links={quickLinks} />
        <FooterColumn title="Our Software" links={software} />
        <FooterColumn title="Support" links={support} />

        {/* Contact column */}
        <div>
          <h4 className="text-amber-500 font-semibold text-sm mb-3">
            Contact Us
          </h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} /> {CONTACT_PHONE}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} /> {CONTACT_EMAIL}
            </li>
            <li className="flex items-center gap-2">
              <Clock size={14} /> Mon - Sat: 10 AM - 8 PM
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/10 mt-10 pt-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {SITE_NAME}. All Rights Reserved.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-amber-500 font-semibold text-sm mb-3">{title}</h4>
      <ul className="space-y-2 text-white/70 text-sm">
        {links.map((item) => (
          <li
            key={typeof item === "string" ? item : item.label}
            className="hover:text-white"
          >
            {typeof item === "string" ? (
              item
            ) : (
              <Link
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
