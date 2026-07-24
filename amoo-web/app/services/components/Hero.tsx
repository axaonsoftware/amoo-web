import Image from "next/image";
import { HomeHeader } from "../../components/home-header";
import { BreadcrumbSlash, HeroLotusDivider } from "./icons";

export default function Hero() {
  return (
    <section className="relative min-h-[420px] w-full overflow-hidden sm:min-h-[490px]">
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/serviceHeroBg.png"
        alt="Reiki Grand Master Surinder Kaur Sehgal"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Keeps the copy legible over the artwork */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(23,4,38,0.7)_0%,rgba(23,4,38,0.4)_32%,rgba(23,4,38,0)_58%)]" />

      <HomeHeader />

      <div className="relative mx-auto h-full w-full max-w-[1336px] px-5">
        <div className="w-full max-w-[560px] pt-[128px] lg:pt-[145px] lg:pl-[145px]">
          <p className="flex items-center gap-[10px] text-[12px] font-medium tracking-[0.2em] text-gold uppercase lg:pl-[80px]">
            <BreadcrumbSlash className="h-[15px] w-[8px] shrink-0" />
            Services
          </p>

          <h1 className="font-display mt-[8px] bg-gradient-to-b from-[#f7d489] to-[#dd9a3c] bg-clip-text text-[28px] leading-[1.12] font-bold text-transparent sm:text-[54px]">
            Our Services
          </h1>

          <p className="mt-[8px] text-[18.5px] leading-[1.4] font-normal text-white">
            Divine Guidance for Every Aspect of Your Life
          </p>

          <p className="mt-[14px] text-[14px] leading-[28px] text-white/85">
            Explore our wide range of spiritual services crafted by
            <br />
            Reiki Grand Master Surinder Kaur Sehgal to help you
            <br />
            find clarity, heal your energy and create a better future.
          </p>

          <HeroLotusDivider className="mt-[16px] h-[20px] w-[330px] text-gold" />
        </div>
      </div>
    </section>
  );
}
