import { CalendarRange, Upload, Plus, ChevronRight } from "lucide-react";
import StatsRow from "./StatsRow";
import AvailabilityTable from "./AvailabilityTable";
import TodaysSlots from "./TodaysSlots";
import RightPanel from "./RightPanel";

export default function AvailabilitySlotsPage() {
  return (
    <main id="main-content" className="flex-1 px-5 pb-8 pt-5 lg:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11.5px]">
        <span className="font-light text-[#8a86a0]">Dashboard</span>
        <ChevronRight className="h-[13px] w-[13px] text-[#c9c5d6]" strokeWidth={2} />
        <span className="font-light text-[#8a86a0]">Availability &amp; Slots</span>
        <ChevronRight className="h-[13px] w-[13px] text-[#c9c5d6]" strokeWidth={2} />
        <span className="font-semibold text-[#241f3d]">Manage Slots</span>
      </nav>

      {/* Page header */}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4c159f] to-[#27026e]">
          <CalendarRange className="h-[21px] w-[21px] text-white" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[25px] font-bold leading-tight text-[#241f3d]">
            Availability &amp; Slots
          </h1>
          <p className="mt-1 text-[11.5px] font-light text-[#8a86a0]">
            Manage astrologer availability, weekly schedules and time slots.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex h-[38px] items-center gap-2 rounded-[9px] border border-[#d7c9f5] bg-white px-4 text-[12px] font-medium text-[#241f3d] hover:bg-[#faf8ff]"
          >
            <Upload className="h-[15px] w-[15px] text-[#3b0788]" strokeWidth={1.9} />
            Export Availability
          </button>
          <button
            type="button"
            className="flex h-[38px] items-center gap-2 rounded-[9px] bg-gradient-to-r from-[#3b0788] to-[#2c0468] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(51,4,119,.25)]"
          >
            <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />
            Add Time Slot
          </button>
        </div>
      </div>

      <StatsRow />

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_272px]">
        <div className="min-w-0">
          <AvailabilityTable />
          <TodaysSlots />
        </div>

        <RightPanel />
      </div>
    </main>
  );
}
