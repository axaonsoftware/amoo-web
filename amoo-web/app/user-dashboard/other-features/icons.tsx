/* Brand marks, decorative graphics and the small amber glyphs used in the
   "Why Users Love AmooGuru?" card. All inline SVG so they scale crisply. */

const AMBER = "#F5901E";

function Experts() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <circle cx="7.6" cy="5.4" r="2.9" stroke={AMBER} strokeWidth="1.3" />
      <path
        d="M2.4 15.4c0-2.9 2.3-5.2 5.2-5.2s5.2 2.3 5.2 5.2"
        stroke={AMBER}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M14.6 2.2l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7.7-1.5Z"
        fill={AMBER}
      />
    </svg>
  );
}

function AllInOne() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M9 1.2 15.6 3.5v5.2c0 4-2.8 6.9-6.6 8.1-3.8-1.2-6.6-4.1-6.6-8.1V3.5L9 1.2Z"
        fill={AMBER}
      />
      <path
        d="M9 5.4c1.5 1.9 1.9 3.6 1.2 5.2H7.8C7.1 9 7.5 7.3 9 5.4Z"
        fill="#FFF3E2"
      />
      <circle cx="9" cy="12" r="1.1" fill="#FFF3E2" />
    </svg>
  );
}

function Secure() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M9 1.2 15.6 3.5v5.2c0 4-2.8 6.9-6.6 8.1-3.8-1.2-6.6-4.1-6.6-8.1V3.5L9 1.2Z"
        fill={AMBER}
      />
      <rect x="7.5" y="7.6" width="3" height="4.6" rx="1.5" fill="#FFF3E2" />
    </svg>
  );
}

function Divine() {
  return (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-[#EFE6FB]">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
        <circle cx="6.5" cy="6.5" r="2.1" fill="#E0182C" />
        <path
          d="M6.5 0.6v2.3M6.5 10.1v2.3M0.6 6.5h2.3M10.1 6.5h2.3M2.3 2.3l1.6 1.6M9.1 9.1l1.6 1.6M10.7 2.3 9.1 3.9M3.9 9.1l-1.6 1.6"
          stroke="#F5901E"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export const WhyIcons = { Experts, AllInOne, Secure, Divine };

/* ------------------------------------------------------------------ */

function Instagram() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="ofIg" cx="0.3" cy="1" r="1.1">
          <stop offset="0" stopColor="#FFD776" />
          <stop offset="0.25" stopColor="#F3A03B" />
          <stop offset="0.5" stopColor="#E8483E" />
          <stop offset="0.75" stopColor="#C32AA3" />
          <stop offset="1" stopColor="#7A38C6" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="18" fill="url(#ofIg)" />
      <rect
        x="10"
        y="10"
        width="16"
        height="16"
        rx="5"
        stroke="#fff"
        strokeWidth="1.8"
      />
      <circle cx="18" cy="18" r="4.1" stroke="#fff" strokeWidth="1.8" />
      <circle cx="22.9" cy="13.1" r="1.15" fill="#fff" />
    </svg>
  );
}

function YouTube() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="18" cy="18" r="18" fill="#FF0000" />
      <rect x="8.5" y="12" width="19" height="12" rx="3.2" fill="#fff" />
      <path d="M16 15.6v4.8l4.4-2.4L16 15.6Z" fill="#FF0000" />
    </svg>
  );
}

function Facebook() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="18" cy="18" r="18" fill="#1877F2" />
      <path
        d="M22.4 22.3l.7-4.4h-4.2v-2.9c0-1.2.6-2.4 2.5-2.4h1.9V9.5s-1.7-.3-3.4-.3c-3.5 0-5.7 2.1-5.7 5.9v3.3h-3.8v4.4h3.8v10.4a15 15 0 0 0 4.7 0V22.3h3.5Z"
        fill="#fff"
      />
    </svg>
  );
}

