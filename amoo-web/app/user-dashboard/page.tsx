import WelcomeHeader from "./WelcomeHeader";
import StatsRow from "./StatsRow";
import UpcomingConsultation from "./UpcomingConsultation";
import QuickAccess from "./QuickAccess";
import UpgradeBanner from "./UpgradeBanner";
import DailyHoroscope from "./DailyHoroscope";
import RecentReports from "./RecentReports";
import FeaturedCourses from "./FeaturedCourses";
import { PageViewTracker } from "../components/PageViewTracker";

export default function DashboardPage() {
  return (
    <main id="main-content" className="flex-1 px-5 pb-10 pt-6 lg:px-6">
      <PageViewTracker page="/user-dashboard" meta={{ area: "user-dashboard" }} />
      <WelcomeHeader />
      <StatsRow />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-4">
          <UpcomingConsultation />
          <QuickAccess />
          <UpgradeBanner />
        </div>

        <div className="flex flex-col gap-4">
          <DailyHoroscope />
          <RecentReports />
        </div>
      </div>

      <FeaturedCourses />
    </main>
  );
}
