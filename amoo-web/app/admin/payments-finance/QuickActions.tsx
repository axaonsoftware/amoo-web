"use client";

import {
  FilePlus2,
  CircleSlash2,
  Banknote,
  Percent,
  Download,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";

const actions = [
  {
    label: "Create Invoice",
    Icon: FilePlus2,
    color: "text-[#3B82F6]",
    path: "/admin/payments-finance",
  },
  {
    label: "Add Refund",
    Icon: CircleSlash2,
    color: "text-[#EF4444]",
    path: "/admin/payments-finance",
  },
  {
    label: "Record Payout",
    Icon: Banknote,
    color: "text-[#16A34A]",
    path: "/admin/payments-finance",
  },
  {
    label: "Manage Taxes",
    Icon: Percent,
    color: "text-[#7C3AED]",
    path: "/admin/payments-finance",
  },
  {
    label: "Download Statement",
    Icon: Download,
    color: "text-[#4A3B63]",
    path: "",
  },
  {
    label: "Financial Reports",
    Icon: BarChart3,
    color: "text-[#7C3AED]",
    path: "",
  },
];

export default function QuickActions() {
  const router = useRouter();

  function handleClick(label: string, path: string) {
    if (path) {
      router.push(path);
    } else {
      window.alert(`${label} — coming soon`);
    }
  }

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">
        Quick Actions
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-[10px]">
        {actions.map(({ label, Icon, color, path }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleClick(label, path)}
            className="inline-flex h-[38px] items-center gap-[7px] rounded-[10px] border border-[#EFEDF4] bg-white px-[10px] text-[10.5px] font-medium text-[#2E2A3B] shadow-[0_1px_2px_rgba(16,12,40,0.03)] hover:bg-[#FAF9FC]"
          >
            <Icon size={15} className={`shrink-0 ${color}`} />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
