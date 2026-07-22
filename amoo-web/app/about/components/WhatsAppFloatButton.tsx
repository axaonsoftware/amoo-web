import { WhatsAppIcon } from "../../components/home-icons";
import { WHATSAPP_URL } from "../../../lib/constants";

export default function WhatsAppFloatButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-[22px] bottom-[22px] z-50 flex h-[58px] w-[58px] items-center justify-center rounded-[16px] bg-[#25D366] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
    >
      <WhatsAppIcon className="h-[34px] w-[34px]" />
    </a>
  );
}
