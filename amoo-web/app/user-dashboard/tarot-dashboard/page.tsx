import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import PopularSpreads from "./PopularSpreads";
import QuickActions from "./QuickActions";
import RecentReadings from "./RecentReadings";
import RecentCards from "./RecentCards";
import GoPremiumBanner from "./GoPremiumBanner";
import DailyTip from "./DailyTip";

export default function TarotDashboardPage() {
  return (
    <main className="flex-1 px-5 pb-6 pt-4 lg:px-6">
      <PageHeader />
      <StatsRow />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.42fr_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <PopularSpreads />
          <RecentReadings />
          <GoPremiumBanner />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <QuickActions />
          <RecentCards />
          <DailyTip />
        </div>
      </div>
    </main>
  );
}
