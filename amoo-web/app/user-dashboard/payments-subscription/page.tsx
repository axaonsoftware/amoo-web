import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import Tabs from "./Tabs";
import TransactionHistory from "./TransactionHistory";
import UnlockBenefits from "./UnlockBenefits";
import WalletCard from "./WalletCard";
import SubscriptionCard from "./SubscriptionCard";
import AvailableOffers from "./AvailableOffers";

export default function PaymentsSubscriptionPage() {
  return (
    <main id="main-content" className="flex-1 px-5 pb-8 pt-[18px] lg:px-6">
      <PageHeader />

      <div className="mt-[18px]">
        <StatsRow />
      </div>

      <div className="mt-[22px] grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_442px]">
        <div className="flex min-w-0 flex-col gap-[22px]">
          <div className="min-w-0">
            <Tabs />
            <div className="mt-[18px]">
              <TransactionHistory />
            </div>
          </div>

          <UnlockBenefits />
        </div>

        <div className="flex flex-col gap-[18px]">
          <WalletCard />
          <SubscriptionCard />
          <AvailableOffers />
        </div>
      </div>
    </main>
  );
}
