// Seeded so the starfield is identical on the server and the client, and stable
// across re-renders.
import Image from "next/image";
export default function UserLeftPanel() {
  return (
    <section className="relative hidden w-full overflow-hidden md:block md:w-1/2">
      {/* Background Image */}
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/userRightSideLogin.png"
        fill
        sizes="50vw"
        alt=""
        className="object-cover object-center"
      />
    </section>
  );
}
