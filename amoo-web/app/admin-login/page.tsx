import { HomeHeader, OfferBar } from "../components/home-header";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import { SITE_NAME } from "../../lib/constants";

export default function AdminLoginPage() {
  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />
      <main
        id="main-content"
        className="min-h-screen bg-[#12031f] flex flex-col items-center justify-start md:justify-center p-4 sm:p-5 lg:p-8"
      >
        <div className="w-full max-w-[1100px] flex flex-col overflow-hidden rounded-2xl lg:rounded-[32px] border border-[#7d5fa733] bg-[#12031f] shadow-[0_25px_70px_rgba(0,0,0,.45)] min-h-[auto] md:min-h-[700px] md:flex-row">
          <LeftPanel />
          <RightPanel />
        </div>

        <p className="mt-7 text-center text-[18px] text-white/85">
          © {new Date().getFullYear()} {SITE_NAME}. All Rights Reserved.
        </p>
      </main>
    </>
  );
}
