"use client";
import Link from "next/link";
import { FileText, FileCheck2, FileClock, FileX2 } from "lucide-react";
import api from "../../../lib/api";
import { useAutoRefreshApi } from "../../../lib/useAutoRefreshApi";
import { ErrorState, Skeleton } from "../../components/states";
import { formatNumber } from "../../../lib/format";

type PaymentStats = {
  total: number | string;
  success_count: number | string;
  pending_count: number | string;
  refunded_count: number | string;
  failed_count: number | string;
};

/**
 * Counts come from `GET /api/payments/stats/overview`, extended in this phase
 * with per-status counts.
 *
 * GAP: there is no `invoices` table — the schema has payments, refunds and
 * coupon_usages but no invoice document, number, issue date or due date, so
 * "Overdue" is not derivable at all. A payment row *is* the billing record
 * here, so this card reports payment status counts under honest labels rather
 * than the previous fully hardcoded 1,850 / 1,456 / 278 / 116.
 * See WIRING_NOTES.md gap G10.
 */
export default function InvoicesOverview() {
  const { data, loading, error, refetch } = useAutoRefreshApi<PaymentStats>(() =>
    api.admin.getPaymentStats(), [], 30_000,
  );

  const rows = [
    {
      label: "Total Transactions",
      value: data?.total,
      Icon: FileText,
      iconWrap: "bg-[#E7F0FE]",
      iconColor: "text-[#3B82F6]",
      valueColor: "text-[#1B1630]",
    },
    {
      label: "Paid",
      value: data?.success_count,
      Icon: FileCheck2,
      iconWrap: "bg-[#E3F7EA]",
      iconColor: "text-[#16A34A]",
      valueColor: "text-[#16A34A]",
    },
    {
      label: "Awaiting Payment",
      value: data?.pending_count,
      Icon: FileClock,
      iconWrap: "bg-[#FEF1E3]",
      iconColor: "text-[#F59E0B]",
      valueColor: "text-[#F59E0B]",
    },
    {
      label: "Failed / Refunded",
      value:
        Number(data?.failed_count ?? 0) + Number(data?.refunded_count ?? 0),
      Icon: FileX2,
      iconWrap: "bg-[#FDE8E8]",
      iconColor: "text-[#EF4444]",
      valueColor: "text-[#EF4444]",
    },
  ];

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          Transactions Overview
        </h2>
        <Link
          href="/admin/payments-finance"
          className="text-[11px] font-medium text-[#7C3AED]"
        >
          View All
        </Link>
      </div>

      {error ? (
        <ErrorState className="mt-[14px]" message={error} onRetry={refetch} />
      ) : (
        <ul className="mt-4 space-y-[14px]">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-[10px]">
              <span
                className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] ${r.iconWrap}`}
              >
                <r.Icon size={16} className={r.iconColor} />
              </span>
              <span className="truncate text-[11.5px] text-[#4A3B63]">
                {r.label}
              </span>
              {loading ? (
                <Skeleton className="ml-auto h-[12px] w-[54px] shrink-0" />
              ) : (
                <span
                  className={`ml-auto shrink-0 text-[12px] font-semibold ${r.valueColor}`}
                >
                  {formatNumber(r.value)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
