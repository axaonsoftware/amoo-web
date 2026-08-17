import React from "react";

export function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.06 12.46A17.2 17.2 0 0 1 12 4.6c3.1 0 5.9 1.2 8.3 3.2" />
      <path d="M21.94 12.46A17.2 17.2 0 0 0 12 4.6c-3.1 0-5.9 1.2-8.3 3.2" />
      <path d="M3.5 4.4 2 6l1.8 1.6" />
      <path d="M20.5 4.4 22 6l-1.8 1.6" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M2.06 12.46c1.9 3.1 4.8 5.4 8.1 6.3" />
      <path d="M21.94 12.46c-1.9 3.1-4.8 5.4-8.1 6.3" />
    </svg>
  );
}

export function ShieldStarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2.6 4.6 5.8v5.6c0 4.6 3.1 8.9 7.4 10 4.3-1.1 7.4-5.4 7.4-10V5.8Z" />
      <path d="m12 8.2 1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4Z" />
    </svg>
  );
}

export function HeartHandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 21.6c-4.2 0-7.6-2.8-7.6-6.2 0-2.4 1.4-4.4 3.4-5.6" />
      <path d="M12 21.6c4.2 0 7.6-2.8 7.6-6.2 0-2.4-1.4-4.4-3.4-5.6" />
      <path d="M12 9.8V4.6" />
      <path d="M8.6 7.2l3.4-2.6 3.4 2.6" />
      <circle cx="12" cy="9.8" r="2.2" />
    </svg>
  );
}

export function LockShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
      <path d="M12 15v2" />
    </svg>
  );
}

export function TarotCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <rect
        x="6"
        y="4"
        width="20"
        height="28"
        rx="3"
        fill="#4b2583"
        opacity="0.3"
      />
      <rect
        x="10"
        y="2"
        width="20"
        height="28"
        rx="3"
        fill="#6b3fa0"
        opacity="0.5"
      />
      <rect
        x="14"
        y="0"
        width="20"
        height="28"
        rx="3"
        fill="#e9b85c"
        opacity="0.9"
      />
      <path
        d="M24 8l1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5Z"
        fill="#4b2583"
      />
    </svg>
  );
}

export function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <path
        d="M20 34c-6 0-11-3.6-11-8.2 0-3.4 2.2-6 5.2-7.4.6-.3 1.2-.4 1.6-.1.4.2.6.7.5 1.2-.3 1.2-.1 2.4.6 3.4 1.4 2 4.4 2 5.8 0 .7-1 .9-2.2.6-3.4-.1-.5.1-1 .5-1.2.4-.3 1-.2 1.6.1 3 1.4 5.2 4 5.2 7.4 0 4.6-5 8.2-11 8.2Z"
        fill="#e9b85c"
      />
    </svg>
  );
}

export function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <rect
        x="6"
        y="14"
        width="28"
        height="18"
        rx="3"
        fill="#e9b85c"
        opacity="0.9"
      />
      <path
        d="M14 14V10a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4"
        fill="none"
        stroke="#e9b85c"
        strokeWidth="2.5"
      />
      <rect x="16" y="20" width="8" height="5" rx="1.5" fill="#4b2583" />
    </svg>
  );
}

export function CoinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <circle cx="20" cy="20" r="14" fill="#e9b85c" opacity="0.9" />
      <circle
        cx="20"
        cy="20"
        r="10"
        fill="none"
        stroke="#4b2583"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#4b2583"
      >
        ₹
      </text>
    </svg>
  );
}

export function YesNoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <circle cx="14" cy="20" r="10" fill="#e9b85c" opacity="0.9" />
      <circle cx="26" cy="20" r="10" fill="#6b3fa0" opacity="0.7" />
      <text
        x="14"
        y="24"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#4b2583"
      >
        Y
      </text>
      <text
        x="26"
        y="24"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="white"
      >
        N
      </text>
    </svg>
  );
}

