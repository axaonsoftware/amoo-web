import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, SparkOrnament } from "./icons";

const CERTIFICATES = [
  { title: "Reiki Grand Master", src: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/certificate_1.png" },
  { title: "Numerology Expert", src: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/certificate_2.png" },
  { title: "Tarot Reading Expert", src: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/certificate_3.png" },
  { title: "Holistic Healing", src: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/certificate_4.png" },
  { title: "Spiritual Coach", src: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/certificate_5.png" },
];

export default function Certifications() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0f051e] pt-[26px] pb-[30px]">
      <div className="stars pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto w-full max-w-[1340px] px-5">
        <div className="flex items-center justify-center gap-3">
          <SparkOrnament flip className="h-[11px] w-[40px] text-gold" />
          <h2 className="font-display text-[28px] leading-none font-bold text-white">
            Certifications &amp; Achievements
          </h2>
          <SparkOrnament className="h-[11px] w-[40px] text-gold" />
        </div>

        <div className="relative mt-[24px] flex items-center justify-center gap-[14px]">
          <button
            type="button"
            aria-label="Previous certificate"
            className="flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full border border-gold/60 text-gold transition-colors hover:bg-gold/10"
          >
            <ChevronLeftIcon className="h-[16px] w-[16px]" />
          </button>

          <ul className="flex flex-1 items-center justify-center gap-[20px] overflow-x-auto">
            {CERTIFICATES.map((cert) => (
              <li key={cert.title} className="shrink-0">
                <Image
                  src={cert.src}
                  alt={`${cert.title} certificate`}
                  width={225}
                  height={167}
                  className="h-[167px] w-[225px] rounded-[4px] border-[5px] border-[#a5762c] object-cover shadow-[0_6px_20px_rgba(0,0,0,0.45)]"
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            aria-label="Next certificate"
            className="flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full border border-gold/60 text-gold transition-colors hover:bg-gold/10"
          >
            <ChevronRightIcon className="h-[16px] w-[16px]" />
          </button>
        </div>

        <div className="mt-[22px] flex justify-center">
          <a
            href="/about"
            className="flex h-[36px] items-center rounded-[6px] bg-gradient-to-b from-[#ffdf8a] to-[#e0a63c] px-[26px] text-[13px] font-semibold text-[#2b0a3d]"
          >
            View All Certificates
          </a>
        </div>
      </div>
    </section>
  );
}
