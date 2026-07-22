import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function UpgradeBanner() {
  return (
    <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#2c0d4c] via-[#3d1268] to-[#5a2496] px-5 py-5 shadow-[0_12px_30px_rgba(42,17,72,.28)]">
      <div className="stars pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative flex flex-col items-center gap-4 sm:flex-row">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=160&q=80"
          alt="Premium crown"
          width={160}
          height={120}
          className="h-[100px] w-[120px] shrink-0 object-contain"
        />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="font-display text-[22px] font-bold text-[#f0c877]">
            Unlock Deeper Insights
          </h2>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-white/85">
            Upgrade to Premium and access advanced
            <br className="hidden sm:block" />
            reports, expert consultations &amp; more!
          </p>
        </div>

        <Link
          href="/user-dashboard/payments-subscription"
          className="inline-flex shrink-0 items-center gap-2 rounded-[8px] bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-5 py-2.5 text-[13px] font-semibold text-[#2a1148] shadow-[0_6px_16px_rgba(0,0,0,.28)]"
        >
          Upgrade Now
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  );
}
