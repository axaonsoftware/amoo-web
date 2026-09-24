import { HomeHeader, OfferBar } from "../components/home-header";
import AstrologerResetPasswordForm from "../reset-password/AstrologerResetPasswordForm";
import { SiteFooter } from "../components/site-footer";

export default function AstrologerResetPasswordPage() {
  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />
      <main
        id="main-content"
        className="min-h-screen bg-[#0d0616] flex flex-col items-center justify-start md:justify-center px-4 py-6 md:py-8"
      >
        <div className="w-full max-w-[500px] rounded-2xl overflow-hidden shadow-2xl bg-white">
          <AstrologerResetPasswordForm />
        </div>
        <div className="w-full -mx-4 mt-6">
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
