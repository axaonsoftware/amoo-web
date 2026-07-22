import Image from "next/image";

export default function DailyTip() {
  return (
    <section className="relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-[#f0e0bd] bg-gradient-to-r from-[#fdf6ea] via-[#fdf4e6] to-[#faf1fb] px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[16px] font-bold leading-[1.2] text-[#2b0f47]">
          Daily Tarot Tip
        </h3>
        <p className="mt-2 text-[12px] leading-[1.5] text-[#6c6b78]">
          Focus on the present moment.
          <br />
          The answers you seek are
          <br />
          already within you.
        </p>
      </div>

      {/* Crystal ball artwork */}
      <span className="relative block h-[74px] w-[74px] shrink-0">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=148&q=80"
          alt="Crystal ball"
          fill
          sizes="74px"
          className="object-contain object-bottom"
        />
      </span>
    </section>
  );
}
