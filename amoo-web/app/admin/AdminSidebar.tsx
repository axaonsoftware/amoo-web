"use client";

import {  usePathname  } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {  SidebarShell  } from "@/app/components/sidebar-shell";
import { 
  Home, 
  User, 
  UserCog, 
  CalendarDays, 
  CalendarCheck, 
  CreditCard, 
  BarChart3, 
  LayoutGrid, 
  HandHeart, 
  FileText, 
  Tag, 
  Bell, 
  ScrollText, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight, 
  Flower2, 
  Gift, 
  Orbit, 
  Layers, 
  Package, 
  Ticket, 
  Inbox, 
  MessageSquareQuote, 
  CalendarClock, 
  LogOut } from "lucide-react";

const nav: {
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  href: string;
}[] = [
  { label: "Dashboard", Icon: Home, href: "/admin/admin-dashboard" },
  {
    label: "Consultation Management",
    Icon: CalendarDays,
    href: "/admin/consultation-management",
  },
  {
    label: "Booking Management",
    Icon: CalendarCheck,
    href: "/admin/booking-management",
  },
  {
    label: "Numerology Management",
    Icon: LayoutGrid,
    href: "/admin/numerology-management",
  },
  {
    label: "Reiki Management",
    Icon: HandHeart,
    href: "/admin/reiki-management",
  },
  { label: "Pricing Management", Icon: Tag, href: "/admin/pricing-management" },
  {
    label: "Services Management",
    Icon: Package,
    href: "/admin/services-management",
  },
  {
    label: "Kundali Management",
    Icon: Orbit,
    href: "/admin/kundali-management",
  },
  { label: "Tarot Management", Icon: Layers, href: "/admin/tarot-management" },
  {
    label: "Report Management",
    Icon: FileText,
    href: "/admin/report-management",
  },
  {
    label: "Reports & Analytics",
    Icon: BarChart3,
    href: "/admin/reports-analytics",
  },
  {
    label: "Payments & Finance",
    Icon: CreditCard,
    href: "/admin/payments-finance",
  },
  { label: "Packages & Offers", Icon: Gift, href: "/admin/packages-offers" },
  { label: "Coupons", Icon: Ticket, href: "/admin/coupon-management" },
  {
    label: "Availability & Slots",
    Icon: CalendarClock,
    href: "/admin/availability-slots",
  },
  { label: "Users", Icon: User, href: "/admin/user-management" },
  {
    label: "Expert Management",
    Icon: UserCog,
    href: "/admin/expert-management",
  },
  { label: "Blog Management", Icon: FileText, href: "/admin/blog-management" },
  {
    label: "Testimonials",
    Icon: MessageSquareQuote,
    href: "/admin/testimonial-management",
  },
  { label: "Contact Inbox", Icon: Inbox, href: "/admin/contact-inbox" },
  { label: "FAQ Management", Icon: HelpCircle, href: "/admin/faq-management" },
  {
    label: "Notifications",
    Icon: Bell,
    href: "/admin/notification-management",
  },
  { label: "Activity Logs", Icon: ScrollText, href: "/admin/activity-logs" },
  // "Courses", "Content Management" and "Settings" were removed: all three
  // pointed at /admin/admin-dashboard, so they looked like features and
  // silently dumped the admin back on the dashboard. Re-add them when the
  // pages exist.
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, label: string) {
    if (href === "/admin/admin-dashboard") {
      return label === "Dashboard" && pathname === "/admin/admin-dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <SidebarShell className="bg-gradient-to-b from-[#2a0e46] via-[#1d0733] to-[#160526]">
      {/* Logo */}
      <div className="px-5 pb-3 pt-5">
        <p className="text-center font-display text-[34px] font-bold leading-none tracking-[0.02em] bg-gradient-to-b from-[#f8e2a8] via-[#e9b85c] to-[#c08c2c] bg-clip-text text-transparent">
          AM
          <span className="text-[42px] leading-none tracking-[-0.04em]">∞</span>
        </p>

        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          <span className="h-px w-5 bg-gradient-to-r from-transparent to-[#c9922f]" />
          <span className="font-display text-[11px] font-medium tracking-[0.42em] text-[#e9b85c]">
            GURU
          </span>
          <span className="h-px w-5 bg-gradient-to-l from-transparent to-[#c9922f]" />
        </div>

        <Flower2
          className="mx-auto mt-1.5 h-[18px] w-[18px] text-[#e9b85c]"
          strokeWidth={1.5}
        />

        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          <ShieldCheck
            className="h-[13px] w-[13px] text-[#e9b85c]"
            strokeWidth={1.8}
          />
          <span className="text-[10.5px] font-semibold tracking-[0.18em] text-[#e9b85c]">
            ADMIN PANEL
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[2px] px-3 pb-4">
        {nav.map(({ label, Icon, href }) => {
          const active = isActive(href, label);
          return (
            <Link
              key={label}
              href={href}
              className={
                active
                  ? "relative flex items-center gap-3 rounded-[10px] bg-gradient-to-r from-[#8a5a18] via-[#5c3140] to-[#2f1550] px-3 py-[10px] text-[13px] font-semibold text-[#f3c76e] shadow-[0_4px_14px_rgba(0,0,0,.35)]"
                  : "flex items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13px] font-normal text-[#cfc4dd] transition-colors hover:bg-white/5 hover:text-white"
              }
            >
              <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.6} />
              <span className="flex-1 truncate">{label}</span>
              {active ? (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-[#f3c76e]"
                  strokeWidth={2.2}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mx-5 my-3 h-px bg-white/10" />

      <nav className="px-3">
        <Link
          href="/admin-login"
          className="flex items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13px] font-normal text-[#cfc4dd] transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" strokeWidth={1.6} />
          <span>Log Out</span>
        </Link>
      </nav>

      {/* Promo card */}
      <div className="mt-auto p-4">
        <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-b from-[#5b1e93] via-[#3f1069] to-[#2b0a4a] px-4 pb-2 pt-4 shadow-[0_10px_30px_rgba(0,0,0,.4)]">
          <div className="stars pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <h3 className="font-display text-[15px] font-bold leading-[1.25] text-[#f3c76e]">
              Spirituality Meets
              <br />
              Technology
            </h3>
            <p className="mt-2 text-[10.5px] leading-[1.55] text-white/75">
              Empowering divine
              <br />
              connections worldwide.
            </p>
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"
              alt=""
              width={300}
              height={220}
              unoptimized
              className="mt-2 h-[92px] w-full rounded-[10px] object-cover opacity-90"
            />
          </div>
        </div>
      </div>
    </SidebarShell>
  );
}
