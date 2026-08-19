"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SidebarShell } from "@/app/components/sidebar-shell";
import { api } from "@/lib/api";
import {
  Home,
  MessageSquare,
  CalendarCheck,
  LogOut,
  Flower2,
} from "lucide-react";

function ChatUnreadBadge() {
  const [count, setCount] = useState(0);
  const genRef = useRef(0);

  const fetch_ = useCallback(() => {
    const gen = ++genRef.current;
    api.chat
      .getUnreadCount()
      .then((res: unknown) => {
        if (gen !== genRef.current) return;
        const data = res as { count?: number };
        setCount(data?.count ?? 0);
      })
      .catch(() => {
        if (gen !== genRef.current) return;
      });
  }, []);

  useEffect(() => {
    fetch_();
    const gen = genRef;
    return () => {
      gen.current++;
    };
  }, [fetch_]);

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      fetch_();
    }, 60_000);
    return () => clearInterval(id);
  }, [fetch_]);

  if (count <= 0) return null;

  return (
    <span className="ml-auto flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#e9b85c] px-1.5 text-[10px] font-bold text-[#2a1148]">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const nav = [
  { label: "Dashboard", Icon: Home, href: "/astrologer-dashboard" },
  { label: "Messages", Icon: MessageSquare, href: "/astrologer-dashboard/chat" },
  { label: "My Schedule", Icon: CalendarCheck, href: "/astrologer-dashboard/schedule" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/astrologer-dashboard") return pathname === "/astrologer-dashboard";
    return pathname.startsWith(href);
  };

  return (
    <SidebarShell className="bg-gradient-to-b from-[#200a36] via-[#1a0730] to-[#150525]">
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
              Expert Dashboard
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-[3px] px-3">
        {nav.map(({ label, Icon, href }) => {
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
              {label === "Messages" && <ChatUnreadBadge />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <Link
          href="/astrologer-login"
          className="flex items-center gap-3 rounded-[12px] px-3 py-[10px] text-[13.5px] text-[#cec2de] transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
          <span>Log Out</span>
        </Link>
      </div>
    </SidebarShell>
  );
}
