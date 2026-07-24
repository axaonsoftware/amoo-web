import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import ConsultationsPanel from "./ConsultationsPanel";
import RightRail from "./RightRail";

export default function ConsultationManagementPage() {
  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-5 sm:px-6">
      <PageHeader />

      <div className="mt-0 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_254px]">
        <div className="min-w-0">
          <StatsRow />
          <div className="mt-4">
            <ConsultationsPanel />
          </div>
        </div>

        <div className="mt-5 min-w-0">
          <RightRail />
        </div>
      </div>
    </main>
  );
}
