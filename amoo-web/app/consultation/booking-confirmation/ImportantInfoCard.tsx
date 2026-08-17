import { Info, CheckCircle2, Headphones, MessageCircle } from "lucide-react";

const notes = [
  "Please join the session on time for the best experience.",
  "Ensure you are in a quiet & comfortable place.",
  "Keep a stable internet connection for a smooth session.",
  "Reschedule or cancel at least 4 hours before the session.",
  "For any changes, contact our support team.",
];

export default function ImportantInfoCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info size={16} className="text-amber-600" />
        <h3 className="text-amber-700 font-semibold text-base">
          Important Information
        </h3>
      </div>

      <ul className="space-y-2.5 mb-5">
        {notes.map((note) => (
          <li
            key={note}
            className="flex items-start gap-2 text-sm text-gray-600"
          >
            <CheckCircle2
              size={16}
              className="text-green-600 mt-0.5 shrink-0"
            />
            {note}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
            <Headphones size={16} className="text-gray-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Need Help?</p>
            <p className="text-xs text-gray-500">We are here for you!</p>
          </div>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-xs font-medium text-gray-700">
          <MessageCircle size={14} className="text-green-600" />
          Chat on WhatsApp
        </button>
      </div>
    </div>
  );
}
