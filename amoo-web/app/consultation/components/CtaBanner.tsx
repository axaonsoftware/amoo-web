import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "../../../lib/constants";

export default function CtaBanner() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-[24px] sm:px-[22px] sm:pb-[34px]">
        <div className="relative min-h-[330px] overflow-hidden rounded-[16px] border border-gold/20 bg-[linear-gradient(90deg,#3d1157_0%,#2a0940_50%,#3d1157_100%)] sm:min-h-[300px] md:h-[150px] md:min-h-0">
          <div className="stars pointer-events-none absolute inset-0 opacity-40" />

          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/tarot_no_bg.png"
            alt=""
            aria-hidden
            width={340}
            height={150}
            className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[300px] translate-y-[8px] object-contain object-bottom md:block"
          />

          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/lotus_candles_no_bg.png"
            alt=""
            aria-hidden
            width={300}
            height={150}
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[260px] object-contain object-right md:block"
          />

          <div className="relative flex min-h-[330px] flex-col items-center justify-center gap-[24px] px-5 py-7 text-center sm:min-h-[300px] sm:gap-[28px] md:h-full md:min-h-0 md:flex-row md:gap-[46px] md:px-5 md:py-0 md:text-left">
            <div className="w-full md:w-auto md:pl-[190px]">
              <h2 className="font-display text-[23px] leading-[1.25] font-bold text-gold sm:text-[27px]">
                Ready to Get Your Answers?
              </h2>

              <p className="mx-auto mt-[8px] max-w-[330px] text-[13px] leading-[1.6] text-white/75 md:mx-0">
                Book your personalized consultation today and step into a life
                of clarity, peace and abundance.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col items-center gap-[12px] sm:flex-row sm:justify-center md:w-auto md:gap-[14px] md:pr-[210px]">
              <Link
                href="/consultation/select-service"
                className="flex h-[46px] w-full max-w-[240px] items-center justify-center rounded-[8px] bg-gradient-to-b from-gold-2 to-gold-3 px-[18px] text-[13px] font-semibold text-[#2b0a3d] sm:w-auto sm:max-w-none sm:px-[24px] sm:text-[14px]"
              >
                Book Consultation Now
              </Link>

              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[46px] w-full max-w-[240px] items-center justify-center gap-2.5 rounded-[8px] border border-white/45 bg-black/20 px-[18px] text-[13px] font-medium text-white sm:w-auto sm:max-w-none sm:px-[22px] sm:text-[14px]"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
