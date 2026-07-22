import { Check } from "lucide-react";

const steps = [
  { label: "Select Service", state: "done" },
  { label: "Select Mode", state: "done" },
  { label: "Select Date & Time", state: "done" },
  { label: "Your Details", state: "done" },
  { label: "Booking Summary", state: "done" },
  { label: "Payment", state: "active", number: 6 },
  { label: "Confirmation", state: "upcoming", number: 7 },
];

export default function Stepper() {
  return (
    <div
      className="w-full py-6 px-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #241535 0%, #150b21 70%, #0d0616 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto flex items-start justify-between overflow-x-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                  step.state === "done"
                    ? "bg-[#3E1E7A] text-white"
                    : step.state === "active"
                    ? "bg-amber-500 text-white"
                    : "bg-white/10 text-white/60 border border-white/20"
                }`}
              >
                {step.state === "done" ? (
                  <Check size={14} className="sm:hidden" />
                ) : (
                  step.number
                )}
                {step.state === "done" && <Check size={16} className="hidden sm:block" />}
              </div>
              <span
                className={`text-[9px] sm:text-[11px] text-center whitespace-nowrap hidden sm:block ${
                  step.state === "active"
                    ? "text-amber-500 font-medium"
                    : step.state === "done"
                    ? "text-white/70"
                    : "text-white/40"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-white/15 mx-1 mt-[-18px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
