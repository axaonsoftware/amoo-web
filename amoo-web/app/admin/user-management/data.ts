export type RoleKey = "premium" | "free" | "consultant";

export type StatusKey = "active" | "blocked" | "pending";

export const roleStyles: Record<
  RoleKey,
  { label: string; bg: string; text: string }
> = {
  premium: {
    label: "Premium User",
    bg: "bg-[#EDE7FB]",
    text: "text-[#6D28D9]",
  },
  free: {
    label: "Free User",
    bg: "bg-[#E3EDFD]",
    text: "text-[#2563EB]",
  },
  consultant: {
    label: "Consultant",
    bg: "bg-[#FEF1E1]",
    text: "text-[#C2711A]",
  },
};

export const statusStyles: Record<
  StatusKey,
  { label: string; bg: string; text: string }
> = {
  active: {
    label: "Active",
    bg: "bg-[#E3F7EC]",
    text: "text-[#16A34A]",
  },
  blocked: {
    label: "Blocked",
    bg: "bg-[#FDEAEA]",
    text: "text-[#EF4444]",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#FEF1E1]",
    text: "text-[#C2711A]",
  },
};
