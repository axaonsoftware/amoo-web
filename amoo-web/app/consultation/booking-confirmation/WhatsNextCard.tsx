import { Mail, MessageCircle, Calendar, Headphones, CalendarPlus } from "lucide-react";

const nextSteps = [
  {
    icon: Mail,
    text: "You will receive a confirmation email with details & meeting link.",
  },
  {
    icon: MessageCircle,
    text: "We will send you a WhatsApp message 5 minutes before your session.",
  },
  {
    icon: Calendar,
    text: "You can reschedule or cancel your appointment from your user dashboard.",
  },
  {
    icon: Headphones,
    text: "Our support team is always here to assist you.",
  },
];

export default function WhatsNextCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-500">✦</span>
        <h3 className="text-[#3E1E7A] font-semibold text-base">
          What&apos;s Next?
        </h3>
      </div>

      <ul className="space-y-4 mb-5">
        {nextSteps.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.text} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-[#5B2A9D]" />
              </span>
              <span className="text-sm text-gray-600 leading-relaxed">
                {step.text}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        className="w-full flex items-center justify-between rounded-lg px-5 py-4 text-white"
        style={{ background: "#3E1E7A" }}
      >
        <span className="text-left">
          <span className="block text-sm font-semibold">Add to Calendar</span>
          <span className="block text-xs text-white/70">
            Never miss your session
          </span>
        </span>
        <CalendarPlus size={20} />
      </button>
    </div>
  );
}
