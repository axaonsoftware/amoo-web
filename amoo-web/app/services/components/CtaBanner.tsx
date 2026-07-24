import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, WhatsAppIcon } from "../../components/home-icons";
import { MandalaRing } from "./icons";
import { WHATSAPP_URL } from "../../../lib/constants";

export default function CtaBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[linear-gradient(90deg,#33124f_0%,#43195f_35%,#4b1c6d_55%,#331350_100%)]">
      <div className="stars pointer-events-none absolute inset-0 opacity-70" />
      <MandalaRing className="pointer-events-none absolute -top-[70px] right-[300px] hidden h-[380px] w-[380px] text-gold/20 lg:block" />

      {/* Tarot cards, candles and crystals */}
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/tarot_no_bg.png"
        alt=""
        width={324}
        height={108}
        aria-hidden
        className="pointer-events-none absolute right-[300px] bottom-[26px] hidden h-[130px] w-[210px] object-contain object-bottom lg:block"
      />
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/lotus_candles_no_bg.png"
        alt=""
        width={356}
        height={173}
        aria-hidden
        className="pointer-events-none absolute right-[10px] bottom-0 hidden h-[200px] w-[300px] object-contain object-bottom lg:block"
      />

      <div className="relative mx-auto w-full max-w-[1336px] px-5 py-[32px]">
        <div className="w-full max-w-[560px] lg:pl-[42px]">
          <h2 className="font-display text-[26px] leading-[1.25] font-bold text-[#f0c874] sm:text-[30px]">
            Ready to Transform Your Life?
          </h2>

          <p className="mt-[12px] text-[13px] leading-[22px] text-white">
            Book your personalized consultation with
            <br />
            Reiki Grand Master Surinder Kaur Sehgal today.
          </p>

          <div className="mt-[20px] flex flex-wrap items-center gap-[16px]">
            <Link
              href="/consultation/select-service"
              className="flex h-[46px] items-center gap-[10px] rounded-[6px] bg-gradient-to-b from-[#ffdf8a] to-[#e0a63c] px-[24px] text-[13.5px] font-semibold text-[#2b0a3d]"
            >
              Book Consultation Now
              <ArrowRightIcon className="h-[16px] w-[16px]" />
            </Link>
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[46px] items-center gap-[10px] rounded-[6px] border border-white/60 pr-[22px] pl-[12px] text-[13.5px] font-medium text-white"
            >
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[#25D366]">
                <WhatsAppIcon className="h-[17px] w-[17px]" />
              </span>
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
