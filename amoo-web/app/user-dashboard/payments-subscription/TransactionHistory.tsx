"use client";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Download,
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type WalletTxn = {
  id: number;
  wallet_id: number;
  amount: number;
  type: "credit" | "debit";
  reason: string;
  ref: string | null;
  created_at: string;
};

type WalletResponse = {
  balance: number;
  currency: string;
  transactions: WalletTxn[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

const columns = [
  "Date & Time",
  "Description",
  "Category",
  "Payment Method",
  "Amount",
  "Status",
];

function parseDateTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "—", time: "" };
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

function BrandMark({ type }: { type: "credit" | "debit" }) {
  if (type === "credit") {
    return <ArrowDownLeft className="h-[15px] w-[15px] text-[#1f9254]" strokeWidth={2} />;
  }
  return <ArrowUpRight className="h-[15px] w-[15px] text-[#c0392b]" strokeWidth={2} />;
}

export default function TransactionHistory() {
  const [page, setPage] = useState(1);

  const { data, loading, error } = useApi<WalletResponse>(
    () => api.getWallet(),
    []
  );

  const transactions = data?.transactions ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <section className="rounded-[16px] border border-[#f1e8da] bg-white p-[18px] shadow-[0_1px_3px_rgba(43,15,71,0.04)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[18px] font-bold leading-none text-[#2b0f47]">
            Transaction History
          </h2>
          <p className="mt-[7px] text-[12.5px] text-[#8b8697]">
            View all your wallet credits, debits and transactions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-[18px] flex flex-wrap items-center gap-3">
        <div className="flex h-[42px] w-[213px] items-center justify-between rounded-[10px] border border-[#e7ddcb] bg-white px-4 text-[13px] text-[#3f1268]">
          <span>All Transactions</span>
          <ChevronDown className="h-[16px] w-[16px] text-[#8b8697]" strokeWidth={2} />
        </div>
        <div className="flex h-[42px] items-center gap-3 rounded-[10px] border border-[#e7ddcb] bg-white px-4 text-[13px] text-[#3f1268]">
          <span>All Time</span>
          <CalendarDays className="h-[16px] w-[16px] text-[#4a1c7d]" strokeWidth={1.8} />
        </div>
        <button
          type="button"
          className="ml-auto inline-flex h-[42px] items-center gap-2 rounded-[10px] border border-[#cbb0ea] bg-white px-5 text-[13px] font-medium text-[#7c3aed]"
        >
          <Download className="h-[15px] w-[15px]" strokeWidth={2} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="mt-[16px] overflow-x-auto rounded-[12px] border border-[#f1e8da]">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="bg-[#faf7f2]">
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-[13px] py-[11px] text-[12px] font-semibold text-[#6c6b78]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-[13px] py-[20px] text-center">
                  <div className="flex items-center justify-center gap-2 text-[13px] text-[#8b8697]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading transactions...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-[13px] py-[20px] text-center text-[12.5px] text-red-500">
                  {error}
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-[13px] py-[24px] text-center">
                  <Wallet className="mx-auto h-8 w-8 text-[#d4ccec]" strokeWidth={1.4} />
                  <p className="mt-2 text-[13px] font-medium text-[#2b0f47]">No transactions yet</p>
                  <p className="mt-1 text-[11.5px] text-[#8b8697]">
                    Your wallet transactions will appear here once funds are added.
                  </p>
                </td>
              </tr>
            ) : (
              transactions.map((txn) => {
                const { date, time } = parseDateTime(txn.created_at);
                const isCredit = txn.type === "credit";
                return (
                  <tr
                    key={txn.id}
                    className="border-t border-[#f1e8da]"
                  >
                    <td className="px-[13px] py-[13px] align-middle">
                      <p className="text-[12.5px] font-medium text-[#2b0f47]">{date}</p>
                      {time && (
                        <p className="mt-[2px] text-[11.5px] text-[#8b8697]">{time}</p>
                      )}
                    </td>
                    <td className="px-[13px] py-[13px] align-middle">
                      <p className="text-[13px] font-semibold text-[#2b0f47]">
                        {txn.reason || (isCredit ? "Wallet Credit" : "Wallet Debit")}
                      </p>
                      {txn.ref && (
                        <p className="mt-[2px] text-[11.5px] text-[#8b8697]">
                          Ref: {txn.ref}
                        </p>
                      )}
                    </td>
                    <td className="px-[13px] py-[13px] align-middle">
                      <span
                        className={`inline-flex items-center rounded-[6px] px-2.5 py-[4px] text-[11px] font-medium ${
                          isCredit
                            ? "bg-[#e6f7ec] text-[#1f9254]"
                            : "bg-[#fdf0d5] text-[#c2820b]"
                        }`}
                      >
                        {isCredit ? "Credit" : "Debit"}
                      </span>
                    </td>
                    <td className="px-[13px] py-[13px] align-middle">
                      <div className="flex items-center gap-2 text-[12.5px] text-[#4b4458]">
                        <BrandMark type={txn.type} />
                        <span>Wallet</span>
                      </div>
                    </td>
                    <td className="px-[13px] py-[13px] align-middle">
                      <span
                        className={`text-[13px] font-semibold ${
                          isCredit ? "text-[#1f9254]" : "text-[#2b0f47]"
                        }`}
                      >
                        {isCredit ? "+" : "-"} ₹{Number(txn.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-[13px] py-[13px] align-middle">
                      <span
                        className={`inline-flex items-center rounded-[6px] px-2.5 py-[4px] text-[11px] font-medium ${
                          isCredit ? "bg-[#e6f7ec] text-[#1f9254]" : "bg-[#fdf0d5] text-[#c2820b]"
                        }`}
                      >
                        {isCredit ? "Completed" : "Debited"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-[15px] flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-[#8b8697]">
          {meta
            ? `Showing ${Math.min((meta.page - 1) * meta.pageSize + 1, meta.total)} to ${Math.min(meta.page * meta.pageSize, meta.total)} of ${meta.total} transactions`
            : transactions.length > 0
            ? `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`
            : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              aria-label="Previous"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#e7ddcb] bg-white text-[#b3adbd] disabled:opacity-40"
            >
              <ChevronLeft className="h-[15px] w-[15px]" strokeWidth={2.2} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-[8px] text-[12.5px] font-semibold ${
                  p === page
                    ? "bg-gradient-to-r from-[#6d28d9] to-[#4c1d95] text-white"
                    : "border border-[#e7ddcb] bg-white text-[#4b4458]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#e7ddcb] bg-white text-[#4a1c7d] disabled:opacity-40"
            >
              <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
