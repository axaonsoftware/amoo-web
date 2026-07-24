import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import QuickOverview from "./QuickOverview";
import PopularTools from "./PopularTools";
import CreateReport from "./CreateReport";
import RecentReports from "./RecentReports";
import UpgradeBanner from "./UpgradeBanner";

export default function NumerologyDashboardPage() {
  return (
    <main id="main-content" className="flex-1 px-5 pb-6 pt-4 lg:px-6">
      <PageHeader />
      <StatsRow />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.26fr_1fr]">
        <div className="flex flex-col gap-4">
          <QuickOverview />
          <PopularTools />
        </div>

        <div className="flex flex-col gap-4">
          <CreateReport />
          <RecentReports />
        </div>
      </div>

      <UpgradeBanner />
    </main>
  );
}
