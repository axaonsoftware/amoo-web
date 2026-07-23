"use client";

import Link from "next/link";
import { CalendarDays, FileText, Wallet, Star, ArrowRight } from "lucide-react";
import { useApi, useApiList } from "@/lib/useApi";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/format";
import { ErrorState } from "@/app/components/states";

type Booking = { status: string };
type Report = { id: number };
type WalletData = { balance: number | string; currency?: string };

export default function StatsRow() {
  // /api/bookings and /api/reports both respond through the backend's
  // paginated() helper, i.e. `{ data, meta }` — not a bare array. Reading
  // `.filter`/`.length` straight off the envelope threw at render.
  const bookings = useApiList<Booking>(() => api.getBookings());
  const reports = useApiList<Report>(() => api.getReports());
  const wallet = useApi<WalletData>(() => api.getWallet());

  const loading = bookings.loading || reports.loading || wallet.loading;
  const error = bookings.error || reports.error || wallet.error;
  const retry = () => {
    bookings.refetch();
    reports.refetch();
    wallet.refetch();
  };

  const upcoming = bookings.items.filter(
    (b) => b.status === "upcoming" || b.status === "pending-payment"
  ).length;
  // meta.total counts every report, not just the current page.
  const reportCount = reports.meta?.total ?? reports.items.length;

  const stats = [
    { Icon: CalendarDays, label: "Upcoming Consultations", value: formatNumber(upcoming), action: "View All", tinted: true },
    { Icon: FileText, label: "Reports Generated", value: formatNumber(reportCount), action: "View All", tinted: false },
    { Icon: Wallet, label: "Wallet Balance", value: formatCurrency(wallet.data?.balance ?? 0, wallet.data?.currency), action: "Add Money", tinted: false },
    // GAP (pending backend support): no rewards/loyalty-points model exists —
    // no points column on `users`, no ledger table. Held at 0 rather than
    // faked. See WIRING_NOTES.md gap G11.
    { Icon: Star, label: "Reward Points", value: "0", action: "View Rewards", tinted: true },
  ];

  if (loading) {
    return (
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-[14px] border border-[#efe6d6] bg-white p-4 shadow-[0_2px_10px_rgba(42,17,72,.05)]">
            <div className="flex items-start gap-3.5">
              <div className="h-[46px] w-[46px] rounded-full bg-[#f0eaf8]" />
              <div className="min-w-0 flex-1">
                <div className="h-3 w-24 rounded bg-[#f0eaf8]" />
                <div className="mt-2 h-6 w-12 rounded bg-[#f0eaf8]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState className="mt-5" tone="dashboard" message={error} onRetry={retry} />;
  }

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ Icon, label, value, action, tinted }) => (
        <div
          key={label}
          className={`flex items-start gap-3.5 rounded-[14px] border px-4 py-4 shadow-[0_2px_10px_rgba(42,17,72,.05)] ${
            tinted ? "border-[#e6dcf5] bg-[#f4edfc]" : "border-[#efe6d6] bg-white"
          }`}
        >
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#5a2496] to-[#3d1268] shadow-[0_4px_10px_rgba(61,18,104,.3)]">
            <Icon className="h-[22px] w-[22px] text-[#f0c877]" strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[#5c5568]">{label}</p>
            <p className="mt-1 font-display text-[24px] font-bold leading-none text-[#2b0f47]">{value}</p>
            <Link href="/user-dashboard" className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6b3fa0]">
              {action}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
