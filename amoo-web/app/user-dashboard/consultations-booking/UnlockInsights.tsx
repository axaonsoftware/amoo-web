import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function UnlockInsights() {
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#5a2f8f] bg-gradient-to-br from-[#3a0f5e] via-[#2a0a47] to-[#1c0733] px-[18px] pb-[18px] pt-[18px] shadow-[0_10px_30px_rgba(38,17,66,.25)]">
      <div className="stars pointer-events-none absolute inset-0 opacity-50" />

      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/lotus_candles_no_bg.png"
        alt=""
        width={300}
        height={300}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[142px] w-[142px] object-contain object-bottom"
      />

      <div className="relative max-w-full sm:max-w-[62%]">
        <h2 className="font-display text-[19px] font-bold leading-tight text-[#f3c76e]">
          Unlock Deeper Insights
        </h2>
        <p className="mt-2 text-[12px] leading-[1.55] text-white/75">
          Upgrade to Premium for priority bookings &amp; exclusive benefits.
        </p>
        <Link
          href="/user-dashboard/payments-subscription"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-b from-[#7c3fc4] to-[#5b21a8] px-4 py-[10px] text-[12.5px] font-semibold text-white shadow-[0_6px_16px_rgba(0,0,0,.3)]"
        >
          Upgrade Now
          <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  );
}
