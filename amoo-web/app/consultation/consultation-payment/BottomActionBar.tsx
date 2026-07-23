"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import {
  resolveService,
  toApiMode,
  modeNote,
  parseDisplayDate,
  parseDisplayTime,
  type ConsultationService,
} from "../lib/services";

export default function BottomActionBar({
  service,
  mode,
  date,
  time,
}: {
  service?: string;
  mode?: string;
  date?: string;
  time?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [svcRow, setSvcRow] = useState<ConsultationService | null>(null);

  const svc = service || "Reiki Healing Session";
  const md = mode || "Video Call";
  const dt = date || "Tuesday, 10 June 2026";
  const tm = time || "08:00 AM";

  const backParams = new URLSearchParams();
  backParams.set("service", svc);
  backParams.set("mode", md);
  backParams.set("date", dt);
  backParams.set("time", tm);
  const qs = backParams.toString();

  // Show the real price on the button rather than a constant that can drift
  // from the services table. Silent on failure — handlePay surfaces the error.
  useEffect(() => {
    let live = true;
    resolveService(svc)
      .then((row) => { if (live) setSvcRow(row); })
      .catch(() => {});
    return () => { live = false; };
  }, [svc]);

  const handlePay = async () => {
    setBusy(true);
    setStatus("Creating booking...");
    try {
      // 1. Resolve the picked service to its row — service_id is required and
      //    the price is the server's, not ours.
      const match = svcRow ?? (await resolveService(svc));
      setSvcRow(match);

      // 2. Create the booking. amount 0 means "pay later": the API stores the
      //    real services.price and rejects any non-zero amount that disagrees
      //    with it. `payment` is not an accepted field — only /payments/verify
      //    may mark a booking paid.
      const note = modeNote(md);
      const booking = await api.createBooking({
        service_id: match.id,
        date: parseDisplayDate(dt),
        time: parseDisplayTime(tm),
        mode: toApiMode(md),
        amount: 0,
        method: "razorpay",
        ...(note ? { notes: note } : {}),
      });

      // 3. Create a Razorpay order for this booking
      setStatus("Loading payment gateway...");
      const order = await api.createPaymentOrder({ booking_id: booking.id });

      // 4. Load Razorpay checkout script
      await loadRazorpayScript();

      // 5. Open Razorpay checkout modal
      setStatus("Opening payment window...");
      const paymentResult = await openRazorpayCheckout({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Amoo Guru",
        description: svc,
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#7C3AED" },
      });

      // 6. Verify payment on the backend
      setStatus("Verifying payment...");
      await api.verifyPayment({
        booking_id: booking.id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });

      // 7. Redirect to confirmation
      router.push(`/consultation/booking-confirmation?bookingId=${booking.id}`);
    } catch (err: any) {
      if (err.message === "Payment cancelled by user") {
        // User closed the modal — no action needed
      } else {
        alert(err.message || "Payment failed. Please try again.");
      }
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-6">
      <button
        onClick={() => router.push(`/consultation/booking-summary?${qs}`)}
        disabled={busy}
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <p className="flex items-center gap-2 text-xs text-gray-500 order-3 sm:order-2">
        <Lock size={14} />
        {status || (busy ? "Processing..." : "Secured by Razorpay")}
      </p>

      <button
        onClick={handlePay}
        disabled={busy}
        className="order-2 sm:order-3 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-[#3E1E7A] w-full sm:w-auto disabled:opacity-60"
        style={{
          background: "linear-gradient(90deg,#F3D07A 0%,#C9932F 100%)",
        }}
      >
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {status || "Processing..."}
          </>
        ) : (
          <>
            {svcRow ? `Pay ₹${svcRow.price.toLocaleString("en-IN")} Securely` : "Pay Securely"}
            <ArrowRight size={16} />
            <Lock size={14} />
          </>
        )}
      </button>
    </div>
  );
}
