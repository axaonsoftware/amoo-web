import OverviewAnalytics from "./OverviewAnalytics";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import StatsRow from "./StatsRow";
import TodaysAppointments from "./TodaysAppointments";
import TopAstrologers from "./TopAstrologers";
import TopServices from "./TopServices";
import WelcomeHeader from "./WelcomeHeader";
import { PageViewTracker } from "../../components/PageViewTracker";

export default function AdminDashboardPage() {
  return (
    <main
      id="main-content"
      className="flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6"
    >
      <PageViewTracker
        page="/admin/admin-dashboard"
        meta={{ area: "admin-dashboard" }}
      />
      <WelcomeHeader />
      <StatsRow />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-5">
          <OverviewAnalytics />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TopServices />
            <TopAstrologers />
          </div>

          <QuickActions />
        </div>

        <div className="flex flex-col gap-5">
          <RecentActivity />
          <TodaysAppointments />
        </div>
      </div>
    </main>
  );
}
