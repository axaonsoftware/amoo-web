import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import RevenueOverview from "./RevenueOverview";
import PaymentMethods from "./PaymentMethods";
import RecentTransactions from "./RecentTransactions";
import RefundsHistory from "./RefundsHistory";
import PayoutsSummary from "./PayoutsSummary";
import InvoicesOverview from "./InvoicesOverview";
import RevenueByService from "./RevenueByService";
import TopEarningAstrologers from "./TopEarningAstrologers";
import TodaysCollection from "./TodaysCollection";
import QuickActions from "./QuickActions";

export default function PaymentsFinancePage() {
  return (
    <main className="flex-1 px-5 py-5">
      <PageHeader />

      <div className="mt-5">
        <StatsRow />
      </div>

      <div className="mt-[14px] grid grid-cols-1 gap-[14px] lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueOverview />
        </div>
        <PaymentMethods />
      </div>

      <div className="mt-[14px] grid grid-cols-1 gap-[14px] lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-[14px]">
          <RecentTransactions />
          <RefundsHistory />
        </div>
        <div className="flex flex-col gap-[14px]">
          <PayoutsSummary />
          <InvoicesOverview />
        </div>
      </div>

      <div className="mt-[14px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
        <RevenueByService />
        <TopEarningAstrologers />
        <TodaysCollection />
        <QuickActions />
      </div>
    </main>
  );
}
