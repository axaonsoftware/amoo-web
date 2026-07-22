"use client";

import Image from "next/image";
import { ShieldCheck, Shield, Users, CloudCog } from "lucide-react";

export default function LeftPanel() {
  return (
    <section className="relative hidden w-full overflow-hidden md:block md:w-1/2">
      {/* Background Image */}
      <Image
        src="/imagesP/adminloginRightBg.jpg"
        fill
        sizes="50vw"
        alt=""
        className="object-cover object-center"
      />
    </section>
  );
}
