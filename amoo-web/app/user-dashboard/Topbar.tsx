"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown, Globe } from "lucide-react";
import { SidebarToggleButton } from "@/app/components/sidebar-shell";
import { useAuth } from "../../lib/auth-context";
import NotificationBell from "./NotificationBell";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-[70px] shrink-0 items-center gap-4 border-b border-[#ece3d5] bg-[#fdfbf7] px-5 lg:px-6">
      <SidebarToggleButton className="flex h-9 w-9 items-center justify-center rounded-lg text-[#3f1268] lg:hidden" />

      <div className="ml-auto flex items-center gap-5">
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-full border border-[#e7ddcb] px-4 py-2 text-[12px] font-medium text-[#4a1c7d] transition-colors hover:bg-[#4a1c7d] hover:text-white sm:inline-flex"
        >
          <Globe className="h-[14px] w-[14px]" strokeWidth={1.8} />
          Visit Website
        </Link>

        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search anything..."
            className="h-[44px] w-[268px] rounded-full border border-[#e7ddcb] bg-white pl-5 pr-12 text-[13px] text-[#3f1268] placeholder:text-[#a09aab] focus:outline-none"
          />
          <span className="pointer-events-none absolute right-0 top-1/2 flex h-[26px] w-[44px] -translate-y-1/2 items-center justify-center border-l border-[#e7ddcb] text-[#4a1c7d]">
            <Search className="h-[17px] w-[17px]" strokeWidth={2} />
          </span>
        </div>

        <NotificationBell />

        <div className="flex items-center gap-2.5">
          <span className="relative block h-[42px] w-[42px] shrink-0 overflow-hidden rounded-full ring-2 ring-[#e9b85c]">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || "User"}
                fill
                sizes="42px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[#4a1c7d] text-white text-sm font-bold">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <div className="hidden leading-tight md:block">
            <p className="text-[14px] font-semibold text-[#2b0f47]">{user?.name || "User"}</p>
            <p className="text-[11.5px] text-[#8b8697] capitalize">{user?.kind || "User"}</p>
          </div>
          <ChevronDown className="h-[18px] w-[18px] text-[#4a1c7d]" strokeWidth={2} />
        </div>
      </div>
    </header>
  );
}
