export type SessionType =
  "distance" | "chakra" | "aura" | "fullBody" | "stress" | "energy";

export type SessionStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export type PaymentStatus = "Paid" | "Refunded" | "Pending";

export const sessionTypeStyles: Record<
  SessionType,
  { label: string; className: string }
> = {
  distance: {
    label: "Distance Healing",
    className: "border-[#DDD1F7] bg-[#F3EEFE] text-[#6D28D9]",
  },
  chakra: {
    label: "Chakra Balancing",
    className: "border-[#C8ECD4] bg-[#E9F8EE] text-[#15803D]",
  },
  aura: {
    label: "Aura Cleansing",
    className: "border-[#CBDFF9] bg-[#E8F1FD] text-[#1D4ED8]",
  },
  fullBody: {
    label: "Full Body Healing",
    className: "border-[#F8DCC0] bg-[#FEF3E7] text-[#C2620C]",
  },
  stress: {
    label: "Stress Relief",
    className: "border-[#F7CFDD] bg-[#FDECF2] text-[#BE185D]",
  },
  energy: {
    label: "Energy Boost",
    className: "border-[#C4E9E1] bg-[#E6F6F2] text-[#0F766E]",
  },
};

export const statusStyles: Record<SessionStatus, string> = {
  Upcoming: "bg-[#FEF1E3] text-[#EA580C]",
  Ongoing: "bg-[#E7F0FE] text-[#2563EB]",
  Completed: "bg-[#E3F7EA] text-[#16A34A]",
  Cancelled: "bg-[#FDE8E8] text-[#EF4444]",
};

export const paymentStyles: Record<PaymentStatus, string> = {
  Paid: "text-[#16A34A]",
  Refunded: "text-[#EA580C]",
  Pending: "text-[#F59E0B]",
};
