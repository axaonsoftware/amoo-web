import {
  ArrowFlourish,
  ClockOutlineIcon,
  LeafIcon,
  LockIcon,
  LotusFlourish,
  PersonIcon,
  ShieldCheckIcon,
} from "./icons";
import { SITE_NAME } from "../../../lib/constants";

const REASONS = [
  {
    Icon: ShieldCheckIcon,
    title: "Authentic Guidance",
    desc: "100% genuine spiritual practices and solutions.",
  },
  {
    Icon: PersonIcon,
    title: "Personalized Approach",
    desc: "Every consultation is customized as per your unique needs.",
  },
  {
    Icon: LockIcon,
    title: "Confidential & Safe",
    desc: "Your privacy and trust are our top priority.",
  },
  {
    Icon: LeafIcon,
    title: "Holistic Healing",
    desc: "Mind, body, soul and energy – complete transformation.",
  },
  {
    Icon: ClockOutlineIcon,
    title: "Easy & Convenient",
    desc: "Book from anywhere and choose your session mode.",
  },
];

export default function WhyChoose() {
  return (
    <div className="mx-auto w-full max-w-[1336px] px-5 pt-[50px] pb-[36px]">
      <div className="flex items-center justify-center gap-4">
        <ArrowFlourish flip />
        <h2 className="font-display text-center text-[24px] leading-tight font-bold text-[#2c0c47] sm:text-[28px]">
          Why Choose {SITE_NAME}?
        </h2>
        <ArrowFlourish />
      </div>

      <LotusFlourish className="mx-auto mt-[10px] h-[14px] w-[96px] text-gold" />

      <div className="mt-[22px] grid grid-cols-1 rounded-[12px] border border-[#efe3d2] bg-white shadow-[0_2px_14px_rgba(75,37,131,0.06)] sm:grid-cols-2 lg:grid-cols-5">
        {REASONS.map(({ Icon, title, desc }, index) => (
          <div
            key={title}
            className={`flex items-center gap-[11px] px-[14px] py-[16px] ${
              index === 0 ? "" : "lg:border-l lg:border-[#efe3d2]"
            }`}
          >
            <Icon className="h-[30px] w-[30px] shrink-0 text-gold-3" />
            <div>
              <h3 className="text-[12.5px] leading-none font-semibold text-[#2c0c47]">
                {title}
              </h3>
              <p className="mt-[6px] text-[10px] leading-[1.55] text-[#6c6b78]">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
