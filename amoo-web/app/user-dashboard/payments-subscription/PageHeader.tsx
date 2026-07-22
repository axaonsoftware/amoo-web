import { CreditCard } from "lucide-react";

export default function PageHeader() {
  return (
    <div className="flex items-center gap-4">
      {/* Icon tile */}
      <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#5b1a9e] via-[#3f1268] to-[#2a0d4a] shadow-[0_8px_20px_rgba(76,29,149,.28)]">
        <CreditCard className="h-[26px] w-[26px] text-[#f3c76e]" strokeWidth={1.7} />
      </span>

      {/* Title */}
      <div>
        <h1 className="font-display text-[28px] font-bold leading-[1.15] text-[#2b0f47]">
          Payments &amp; Subscription
        </h1>
        <p className="mt-[5px] text-[13px] text-[#8b8697]">
          Manage your payments, invoices, wallet and subscription plans.
        </p>
      </div>
    </div>
  );
}
