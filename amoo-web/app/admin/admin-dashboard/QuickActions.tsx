import {
  UserPlus,
  UserRoundPlus,
  BadgePercent,
  GraduationCap,
  Send,
  FileText,
  Settings,
} from "lucide-react";

const actions = [
  { label: "Add New User", Icon: UserPlus, bg: "bg-[#f3ecfe]", fg: "text-[#7c3aed]" },
  { label: "Add Astrologer", Icon: UserRoundPlus, bg: "bg-[#fdf3e2]", fg: "text-[#dda43c]" },
  { label: "Create Offer", Icon: BadgePercent, bg: "bg-[#f3ecfe]", fg: "text-[#7c3aed]" },
  { label: "Add Course", Icon: GraduationCap, bg: "bg-[#fdf3e2]", fg: "text-[#dda43c]" },
  { label: "Send Notification", Icon: Send, bg: "bg-[#f3ecfe]", fg: "text-[#7c3aed]" },
  { label: "Generate Report", Icon: FileText, bg: "bg-[#fdf3e2]", fg: "text-[#dda43c]" },
  { label: "System Settings", Icon: Settings, bg: "bg-[#f3ecfe]", fg: "text-[#7c3aed]" },
];

export default function QuickActions() {
  return (
    <section className="rounded-[16px] border border-[#f0eaf8] bg-white p-5 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
      <h2 className="font-display text-[17px] font-bold text-[#3d1a63]">Quick Actions</h2>

      <div className="mt-4 flex flex-wrap gap-x-[22px] gap-y-4">
        {actions.map(({ label, Icon, bg, fg }) => (
          <button key={label} type="button" className="flex w-[76px] flex-col items-center gap-2">
            <span
              className={`flex h-[54px] w-[54px] items-center justify-center rounded-[12px] ${bg}`}
            >
              <Icon className={`h-[20px] w-[20px] ${fg}`} strokeWidth={1.8} />
            </span>
            <span className="whitespace-nowrap text-center text-[9.5px] font-medium leading-[1.2] text-[#4b4459]">
              {label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
