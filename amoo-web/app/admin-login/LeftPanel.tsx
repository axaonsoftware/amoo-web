"use client";

import Image from "next/image";

export default function LeftPanel() {
  return (
    <section className="relative hidden h-full w-1/2 overflow-hidden md:block">
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/adminloginRightBg.jpg"
        fill
        sizes="50vw"
        alt=""
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/5" />
    </section>
  );
}
