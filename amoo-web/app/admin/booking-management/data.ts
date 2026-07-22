export type ServiceKey =
  | "kundli-reading"
  | "tarot-reading"
  | "numerology"
  | "vastu-consultation"
  | "kundli-matching"
  | "career-guidance"
  | "name-correction";

type StatusKey =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "pending-payment";

export const serviceStyles: Record<
  ServiceKey,
  { label: string; bg: string; text: string }
> = {
  "kundli-reading": {
    label: "Kundli Reading",
    bg: "bg-[#F0EAFB]",
    text: "text-[#6D28D9]",
  },
  "tarot-reading": {
    label: "Tarot Reading",
    bg: "bg-[#FDE8EC]",
    text: "text-[#E11D48]",
  },
  numerology: {
    label: "Numerology",
    bg: "bg-[#E3EDFD]",
    text: "text-[#2563EB]",
  },
  "vastu-consultation": {
    label: "Vastu Consultation",
    bg: "bg-[#E3F7EC]",
    text: "text-[#16A34A]",
  },
  "kundli-matching": {
    label: "Kundli Matching",
    bg: "bg-[#F0EAFB]",
    text: "text-[#6D28D9]",
  },
  "career-guidance": {
    label: "Career Guidance",
    bg: "bg-[#FEF1E1]",
    text: "text-[#EA580C]",
  },
  "name-correction": {
    label: "Name Correction",
    bg: "bg-[#E3EDFD]",
    text: "text-[#2563EB]",
  },
};

export const statusStyles: Record<
  StatusKey,
  { label: string; bg: string; text: string }
> = {
  upcoming: {
    label: "Upcoming",
    bg: "bg-[#FEF2E2]",
    text: "text-[#C2711A]",
  },
  completed: {
    label: "Completed",
    bg: "bg-[#E3F7EC]",
    text: "text-[#15803D]",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#FDEAEA]",
    text: "text-[#DC2626]",
  },
  "pending-payment": {
    label: "Pending Payment",
    bg: "bg-[#FEE9D2]",
    text: "text-[#C2410C]",
  },
};
