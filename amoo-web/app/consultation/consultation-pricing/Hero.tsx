import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[400px] overflow-hidden">
      <Image
        src="/imagesP/consultation_pricing.png"
        alt="Consultation Pricing"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    </section>
  );
}
