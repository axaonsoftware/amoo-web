"use client";

import { useState } from "react";
import { Tag, CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { api } from "../../../lib/api";
import { formatCurrency } from "../../../lib/format";

export type AppliedCoupon = { code: string; discount: number };

/**
 * Coupon entry for the checkout page.
 *
 * This card used to be entirely decorative. It called
 * `api.validateCoupon(code)` with **no amount**, and the backend computes
 *   discount = amount ? (percent ? amount * value / 100 : value) : 0
 * so the response was always `discount: 0` — the UI then rendered
 * "CODE Applied — You saved ₹0". It also held its result in local state that
 * nothing else could read, and never called `POST /api/coupons/apply`, so the
 * booking was charged the full price regardless.
 *
 * Now the amount is passed in, and the accepted coupon is lifted to the page so
 * the summary and the Pay button agree with it. Redemption still happens at pay
 * time (see BottomActionBar) because /apply needs a booking id, which does not
 * exist until the user commits.
 */
export default function CouponCard({
  amount,
  applied,
  onChange,
}: {
  amount: number;
  applied: AppliedCoupon | null;
  onChange: (coupon: AppliedCoupon | null) => void;
}) {
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setValidating(true);
    setError(null);
    try {
      const res = await api.validateCoupon(trimmed, amount);
      const discount = Number(res?.discount) || 0;
      if (discount <= 0) {
        // A real coupon that produces no saving on this order is not an error,
        // but silently showing "₹0 saved" as a success was misleading.
        setError("This coupon gives no discount on the current amount.");
        onChange(null);
        return;
      }
      onChange({ code: res?.coupon?.code ?? trimmed.toUpperCase(), discount });
    } catch (err) {
      onChange(null);
      setError((err as Error)?.message || "Invalid coupon");
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setCode("");
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={16} className="text-[#3E1E7A]" aria-hidden="true" />
        <h3 className="text-[#3E1E7A] font-semibold text-base">
          2. Offers &amp; Coupons
        </h3>
      </div>

      {applied ? (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={20}
              className="text-green-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-green-800">
                {applied.code} applied
              </p>
              <p className="text-xs text-green-600">
                You save {formatCurrency(applied.discount)} on this booking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove coupon ${applied.code}`}
            className="rounded p-1 text-green-700 transition hover:bg-green-100"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-3">
            <label htmlFor="coupon-code" className="sr-only">
              Coupon code
            </label>
            <input
              id="coupon-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="Enter coupon code"
              autoComplete="off"
              className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={validating || !code.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ background: "#3E1E7A" }}
            >
              {validating && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Apply
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
