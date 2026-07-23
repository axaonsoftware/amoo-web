import { HomeHeader, OfferBar } from "../components/home-header";
import AstrologerRightSection from "./AstrologerRightSection";
import { SiteFooter } from "../components/site-footer";
import TrustBar from "../user-login/TrustBar";

export default function AstrologerLoginPage() {
  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />
      <main className="min-h-screen bg-[#0d0616] flex flex-col items-center justify-start md:justify-center px-4 py-6 md:py-8">
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row justify-center rounded-2xl overflow-hidden shadow-2xl min-h-[auto] md:min-h-[720px]">
          <AstrologerLeftSection />
          <AstrologerRightSection />
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

function AstrologerLeftSection() {
  return (
    <section className="relative hidden w-full overflow-hidden md:block md:w-1/2">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0730] via-[#2c0e4c] to-[#0d0218]" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-10 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-[#f1c469] to-[#dda43c] shadow-[0_0_40px_rgba(233,184,92,.3)]">
          <span className="font-serif text-3xl font-bold text-[#1a0730]">AG</span>
        </div>
        <h2 className="font-serif text-3xl font-bold text-white">Astrologer Portal</h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          Access your dashboard to manage consultations, deliver reports, track earnings, and connect with clients.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#e9b85c]/60" />
          <div className="h-2 w-2 rotate-45 bg-[#e9b85c]" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#e9b85c]/60" />
        </div>
        <p className="mt-6 text-xs italic text-white/40">
          &ldquo;The stars incline us, they do not bind us.&rdquo;
        </p>
      </div>
    </section>
  );
}
