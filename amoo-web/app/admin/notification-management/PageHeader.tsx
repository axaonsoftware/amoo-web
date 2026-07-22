import { ChevronRight, Bell, Plus } from "lucide-react";

export default function PageHeader({ onAdd }: { onAdd?: () => void }) {
  return (
    <>
      <nav className="flex items-center gap-[6px] text-[10.5px]">
        <span className="text-[#8B879C]">Dashboard</span>
        <ChevronRight size={12} className="text-[#B7B3C4]" />
        <span className="text-[#8B879C]">Notification Management</span>
        <ChevronRight size={12} className="text-[#B7B3C4]" />
        <span className="font-medium text-[#3D3752]">All Notifications</span>
      </nav>

      <div className="mt-[14px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[14px]">
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] shadow-[0_6px_16px_rgba(109,40,217,.25)]">
            <Bell size={24} strokeWidth={1.8} className="text-white" />
          </span>

          <div>
            <h1 className="font-display text-[26px] font-bold leading-none text-[#231640]">
              Notification Management
            </h1>
            <p className="mt-[7px] text-[11px] text-[#8B879C]">
              Compose and send notifications to users or broadcast to all.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex h-[38px] items-center gap-[7px] rounded-[9px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-[15px] text-[11.5px] font-medium text-white shadow-[0_6px_16px_rgba(109,40,217,.25)]"
        >
          <Plus size={15} strokeWidth={2.4} />
          Compose Notification
        </button>
      </div>
    </>
  );
}
