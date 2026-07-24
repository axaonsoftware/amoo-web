
import Image from "next/image";
export default function UserLeftPanel() {
  return (
    <section className="relative hidden w-[48%] overflow-hidden lg:flex">
      {/* Background Image */}
      <Image
        src="/imagesP/userRightSideLogin.png"
        fill
        sizes="50vw"
        alt=""
        className="object-cover"
      />
    </section>
  );
}
