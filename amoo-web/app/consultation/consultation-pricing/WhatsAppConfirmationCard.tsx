import { MessageCircle, CheckCircle2 } from "lucide-react";

const items = [
  "Booking Confirmation",
  "Payment Receipt",
  "Meeting Link (if applicable)",
  "Reminder Notifications",
];

export default function WhatsAppConfirmationCard() {
  return (
    <div
      className="rounded-2xl p-5 text-white h-full flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #241535 0%, #150b21 70%, #0d0616 100%)",
        border: "1px solid rgba(212,160,60,0.25)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={16} className="text-amber-400" />
        <h3 className="text-amber-400 font-semibold text-sm tracking-wide">
          WHATSAPP CONFIRMATION
        </h3>
      </div>

      <div className="flex-1 flex items-center justify-center mb-4">
        <div className="w-24 h-40 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
          📱
        </div>
      </div>

      <p className="text-white/70 text-xs mb-3">
        Get instant booking confirmation on WhatsApp with all details.
      </p>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-white/80">
            <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
