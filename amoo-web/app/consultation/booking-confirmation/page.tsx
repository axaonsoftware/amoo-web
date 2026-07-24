import { HomeHeader, OfferBar } from "../../components/home-header";
import Stepper from "./Stepper";
import ConfirmationHeader from "./ConfirmationHeader";
import BookingDetailsCard from "./BookingDetailsCard";
import ImportantInfoCard from "./ImportantInfoCard";
import HeroImageCard from "./HeroImageCard";
import WhatsNextCard from "./WhatsNextCard";
import ThankYouBanner from "./ThankYouBanner";
import TrustBadges from "./TrustBadges";
import ActionButtons from "./ActionButtons";
import { SiteFooter } from "../../components/site-footer";
import WhatsAppFloatButton from "./WhatsAppFloatButton";

export default function BookingConfirmationPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#FCF9F3]">
      <OfferBar />
      <HomeHeader absolute={false} />
      <Stepper />
      <ConfirmationHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <BookingDetailsCard />
          <ImportantInfoCard />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <HeroImageCard />
          <WhatsNextCard />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col gap-8">
        <ThankYouBanner />
        <TrustBadges />
        <div className="pb-4">
          <ActionButtons />
        </div>
      </div>

      <div className="h-8" />
      <SiteFooter />
      <WhatsAppFloatButton />
    </main>
  );
}
