export type StatusKey = "upcoming" | "completed" | "in-progress" | "cancelled";

export const statusStyles: Record<
  StatusKey,
  { label: string; bg: string; text: string }
> = {
  upcoming: {
    label: "Upcoming",
    bg: "bg-[#FDF1E3]",
    text: "text-[#E8891A]",
  },
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
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#FDEAEC]",
    text: "text-[#EF3B4D]",
  },
};
