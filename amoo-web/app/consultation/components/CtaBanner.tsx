import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "../../../lib/constants";

export default function CtaBanner() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-[22px] pb-[34px]">
        <div className="relative h-[150px] rounded-[16px] border border-gold/20 bg-[linear-gradient(90deg,#3d1157_0%,#2a0940_50%,#3d1157_100%)]">
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

          <div className="relative flex h-full items-center justify-center gap-[46px] px-5">
            <div className="md:pl-[190px]">
              <h2 className="font-display text-[27px] leading-tight font-bold text-gold">
                Ready to Get Your Answers?
              </h2>
              <p className="mt-[8px] max-w-[330px] text-[13px] leading-[1.6] text-white/75">
                Book your personalized consultation today and step into a life
                of clarity, peace and abundance.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-[14px] md:pr-[210px]">
              <Link
                href="/consultation/select-service"
                className="flex h-[46px] items-center rounded-[8px] bg-gradient-to-b from-gold-2 to-gold-3 px-[24px] text-[14px] font-semibold text-[#2b0a3d]"
              >
                Book Consultation Now
              </Link>

              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[46px] items-center gap-2.5 rounded-[8px] border border-white/45 bg-black/20 px-[22px] text-[14px] font-medium text-white"
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
