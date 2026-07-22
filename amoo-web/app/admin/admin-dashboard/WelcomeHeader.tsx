import { Flower2, Calendar, ChevronDown } from "lucide-react";

export default function WelcomeHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-3">
        <Flower2 className="mt-[6px] h-[30px] w-[30px] shrink-0 text-[#7c3aed]" strokeWidth={1.5} />
        <div>
          <p className="text-[12.5px] font-medium text-[#8b8397]">Welcome back,</p>
          <h1 className="font-display text-[26px] font-bold leading-[1.2] text-[#3d1a63] md:text-[30px]">
            Admin <span className="align-middle">👋</span>
          </h1>
          <p className="mt-1 text-[12.5px] text-[#8b8397]">
            Here&apos;s what&apos;s happening with Amoo Guru today.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="flex h-[46px] shrink-0 items-center gap-3 rounded-[12px] border border-[#ece4f6] bg-white px-4 text-[13px] font-medium text-[#3d1a63] shadow-[0_1px_2px_rgba(42,17,72,.04)]"
      >
        <Calendar className="h-[17px] w-[17px] text-[#7c3aed]" strokeWidth={1.8} />
        <span>15 May 2025 - 21 May 2025</span>
        <ChevronDown className="h-4 w-4 text-[#8b8397]" strokeWidth={2} />
      </button>
    </div>
  );
}
