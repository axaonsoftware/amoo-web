import Image from "next/image";
import { HomeHeader, OfferBar } from "../components/home-header";
import SignUpForm from "./SignUpForm";
import { SiteFooter } from "../components/site-footer";
import TrustBar from "../user-login/TrustBar";

export default function SignUpPage() {
  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />
      <main
        id="main-content"
        className="min-h-screen bg-[#0d0616] flex flex-col items-center justify-start md:justify-center px-4 py-6 md:py-8"
      >
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row justify-center rounded-2xl overflow-hidden shadow-2xl min-h-[auto] md:min-h-[720px]">
          <div className="relative hidden w-full overflow-hidden md:block md:w-1/2">
            <Image
              src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/userRightSideLogin.png"
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <SignUpForm />
        </div>

        <div className="w-full max-w-6xl">
          <TrustBar />
        </div>

        <div className="w-full -mx-4 mt-6">
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
