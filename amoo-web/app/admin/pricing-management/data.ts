type Service =
  | "Numerology"
  | "Tarot"
  | "Astrology"
  | "Healing"
  | "Vastu"
  | "AI Services"
  | "All Services"
  | "Spiritual";

type PlanType = "One-time" | "Subscription";

export const serviceTone: Record<Service, string> = {
  Numerology: "bg-[#F1EAFE] text-[#7C3AED]",
  Tarot: "bg-[#FDE7EC] text-[#E11D48]",
  Astrology: "bg-[#E7F0FE] text-[#2563EB]",
  Healing: "bg-[#E6F7EE] text-[#16A34A]",
  Vastu: "bg-[#FEF0DC] text-[#D97706]",
  "AI Services": "bg-[#E8EAFE] text-[#4F46E5]",
  "All Services": "bg-[#E4F1FD] text-[#0E7FBF]",
  Spiritual: "bg-[#F3E9FD] text-[#9333EA]",
};

export const planTypeTone: Record<PlanType, string> = {
  "One-time": "bg-[#EAF1FE] text-[#3B82F6]",
  Subscription: "bg-[#F1EAFE] text-[#7C3AED]",
};
