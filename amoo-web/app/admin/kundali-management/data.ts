export type KundaliTypeKey =
  "janam" | "match-making" | "dasha" | "varshphal" | "child-birth" | "prashna";

export type StatusKey = "completed" | "in-progress" | "pending" | "cancelled";

export type DoshaKey = "manglik" | "nadi" | "kaal-sarp" | "bhokoot" | null;

export const kundaliTypeStyles: Record<
  KundaliTypeKey,
  { label: string; bg: string; text: string }
> = {
  janam: {
    label: "Janam Kundali",
    bg: "bg-[#F3EBFE]",
    text: "text-[#6D28D9]",
  },
  "match-making": {
    label: "Match Making",
    bg: "bg-[#FDE9F0]",
    text: "text-[#E0316B]",
  },
  dasha: {
    label: "Dasha Analysis",
    bg: "bg-[#E8F1FE]",
    text: "text-[#2563EB]",
  },
  varshphal: {
    label: "Varshphal",
    bg: "bg-[#FDF2E2]",
    text: "text-[#E07F22]",
  },
  "child-birth": {
    label: "Child Birth",
    bg: "bg-[#E8F7ED]",
    text: "text-[#2E8F4A]",
  },
  prashna: {
    label: "Prashna Kundali",
    bg: "bg-[#F0E9FE]",
    text: "text-[#5B21D6]",
  },
};

export const statusStyles: Record<
  StatusKey,
  { label: string; bg: string; text: string }
> = {
  completed: {
    label: "Completed",
    bg: "bg-[#E9F8EE]",
    text: "text-[#1E9E4A]",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-[#E8EFFE]",
    text: "text-[#2563EB]",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#FDF1E3]",
    text: "text-[#E8891A]",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#FDEAEC]",
    text: "text-[#EF3B4D]",
  },
};

export const doshaStyles: Record<
  Exclude<DoshaKey, null>,
  { label: string; bg: string; text: string }
> = {
  manglik: {
    label: "Manglik",
    bg: "bg-[#FDF2E2]",
    text: "text-[#E07F22]",
  },
  nadi: {
    label: "Nadi Dosha",
    bg: "bg-[#FDEAEA]",
    text: "text-[#EF3B3B]",
  },
  "kaal-sarp": {
    label: "Kaal Sarp",
    bg: "bg-[#FDEAEA]",
    text: "text-[#EF3B3B]",
  },
  bhokoot: {
    label: "Bhokoot Dosha",
    bg: "bg-[#FDEAEA]",
    text: "text-[#EF3B3B]",
  },
};
