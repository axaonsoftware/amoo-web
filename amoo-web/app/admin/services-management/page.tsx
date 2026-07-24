import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import ServicesPanel from "./ServicesPanel";
import RightRail from "./RightRail";

export default function ServicesManagementPage() {
  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <PageHeader />

      <StatsRow />

      <div className="mt-5 flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          <ServicesPanel />
        </div>
        <RightRail />
      </div>
    </main>
  );
}
