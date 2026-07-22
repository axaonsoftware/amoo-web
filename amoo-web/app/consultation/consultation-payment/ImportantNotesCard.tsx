import { ShieldCheck, CheckCircle2 } from "lucide-react";

const notes = [
  "Your booking will be confirmed only after successful payment.",
  "You will receive booking details on your email and WhatsApp.",
  "You can reschedule up to 4 hours before the consultation time.",
  "For any queries, contact our support team.",
];

export default function ImportantNotesCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-[#3E1E7A]" />
        <h3 className="text-[#3E1E7A] font-semibold text-base">
          3. Important Notes
        </h3>
      </div>

      <ul className="space-y-2.5">
        {notes.map((note) => (
          <li key={note} className="flex items-start gap-2 text-sm text-gray-600">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
