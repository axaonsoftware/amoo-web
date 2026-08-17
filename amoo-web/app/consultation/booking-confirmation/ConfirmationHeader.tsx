import { Check, ShieldCheck } from "lucide-react";
import { SITE_NAME } from "../../../lib/constants";

export default function ConfirmationHeader({
  bookingId = "AG2606100825",
}: {
  bookingId?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto pt-10 px-4">
      <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <span className="absolute -left-4 top-0 text-amber-400 text-lg">✦</span>
        <span className="absolute -right-4 top-0 text-amber-400 text-lg">
          ✦
        </span>
        <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
          <Check size={28} className="text-white" strokeWidth={3} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="text-amber-500 text-lg">⟜</span>
        <h1
          className="text-3xl font-serif font-bold"
          style={{ color: "#3E1E7A" }}
        >
          Booking Confirmed!
        </h1>
        <span className="text-amber-500 text-lg">⟝</span>
      </div>

      <p className="text-gray-500 text-sm mt-2">
        Thank you for choosing {SITE_NAME}.
        <br />
        Your consultation has been successfully booked.
      </p>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-xl py-4 px-6">
        <p className="flex items-center justify-center gap-2 text-green-800 font-semibold text-sm">
          <ShieldCheck size={16} className="text-green-600" />
          Your booking ID is {bookingId}
        </p>
        <p className="text-green-700/80 text-xs mt-1">
          A confirmation email &amp; WhatsApp message has been sent to you.
        </p>
      </div>
    </div>
  );
}
