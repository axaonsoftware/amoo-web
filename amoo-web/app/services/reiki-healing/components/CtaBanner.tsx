import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "../../../components/home-icons";
import { WHATSAPP_URL } from "../../../../lib/constants";

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(90deg,#2a0b45_0%,#5a1a8c_28%,#6d2aa3_50%,#4a1273_72%,#2a0b45_100%)]">
      <div className="stars pointer-events-none absolute inset-0 opacity-70" />

      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/trust-candles.png"
        alt=""
        width={417}
        height={222}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[190px] scale-x-[-1] object-cover object-left opacity-70 lg:block"
      />
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/trust-candles.png"
        alt=""
        width={417}
        height={222}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[190px] object-cover object-right opacity-70 lg:block"
      />

      <div className="relative mx-auto flex w-full max-w-[1336px] flex-col items-center gap-6 px-5 py-[26px] lg:flex-row lg:justify-center lg:gap-[54px] lg:px-[170px]">
        <div className="text-center lg:text-left">
          <h2 className="font-display text-[22px] leading-[1.3] font-bold text-white sm:text-[25px] lg:whitespace-nowrap">
            Ready to Heal, Balance and Transform Your Life?
          </h2>
          <p className="mt-[8px] text-[12.5px] text-white/85">
            Connect with Reiki Grand Master Surinder Kaur Sehgal today.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/consultation/consultation-mode?service=Reiki%20Healing%20Session"
            className="flex h-[42px] items-center rounded-[6px] bg-gradient-to-b from-gold-2 to-gold-3 px-[22px] text-[13px] font-semibold text-[#2b0a3d]"
          >
            Book Reiki Session
          </Link>
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[42px] items-center gap-2 rounded-[6px] border border-white/60 px-[20px] text-[13px] font-medium text-white"
          >
            <WhatsAppIcon className="h-[17px] w-[17px]" />
            Chat on WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}
