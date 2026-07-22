import Image from "next/image";
import { HomeHeader } from "../../components/home-header";
import { greatVibes } from "./fonts";
import { AboutBadgeIcon, HeroDividerDiamond } from "./icons";

export default function Hero() {
  return (
    <section className="relative min-h-[500px] w-full overflow-hidden sm:min-h-[556px]">
      <HomeHeader />
      <Image
        src="/imagesP/aboutHeroPN.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover  sm:object-[65%_center]"
      />

      {/* Left-side darkening so the copy stays legible over the artwork */}

      <div className="relative mx-auto h-full w-full max-w-[1336px] ">
        <div className="flex flex-col items-center pt-[110px] text-center sm:absolute sm:top-[139px] sm:left-[64px] sm:w-[520px] sm:items-start sm:text-left">
          <div className="flex items-center gap-2 text-gold">
            <AboutBadgeIcon className="h-[13px] w-[13px]" />
            <span className="text-[12px] font-medium tracking-[0.2em]">
              ABOUT
            </span>
          </div>

          <h1 className="mt-[10px] bg-gradient-to-b from-[#f7d489] to-[#dd9a3c] bg-clip-text font-display text-[28px] leading-[1.1] font-bold text-transparent sm:text-[42px] sm:whitespace-nowrap">
            Surinder Kaur Sehgal
          </h1>

          <p className="mt-[10px] text-[16px] leading-[26px] font-normal text-white sm:text-[18px] sm:leading-[29px]">
            Reiki Grand Master | Numerology Expert
            <br className="hidden sm:block" />
            Tarot Guide | Spiritual Healer
          </p>

          <HeroDividerDiamond className="mt-[16px] h-[10px] w-[280px] text-gold sm:w-[380px]" />

          <p className="mt-[16px] max-w-[480px] text-[13px] leading-[26px] text-white/85 px-4 sm:px-0">
            With over two decades of experience in spiritual sciences, Surinder
            Kaur Sehgal has guided thousands of souls towards healing, clarity,
            and a life of purpose. Her mission is simple – to help you connect
            with your inner power and lead a balanced, joyful life.
          </p>

          <p
            className={`${greatVibes.className} mt-[24px] text-[26px] leading-none text-gold sm:text-[30px]`}
          >
            Surinder Kaur Sehgal
          </p>
          <p className="mt-[12px] pb-8 text-[11px] text-white/85 sm:pl-[58px] sm:pb-0">
            Reiki Grand Master
          </p>
        </div>
      </div>
    </section>
  );
}
