import Link from "next/link";
import { FileText, FileCheck2, FileClock, FileX2 } from "lucide-react";

const rows = [
  {
    label: "Total Invoices",
    value: "1,850",
    Icon: FileText,
    iconWrap: "bg-[#E7F0FE]",
    iconColor: "text-[#3B82F6]",
    valueColor: "text-[#1B1630]",
  },
  {
    label: "Paid Invoices",
    value: "1,456",
    Icon: FileCheck2,
    iconWrap: "bg-[#E3F7EA]",
    iconColor: "text-[#16A34A]",
    valueColor: "text-[#16A34A]",
  },
  {
    label: "Unpaid Invoices",
    value: "278",
    Icon: FileClock,
    iconWrap: "bg-[#FEF1E3]",
    iconColor: "text-[#F59E0B]",
    valueColor: "text-[#F59E0B]",
  },
  {
    label: "Overdue Invoices",
    value: "116",
    Icon: FileX2,
    iconWrap: "bg-[#FDE8E8]",
    iconColor: "text-[#EF4444]",
    valueColor: "text-[#EF4444]",
  },
];

export default function InvoicesOverview() {
  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          Invoices Overview
        </h2>
        <Link href="/admin/payments-finance" className="text-[11px] font-medium text-[#7C3AED]">
          View All
        </Link>
      </div>

      <ul className="mt-4 space-y-[14px]">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-[10px]">
            <span
              className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] ${r.iconWrap}`}
            >
              <r.Icon size={16} className={r.iconColor} />
            </span>
            <span className="truncate text-[11.5px] text-[#4A3B63]">
              {r.label}
            </span>
            <span
              className={`ml-auto shrink-0 text-[12px] font-semibold ${r.valueColor}`}
            >
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
