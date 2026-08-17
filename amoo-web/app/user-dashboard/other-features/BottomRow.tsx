import { Brands, FooterLotus, WhyIcons } from "./icons";
import { WHATSAPP_URL, SITE_NAME } from "../../../lib/constants";

const why = [
  {
    Icon: WhyIcons.Experts,
    text: "Trusted experts & accurate guidance",
    strong: false,
  },
  {
    Icon: WhyIcons.AllInOne,
    text: "All-in-one spiritual & astrology solution",
    strong: true,
  },
  {
    Icon: WhyIcons.Secure,
    text: "User-friendly & secure platform",
    strong: true,
  },
  {
    Icon: WhyIcons.Divine,
    text: "Empowering your life with divine wisdom",
    strong: false,
  },
];

const socials = [
  {
    name: "Instagram",
    Icon: Brands.Instagram,
    href: "https://instagram.com/amoooguru",
  },
  {
    name: "YouTube",
    Icon: Brands.YouTube,
    href: "https://youtube.com/@amoooguru",
  },
  {
    name: "Facebook",
    Icon: Brands.Facebook,
    href: "https://facebook.com/amoooguru",
  },
  { name: "WhatsApp", Icon: Brands.WhatsApp, href: WHATSAPP_URL },
  { name: "Telegram", Icon: Brands.Telegram, href: "https://t.me/amoooguru" },
];

const cardClass =
  "rounded-[18px] border border-[#F0EEF7] bg-[linear-gradient(150deg,#FBFAFD_0%,#FFFFFF_55%)] shadow-[0_1px_2px_rgba(45,25,110,0.02)]";

export default function BottomRow() {
  return (
    <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-[369fr_191fr_229fr]">
      {/* Why Users Love AmooGuru? */}
      <section
        className={`${cardClass} relative min-h-[202px] overflow-hidden px-[22px] pb-[20px] pt-[19px]`}
      >
        <h2 className="relative text-[18px] font-bold leading-none text-[#241268]">
          Why Users Love {SITE_NAME}?
        </h2>

        <ul className="relative mt-[18px] flex flex-col gap-[15px]">
          {why.map(({ Icon, text, strong }) => (
            <li key={text} className="flex items-center gap-[17px]">
              <Icon />
              <span
                className={
                  strong
                    ? "text-[13px] font-semibold leading-none text-[#39336F]"
                    : "text-[13px] font-normal leading-none text-[#5D5980]"
                }
              >
                {text}
              </span>
            </li>
          ))}
        </ul>

        <FooterLotus />
      </section>

      {/* Available On */}
      <section
        className={`${cardClass} min-h-[202px] px-[35px] pb-[20px] pt-[28px]`}
      >
        <h2 className="text-[15px] font-bold leading-none text-[#241268]">
          Available On
        </h2>

        <div className="mt-[18px] flex flex-col gap-[13px]">
          <Brands.GooglePlay />
          <Brands.AppStore />
        </div>
      </section>

      {/* Stay Connected */}
      <section
        className={`${cardClass} min-h-[202px] px-[28px] pb-[20px] pt-[26px]`}
      >
        <h2 className="text-[16px] font-bold leading-none text-[#241268]">
          Stay Connected
        </h2>

        <div className="mt-[22px] flex items-center gap-[21px]">
          {socials.map(({ name, Icon, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="block h-[36px] w-[36px] shrink-0"
            >
              <Icon />
            </a>
          ))}
        </div>

        <p className="mt-[24px] text-[14px] font-normal leading-none text-[#5D5980]">
          Join our community and grow spiritually.
        </p>
      </section>
    </div>
  );
}
