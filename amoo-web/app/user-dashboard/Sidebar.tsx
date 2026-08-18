"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarShell } from "@/app/components/sidebar-shell";
import {
  Home,
  CircleDot,
  FileText,
  LayoutGrid,
  Layers,
  Orbit,
  Flower2,
  Hourglass,
  Wallet,
  Bell,
  CircleUserRound,
  LogOut,
  Crown,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

const primaryNav = [
  { label: "Dashboard", Icon: Home, href: "/user-dashboard" },
  {
    label: "My Consultations",
    Icon: CircleDot,
    href: "/user-dashboard/consultations-booking",
  },
  {
    label: "Messages",
    Icon: MessageSquare,
    href: "/user-dashboard/chat",
  },
  { label: "My Reports", Icon: FileText, href: "/user-dashboard/my-reports" },
  {
    label: "Numerology",
    Icon: LayoutGrid,
    href: "/user-dashboard/numerology-dashboard",
  },
  { label: "Tarot", Icon: Layers, href: "/user-dashboard/tarot-dashboard" },
  { label: "Kundali", Icon: Orbit, href: "/user-dashboard/kundali-dashboard" },
  { label: "Reiki", Icon: Flower2, href: "/user-dashboard/reiki-dashboard" },
];

const secondaryNav = [
  {
    label: "Payments & Subscription",
    Icon: Wallet,
    href: "/user-dashboard/payments-subscription",
  },
  {
    label: "Account & Profile",
    Icon: CircleUserRound,
    href: "/user-dashboard/account-profile",
  },
  { label: "Notifications", Icon: Bell, href: "/user-dashboard" },
  { label: "My Activity", Icon: Hourglass, href: "/user-dashboard/activity" },
  { label: "Log Out", Icon: LogOut, href: "/user-login" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/user-dashboard") return pathname === "/user-dashboard";
    return pathname.startsWith(href);
  };

  return (
    <SidebarShell className="bg-gradient-to-b from-[#200a36] via-[#1a0730] to-[#150525]">
      {/* Logo */}
      <div className="px-5 pb-4 pt-6">
        <div className="text-center">
          <p className="font-display text-[34px] font-bold leading-none tracking-[0.04em] bg-gradient-to-b from-[#f8e2a8] via-[#e9b85c] to-[#c08c2c] bg-clip-text text-transparent">
            AMOO
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#c9922f]" />
            <span className="font-display text-[12px] font-medium tracking-[0.42em] text-[#e9b85c]">
              GURU
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#c9922f]" />
          </div>
          <div className="mt-2.5 flex items-start justify-center gap-1.5">
            <Flower2 className="mt-[1px] h-4 w-4 shrink-0 text-[#e9b85c]" />
            <p className="text-[9.5px] font-medium leading-[1.5] text-white/70">
              Guiding You Towards Clarity,
              <br />
              Healing &amp; Abundance
            </p>
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-[3px] px-3">
        {primaryNav.map(({ label, Icon, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className={
                active
                  ? "flex items-center gap-3 rounded-[12px] border border-[#a9762c] bg-gradient-to-r from-[#7a4b17] via-[#4d2c39] to-[#33174f] px-3 py-[11px] text-[13.5px] font-semibold text-[#f3c76e] shadow-[0_4px_14px_rgba(0,0,0,.35)]"
                  : "flex items-center gap-3 rounded-[12px] border border-transparent px-3 py-[10px] text-[13.5px] font-normal text-[#cec2de] transition-colors hover:bg-white/5 hover:text-white"
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-5 my-3 h-px bg-white/10" />

      {/* Secondary nav */}
      <nav className="flex flex-col gap-[3px] px-3">
        {secondaryNav.map(({ label, Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-[12px] px-3 py-[10px] text-[13.5px] text-[#cec2de] transition-colors hover:bg-white/5 hover:text-white"
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Premium card */}
      <div className="mt-auto p-4">
        <div className="relative overflow-hidden rounded-[16px] border border-[#8054bf]/45 bg-gradient-to-b from-[#3d1465] via-[#2c0e4c] to-[#1f0736] px-4 pb-4 pt-4 text-center shadow-[0_10px_30px_rgba(0,0,0,.4)]">
          <div className="stars pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <Crown
              className="mx-auto h-6 w-6 text-[#e9b85c]"
              strokeWidth={1.7}
            />
            <div className="mx-auto mt-2 flex items-center justify-center gap-1.5">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c9922f]/70" />
              <span className="h-[3px] w-[3px] rotate-45 bg-[#e9b85c]" />
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9922f]/70" />
            </div>
            <h3 className="mt-2 font-display text-[15px] font-bold text-[#f3c76e]">
              Upgrade to Premium
            </h3>
            <p className="mt-1.5 text-[10.5px] leading-[1.55] text-white/70">
              Unlock advanced reports,
              <br />
              priority support &amp; more.
            </p>
            <Link
              href="/user-dashboard/payments-subscription"
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-4 py-2 text-[11.5px] font-semibold text-[#2a1148] shadow-[0_4px_12px_rgba(0,0,0,.3)]"
            >
              Upgrade Now
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
            </Link>
            <div className="mx-auto mt-3 h-[26px] w-[110px] rounded-t-full border-x border-t border-[#c9922f]/35 opacity-70" />
          </div>
        </div>
      </div>
    </SidebarShell>
  );
}
