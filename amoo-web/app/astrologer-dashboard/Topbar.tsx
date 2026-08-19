"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { SidebarToggleButton } from "@/app/components/sidebar-shell";
import { useAuth } from "@/lib/auth-context";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-[70px] shrink-0 items-center gap-4 border-b border-[#ece3d5] bg-[#fdfbf7] px-5 lg:px-6">
      <SidebarToggleButton className="flex h-9 w-9 items-center justify-center rounded-lg text-[#3f1268] lg:hidden" />

      <div className="ml-auto flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <span className="relative block h-[42px] w-[42px] shrink-0 overflow-hidden rounded-full ring-2 ring-[#e9b85c]">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || "Expert"}
                fill
                sizes="42px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[#4a1c7d] text-white text-sm font-bold">
                {(user?.name || "E").charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <div className="hidden leading-tight md:block">
            <p className="text-[14px] font-semibold text-[#2b0f47]">
              {user?.name || "Expert"}
            </p>
            <p className="text-[11.5px] text-[#8b8697] capitalize">
              {user?.kind || "expert"}
            </p>
          </div>
          <ChevronDown
            className="h-[18px] w-[18px] text-[#4a1c7d]"
            strokeWidth={2}
          />
        </div>
      </div>
    </header>
  );
}
