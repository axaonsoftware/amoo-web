import { ShieldCheck } from "lucide-react";

export default function PaymentPageHeader() {
  return (
    <div className="text-center max-w-2xl mx-auto pt-8 px-4">
      <div className="flex items-center justify-center gap-3">
        <span className="text-amber-500 text-lg">⟜</span>
        <h1
          className="text-3xl font-serif font-bold"
          style={{ color: "#3E1E7A" }}
        >
          Consultation Payment
        </h1>
        <span className="text-amber-500 text-lg">⟝</span>
      </div>
      <p className="text-gray-500 text-sm mt-2">
        Complete your payment to confirm your booking.
      </p>

      <div className="flex items-center justify-center gap-2 mt-5 bg-amber-50 border border-amber-200 rounded-lg py-2.5 px-4 text-xs sm:text-sm text-amber-800">
        <ShieldCheck size={16} className="text-amber-600 shrink-0" />
        Your payment is 100% secure. We do not store your card details.
      </div>
    </div>
  );
}