function WhatsApp() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="18" cy="18" r="18" fill="#25D366" />
      <path
        d="M18.1 9.2a8.6 8.6 0 0 0-7.3 13.2l-1.2 4.4 4.5-1.2a8.6 8.6 0 1 0 4-16.4Zm0 15.7a7 7 0 0 1-3.6-1l-.3-.2-2.7.7.7-2.6-.2-.3a7.1 7.1 0 1 1 6.1 3.4Z"
        fill="#fff"
      />
      <path
        d="M22 20.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a5.8 5.8 0 0 1-2.9-2.5c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.6-1.5c-.2-.4-.4-.3-.5-.3h-.5c-.2 0-.5.1-.7.3-.8.8-.9 1.9-.2 3.1a9.6 9.6 0 0 0 4 3.8c1.4.6 2.3.5 2.9.2.4-.2 1-.7 1.1-1.1.1-.3.1-.6 0-.7l-.4-.2Z"
        fill="#fff"
      />
    </svg>
  );
}

function Telegram() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="18" cy="18" r="18" fill="#31A8E0" />
      <path
        d="M26.6 11.3 24 25.1c-.2.9-.7 1.1-1.4.7l-4-3-1.9 1.9c-.2.2-.4.4-.8.4l.3-4.1 7.4-6.7c.3-.3-.1-.4-.5-.2l-9.2 5.8-4-1.2c-.9-.3-.9-.9.2-1.3l15.6-6c.7-.3 1.4.2 1.1 1.9Z"
        fill="#fff"
      />
    </svg>
  );
}

function GooglePlay() {
  return (
    <span className="flex h-[49px] w-[171px] items-center gap-[11px] rounded-[11px] bg-[#0B0B0B] pl-[14px]">
      <svg width="24" height="26" viewBox="0 0 24 26" fill="none" aria-hidden>
        <path
          d="M1.3 1.1a2 2 0 0 0-.6 1.4v21a2 2 0 0 0 .6 1.4L13 13.3 1.3 1.1Z"
          fill="#00D0FF"
        />
        <path
          d="M17.8 17.9 13 13.3 1.3 25.1a1.9 1.9 0 0 0 2.3.2l14.2-7.4Z"
          fill="#EA4335"
        />
        <path
          d="M17.8 8.6 3.6 1.2a1.9 1.9 0 0 0-2.3.2L13 13.3l4.8-4.7Z"
          fill="#00F076"
        />
        <path
          d="M17.8 8.6 13 13.3l4.8 4.6 5-2.6c1.4-.8 1.4-2.7 0-3.4l-5-2.6Z"
          fill="#FFCE00"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[8.5px] font-medium uppercase tracking-[0.03em] text-white">
          Get it on
        </span>
        <span className="mt-[3px] text-[17px] font-semibold leading-[1.15] text-white">
          Google Play
        </span>
      </span>
    </span>
  );
}

function AppStore() {
  return (
    <span className="flex h-[49px] w-[171px] items-center gap-[10px] rounded-[11px] bg-[#0B0B0B] pl-[14px]">
      <svg width="24" height="28" viewBox="0 0 24 28" fill="#fff" aria-hidden>
        <path d="M18.6 14.7c0-3.1 2.5-4.6 2.6-4.7-1.4-2.1-3.6-2.4-4.4-2.4-1.9-.2-3.6 1.1-4.6 1.1-.9 0-2.4-1.1-3.9-1-2 0-3.9 1.2-4.9 3-2.1 3.6-.5 9 1.5 12 1 1.4 2.2 3 3.7 2.9 1.5-.1 2.1-1 3.9-1 1.8 0 2.3 1 3.9 1 1.6 0 2.6-1.4 3.6-2.9 1.1-1.6 1.6-3.2 1.6-3.3-.1 0-3-1.2-3-4.7Z" />
        <path d="M15.5 5.6c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.7.8-3.6 1.8-.8.9-1.4 2.3-1.2 3.7 1.3.1 2.7-.7 3.6-1.7Z" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[8.5px] font-medium text-white">
          Download on the
        </span>
        <span className="mt-[3px] text-[17px] font-semibold leading-[1.15] text-white">
          App Store
        </span>
      </span>
    </span>
  );
}

