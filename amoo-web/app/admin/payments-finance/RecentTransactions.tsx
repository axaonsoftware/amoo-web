"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Smartphone,
  Wallet,
  CreditCard,
  Landmark,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../../lib/api";

type Payment = {
  id: number;
  txn_id?: string;
  amount?: number;
  status?: string;
  payment_method?: string;
  service_name?: string;
  user_name?: string;
  user_email?: string;
  created_at?: string;
};

const methodMeta: Record<string, { Icon: typeof Smartphone; color: string }> = {
  UPI: { Icon: Smartphone, color: "text-[#F59E0B]" },
  Razorpay: { Icon: Wallet, color: "text-[#7C3AED]" },
  Cards: { Icon: CreditCard, color: "text-[#3B82F6]" },
  "Net Banking": { Icon: Landmark, color: "text-[#16A34A]" },
};

const statusColors: Record<string, string> = {
  success: "bg-[#E3F7EA] text-[#16A34A]",
  completed: "bg-[#E3F7EA] text-[#16A34A]",
  pending: "bg-[#FEF1E3] text-[#F59E0B]",
  refunded: "bg-[#FDE8E8] text-[#EF4444]",
  failed: "bg-[#FDE8E8] text-[#EF4444]",
};

function fmtAmount(n?: number): string {
  if (!n) return "₹ 0";
  return `₹ ${n.toLocaleString("en-IN")}`;
}

function fmtDate(ts?: string): { date: string; time: string } {
  if (!ts) return { date: "\u2014", time: "\u2014" };
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function RecentTransactions() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.admin.getPayments()
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setRows(data);
      })
      .catch((e) => { if (!cancelled) { setRows([]); setError(e?.message || "Failed to load"); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const start = (page - 1) * itemsPerPage;
  const pageRows = rows.slice(start, start + itemsPerPage);

  if (error) {
    return (
      <section className="flex items-center justify-center rounded-[14px] border border-red-200 bg-red-50 p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        <div className="flex items-center gap-2 text-[13px] text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" />
      </section>
    );
  }

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          Recent Transactions
        </h2>
        <button
          type="button"
          className="h-[28px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A3B63] hover:bg-[#FAF9FC]"
        >
          View All
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#EFEDF4]">
              {["Transaction ID", "Date & Time", "Client", "Service", "Amount", "Payment Method", "Status"].map((h) => (
                <th key={h} className="pb-[10px] text-[10.5px] font-medium text-[#8B879C]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[13px] text-[#8B879C]">No transactions found</td>
              </tr>
            ) : (
              pageRows.map((r) => {
                const { date, time } = fmtDate(r.created_at);
                const method = methodMeta[r.payment_method || ""] || { Icon: Wallet, color: "text-[#8B879C]" };
                const statusClass = statusColors[r.status || ""] || "bg-[#F1EFF6] text-[#8B879C]";
                return (
                  <tr key={r.id} className="border-b border-[#F5F3F9]">
                    <td className="py-[11px] pr-3 text-[11px] font-medium text-[#4A3B63]">
                      {r.txn_id || `#${r.id}`}
                    </td>
                    <td className="py-[11px] pr-3">
                      <p className="text-[11px] text-[#4A3B63]">{date}</p>
                      <p className="text-[10px] text-[#A5A2B5]">{time}</p>
                    </td>
                    <td className="py-[11px] pr-3">
                      <div className="flex items-center gap-[8px]">
                        <Image
                          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
                          alt={r.user_name || "Client"}
                          width={28}
                          height={28}
                          className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-[#1B1630]">
                            {r.user_name || "Unknown"}
                          </p>
                          <p className="truncate text-[9.5px] text-[#A5A2B5]">
                            {r.user_email || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-[11px] pr-3 text-[11px] text-[#4A3B63]">
                      {r.service_name || "\u2014"}
                    </td>
                    <td className="py-[11px] pr-3 text-[11px] font-medium text-[#1B1630]">
                      {fmtAmount(r.amount)}
                    </td>
                    <td className="py-[11px] pr-3">
                      <span className="flex items-center gap-[6px] text-[11px] text-[#4A3B63]">
                        <method.Icon size={14} className={method.color} />
                        {r.payment_method || "\u2014"}
                      </span>
                    </td>
                    <td className="py-[11px]">
                      <span className={`inline-flex h-[20px] items-center rounded-full px-[9px] text-[9.5px] font-medium capitalize ${statusClass}`}>
                        {r.status || "unknown"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {rows.length > itemsPerPage && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#8B879C]">
            Showing 1 to {pageRows.length} of {rows.length} transactions
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="grid h-[28px] w-[28px] place-items-center rounded-[7px] border border-[#E7E5EF] text-[#8B879C] hover:bg-[#FAF9FC] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-[11px] text-[#4A3B63]">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="grid h-[28px] w-[28px] place-items-center rounded-[7px] border border-[#E7E5EF] text-[#8B879C] hover:bg-[#FAF9FC] disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <button
              type="button"
              className="inline-flex h-[28px] items-center gap-[10px] rounded-[7px] border border-[#E7E5EF] bg-white pl-3 pr-2 text-[11px] text-[#4A3B63]"
            >
              {itemsPerPage} / page
              <ChevronDown size={13} className="text-[#8B879C]" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
