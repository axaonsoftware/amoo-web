import { SectionHeading } from "./ServicesGrid";
import {
  StepBookIcon,
  StepDetailsIcon,
  StepGuidanceIcon,
  StepHealingIcon,
  StepPaymentIcon,
  StepTransformIcon,
} from "./icons";

const STEPS = [
  {
    icon: StepBookIcon,
    title: "1. Book Session",
    desc: ["Choose your healing", "session and time."],
  },
  {
    icon: StepDetailsIcon,
    title: "2. Share Details",
    desc: ["Fill in your details and", "healing concerns."],
  },
  {
    icon: StepPaymentIcon,
    title: "3. Make Payment",
    desc: ["Secure your slot with", "simple payment."],
  },
  {
    icon: StepHealingIcon,
    title: "4. Receive Healing",
    desc: ["Experience powerful", "Reiki healing energy."],
  },
  {
    icon: StepTransformIcon,
    title: "5. Feel Transformation",
    desc: ["Feel lighter, calmer and", "full of positive energy."],
  },
  {
    icon: StepGuidanceIcon,
    title: "6. Follow Guidance",
    desc: ["Get personalized guidance", "for lasting results."],
  },
];

function StepArrow() {
  return (
    <svg
      viewBox="0 0 24 12"
      fill="currentColor"
      aria-hidden
      className="mt-[26px] hidden h-[12px] w-[24px] shrink-0 text-[#6b3fa0]/60 lg:block"
    >
      <path d="M0 5h18.4l-3.6-3.8.9-1L22.6 6l-6.9 5.8-.9-1L18.4 7H0Z" />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Faint mandala flourishes */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -left-[80px] hidden h-[220px] w-[220px] -translate-y-1/2 rounded-full border border-gold/25 lg:block"
      >
        <div className="absolute inset-[22px] rounded-full border border-[#6b3fa0]/15" />
        <div className="absolute inset-[46px] rounded-full border border-gold/20" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -right-[80px] hidden h-[220px] w-[220px] -translate-y-1/2 rounded-full border border-gold/25 lg:block"
      >
        <div className="absolute inset-[22px] rounded-full border border-[#6b3fa0]/15" />
        <div className="absolute inset-[46px] rounded-full border border-gold/20" />
      </div>

      <div className="relative mx-auto w-full max-w-[1336px] px-5 pt-[26px] pb-[24px]">
        <SectionHeading>How Reiki Healing Works</SectionHeading>

        <div className="mt-[26px] flex flex-col items-center gap-y-8 lg:flex-row lg:items-start lg:justify-center lg:gap-x-1">
          {STEPS.map(({ icon: Icon, title, desc }, index) => (
            <div key={title} className="flex items-start lg:flex-1">
              <div className="flex flex-1 flex-col items-center text-center">
                <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[radial-gradient(120%_120%_at_50%_20%,#5a1a86_0%,#3b1160_55%,#2a0a45_100%)] text-[#f6e3b4]">
                  <Icon className="h-[28px] w-[28px]" />
                </span>
                <h3 className="mt-[12px] text-[11.5px] font-semibold text-[#4b2583]">
                  {title}
                </h3>
                <p className="mt-[5px] max-w-[126px] text-[10px] leading-[1.55] text-[#6c6b78]">
                  {desc[0]}
                  <br />
                  {desc[1]}
                </p>
              </div>

              {index < STEPS.length - 1 && <StepArrow />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
