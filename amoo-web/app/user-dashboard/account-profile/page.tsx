import PageHeader from "./PageHeader";
import ProfileCard from "./ProfileCard";
import PersonalInformation from "./PersonalInformation";
import AccountInformation from "./AccountInformation";
import PremiumBanner from "./PremiumBanner";

export default function AccountProfilePage() {
  return (
    <main className="flex-1 px-5 pb-7 pt-6 lg:px-[26px]">
      <PageHeader />

      <div className="mt-[18px] grid grid-cols-1 items-start gap-[22px] xl:grid-cols-[286px_1fr]">
        <ProfileCard />

        <div className="flex flex-col gap-[22px]">
          <PersonalInformation />
          <AccountInformation />
        </div>
      </div>

      <div className="mt-[22px]">
        <PremiumBanner />
      </div>
    </main>
  );
}
