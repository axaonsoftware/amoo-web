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
  RotateCcw,
  X,
  Download,
} from "lucide-react";
import api, { unwrapList, unwrapMeta } from "../../../lib/api";
import { errorMessage } from "../../../lib/errors";

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
  refund_id?: string;
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
    date: d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function RecentTransactions() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const itemsPerPage = 8;

  // Refund modal state
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [refundResult, setRefundResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(itemsPerPage));
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    api.admin
      .getPayments(`?${params.toString()}`)
      .then((res) => {
        const data = unwrapList<Payment>(res);
        const meta = unwrapMeta(res);
        setRows(data);
        if (meta) {
          setTotalPages(meta.totalPages);
        }
      })
      .catch((e) => {
        setRows([]);
        setError(errorMessage(e, "Failed to load"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo]);

  const openRefund = (p: Payment) => {
    setRefundTarget(p);
    setRefundReason("");
    setRefundResult(null);
  };

  const confirmRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);
    setRefundResult(null);
    try {
      const res = await api.admin.refundPayment(refundTarget.id, {
        reason: refundReason || undefined,
      });
      setRefundResult({
        ok: true,
        msg: `Refunded ${fmtAmount(refundTarget.amount)} — ${res?.gateway_refund_id ? `Gateway ID: ${res.gateway_refund_id}` : "DB only"}`,
      });
      load(); // refresh the list
    } catch (e: unknown) {
      setRefundResult({ ok: false, msg: errorMessage(e, "Refund failed") });
    } finally {
      setRefunding(false);
    }
  };

  const handleExport = () => {
    if (!rows.length) return;
    const headers = ["ID", "User", "Amount", "Method", "Status", "Date"];
    const r = rows.map((t) => [
      t.id,
      t.user_name,
      t.amount,
      t.payment_method,
      t.status,
      t.created_at,
    ]);
    const csv = [headers.join(","), ...r.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
    <>
      <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#1B1630]">
            Recent Transactions
          </h2>
          <button
            type="button"
            onClick={load}
            className="h-[28px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A3B63] hover:bg-[#FAF9FC]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] text-[#8B879C]">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-[28px] rounded-[7px] border border-[#E7E5EF] bg-white px-2 text-[11px] text-[#3D3752] outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-[#8B879C]">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-[28px] rounded-[7px] border border-[#E7E5EF] bg-white px-2 text-[11px] text-[#3D3752] outline-none"
            />
          </label>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="h-[28px] rounded-[7px] border border-[#E7E5EF] bg-white px-2 text-[11px] text-[#8B879C] hover:bg-[#FAF9FC]"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-[28px] items-center gap-1.5 rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A3B63] hover:bg-[#FAF9FC]"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#EFEDF4]">
                {[
                  "Transaction ID",
                  "Date & Time",
                  "Client",
                  "Service",
                  "Amount",
                  "Payment Method",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="pb-[10px] text-[10.5px] font-medium text-[#8B879C]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-[13px] text-[#8B879C]"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const { date, time } = fmtDate(r.created_at);
                  const method = methodMeta[r.payment_method || ""] || {
                    Icon: Wallet,
                    color: "text-[#8B879C]",
                  };
                  const statusClass =
                    statusColors[r.status || ""] ||
                    "bg-[#F1EFF6] text-[#8B879C]";
                  const canRefund = r.status === "success";
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
                        <span
                          className={`inline-flex h-[20px] items-center rounded-full px-[9px] text-[9.5px] font-medium capitalize ${statusClass}`}
                        >
                          {r.status || "unknown"}
                        </span>
                      </td>
                      <td className="py-[11px] pl-2">
                        {canRefund ? (
                          <button
                            type="button"
                            onClick={() => openRefund(r)}
                            className="inline-flex h-[26px] items-center gap-1 rounded-[6px] border border-red-200 bg-red-50 px-2 text-[10px] font-medium text-red-600 hover:bg-red-100"
                          >
                            <RotateCcw size={11} />
                            Refund
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-[#8B879C]">
              Page {page} of {totalPages}
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

      {/* Refund confirmation modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#1B1630]">
                Confirm Refund
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (!refunding) setRefundTarget(null);
                }}
                className="text-[#8B879C] hover:text-[#1B1630]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[12.5px] text-[#4A3B63]">
              <div className="rounded-[10px] border border-[#EFEDF4] bg-[#FAF9FC] p-3">
                <p>
                  <span className="font-medium">Transaction:</span>{" "}
                  {refundTarget.txn_id || `#${refundTarget.id}`}
                </p>
                <p>
                  <span className="font-medium">Client:</span>{" "}
                  {refundTarget.user_name || "Unknown"}
                </p>
                <p>
                  <span className="font-medium">Amount:</span>{" "}
                  {fmtAmount(refundTarget.amount)}
                </p>
                <p>
                  <span className="font-medium">Method:</span>{" "}
                  {refundTarget.payment_method || "\u2014"}
                </p>
              </div>

              <label className="block">
                <span className="text-[11px] font-medium text-[#8B879C]">
                  Reason (optional)
                </span>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-[8px] border border-[#E7E5EF] bg-white p-2.5 text-[12.5px] text-[#1B1630] outline-none focus:border-[#7C3AED]"
                  placeholder="e.g. Customer requested cancellation..."
                />
              </label>

              {refundResult && (
                <div
                  className={`rounded-[8px] p-2.5 text-[12px] ${refundResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                >
                  {refundResult.msg}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  disabled={refunding}
                  className="flex-1 rounded-[9px] border border-[#E7E5EF] bg-white py-2.5 text-[12px] font-medium text-[#3D3752] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRefund}
                  disabled={refunding || refundResult?.ok}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[9px] bg-gradient-to-r from-red-600 to-red-500 py-2.5 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(220,38,38,.25)] disabled:opacity-60"
                >
                  {refunding && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  {refunding ? "Refunding..." : "Confirm Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