export const Brands = {
  Instagram,
  YouTube,
  Facebook,
  WhatsApp,
  Telegram,
  GooglePlay,
  AppStore,
};

/* ------------------------------------------------------------------ */

export function FooterLotus() {
  return (
    <svg
      viewBox="0 0 180 150"
      fill="none"
      className="pointer-events-none absolute right-[8px] top-[22px] h-[150px] w-[180px]"
      aria-hidden
    >
      <defs>
        <linearGradient id="ofLp" x1="90" y1="55" x2="90" y2="128">
          <stop offset="0" stopColor="#FCE3AC" />
          <stop offset="0.55" stopColor="#F3B655" />
          <stop offset="1" stopColor="#D98A2B" />
        </linearGradient>
        <linearGradient id="ofLpIn" x1="90" y1="50" x2="90" y2="125">
          <stop offset="0" stopColor="#FEF0CE" />
          <stop offset="1" stopColor="#F0AC3C" />
        </linearGradient>
        <linearGradient id="ofLbase" x1="90" y1="112" x2="90" y2="132">
          <stop offset="0" stopColor="#8C63C4" />
          <stop offset="1" stopColor="#5B2E9C" />
        </linearGradient>
        <radialGradient id="ofLglow" cx="0.5" cy="0.62" r="0.55">
          <stop offset="0" stopColor="#F6D9A8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#F6D9A8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="90" cy="95" rx="82" ry="52" fill="url(#ofLglow)" />

      {/* mandala halo */}
      <g stroke="#C7ADE4" strokeWidth="1" opacity="0.55">
        <path d="M90 8c40 0 72 32 72 72 0 12-3 24-8 34" />
        <path d="M90 8C50 8 18 40 18 80c0 12 3 24 8 34" />
        <path d="M32 116a58 58 0 0 1 116 0" />
        {Array.from({ length: 18 }).map((_, i) => {
          const a = Math.PI + (i / 17) * Math.PI;
          return (
            <path
              key={i}
              d={`M${90 + Math.cos(a) * 58} ${112 + Math.sin(a) * 58} L${
                90 + Math.cos(a) * 72
              } ${112 + Math.sin(a) * 72}`}
            />
          );
        })}
      </g>
      <path
        d="M90 14c8 6 12 12 12 18s-4 10-12 10-12-4-12-10 4-12 12-18Z"
        stroke="#C7ADE4"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* petals */}
      <path
        d="M90 46c11 17 15 34 11 51l-11 7-11-7c-4-17 0-34 11-51Z"
        fill="url(#ofLpIn)"
      />
      <path
        d="M55 60c15 10 25 24 28 41l-5 12-12-2c-12-13-16-30-11-51Z"
        fill="url(#ofLp)"
      />
      <path
        d="M125 60c5 21 1 38-11 51l-12 2-5-12c3-17 13-31 28-41Z"
        fill="url(#ofLp)"
      />
      <path
        d="M28 82c18 2 33 11 42 26l-1 13-14 3c-15-9-25-23-27-42Z"
        fill="url(#ofLp)"
        opacity="0.92"
      />
      <path
        d="M152 82c-2 19-12 33-27 42l-14-3-1-13c9-15 24-24 42-26Z"
        fill="url(#ofLp)"
        opacity="0.92"
      />
      <path
        d="M90 58c7 14 10 28 7 42l-7 5-7-5c-3-14 0-28 7-42Z"
        fill="#FBD98F"
      />

      {/* base */}
      <path
        d="M46 116c10 12 25 18 44 18s34-6 44-18c-12-7-27-11-44-11s-32 4-44 11Z"
        fill="url(#ofLbase)"
      />
      <ellipse cx="90" cy="134" rx="46" ry="5" fill="#7B57B5" opacity="0.35" />

      {/* flame */}
      <path
        d="M90 28c4 5 6 9 6 12a6 6 0 0 1-12 0c0-3 2-7 6-12Z"
        fill="#F6C34A"
      />
      <path
        d="M90 84c4 6 6 10 6 13a6 6 0 0 1-12 0c0-3 2-7 6-13Z"
        fill="#FBD35C"
      />
    </svg>
  );
}
