import { ChevronLeft } from "lucide-react";

import Phone, { StatusBar } from "../Phone";

const TXNS = [
  { title: "Kundali Reading", date: "18 May 2025", amount: "- ₹ 1,999", positive: false },
  { title: "Tarot Reading", date: "14 May 2025", amount: "- ₹ 799", positive: false },
  { title: "Added Money", date: "15 May 2025", amount: "+ ₹ 3,000", positive: true },
];

export default function WalletPhone() {
  return (
    <Phone>
      <StatusBar tone="dark" />

      <div className="flex min-h-0 flex-1 flex-col px-[11px] pb-[13px]">
        {/* Header */}
        <div className="relative mt-[6px] flex h-[18px] shrink-0 items-center">
          <ChevronLeft
            className="h-[12px] w-[12px] text-[#241268]"
            strokeWidth={2.5}
          />
          <span className="absolute inset-x-0 text-center text-[11px] font-bold leading-none text-[#241268]">
            My Wallet
          </span>
        </div>

        {/* Balance card */}
        <div className="mt-[13px] flex shrink-0 flex-col items-center rounded-[12px] border border-[#EFEDF7] bg-white px-[12px] py-[12px] shadow-[0_1px_2px_rgba(45,25,110,0.03)]">
          <span className="self-start text-[8.5px] font-semibold leading-none text-[#8E8AA3]">
            Wallet Balance
          </span>
          <span className="mt-[7px] self-start text-[17px] font-extrabold leading-none text-[#241268]">
            ₹ 5,680.00
          </span>
          <div className="mt-[11px] flex h-[28px] w-full items-center justify-center rounded-[9px] bg-[#3A1C96] shadow-[0_4px_10px_-3px_rgba(58,28,150,0.5)]">
            <span className="text-[9.5px] font-bold leading-none text-white">
              Add Money
            </span>
          </div>
        </div>

        {/* Recent transactions */}
        <span className="mt-[13px] shrink-0 text-[8.5px] font-bold leading-none text-[#241268]">
          Recent Transactions
        </span>

        <div className="mt-[8px] flex shrink-0 flex-col gap-[8px]">
          {TXNS.map((txn) => (
            <div
              key={txn.title}
              className="flex h-[38px] items-center justify-between rounded-[10px] border border-[#EFEDF7] bg-white px-[10px] shadow-[0_1px_2px_rgba(45,25,110,0.03)]"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[8px] font-bold leading-[1.2] text-[#241268]">
                  {txn.title}
                </span>
                <span className="mt-[2px] truncate text-[7px] leading-[1.2] text-[#9C98AE]">
                  {txn.date}
                </span>
              </div>
              <span
                className={`shrink-0 pl-[4px] text-[8.5px] font-bold leading-none ${
                  txn.positive ? "text-[#1FA85C]" : "text-[#241268]"
                }`}
              >
                {txn.amount}
              </span>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-auto flex h-[28px] shrink-0 items-center justify-center rounded-[10px] bg-[#EEEAFB]">
          <span className="text-[10px] font-bold leading-none text-[#4A22DE]">
            View All
          </span>
        </div>
      </div>
    </Phone>
  );
}
