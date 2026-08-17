import {
  Bell,
  Send,
  Clock,
  CircleCheck,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const quickStats = [
  { label: "Sent This Week", value: "42", Icon: Send, color: "#7C3AED" },
  { label: "Avg. Open Rate", value: "68%", Icon: TrendingUp, color: "#16A34A" },
  { label: "Unread", value: "128", Icon: Clock, color: "#F59E0B" },
  { label: "Delivery Rate", value: "97%", Icon: CircleCheck, color: "#2563EB" },
  { label: "Total Reach", value: "12.4K", Icon: Bell, color: "#4F46E5" },
  { label: "Click Rate", value: "23%", Icon: BarChart3, color: "#059669" },
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
              <p className="text-[10px] leading-tight text-[#8B879C]">
                {label}
              </p>
            </div>
            <p className="mt-[8px] text-[20px] font-semibold leading-none text-[#1F1836]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
