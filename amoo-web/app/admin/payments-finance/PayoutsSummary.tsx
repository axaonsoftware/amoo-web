"use client";
import Link from "next/link";
import { Users, CircleCheck, Clock, CircleX } from "lucide-react";
import api from "../../../lib/api";
import { useAutoRefreshApi } from "../../../lib/useAutoRefreshApi";
import { ErrorState, Skeleton } from "../../components/states";
import { formatCurrency, toNumber } from "../../../lib/format";

type PaymentStats = {
  total_revenue: number | string;
  collected: number | string;
  pending: number | string;
  refunded: number | string;
  failed: number | string;
};

/**
 * GAP: there is no payouts model in the schema — no `payouts` table, no
 * commission rate on `experts`, no ledger of what is owed to a practitioner.
 * The previous version invented one by multiplying payment totals by a
 * hardcoded 0.63 ("Total Payouts" = revenue × 0.63, "Paid" = collected × 0.63,
 * and so on), computed over the first page of `GET /api/payments` — 20 rows.
 *
 * Rather than keep a fabricated payout ledger, this card now reports the real
 * money movement the backend does track, from
 * `GET /api/payments/stats/overview`. Restoring a true payouts summary needs
 * the backend addition described in WIRING_NOTES.md gap G8.
 */
export default function PayoutsSummary() {
  const { data, loading, error, refetch } = useAutoRefreshApi<PaymentStats>(() =>
    api.admin.getPaymentStats(), [], 30_000,
  );

  const rows = [
    {
      label: "Gross Transacted",
      value: data?.total_revenue,
      Icon: Users,
      iconWrap: "bg-[#E7F0FE]",
      iconColor: "text-[#3B82F6]",
      valueColor: "text-[#1B1630]",
    },
    {
      label: "Collected",
      value: data?.collected,
      Icon: CircleCheck,
      iconWrap: "bg-[#E3F7EA]",
      iconColor: "text-[#16A34A]",
      valueColor: "text-[#16A34A]",
    },
    {
      label: "Pending",
      value: data?.pending,
      Icon: Clock,
      iconWrap: "bg-[#FEF1E3]",
      iconColor: "text-[#F59E0B]",
      valueColor: "text-[#F59E0B]",
    },
    {
      label: "Refunded / Failed",
      value: toNumber(data?.refunded) + toNumber(data?.failed),
      Icon: CircleX,
      iconWrap: "bg-[#FDE8E8]",
      iconColor: "text-[#EF4444]",
      valueColor: "text-[#EF4444]",
    },
  ];

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          Money Movement (All Time)
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
                <Skeleton className="ml-auto h-[12px] w-[68px] shrink-0" />
              ) : (
                <span
                  className={`ml-auto shrink-0 text-[12px] font-semibold ${r.valueColor}`}
                >
                  {formatCurrency(r.value)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/admin/payments-finance"
        className="mt-[18px] flex h-[40px] w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-[#3B1078] to-[#6D28D9] text-[12.5px] font-semibold text-white shadow-[0_6px_16px_rgba(76,29,149,0.24)]"
      >
        View Transactions
      </Link>
    </section>
  );
}
