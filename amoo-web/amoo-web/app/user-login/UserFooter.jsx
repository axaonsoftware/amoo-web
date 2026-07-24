import { Instagram, Facebook, Youtube, Phone, Mail, Clock } from "lucide-react";

const quickLinks = [
  "Home",
  "About Us",
  "Services",
  "Consultation",
  "Blog",
  "Contact Us",
];
const software = [
  "Numerology Software",
  "Tarot Software",
  "Kundali Software",
  "Vastu Software",
  "Reiki Healing Software",
  "All Software",
];
const support = [
  "FAQ",
  "Privacy Policy",
  "Terms & Conditions",
  "Refund Policy",
  "Cancellation Policy",
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
              <Phone size={14} /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} /> support@amooguru.com
            </li>
            <li className="flex items-center gap-2">
              <Clock size={14} /> Mon - Sat: 10 AM - 8 PM
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/10 mt-10 pt-5 text-center text-xs text-white/40">
        © 2025 Amoo Guru. All Rights Reserved.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-amber-500 font-semibold text-sm mb-3">{title}</h4>
      <ul className="space-y-2 text-white/70 text-sm">
        {links.map((link) => (
          <li key={link} className="hover:text-white cursor-pointer">
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
}
