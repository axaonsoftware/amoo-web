import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import KundaliPanel from "./KundaliPanel";
import RightRail from "./RightRail";

export default function KundaliManagementPage() {
  return (
    <main className="flex-1 pb-6">
      <div className="px-6 pt-[11px]">
        <PageHeader />

        <div className="mt-[26px]">
          <StatsRow />
        </div>
      </div>

      <div className="mt-[12px] flex gap-[10px] pl-[10px] pr-6 max-xl:flex-col max-xl:px-6">
        <div className="min-w-0 flex-1">
          <KundaliPanel />
        </div>

        <aside className="w-[281px] shrink-0 max-xl:w-full">
          <RightRail />
        </aside>
      </div>
    </main>
  );
}
