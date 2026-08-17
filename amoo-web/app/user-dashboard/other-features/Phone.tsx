export function StatusBar({
  time = "9:41",
  tone = "dark",
}: {
  time?: string;
  tone?: "dark" | "light";
}) {
  const color = tone === "dark" ? "#1B1340" : "#FFFFFF";
  return (
    <div className="flex h-[20px] shrink-0 items-center justify-between px-[10px] pt-[3px]">
      <span className="text-[7px] font-semibold leading-none" style={{ color }}>
        {time}
      </span>
      <span className="flex items-center gap-[3px]">
        {/* signal */}
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M0 6h1.4V4.4H0V6Z" fill={color} />
          <path d="M2.5 6h1.4V3.1H2.5V6Z" fill={color} />
          <path d="M5 6h1.4V1.7H5V6Z" fill={color} />
          <path d="M7.5 6h1.4V0H7.5v6Z" fill={color} />
        </svg>
        {/* wifi */}
        <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
          <path d="M4 6.2 6.9 2.5A4.6 4.6 0 0 0 1.1 2.5L4 6.2Z" fill={color} />
        </svg>
        {/* battery */}
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
          <rect
            x="0.4"
            y="0.4"
            width="9.6"
            height="6.2"
            rx="1.6"
            stroke={color}
            strokeWidth="0.8"
          />
          <rect
            x="1.6"
            y="1.6"
            width="7.2"
            height="3.8"
            rx="0.8"
            fill={color}
          />
          <path
            d="M10.9 2.4v2.2c.5-.2.8-.6.8-1.1s-.3-.9-.8-1.1Z"
            fill={color}
          />
        </svg>
      </span>
    </div>
  );
}

export default function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[357px] w-[158px] shrink-0 rounded-[26px] bg-[#0C0C10] p-[3.5px] shadow-[0_14px_30px_-10px_rgba(28,16,74,0.45),0_4px_10px_-4px_rgba(28,16,74,0.25)]">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[23px] bg-white">
        {children}
      </div>
    </div>
  );
}
