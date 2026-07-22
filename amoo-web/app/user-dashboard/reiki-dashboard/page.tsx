import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import ChakraBalance from "./ChakraBalance";
import HealingPlan from "./HealingPlan";
import HealingProgress from "./HealingProgress";
import UpcomingSession from "./UpcomingSession";
import QuickActions from "./QuickActions";
import RecentSessions from "./RecentSessions";
import UpgradeCta from "./UpgradeCta";

export default function ReikiDashboardPage() {
  return (
    <main className="flex-1 px-5 pb-8 pt-5 lg:px-6">
      <PageHeader />
      <StatsRow />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.62fr_1fr]">
            <ChakraBalance />
            <HealingPlan />
          </div>

          <HealingProgress />
        </div>

        <div className="flex flex-col gap-4">
          <UpcomingSession />
          <QuickActions />
          <RecentSessions />
        </div>
      </div>

      <UpgradeCta />
    </main>
  );
}
