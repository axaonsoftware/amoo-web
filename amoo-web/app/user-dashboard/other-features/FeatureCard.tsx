function BulletMark() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      className="mt-[5px] shrink-0"
      aria-hidden
    >
      <path
        d="M1.4 1.2 5.9 5.5 1.4 9.8"
        stroke="#8E7BD8"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 1.2 10.7 5.5 6.2 9.8"
        stroke="#8E7BD8"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FeatureCard({
  title,
  bullets,
  phone,
}: {
  title: string;
  bullets: string[];
  phone: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[405px] gap-[10px] rounded-[18px] border border-[#F0EEF7] bg-[linear-gradient(150deg,#FBFAFD_0%,#FFFFFF_55%)] pb-[19px] pl-[22px] pr-[20px] pt-[22px] shadow-[0_1px_2px_rgba(45,25,110,0.02)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="whitespace-nowrap text-[15px] font-bold leading-[1.3] text-[#241268]">
          {title}
        </h2>

        <ul className="mt-[30px] flex flex-col gap-[18px]">
          {bullets.map((b) => (
            <li key={b} className="flex gap-[9px]">
              <BulletMark />
              <span className="text-[12.5px] font-normal leading-[1.6] text-[#4F4B78]">
                {b}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-[7px] shrink-0">{phone}</div>
    </section>
  );
}
