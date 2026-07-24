import Link from "next/link";
import { HomeHeader, OfferBar } from "./components/home-header";
import { SiteFooter } from "./components/site-footer";

export default function NotFound() {
  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />
      <main id="main-content" className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-[#0d0616] to-[#1a0a2e] px-4">
        <div className="text-center">
          <div className="mb-6 font-serif text-[80px] font-bold leading-none text-[#e9b85c] opacity-60 sm:text-[120px]">
            404
          </div>
          <h1 className="font-display text-[28px] font-bold text-white sm:text-[36px]">
            Page Not Found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-white/60">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-8 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(109,40,217,.35)] transition hover:scale-[1.02]"
          >
            Go Home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
