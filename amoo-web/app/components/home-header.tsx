"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, GiftIcon, WhatsAppIcon } from "./home-icons";
import { Menu, X, LogOut } from "lucide-react";
import { WHATSAPP_URL, SITE_NAME } from "../../lib/constants";
import { useAuth } from "../../lib/auth-context";

type DropdownItem = { label: string; href: string };
type NavItem = {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
};

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    dropdown: [
      { label: "Services Overview", href: "/services" },
      { label: "Tarot Reading", href: "/services/tarot-reading" },
      { label: "Reiki Healing", href: "/services/reiki-healing" },
      { label: "Numerology Services", href: "/services/numerology-services" },
    ],
  },
  {
    label: "Consultation",
    href: "/consultation",
    dropdown: [
      { label: "Overview", href: "/consultation" },
      { label: "Pricing", href: "/consultation/consultation-pricing" },
      { label: "select service", href: "/consultation/select-service" },
      { label: "Consultation Mode", href: "/consultation/consultation-mode" },
      { label: "Select Date/Time", href: "/consultation/select-date-time" },

      { label: "Booking", href: "/consultation/select-service" },
      {
        label: "Consultation Booking",
        href: "/consultation/consultation-booking",
      },
      { label: "Payment", href: "/consultation/consultation-payment" },
      { label: "Confirmation", href: "/consultation/booking-confirmation" },
    ],
  },
  {
    label: "Software",
    href: "/software-hub",
    dropdown: [
      { label: "Software Hub", href: "/software-hub" },
      { label: "Basic Kundali", href: "/software-hub/basic-kundali-software" },
      { label: "Tarot Software", href: "/software-hub/tarot-software" },
      {
        label: "Numerology Software",
        href: "/software-hub/numerology-software",
      },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  {
    label: "Login",
    href: "/user-login",
    dropdown: [
      { label: "User Login", href: "/user-login" },
      { label: "Astrologer Login", href: "/astrologer-login" },
      { label: "Admin Login", href: "/admin-login" },
    ],
  },
];

export function OfferBar() {
  return (
    <div className="relative z-40 flex min-h-[43px] w-full items-center justify-center bg-offer px-5 py-1.5">
      <div className="flex items-center gap-2.5">
        <GiftIcon className="h-[15px] w-[15px] text-gold" />
        <p className="text-[13px] font-semibold text-white">
          Special Offer: Get 15% OFF on All Consultations This Week Only!
        </p>
        <p className="ml-3 hidden text-[13px] text-white sm:block">
          Use Code:{" "}
          <span className="font-bold tracking-[0.01em] text-gold">
            AMOOGURU15
          </span>
        </p>
        <Link
          href="/consultation/select-service"
          className="ml-3 hidden h-[24px] items-center rounded-full border border-gold/70 px-3.5 text-[12px] font-semibold text-gold sm:flex"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

export function HomeHeader({ absolute = true }: { absolute?: boolean }) {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDesktopOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header
      ref={headerRef}
      className={`${absolute ? "absolute inset-x-0 top-0" : "relative bg-[#170426]"} z-30`}
    >
      <div className="mx-auto flex h-[66px] w-full max-w-[1336px] items-center justify-between gap-3 px-5 sm:h-[86px] sm:gap-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/imagesP/amooLogoP.png"
            alt={SITE_NAME}
            width={350}
            height={150}
            priority
            className="h-[48px] w-auto object-contain sm:h-[72px]"
          />
        </Link>

        <nav className="hidden items-center gap-[26px] lg:flex">
          {NAV.filter((item) => !isAuthenticated || item.label !== "Login").map((item) => {
            const active = isActive(item.href);
            const hasDropdown = !!item.dropdown;
            const isOpen = desktopOpen === item.label;

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => hasDropdown && setDesktopOpen(item.label)}
                onMouseLeave={() => hasDropdown && setDesktopOpen(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 text-[14px] transition-colors ${
                    active
                      ? "font-medium text-gold"
                      : "font-normal text-white hover:text-gold"
                  }`}
                >
                  {item.label}
                  {hasDropdown && (
                    <ChevronDownIcon
                      className={`mt-px h-[13px] w-[13px] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>

                {hasDropdown && isOpen && item.dropdown && (
                  <div className="absolute left-0 top-full w-56 rounded-xl border border-white/10 bg-[#170426] py-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => setDesktopOpen(null)}
                        className={`flex items-center px-4 py-2.5 text-[13px] transition-colors ${
                          isActive(sub.href)
                            ? "text-gold font-medium"
                            : "text-white/70 hover:bg-white/5 hover:text-gold"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-[14px] font-normal text-white hover:text-gold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[40px] items-center gap-2 rounded-full border border-gold/70 bg-black/35 pr-4 pl-1.5 text-[13px] font-medium text-white"
          >
            <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#25D366] text-white">
              <WhatsAppIcon className="h-[18px] w-[18px]" />
            </span>
            <span className="hidden sm:inline">WhatsApp Us</span>
          </a>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex h-[40px] items-center gap-2 rounded-[6px] bg-gradient-to-b from-gold-2 to-gold px-5 text-[13px] font-medium text-ink"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <Link
              href="/user-login"
              className="flex h-[40px] items-center rounded-[6px] bg-gradient-to-b from-gold-2 to-gold px-5 text-[13px] font-medium text-ink"
            >
              Login / Register
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex lg:hidden h-[40px] w-[40px] items-center justify-center rounded-lg border border-white/20 text-white"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#170426] lg:hidden">
          <div className="mx-auto max-w-[1336px] px-5 py-4 space-y-1">
            {NAV.filter((item) => !isAuthenticated || item.label !== "Login").map((item) => {
              const active = isActive(item.href);
              const hasDropdown = !!item.dropdown;
              const isSubOpen = mobileSubOpen === item.label;

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex-1 py-2.5 text-[14px] transition-colors ${
                        active
                          ? "font-medium text-gold"
                          : "font-normal text-white/80"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {hasDropdown && (
                      <button
                        type="button"
                        onClick={() =>
                          setMobileSubOpen(isSubOpen ? null : item.label)
                        }
                        className="p-2 text-white/60"
                      >
                        <ChevronDownIcon
                          className={`h-3.5 w-3.5 transition-transform ${
                            isSubOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {hasDropdown && isSubOpen && item.dropdown && (
                    <div className="ml-4 border-l border-white/10 pl-4 pb-2">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block py-2 text-[13px] transition-colors ${
                            isActive(sub.href)
                              ? "text-gold font-medium"
                              : "text-white/60 hover:text-gold"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isAuthenticated && (
              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                className="flex w-full items-center gap-2 py-2.5 text-[14px] text-white/80 hover:text-gold transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
