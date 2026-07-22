"use client";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../lib/api";

type Refund = {
  id: number;
  payment_id: number;
  amount?: number;
  reason?: string;
  status?: string;
  created_at?: string;
  txn_id?: string;
  method?: string;
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

export default function RefundsHistory() {
  const [rows, setRows] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    api.admin.getPaymentRefunds(`?page=${page}&pageSize=${itemsPerPage}`)
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setRows(data);
      })
      .catch((e) => { setRows([]); setError(e?.message || "Failed to load refunds"); })
      .finally(() => setLoading(false));
  }, [page]);

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

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center gap-2">
        <RotateCcw size={15} className="text-[#EF4444]" />
        <h2 className="text-[14px] font-semibold text-[#1B1630]">Refund History</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#6D28D9]" />
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-[12px] text-[#8B879C]">No refunds processed yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#EFEDF4]">
                {["Refund ID", "Transaction", "Amount", "Reason", "Status", "Date"].map((h) => (
                  <th key={h} className="pb-[10px] text-[10.5px] font-medium text-[#8B879C]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const { date, time } = fmtDate(r.created_at);
                return (
                  <tr key={r.id} className="border-b border-[#F5F3F9]">
                    <td className="py-[10px] pr-3 text-[11px] font-medium text-[#4A3B63]">#{r.id}</td>
                    <td className="py-[10px] pr-3 text-[11px] text-[#4A3B63]">{r.txn_id || `#${r.payment_id}`}</td>
                    <td className="py-[10px] pr-3 text-[11px] font-medium text-[#1B1630]">{fmtAmount(r.amount)}</td>
                    <td className="max-w-[180px] truncate py-[10px] pr-3 text-[11px] text-[#4A3B63]">{r.reason || "\u2014"}</td>
                    <td className="py-[10px] pr-3">
                      <span className={`inline-flex h-[20px] items-center rounded-full px-[9px] text-[9.5px] font-medium capitalize ${
                        r.status === "processed" ? "bg-[#E3F7EA] text-[#16A34A]" :
                        r.status === "failed" ? "bg-[#FDE8E8] text-[#EF4444]" :
                        "bg-[#FEF1E3] text-[#F59E0B]"
                      }`}>
                        {r.status || "unknown"}
                      </span>
                    </td>
                    <td className="py-[10px] text-[11px] text-[#8B879C]">
                      <span className="block">{date}</span>
                      <span className="block text-[10px]">{time}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-[#8B879C]">{rows.length} refund(s)</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C] disabled:opacity-40"
            >
              <ChevronLeft size={12} />
            </button>
            <span className="text-[11px] text-[#4A3B63]">{page}</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={rows.length < itemsPerPage}
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C] disabled:opacity-40"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
