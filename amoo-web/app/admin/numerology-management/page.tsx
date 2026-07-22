import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import ReportsPanel from "./ReportsPanel";
import RightRail from "./RightRail";

export default function NumerologyManagementPage() {
  return (
    <main className="flex-1 px-5 py-[18px]">
      <PageHeader />

      <div className="mt-[18px]">
        <StatsRow />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
        <ReportsPanel />
        <RightRail />
      </div>
    </main>
  );
}
