"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  CalendarIcon,
  ChevronDownIcon,
  NavHomeIcon,
  NavLotusIcon,
  NavSoftwareIcon,
  NavStarIcon,
  NavTagIcon,
  NavUserIcon,
  WhatsAppIcon,
} from "./icons";
import { WHATSAPP_URL, SITE_NAME } from "../../../lib/constants";

type NavItem = {
  label: string;
  href: string;
  icon?: (p: { className?: string }) => React.ReactElement;
  caret?: boolean;
  active?: boolean;
};

const NAV: NavItem[] = [
  { label: "Home", href: "/", icon: NavHomeIcon },
  { label: "About", href: "/about", icon: NavUserIcon },
  { label: "Services", href: "/services", icon: NavLotusIcon, caret: true },
  { label: "Consultation", href: "/consultation", icon: NavStarIcon },
  {
    label: "Pricing",
    href: "/consultation/consultation-pricing",
    icon: NavTagIcon,
  },
  {
    label: "Software Hub",
    href: "/software-hub",
    icon: NavSoftwareIcon,
    active: true,
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-[66px] w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:h-[92px]">
        <Link href="/" className="shrink-0">
          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/amooLogoP.png"
            alt={SITE_NAME}
            width={300}
            height={120}
            preload
            className="h-[52px] w-auto object-contain sm:h-[80px]"
          />
        </Link>

        <nav className="hidden items-center gap-[22px] xl:flex">
          {NAV.map((item) => {
            const Icon = item.icon;

            if (item.active) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex h-[36px] items-center gap-[7px] rounded-[8px] border border-gold/70 bg-gold/[0.07] px-[11px] text-[15px] font-semibold text-gold"
                >
                  {Icon && <Icon className="h-[17px] w-[17px]" />}
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-[7px] text-[15px] font-normal text-white transition-colors hover:text-gold"
              >
                {Icon && <Icon className="h-[17px] w-[17px]" />}
                {item.label}
                {item.caret && <ChevronDownIcon className="mt-px h-[12px] w-[12px]" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-[10px]">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[42px] items-center gap-[9px] rounded-[8px] border border-gold/70 bg-black/40 pr-[15px] pl-[7px] text-[13.5px] font-semibold text-white"
          >
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#25D366] text-white">
              <WhatsAppIcon className="h-[17px] w-[17px]" />
            </span>
            <span className="hidden sm:inline">WhatsApp Us</span>
          </a>

          <Link
            href="/consultation/select-service"
            className="flex h-[42px] items-center gap-[9px] rounded-[8px] bg-gradient-to-b from-[#f7d488] to-[#e0a63c] px-[15px] text-[13.5px] font-semibold text-[#2b0a3d]"
          >
            <CalendarIcon className="h-[17px] w-[17px]" />
            <span className="hidden sm:inline">Book Consultation</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[8px] border border-white/20 text-white xl:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#170426] xl:hidden">
          <div className="mx-auto max-w-[1400px] space-y-1 px-4 py-4">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-[9px] py-2.5 text-[14px] ${
                    item.active ? "font-semibold text-gold" : "text-white/85"
                  }`}
                >
                  {Icon && <Icon className="h-[17px] w-[17px]" />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
