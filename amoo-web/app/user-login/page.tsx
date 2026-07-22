import { HomeHeader, OfferBar } from "../components/home-header";
import UserLeftSection from "./UserLeftSection";
import UserRightSection from "./UserRightSection";
import { SiteFooter } from "../components/site-footer";
import TrustBar from "./TrustBar";

export default function LoginPage() {
  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />
      <main className="min-h-screen bg-[#0d0616] flex flex-col items-center justify-start md:justify-center px-4 py-6 md:py-8">
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row justify-center rounded-2xl overflow-hidden shadow-2xl min-h-[auto] md:min-h-[720px]">
          <UserLeftSection />
          <UserRightSection />
        </div>

        <div className="w-full max-w-6xl">
          <TrustBar />
        </div>

        <div className="w-full -mx-4 mt-6">
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