export function CompassIcon2({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <circle cx="20" cy="20" r="14" fill="#e9b85c" opacity="0.9" />
      <circle
        cx="20"
        cy="20"
        r="10"
        fill="none"
        stroke="#4b2583"
        strokeWidth="1.5"
      />
      <path d="M20 10l2 6-6 2-2-6Z" fill="#4b2583" />
      <path d="M20 30l-2-6 6-2 2 6Z" fill="#6b3fa0" />
    </svg>
  );
}

export function CalendarCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <rect
        x="6"
        y="8"
        width="28"
        height="26"
        rx="3"
        fill="#e9b85c"
        opacity="0.9"
      />
      <rect x="6" y="8" width="28" height="8" rx="3" fill="#4b2583" />
      <text
        x="20"
        y="30"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#4b2583"
      >
        2026
      </text>
    </svg>
  );
}

export function ThreeCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <rect
        x="2"
        y="6"
        width="14"
        height="20"
        rx="2"
        fill="#6b3fa0"
        opacity="0.6"
      />
      <rect
        x="13"
        y="4"
        width="14"
        height="20"
        rx="2"
        fill="#e9b85c"
        opacity="0.9"
      />
      <rect
        x="24"
        y="6"
        width="14"
        height="20"
        rx="2"
        fill="#4b2583"
        opacity="0.7"
      />
      <text
        x="20"
        y="18"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="white"
      >
        3
      </text>
    </svg>
  );
}

export function OneCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <rect
        x="10"
        y="4"
        width="20"
        height="28"
        rx="3"
        fill="#e9b85c"
        opacity="0.9"
      />
      <path
        d="M20 10l1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5Z"
        fill="#4b2583"
      />
    </svg>
  );
}

export function SpiritualIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <circle cx="20" cy="20" r="14" fill="#e9b85c" opacity="0.9" />
      <circle
        cx="20"
        cy="20"
        r="8"
        fill="none"
        stroke="#4b2583"
        strokeWidth="1.5"
      />
      <circle cx="20" cy="20" r="3" fill="#4b2583" />
    </svg>
  );
}

export function SpreadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <rect
        x="2"
        y="8"
        width="12"
        height="18"
        rx="2"
        fill="#6b3fa0"
        opacity="0.5"
        transform="rotate(-15 8 17)"
      />
      <rect
        x="10"
        y="6"
        width="12"
        height="18"
        rx="2"
        fill="#e9b85c"
        opacity="0.9"
      />
      <rect
        x="18"
        y="8"
        width="12"
        height="18"
        rx="2"
        fill="#4b2583"
        opacity="0.7"
        transform="rotate(15 24 17)"
      />
    </svg>
  );
}

export const TAROT_ICON_MAP: Record<
  string,
  React.FC<{ className?: string }>
> = {
  "General Tarot Reading": TarotCardIcon,
  "Love & Relationship Reading": HeartIcon,
  "Career Tarot Reading": BriefcaseIcon,
  "Money & Finance Reading": CoinIcon,
  "Yes or No Reading": YesNoIcon,
  "Decision Making Reading": CompassIcon2,
  "Monthly Guidance Reading": CalendarCardIcon,
  "Yearly Guidance Reading": ({ className }: { className?: string }) => (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className}>
      <rect
        x="6"
        y="8"
        width="28"
        height="26"
        rx="3"
        fill="#e9b85c"
        opacity="0.9"
      />
      <rect x="6" y="8" width="28" height="8" rx="3" fill="#4b2583" />
      <text
        x="20"
        y="30"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#4b2583"
      >
        2026
      </text>
    </svg>
  ),
  "Three Card Reading": ThreeCardIcon,
  "One Card Reading": OneCardIcon,
  "Spiritual Path Reading": SpiritualIcon,
  "Personalized Tarot Spread": SpreadIcon,
};

export function defaultTarotIcon() {
  return <TarotCardIcon />;
}
