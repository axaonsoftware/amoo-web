import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import LatestKundali from "./LatestKundali";
import QuickActions from "./QuickActions";
import PlanetaryOverview from "./PlanetaryOverview";
import RecentKundalis from "./RecentKundalis";
import UpgradeCta from "./UpgradeCta";

export default function KundaliDashboardPage() {
  return (
    <main id="main-content" className="flex-1 px-5 pb-8 pt-5 lg:px-6">
      <PageHeader />
      <StatsRow />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.87fr_1fr]">
        <div className="flex flex-col gap-4">
          <LatestKundali />
          <RecentKundalis />
        </div>

        <div className="flex flex-col gap-4">
          <QuickActions />
          <PlanetaryOverview />
        </div>
      </div>

      <UpgradeCta />
    </main>
  );
}
