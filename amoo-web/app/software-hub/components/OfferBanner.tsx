import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "./icons";

export default function OfferBanner() {
  return (
    <div className="relative mt-[17px] overflow-hidden rounded-[16px] border border-[#4a2a6e]/50 bg-[radial-gradient(120%_160%_at_50%_50%,#2a0846_0%,#1e0533_55%,#16032a_100%)] px-[30px] py-[13px]">
      <div className="haze pointer-events-none absolute inset-0 opacity-70" />

      {/* lotus glow, right edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[160px] xl:block">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=320&q=80"
          alt=""
          fill
          sizes="160px"
          className="object-cover object-center"
        />
      </div>

      <div className="relative flex flex-col items-center gap-[22px] xl:flex-row xl:gap-0">
        {/* gift + heading */}
        <div className="flex items-center gap-[33px]">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=220&q=80"
            alt=""
            width={220}
            height={220}
            className="h-[100px] w-[110px] shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="font-display text-[22px] leading-[1.25] font-bold text-[#f0c46a]">
              Special Offer for You!
            </p>
            <p className="mt-[7px] text-[13px] leading-[1.5] font-normal text-white">
              Get 15% OFF on all software today.
            </p>
          </div>
        </div>

        {/* coupon code */}
        <div className="flex h-[44px] w-full max-w-[288px] items-center justify-center rounded-[8px] border border-dashed border-gold/60 px-[20px] xl:ml-[65px]">
          <span className="text-[13.5px] font-normal whitespace-nowrap text-white">
            Use Code:{" "}
            <span className="text-[15px] font-bold tracking-[0.02em] text-gold">
              AMOOGURU15
            </span>
          </span>
        </div>

        {/* divider */}
        <span className="hidden h-[86px] w-px bg-white/15 xl:ml-[42px] xl:block" />

        {/* cta */}
        <div className="flex flex-col items-center xl:ml-[57px]">
          <Link
            href="/software-hub"
            className="flex h-[32px] w-[276px] items-center justify-center gap-[10px] rounded-[8px] bg-gradient-to-b from-[#f7d488] to-[#e0a63c] text-[14px] font-bold text-[#2b0a3d]"
          >
            Explore All Software
            <ArrowRightIcon className="h-[14px] w-[14px]" />
          </Link>
          <p className="mt-[13px] text-[12px] leading-[1.4] font-normal text-white">
            Empower your spiritual practice today!
          </p>
        </div>
      </div>
    </div>
  );
}
