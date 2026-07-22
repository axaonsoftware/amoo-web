import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "../../../lib/constants";

export default function WhatsAppFloatButton() {
  return (
    <Link
      href={WHATSAPP_URL}
      aria-label="Chat on WhatsApp"
      className="fixed right-6 bottom-6 z-50 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
    >
      <MessageCircle size={28} />
    </Link>
  );
}
