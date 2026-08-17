import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/* ---------- ornaments ---------- */

export function SparkleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c.5 3.1 1.6 4.9 3.6 6-2 1.1-3.1 2.9-3.6 6-.5-3.1-1.6-4.9-3.6-6 2-1.1 3.1-2.9 3.6-6Z" />
      <path
        d="M12 10c.4 2.6 1.4 4.2 3.1 5.2-1.7 1-2.7 2.6-3.1 5.2-.4-2.6-1.4-4.2-3.1-5.2 1.7-1 2.7-2.6 3.1-5.2Z"
        opacity="0.65"
      />
      <circle cx="19.6" cy="5.2" r="1.5" opacity="0.8" />
      <circle cx="4.6" cy="17.6" r="1.2" opacity="0.6" />
    </svg>
  );
}

export function ArrowFlourish({
  flip = false,
  className = "",
}: {
  flip?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`hidden items-center gap-1.5 text-gold sm:flex ${flip ? "flex-row-reverse" : ""} ${className}`}
    >
      <svg
        viewBox="0 0 14 12"
        fill="currentColor"
        className="h-[10px] w-[12px] shrink-0"
      >
        <path d="M0 6h9.4L6.1 2.5 7 1.5 12.5 6 7 10.5l-.9-1 3.3-3.5H0Z" />
      </svg>
      <span className="block h-px w-[44px] bg-gold/70" />
      <span className="block h-[6px] w-[6px] rotate-45 bg-gold/80" />
      <span className="block h-px w-[10px] bg-gold/70" />
    </span>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m7.6 12.3 2.9 2.9 5.9-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- hero feature icons ---------- */

export function DivineEnergyIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 3.4c1.9 1.6 3 3.5 3 5.6a3 3 0 0 1-6 0c0-2.1 1.1-4 3-5.6Z" />
      <circle cx="12" cy="9" r="1.3" />
      <path d="M6.2 12.6c-1.4 1-2.2 2.3-2.2 3.6 0 1.6 1.3 2.6 2.9 2.6 1.4 0 2.6-.7 3.4-1.9" />
      <path d="M17.8 12.6c1.4 1 2.2 2.3 2.2 3.6 0 1.6-1.3 2.6-2.9 2.6-1.4 0-2.6-.7-3.4-1.9" />
      <path d="M9.4 20.6h5.2" />
    </svg>
  );
}

export function ChakraBalancingIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="8.4" opacity="0.65" />
      <path d="M12 3.6v3.4M12 17v3.4M3.6 12H7M17 12h3.4" />
      <path
        d="m6.1 6.1 2.4 2.4M15.5 15.5l2.4 2.4M17.9 6.1l-2.4 2.4M8.5 15.5l-2.4 2.4"
        opacity="0.7"
      />
    </svg>
  );
}

export function EmotionalHealingIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 20.4c-3.6-2.4-6.8-5-6.8-8.6a3.8 3.8 0 0 1 6.8-2.3 3.8 3.8 0 0 1 6.8 2.3c0 3.6-3.2 6.2-6.8 8.6Z" />
      <path d="M8.4 12.6h1.9l1-2 1.6 3.4 1-1.4h1.7" strokeWidth={1.2} />
    </svg>
  );
}

export function EnergyClearingIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 2.6 13.6 8l5.4 1.6-5.4 1.6L12 16.6 10.4 11.2 5 9.6 10.4 8Z" />
      <path
        d="M18.2 15.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"
        opacity="0.75"
      />
      <path
        d="M5 15.6l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6L2.8 18l1.6-.6Z"
        opacity="0.6"
      />
    </svg>
  );
}

/* ---------- service card icons ---------- */

export function PersonalHealingIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path
        d="M12 2.8v3.6M9.2 4l1 2.6M14.8 4l-1 2.6M6.6 6.6l1.9 2M17.4 6.6l-1.9 2"
        opacity="0.8"
      />
      <path d="M12 8.4a3 3 0 0 1 3 3v1.4h-6v-1.4a3 3 0 0 1 3-3Z" />
      <path d="M4.6 13.6c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8v3.6c0 1.7 1.6 3.2 3.8 3.2s3.8-1.5 3.8-3.2v-3.6c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8" />
    </svg>
  );
}

export function DistanceHealingIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2M12 3.4c2.3 2.4 3.5 5.4 3.5 8.6s-1.2 6.2-3.5 8.6c-2.3-2.4-3.5-5.4-3.5-8.6S9.7 5.8 12 3.4Z" />
      <path d="M12 8.2v7.6M8.2 12h7.6" strokeWidth={1.6} opacity="0.9" />
    </svg>
  );
}

