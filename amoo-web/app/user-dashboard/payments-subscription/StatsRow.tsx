"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Coins,
  Loader2,
  Star,
  Wallet,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type WalletData = {
  balance: number;
  currency: string;
  transactions: {
    id: number;
    amount: number;
    type: string;
    created_at: string;
  }[];
  meta: { total: number };
};

type Subscription = {
  id: number;
  plan_name: string;
  status: string;
  expires_at: string | null;
  package_name: string | null;
  package_price: number | string | null;
};

export default function StatsRow() {
  const { data: wallet, loading: wLoading } = useApi<WalletData>(
    () => api.getWallet(),
    [],
  );
  const { data: subsData, loading: sLoading } = useApi<{
    data?: Subscription[];
  }>(() => api.getSubscriptions(), []);

  const loading = wLoading || sLoading;

  const balance = Number(wallet?.balance ?? 0);
  const totalSpent = (wallet?.transactions ?? [])
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const subs = Array.isArray(subsData?.data)
    ? subsData.data
    : Array.isArray(subsData)
      ? subsData
      : [];
  const activeSub = subs.find((s: Subscription) => s.status === "active");
  const nextRenewal = activeSub?.expires_at
    ? new Date(activeSub.expires_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const stats = [
    {
      label: "Wallet Balance",
      value: loading ? "—" : `₹ ${balance.toLocaleString("en-IN")}`,
      action: "View Wallet",
      href: "#wallet",
      icon: Wallet,
      tint: "bg-[#f3e8ff]",
      iconColor: "text-[#7c3aed]",
      solid: false,
    },
    {
      label: "Total Spent",
      value: loading ? "—" : `₹ ${totalSpent.toLocaleString("en-IN")}`,
      action: "View Details",
      href: "#transactions",
      icon: Coins,
      tint: "bg-[#fdf1dc]",
      iconColor: "text-[#d9932a]",
      solid: false,
    },
    {
      label: "Active Subscription",
      value: loading
        ? "—"
        : activeSub
          ? activeSub.plan_name || activeSub.package_name || "Active"
          : "None",
      action: "View Plan",
      href: "#subscription",
      icon: Star,
      tint: "bg-[#e6f7ec]",
      iconColor: "text-[#1f9254]",
      solid: false,
    },
    {
      label: "Next Renewal",
      value: loading ? "—" : (nextRenewal ?? "N/A"),
      action: nextRenewal ? "Renew Now" : "Subscribe",
      href: "#subscription",
      icon: CalendarDays,
      tint: "bg-[#fdeaf1]",
      iconColor: "text-[#db2777]",
      solid: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-start gap-3 rounded-[16px] border border-[#f1e8da] bg-white p-[15px] shadow-[0_1px_3px_rgba(43,15,71,0.04)]"
          >
            <span
              className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[13px] ${stat.tint}`}
            >
              {loading ? (
                <Loader2
                  className="h-[21px] w-[21px] text-[#8b8697] animate-spin"
                  strokeWidth={1.8}
                />
              ) : (
                <Icon
                  className={`h-[21px] w-[21px] ${stat.iconColor}`}
                  strokeWidth={1.8}
                  fill={stat.solid ? "currentColor" : "none"}
                />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[12px] leading-none text-[#8b8697]">
                {stat.label}
              </p>
              <p className="mt-[7px] font-display text-[19px] font-bold leading-none text-[#2b0f47]">
                {stat.value}
              </p>
              <Link
                href={stat.href}
                className="mt-[9px] inline-flex items-center gap-1 text-[12px] font-medium text-[#7c3aed]"
              >
                {stat.action}
                <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
