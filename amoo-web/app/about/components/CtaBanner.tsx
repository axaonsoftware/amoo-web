import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "../../components/home-icons";
import { WHATSAPP_URL } from "../../../lib/constants";

export default function CtaBanner() {
  return (
    <section className="relative min-h-[132px] w-full overflow-hidden bg-gradient-to-r from-[#3d1157] via-[#2a0940] to-[#3d1157]">
      <Image
        src="/imagesP/lotus_candles_no_bg.png"
        alt=""
        width={320}
        height={132}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[320px] object-cover md:block"
      />
      <Image
        src="/imagesP/tarot_no_bg.png"
        alt=""
        width={224}
        height={132}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[224px] object-cover md:block"
      />

      <div className="relative mx-auto flex h-full w-full max-w-[1336px] items-center justify-center gap-[40px] px-5">
        <div className="pl-0 md:pl-[240px]">
          <h2 className="font-display text-[26px] leading-none font-bold text-white">
            Begin Your Transformation Journey Today
          </h2>
          <p className="mt-[12px] text-[13px] leading-none text-white/90">
            Let&apos;s discover the divine guidance meant just for you.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-[14px] md:pr-[130px]">
          <Link
            href="/consultation/select-service"
            className="flex h-[44px] items-center rounded-[6px] border border-[#f0c565] bg-gradient-to-b from-[#ffdf8a] to-[#e0a63c] px-[22px] text-[13.5px] font-semibold text-[#2b0a3d]"
          >
            Book Your Consultation
          </Link>
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[44px] items-center gap-2 rounded-[6px] border border-gold/70 bg-black/25 pr-[18px] pl-[10px] text-[13.5px] font-medium text-white"
          >
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[#25D366]">
              <WhatsAppIcon className="h-[17px] w-[17px]" />
            </span>
            WhatsApp Us
          </Link>
        </div>
      </div>
    </section>
  );
}
