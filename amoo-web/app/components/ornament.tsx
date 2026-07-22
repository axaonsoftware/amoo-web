type OrnamentProps = {
  flip?: boolean;
  className?: string;
};

/** Gold flourish used on both sides of the section headings. */
export function Ornament({ flip = false, className = "" }: OrnamentProps) {
  return (
    <svg
      width="96"
      height="14"
      viewBox="0 0 96 14"
      fill="none"
      aria-hidden="true"
      className={`${flip ? "scale-x-[-1]" : ""} ${className}`}
    >
      <path
        d="M3 7c2.4-3.4 7-3.4 9.4 0-2.4 3.4-7 3.4-9.4 0Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M12.4 7h5.6" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="m23 2.6 4.4 4.4L23 11.4 18.6 7Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path d="M28 7h27" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="m59 4.4 2.6 2.6L59 9.6 56.4 7Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path d="M62 7h32" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

type SectionHeadingProps = {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  children,
  tone = "light",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <Ornament flip className="hidden text-gold sm:block" />
      <h2
        className={`font-display text-center text-[26px] leading-tight font-bold whitespace-nowrap sm:text-[30px] lg:text-[34px] ${
          tone === "dark" ? "text-white" : "text-grape"
        }`}
      >
        {children}
      </h2>
      <Ornament className="hidden text-gold sm:block" />
    </div>
  );
}
