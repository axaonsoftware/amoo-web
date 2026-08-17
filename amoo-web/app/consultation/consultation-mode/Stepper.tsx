import { Check } from "lucide-react";

type Step = {
  num: number;
  label: string;
  state: "done" | "active" | "upcoming";
};

const STEPS: Step[] = [
  { num: 1, label: "Select Service", state: "done" },
  { num: 2, label: "Select Mode", state: "active" },
  { num: 3, label: "Select Date & Time", state: "upcoming" },
  { num: 4, label: "Your Details", state: "upcoming" },
  { num: 5, label: "Booking Summary", state: "upcoming" },
  { num: 6, label: "Payment", state: "upcoming" },
  { num: 7, label: "Confirmation", state: "upcoming" },
];

export default function Stepper() {
  return (
    <div className="w-full overflow-x-auto pt-[54px] min-[1530px]:pt-[22px]">
      <div className="mx-auto flex min-w-0 max-w-[1000px] items-start px-3 sm:px-5">
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="relative flex flex-1 flex-col items-center min-w-0"
          >
            {/* connector to the previous step */}
            {i > 0 && (
              <span className="absolute top-[17px] sm:top-[21px] right-1/2 h-[2px] w-full bg-[#e3dac8]" />
            )}

            <span
              className={`relative z-10 flex h-[32px] w-[32px] sm:h-[42px] sm:w-[42px] items-center justify-center rounded-full text-[12px] sm:text-[15px] font-semibold ${
                step.state === "done"
                  ? "bg-gradient-to-b from-[#6b3fa0] to-[#4b2583] text-white"
                  : step.state === "active"
                    ? "bg-gradient-to-b from-[#f0c268] to-[#dfa23c] text-white"
                    : "border-[1.5px] border-[#e3dac8] bg-white text-[#8d82a1]"
              }`}
            >
              {step.state === "done" ? (
                <Check size={15} strokeWidth={3} className="sm:hidden" />
              ) : (
                step.num
              )}
              {step.state === "done" && (
                <Check size={19} strokeWidth={3} className="hidden sm:block" />
              )}
            </span>

            <span
              className={`mt-[9px] text-center text-[10px] sm:text-[12.5px] whitespace-nowrap hidden sm:block ${
                step.state === "active"
                  ? "font-semibold text-[#d99a35]"
                  : step.state === "done"
                    ? "font-medium text-[#4b3a63]"
                    : "text-[#7c7389]"
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
