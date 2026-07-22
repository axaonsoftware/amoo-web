"use client";

import { useState } from "react";
import { Tag, Hourglass, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { api } from "../../../lib/api";

export default function CouponCard() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; savings: number } | null>(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setValidating(true);
    setError(null);
    setApplied(null);
    try {
      const res: any = await api.validateCoupon(code.trim());
      setApplied({
        code: res?.coupon?.code ?? code.trim().toUpperCase(),
        savings: res?.discount ?? 0,
      });
    } catch (err: any) {
      setApplied(null);
      setError(err?.message || "Invalid coupon");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={16} className="text-[#3E1E7A]" />
        <h3 className="text-[#3E1E7A] font-semibold text-base">2. Offers &amp; Coupons</h3>
      </div>

      <div className="flex gap-3 mb-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Enter coupon code"
          className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <button
          onClick={handleApply}
          disabled={validating || !code.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          style={{ background: "#3E1E7A" }}
        >
          {validating && <Loader2 className="h-4 w-4 animate-spin" />}
          Apply
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {applied && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <Hourglass size={16} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{applied.code} Applied</p>
              <p className="text-xs text-green-600">You saved ₹{applied.savings}</p>
            </div>
          </div>
          <CheckCircle2 size={20} className="text-green-600" />
        </div>
      )}
    </div>
  );
}
