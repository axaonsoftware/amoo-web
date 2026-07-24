import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import RevenueOverview from "./RevenueOverview";
import RevenueByService from "./RevenueByService";
import BookingsOverview from "./BookingsOverview";
import TopServicesByBookings from "./TopServicesByBookings";
import UserGrowth from "./UserGrowth";
import TopPerformingAstrologers from "./TopPerformingAstrologers";
import ReportsSummary from "./ReportsSummary";
import SideMetrics from "./SideMetrics";
import QuickInsights from "./QuickInsights";

export default function ReportsAnalyticsPage() {
  return (
    <main id="main-content" className="flex-1 px-5 py-5">
      <PageHeader />

      <div className="mt-5">
        <StatsRow />
      </div>

      <div className="mt-[14px] grid grid-cols-1 gap-[14px] lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueOverview />
        </div>
        <RevenueByService />
      </div>

      <div className="mt-[14px] grid grid-cols-1 gap-[14px] md:grid-cols-2 lg:grid-cols-[347fr_313fr_464fr]">
        <BookingsOverview />
        <TopServicesByBookings />
        <UserGrowth />
      </div>

      <div className="mt-[14px] grid grid-cols-1 gap-[14px] md:grid-cols-2 lg:grid-cols-[618fr_290fr_220fr]">
        <TopPerformingAstrologers />
        <ReportsSummary />
        <SideMetrics />
      </div>

      <div className="mt-[14px]">
        <QuickInsights />
      </div>
    </main>
  );
}
