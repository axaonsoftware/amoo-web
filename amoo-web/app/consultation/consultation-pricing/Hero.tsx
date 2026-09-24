import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[400px] overflow-hidden">
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/consultation_pricing.png"
        alt="Consultation Pricing"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[90%_center] sm:object-center"
      />
    </section>
  );
}
