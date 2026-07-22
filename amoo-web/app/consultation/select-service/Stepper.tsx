import { CheckIcon } from "../../components/icons";

type Step = {
  num: number;
  label: string;
  state: "done" | "active" | "upcoming";
};

const STEPS: Step[] = [
  { num: 1, label: "Select Service", state: "active" },
  { num: 2, label: "Select Mode", state: "upcoming" },
  { num: 3, label: "Select Date & Time", state: "upcoming" },
  { num: 4, label: "Your Details", state: "upcoming" },
  { num: 5, label: "Booking Summary", state: "upcoming" },
  { num: 6, label: "Payment", state: "upcoming" },
  { num: 7, label: "Confirmation", state: "upcoming" },
];

export default function Stepper() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[960px] overflow-x-auto px-3 sm:px-5 pt-[22px] pb-[14px]">
      <div className="flex min-w-0 items-start justify-between">
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="relative flex flex-1 flex-col items-center min-w-0"
          >
            {/* Connector */}
            {i > 0 && (
              <span className="absolute top-[15px] sm:top-[19px] right-1/2 h-[1.5px] w-full bg-[#ded5c6]" />
            )}

            {/* Circle */}
            <span
              className={`relative z-10 flex h-[28px] w-[28px] sm:h-[38px] sm:w-[38px] items-center justify-center rounded-full text-[11px] sm:text-[14px] font-semibold ${
                step.state === "done"
                  ? "bg-[#3d1a6d] text-white"
                  : step.state === "active"
                    ? "bg-[#e0a33e] text-white shadow-[0_0_0_4px_rgba(224,163,62,0.18)]"
                    : "border border-[#ded5c6] bg-white text-[#9a97a6]"
              }`}
            >
              {step.state === "done" ? (
                <CheckIcon className="h-[13px] w-[13px] sm:h-[17px] sm:w-[17px]" />
              ) : (
                step.num
              )}
            </span>

            {/* Label */}
            <span
              className={`mt-[9px] text-center text-[10px] sm:text-[12.5px] whitespace-nowrap hidden sm:block ${
                step.state === "active"
                  ? "font-medium text-[#d99a35]"
                  : step.state === "done"
                    ? "font-medium text-[#3d1a6d]"
                    : "text-[#9a97a6]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
