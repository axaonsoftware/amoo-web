"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Bell, ChevronDown, Globe } from "lucide-react";
import { SidebarToggleButton } from "@/app/components/sidebar-shell";
import { useAuth } from "../../lib/auth-context";

export default function AdminTopbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center gap-4 border-b border-[#efe9f6] bg-white px-4 sm:px-6">
      <SidebarToggleButton className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#ece4f6] bg-[#f8f5fc] text-[#3d1a63] lg:hidden" />

      {/* Search */}
      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-[430px]">
          <input
            type="text"
            placeholder="Search anything..."
            className="h-[44px] w-full rounded-full border border-[#ece4f6] bg-[#faf8fd] pl-5 pr-[52px] text-[13px] text-[#3d1a63] outline-none placeholder:text-[#a49bb1]"
          />
          <span className="absolute right-[5px] top-1/2 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white">
            <Search className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-lg border border-[#ece4f6] px-3.5 py-2 text-[12px] font-medium text-[#3d1a63] transition-colors hover:bg-[#3d1a63] hover:text-white sm:inline-flex"
        >
          <Globe className="h-[14px] w-[14px]" strokeWidth={1.8} />
          Visit Website
        </Link>

        <button type="button" aria-label="Notifications" className="relative">
          <Bell className="h-[21px] w-[21px] text-[#3d1a63]" strokeWidth={1.8} />
          <span className="absolute -right-[7px] -top-[7px] flex h-[17px] w-[17px] items-center justify-center rounded-full border-2 border-white bg-[#ef4444] text-[9px] font-bold text-white">
            5
          </span>
        </button>

        <div className="flex items-center gap-2.5">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt=""
              width={80}
              height={80}
              unoptimized
              className="h-[42px] w-[42px] rounded-full object-cover"
            />
          ) : (
            <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#3d1a63] text-white text-sm font-bold">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="hidden leading-tight sm:block">
            <p className="text-[13.5px] font-semibold text-[#2a1148]">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-[#8b8397] capitalize">{user?.role || "Super Admin"}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-[#8b8397]" strokeWidth={2} />
        </div>
      </div>
    </header>
  );
}
