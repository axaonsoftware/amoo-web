export type ReportType =
  | "full"
  | "correction"
  | "suggestion"
  | "career"
  | "compatibility"
  | "health";

export type ReportStatus =
  | "Completed"
  | "In Progress"
  | "Pending"
  | "Cancelled";

export const reportTypeStyles: Record<
  ReportType,
  { label: string; className: string }
> = {
  full: {
    label: "Full Numerology Report",
    className: "border-[#DDD1F7] bg-[#F3EEFE] text-[#6D28D9]",
  },
  correction: {
    label: "Name Correction",
    className: "border-[#F8DCC0] bg-[#FEF3E7] text-[#C2620C]",
  },
  suggestion: {
    label: "Name Suggestion",
    className: "border-[#C8ECD4] bg-[#E9F8EE] text-[#15803D]",
  },
  career: {
    label: "Career & Business Report",
    className: "border-[#D6D5F8] bg-[#EEEDFD] text-[#4F46E5]",
  },
  compatibility: {
    label: "Compatibility Report",
    className: "border-[#CBDFF9] bg-[#E8F1FD] text-[#1D4ED8]",
  },
  health: {
    label: "Health & Wellness Report",
    className: "border-[#C4E9E1] bg-[#E6F6F2] text-[#0F766E]",
  },
};

export const statusStyles: Record<ReportStatus, string> = {
  Completed: "bg-[#E3F7EA] text-[#16A34A]",
  "In Progress": "bg-[#E7F0FE] text-[#2563EB]",
  Pending: "bg-[#FEF1E3] text-[#EA580C]",
  Cancelled: "bg-[#FDE8E8] text-[#EF4444]",
};
