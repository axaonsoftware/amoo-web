type StatusTone = "upcoming" | "completed" | "cancelled";

export type TypeKey =
  | "kundli-reading"
  | "tarot-reading"
  | "numerology"
  | "vastu"
  | "kundli-matching"
  | "career-guidance"
  | "name-correction";

export const typeStyles: Record<
  TypeKey,
  { label: string; bg: string; text: string }
> = {
  "kundli-reading": {
    label: "Kundli Reading",
    bg: "bg-[#EFE9FB]",
    text: "text-[#6D28D9]",
  },
  "tarot-reading": {
    label: "Tarot Reading",
    bg: "bg-[#FDE7F0]",
    text: "text-[#DB2777]",
  },
  numerology: {
    label: "Numerology",
    bg: "bg-[#E3EDFD]",
    text: "text-[#2563EB]",
  },
  vastu: {
    label: "Vastu Consultation",
    bg: "bg-[#E2F7EA]",
    text: "text-[#16A34A]",
  },
  "kundli-matching": {
    label: "Kundli Matching",
    bg: "bg-[#EFE9FB]",
    text: "text-[#6D28D9]",
  },
  "career-guidance": {
    label: "Career Guidance",
    bg: "bg-[#FEF0DF]",
    text: "text-[#D97706]",
  },
  "name-correction": {
    label: "Name Correction",
    bg: "bg-[#E3EDFD]",
    text: "text-[#2563EB]",
  },
};

export const statusStyles: Record<
  StatusTone,
  { label: string; bg: string; text: string }
> = {
  upcoming: { label: "Upcoming", bg: "bg-[#FEF2E2]", text: "text-[#C2711A]" },
  completed: { label: "Completed", bg: "bg-[#E2F7EA]", text: "text-[#17A34A]" },
  cancelled: { label: "Cancelled", bg: "bg-[#FDEAEA]", text: "text-[#E1444A]" },
};
