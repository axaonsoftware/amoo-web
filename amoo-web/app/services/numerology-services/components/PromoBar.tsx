import { Gift } from "lucide-react";

export default function PromoBar() {
  return (
    <div className="bg-[#150826] text-white text-xs sm:text-sm py-2 px-4 flex flex-wrap items-center justify-center gap-3 text-center">
      <span className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-amber-300 font-medium">
          Special Offer: Get 15% OFF on All Numerology Consultations This Week Only!
        </span>
      </span>
      <span className="border border-amber-500/60 text-amber-300 rounded px-3 py-1 text-xs">
        Use Code: AMOONUM15
      </span>
    </div>
  );
}
