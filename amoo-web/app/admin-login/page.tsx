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
        className="min-h-[calc(100vh-80px)] bg-[#12031f] flex flex-col items-center justify-center px-3 py-4 sm:px-5 lg:px-6"
      >
        <div
          className="
    w-full
    max-w-[1000px]
    md:h-[540px]
    flex
    flex-col
    md:flex-row
    overflow-hidden
    rounded-2xl
    lg:rounded-[26px]
    border
    border-[#7d5fa733]
    bg-[#12031f]
    shadow-[0_20px_60px_rgba(0,0,0,.45)]
  "
        >
          <LeftPanel />
          <RightPanel />
        </div>

        <p className="mt-3 text-center text-xs text-white/75 sm:text-sm">
          © {new Date().getFullYear()} {SITE_NAME}. All Rights Reserved.
        </p>
      </main>
    </>
  );
}
