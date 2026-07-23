"use client";

import { ShieldCheck, Crown, CalendarDays, Star, IndianRupee, ArrowRight, Loader2 } from "lucide-react";
import { useApi, useApiList } from "@/lib/useApi";
import { api } from "@/lib/api";

export default function AccountInformation() {
  const { data: profile, loading: pLoading, error: pError } = useApi<any>(() => api.getProfile());
  // /api/subscriptions is paginated -> `{ data, meta }`, never a bare array.
  const { items: subs, loading: sLoading } = useApiList<any>(() => api.getSubscriptions());
  const user = profile?.user || profile || {};
  const hasPremium = subs.some((s: any) => s.status === "active");
  const loading = pLoading || sLoading;

  const tiles = [
    {
      label: "Account Type",
      value: hasPremium ? "Premium User" : "Free User",
      Icon: Crown,
      circle: "bg-[#fbecc9]",
      icon: "text-[#e0932a]",
    },
    {
      label: "Member Since",
      value: user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—",
      Icon: CalendarDays,
      circle: "bg-[#ece5fb]",
      icon: "text-[#6b3fa0]",
    },
    {
      label: "Reward Points",
      value: user.points ? `${Number(user.points).toLocaleString("en-IN")} Points` : "—",
      Icon: Star,
      circle: "bg-[#ece5fb]",
      icon: "text-[#6b3fa0]",
    },
    {
      label: "Wallet Balance",
      value: user.wallet_balance ? `₹${Number(user.wallet_balance).toLocaleString("en-IN")}` : "—",
      Icon: IndianRupee,
      circle: "bg-[#f4edfb]",
      icon: "text-[#9a6fd0]",
    },
  ];
  return (
    <div className="rounded-[16px] border border-[#efe6d6] bg-white px-6 pb-[22px] pt-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center gap-[10px]">
        <ShieldCheck className="h-[22px] w-[22px] text-[#6b3fa0]" strokeWidth={1.8} />
        <h2 className="font-display text-[20px] font-bold text-[#2b0f47]">Account Information</h2>
      </div>

      {/* Stat tiles */}
      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : pError ? (
        <p className="mt-4 text-[12.5px] text-red-500">{pError}</p>
      ) : (
      <div className="mt-4 grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, Icon, circle, icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-[12px] border border-[#eee8f2] bg-[#fbfafd] px-4 py-[13px]"
          >
            <span className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${circle}`}>
              <Icon className={`h-[19px] w-[19px] ${icon}`} strokeWidth={1.8} />
            </span>
            <div className="min-w-0 leading-[1.3]">
              <p className="whitespace-nowrap text-[12px] text-[#6c6b78]">{label}</p>
              <p className="whitespace-nowrap text-[14px] font-semibold text-[#2b0f47]">{value}</p>
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="mt-[18px] h-px bg-[#efe6d6]" />

      {/* Profile completion */}
      <div className="mt-[18px] flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#2b0f47]">Profile Completion</span>
            <span className="text-[12.5px] text-[#6c6b78]">85% Completed</span>
          </div>
          <div className="mt-[10px] h-[10px] w-full rounded-full bg-[#ece7f2]">
            <div className="relative h-full w-[85%] rounded-full bg-gradient-to-r from-[#2e1258] via-[#8a3bb0] to-[#efac3e]">
              <span className="absolute right-0 top-1/2 h-[14px] w-[14px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#f5c56a] shadow-[0_0_8px_2px_rgba(233,168,60,.55)]" />
            </div>
          </div>
          <p className="mt-[11px] text-[12.5px] text-[#6c6b78]">
            Complete your profile to get more accurate predictions and better recommendations.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-gradient-to-b from-[#6a2fb5] to-[#4a1c86] px-[26px] py-[14px] text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(75,31,131,.32)]"
        >
          Complete Now
          <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
