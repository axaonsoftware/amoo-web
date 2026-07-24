import Image from "next/image";
import { greatVibes } from "./fonts";
import { MissionLotusIcon, VisionEyeIcon } from "./icons";

export default function MissionVision() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f4e3d4]">
      {/* Warm paper wash + centre glow behind the portrait */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_50%,#fdf5ec_0%,#f6e6d8_45%,#eed3bd_100%)]" />

      <div className="relative mx-auto grid w-full max-w-[1336px] grid-cols-1 items-center gap-6 px-5 py-[34px] lg:min-h-[312px] lg:grid-cols-[1fr_334px_1fr] lg:gap-0 lg:py-0">
        {/* Mission */}
        <div className="flex flex-col items-center text-center lg:pb-[26px] lg:pl-[80px]">
          <MissionLotusIcon className="h-[30px] w-[30px] text-[#5b1a86]" />
          <h2 className="mt-[12px] font-display text-[20px] leading-none font-bold text-[#4a1173]">
            My Mission
          </h2>
          <p className="mt-[14px] text-[12.5px] leading-[21px] text-[#4b4453]">
            To spread love, light and healing
            <br />
            through spiritual sciences and
            <br />
            empower individuals to discover
            <br />
            their true potential.
          </p>
        </div>

        {/* Portrait */}
        <div className="relative mx-auto h-[312px] w-[334px] max-w-full shrink-0">
          <Image
            src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/amooLadyP.png"
            alt="Surinder Kaur Sehgal"
            fill
            priority
            sizes="434px"
            className="object-cover object-bottom"
          />
        </div>

        {/* Vision */}
        <div className="flex flex-col items-center text-center lg:pr-[120px] lg:pb-[26px]">
          <VisionEyeIcon className="h-[30px] w-[30px] text-[#5b1a86]" />
          <h2 className="mt-[12px] font-display text-[20px] leading-none font-bold text-[#4a1173]">
            My Vision
          </h2>
          <p className="mt-[14px] text-[12.5px] leading-[21px] text-[#4b4453]">
            To create a world where every
            <br />
            individual lives with clarity, peace,
            <br />
            good health, abundance, and
            <br />
            spiritual growth.
          </p>
          <p
            className={`${greatVibes.className} mt-[18px] text-[26px] leading-none text-[#c08a3e]`}
          >
            Surinder Kaur Sehgal
          </p>
        </div>
      </div>
    </section>
  );
}
