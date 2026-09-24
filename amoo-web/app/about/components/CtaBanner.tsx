import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "../../components/home-icons";
import { WHATSAPP_URL } from "../../../lib/constants";

export default function CtaBanner() {
  return (
    <section className="relative min-h-[132px] w-full bg-gradient-to-r from-[#3d1157] via-[#2a0940] to-[#3d1157]">
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/lotus_candles_no_bg.png"
        alt=""
        width={320}
        height={132}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[320px] object-cover md:block"
      />

      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/tarot_no_bg.png"
        alt=""
        width={224}
        height={132}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[224px] object-cover md:block"
      />

      <div className="relative mx-auto flex min-h-[132px] w-full max-w-[1336px] flex-col items-center justify-center gap-5 px-5 py-7 text-center md:h-[132px] md:flex-row md:gap-[40px] md:px-5 md:py-0 md:text-left">
        <div className="pl-0 md:pl-[240px]">
          <h2 className="font-display text-[21px] leading-[1.25] font-bold text-white sm:text-[24px] md:text-[26px] md:leading-none">
            Begin Your Transformation Journey Today
          </h2>

          <p className="mt-[10px] text-[12px] leading-[18px] text-white/90 sm:text-[13px] md:mt-[12px] md:leading-none">
            Let&apos;s discover the divine guidance meant just for you.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-[14px] md:pr-[130px]">
          <Link
            href="/consultation/select-service"
            className="flex h-[44px] w-full items-center justify-center rounded-[6px] border border-[#f0c565] bg-gradient-to-b from-[#ffdf8a] to-[#e0a63c] px-[18px] text-[13px] font-semibold text-[#2b0a3d] sm:w-auto sm:px-[22px] sm:text-[13.5px]"
          >
            Book Your Consultation
          </Link>

          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[6px] border border-gold/70 bg-black/25 pr-[18px] pl-[10px] text-[13px] font-medium text-white sm:w-auto"
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
