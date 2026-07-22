type ServiceRow = {
  name: string;
  sub: string;
  img: string;
  category:
    | "Numerology"
    | "Tarot"
    | "Astrology"
    | "Healing"
    | "Vastu"
    | "AI Services"
    | "Spiritual";
  type: "Report" | "Consultation" | "Chat";
  price: string;
  duration: string;
  status: "Active" | "Inactive";
  bookings: string;
};

export const categoryTone: Record<ServiceRow["category"], string> = {
  Numerology: "bg-[#F1EAFE] text-[#7C3AED]",
  Tarot: "bg-[#FDE9F0] text-[#DB2777]",
  Astrology: "bg-[#E7F0FE] text-[#2563EB]",
  Healing: "bg-[#E6F7EE] text-[#16A34A]",
  Vastu: "bg-[#FEF0DC] text-[#D97706]",
  "AI Services": "bg-[#E0F2FE] text-[#0284C7]",
  Spiritual: "bg-[#EDE9FE] text-[#6D28D9]",
};

export const typeTone: Record<ServiceRow["type"], string> = {
  Report: "bg-[#E7F0FE] text-[#2563EB]",
  Consultation: "bg-[#EAE9FB] text-[#4F46E5]",
  Chat: "bg-[#E0F7F4] text-[#0D9488]",
};
