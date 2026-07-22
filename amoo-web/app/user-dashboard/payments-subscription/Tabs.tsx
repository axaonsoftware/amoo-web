import Link from "next/link";

const tabs = [
  { label: "All Transactions", active: true },
  { label: "Invoices", active: false },
  { label: "Subscription Plans", active: false },
  { label: "Purchased Packages", active: false },
  { label: "Payment Methods", active: false },
];

export default function Tabs() {
  return (
    <div className="flex items-center gap-8 overflow-x-auto border-b border-[#ece3d5]">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href="/user-dashboard/payments-subscription"
          className={
            tab.active
              ? "-mb-px whitespace-nowrap border-b-2 border-[#7c3aed] pb-[11px] text-[13.5px] font-semibold text-[#7c3aed]"
              : "-mb-px whitespace-nowrap border-b-2 border-transparent pb-[11px] text-[13.5px] font-medium text-[#6c6b78] transition-colors hover:text-[#2b0f47]"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
