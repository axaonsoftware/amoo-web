import { MessageCircle } from "lucide-react";

export default function WhatsAppFloatButton() {
  return (
    <button
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg z-50"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} className="text-white" fill="white" />
    </button>
  );
}
