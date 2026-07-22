import {
  FileText,
  Clock,
  CircleCheck,
  Ban,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const quickStats = [
  { label: "Total Reports", value: "—", Icon: FileText, color: "#7C3AED" },
  { label: "Pending Generation", value: "—", Icon: Clock, color: "#F59E0B" },
  { label: "Ready Reports", value: "—", Icon: CircleCheck, color: "#16A34A" },
  { label: "Rejected", value: "—", Icon: Ban, color: "#EF4444" },
  { label: "This Month", value: "—", Icon: TrendingUp, color: "#2563EB" },
  { label: "Avg. Per Day", value: "—", Icon: BarChart3, color: "#059669" },
];

export default function RightRail() {
  return (
    <aside className="w-[260px] shrink-0">
      <div className="flex flex-col gap-4">
        {quickStats.map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="rounded-[14px] border border-[#EEEDF4] bg-white px-4 py-[13px] shadow-[0_1px_2px_rgba(20,16,40,.04)]"
          >
            <div className="flex items-center gap-[10px]">
              <Icon size={16} strokeWidth={1.8} style={{ color }} />
              <p className="text-[10px] leading-tight text-[#8B879C]">{label}</p>
            </div>
            <p className="mt-[8px] text-[20px] font-semibold leading-none text-[#1F1836]">{value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
