import { Headphones, MessageCircle, ShieldCheck } from "lucide-react";

export function NeedHelpCard() {
  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Headphones size={16} className="text-amber-700" />
        </span>
        <div>
          <p className="font-semibold text-gray-800 text-sm">Need Help?</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Our support team is here for you anytime you need assistance.
          </p>
        </div>
      </div>
      <button
        className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-white text-sm font-medium"
        style={{ background: "#3E1E7A" }}
      >
        <MessageCircle size={15} />
        Chat on WhatsApp
      </button>
    </div>
  );
}

export function SecurePaymentCard() {
  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <ShieldCheck size={16} className="text-amber-700" />
      </span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">
          100% Secure Payment
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Your payment and personal details are safe with us.
        </p>
      </div>
    </div>
  );
}