export function ChakraBodyIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="4.4" r="1.9" />
      <path d="M12 6.6v7.2" />
      <path d="M6.4 9.4c1.3 1.4 3.3 2.2 5.6 2.2s4.3-.8 5.6-2.2" />
      <path d="M12 13.8c-2.6 0-4.6 1.9-4.6 4.2 0 1.4 1.1 2.4 2.4 2.4h4.4c1.3 0 2.4-1 2.4-2.4 0-2.3-2-4.2-4.6-4.2Z" />
      <path d="M12 8.4v.1M12 16.6v.1" strokeWidth={2} />
    </svg>
  );
}

export function EmotionalHeartIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M12 8.2a3.4 3.4 0 0 1 6-2.2c1.3 1.5 1 3.7-.5 5.2L12 16.8 6.5 11.2C5 9.7 4.7 7.5 6 6a3.4 3.4 0 0 1 6 2.2Z" />
      <path
        d="M4.4 18.8c1.6-1 3.4-1.5 5.2-1.5M19.6 18.8c-1.6-1-3.4-1.5-5.2-1.5"
        opacity="0.75"
      />
      <path d="M6.6 21.4c1.7-.8 3.5-1.2 5.4-1.2s3.7.4 5.4 1.2" opacity="0.6" />
    </svg>
  );
}

export function CalmMindIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M12 5.2c1.7 1.8 2.5 3.6 2.5 5.4 0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5c0-1.8.8-3.6 2.5-5.4Z" />
      <path d="M9.4 13.1c-1.8-1.2-3.6-1.7-5.4-1.5.4 2.5 2 4.2 4.8 5" />
      <path d="M14.6 13.1c1.8-1.2 3.6-1.7 5.4-1.5-.4 2.5-2 4.2-4.8 5" />
      <path d="M6 19.6c1.9-1 3.9-1.5 6-1.5s4.1.5 6 1.5" />
    </svg>
  );
}

export function RelationshipIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M12 19.4c-3.4-2.2-6.2-4.6-6.2-7.8a3.5 3.5 0 0 1 6.2-2.2 3.5 3.5 0 0 1 6.2 2.2c0 3.2-2.8 5.6-6.2 7.8Z" />
      <path
        d="M3.2 20.6c1-2 2.6-3.2 4.4-3.6M20.8 20.6c-1-2-2.6-3.2-4.4-3.6"
        opacity="0.75"
      />
    </svg>
  );
}

/* ---------- step icons ---------- */

export function StepBookIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.4} {...props}>
      <rect x="3.6" y="5" width="16.8" height="15.4" rx="2.2" />
      <path d="M3.6 9.6h16.8M8.4 3.2v3.6M15.6 3.2v3.6" />
      <path d="m9 14.6 1.9 1.9 3.9-4" strokeWidth={1.5} />
    </svg>
  );
}

export function StepDetailsIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.4} {...props}>
      <rect x="5" y="4.2" width="14" height="16.4" rx="2.2" />
      <path d="M9 4.2V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.2" />
      <path d="M8.6 10h6.8M8.6 13.6h6.8M8.6 17.2h4" />
    </svg>
  );
}

export function StepPaymentIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.4} {...props}>
      <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.2" />
      <path d="M2.8 9.8h18.4" strokeWidth={1.8} />
      <path d="M6.4 14.4h3.2M13 14.4h4.6" />
    </svg>
  );
}

export function StepHealingIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="8.2" r="2.4" />
      <path
        d="M12 3.4v1.4M12 11.6V13M7.4 8.2H8.8M15.2 8.2h1.4M8.7 4.9l1 1M14.3 11.5l1 1M15.3 4.9l-1 1M9.7 11.5l-1 1"
        opacity="0.8"
      />
      <path d="M4 15.4c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8v1.4c0 2 2 3.4 4.4 3.4s4.4-1.4 4.4-3.4v-1.4c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8" />
    </svg>
  );
}

export function StepTransformIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M12 4.2c1.9 2 2.9 4 2.9 6 0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9c0-2 1-4 2.9-6Z" />
      <path d="M9 12.4c-2.1-1.5-4.2-2.1-6.3-1.8.5 3 2.5 5 5.9 5.9" />
      <path d="M15 12.4c2.1-1.5 4.2-2.1 6.3-1.8-.5 3-2.5 5-5.9 5.9" />
      <path d="M5.6 19.8c2.1-1 4.2-1.5 6.4-1.5s4.3.5 6.4 1.5" />
    </svg>
  );
}

export function StepGuidanceIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M12 20.2c-3.6-2.4-6.6-4.9-6.6-8.4A3.7 3.7 0 0 1 12 9.4a3.7 3.7 0 0 1 6.6 2.4c0 3.5-3 6-6.6 8.4Z" />
      <path d="M12 2.8v3.4M9.2 4.4l1.1 2M14.8 4.4l-1.1 2" opacity="0.8" />
    </svg>
  );
}
