"use client";

import { useState } from "react";
import { ArrowLeft, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";

function parseDisplayDate(display: string): string {
  const months: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04",
    May: "05", June: "06", July: "07", August: "08",
    September: "09", October: "10", November: "11", December: "12",
  };
  const m = display.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (!m) return new Date().toISOString().slice(0, 10);
  const [, day, monthName, year] = m;
  return `${year}-${months[monthName] || "01"}-${day.padStart(2, "0")}`;
}

function parseDisplayTime(display: string): string {
  const m = display.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return "09:00:00";
  let h = parseInt(m[1], 10);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}:00`;
}

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

  const handlePay = async () => {
    setBusy(true);
    setStatus("Creating booking...");
    try {
      // 1. Find the service
      const services = await api.getServices();
      const match = services.find(
        (s: any) => s.name.toLowerCase() === svc.toLowerCase()
      ) || services.find((s: any) =>
        s.name.toLowerCase().includes(svc.toLowerCase().split(" ").slice(0, 2).join(" "))
      );
      const serviceId = match?.id || 4;

      // 2. Create booking as "Pending" (reserve slot, no payment yet)
      const booking = await api.createBooking({
        service_id: serviceId,
        date: parseDisplayDate(dt),
        time: parseDisplayTime(tm),
        mode: md,
        amount: 719,
        payment: "Pending",
        method: "razorpay",
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
            Pay ₹719 Securely
            <ArrowRight size={16} />
            <Lock size={14} />
          </>
        )}
      </button>
    </div>
  );
}
