"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { clearConsultationData } from "../lib/consultation-storage";
import {
  toApiMode,
  modeNote,
  parseDisplayDate,
  parseDisplayTime,
  type ConsultationService,
} from "../lib/services";
import type { AppliedCoupon } from "./CouponCard";

export default function BottomActionBar({
  service,
  mode,
  date,
  time,
  slot_id,
  duration,
  amount,
  svc,
  coupon,
  total,
}: {
  service: string;
  mode: string;
  date: string;
  time: string;
  slot_id?: number;
  duration?: number;
  amount?: number;
  svc: ConsultationService | null;
  coupon: AppliedCoupon | null;
  total: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bookingIdRef = useRef<number | null>(null);
  const [validatedAmount, setValidatedAmount] = useState<number | null>(null);

  const backQuery = new URLSearchParams({
    service,
    mode,
    date,
    time,
  }).toString();

  const handlePay = async () => {
    if (!svc) return;
    setBusy(true);
    setError(null);
    setStatus("Creating booking...");
    try {
      // Reuse an existing booking if the user is retrying after cancelling
      // Razorpay. Without this, each retry creates a new orphaned unpaid
      // booking and may double-reserve the slot.
      let booking;
      if (bookingIdRef.current) {
        setStatus("Reusing existing booking...");
        booking = { id: bookingIdRef.current };
      } else {
        // 1. Create the booking. `amount: 0` means "let the server price it": the
        //    API stores services.price and rejects any non-zero amount that
        //    disagrees with it. `payment` is not an accepted field — only a
        //    signature-verified /payments/verify may mark a booking paid.
        const note = modeNote(mode);
        booking = await api.createBooking({
          service_id: svc.id,
          ...(slot_id ? { slot_id } : {}),
          date: parseDisplayDate(date),
          time: parseDisplayTime(time),
          mode: toApiMode(mode),
          amount: amount ?? 0,
          duration_minutes: duration,
          method: "razorpay",
          ...(note ? { notes: note } : {}),
        });
        bookingIdRef.current = booking.id;
      }

      // 2. Redeem the coupon BEFORE the order is created. /apply rewrites
      //    bookings.amount inside a transaction, and /create-order prices the
      //    order from that column — so the discount has to land first or the
      //    customer is charged full price. Nothing called /apply at all before
      //    this change, which is exactly why coupons never reduced a bill.
      if (coupon) {
        setStatus("Applying coupon...");
        try {
          await api.applyCoupon(coupon.code, booking.id);
        } catch (couponErr) {
          // The booking exists and is valid; only the discount failed. Stop
          // rather than silently charging full price after the summary promised
          // a saving.
          throw new Error(
            `${(couponErr as Error)?.message || "Coupon could not be applied"}. ` +
              "Remove the coupon to continue at the full price.",
          );
        }
      }

      // 3. Create the Razorpay order for the (now possibly discounted) booking.
      setStatus("Loading payment gateway...");
      const order = await api.createPaymentOrder({ booking_id: booking.id });

      // Validate the backend order before opening Razorpay. The backend
      // computes the correct amount from services.price (minus any coupon);
      // if the response is malformed or the amount is invalid, stop immediately
      // rather than passing garbage to the payment gateway.
      if (
        !order ||
        !Number.isFinite(order.amount) ||
        order.amount <= 0 ||
        !order.order_id ||
        !order.key_id ||
        !order.currency
      ) {
        throw new Error(
          "Payment validation failed. Please refresh and try again.",
        );
      }

      setValidatedAmount(order.amount);
      await loadRazorpayScript();

      setStatus("Opening payment window...");
      const paymentResult = await openRazorpayCheckout({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Amoo Guru",
        description: service,
        theme: { color: "#7C3AED" },
      });

      setStatus("Verifying payment...");
      await api.verifyPayment({
        booking_id: booking.id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });

      // The multi-step form data has served its purpose; holding personal
      // details in browser storage after checkout is an unnecessary risk.
      clearConsultationData();
      router.push(`/consultation/booking-confirmation?bookingId=${booking.id}`);
    } catch (err) {
      const message =
        (err as Error)?.message || "Payment failed. Please try again.";
      // Closing the Razorpay modal is a normal action, not an error state.
      if (message !== "Payment cancelled by user") {
        // Rendered inline rather than through alert(), which is blocking,
        // unstyled, and impossible to read on mobile.
        setError(message);
      }
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <button
          type="button"
          onClick={() =>
            router.push(`/consultation/booking-summary?${backQuery}`)
          }
          disabled={busy}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>

        <p
          className="flex items-center gap-2 text-xs text-gray-500 order-3 sm:order-2"
          aria-live="polite"
        >
          <Lock size={14} aria-hidden="true" />
          {status || (busy ? "Processing..." : "Secured by Razorpay")}
        </p>

        <button
          type="button"
          onClick={handlePay}
          disabled={busy || !svc}
          className="order-2 sm:order-3 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-[#3E1E7A] w-full sm:w-auto disabled:opacity-60"
          style={{
            background: "linear-gradient(90deg,#F3D07A 0%,#C9932F 100%)",
          }}
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              {status || "Processing..."}
            </>
          ) : (
            <>
              {/* Prefer the backend-validated amount; fall back to the
                  client-side total while the order hasn't been created yet. */}
              Pay{" "}
              {formatCurrency(validatedAmount ? validatedAmount / 100 : total)}{" "}
              Securely
              <ArrowRight size={16} aria-hidden="true" />
              <Lock size={14} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
