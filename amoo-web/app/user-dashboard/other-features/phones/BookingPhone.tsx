import Image from "next/image";
import { ChevronDown, ChevronLeft, Star } from "lucide-react";

import Phone, { StatusBar } from "../Phone";

export default function BookingPhone() {
  return (
    <Phone>
      <StatusBar tone="dark" />

      <div className="flex min-h-0 flex-1 flex-col px-[11px] pb-[14px]">
        {/* Header */}
        <div className="relative mt-[6px] flex h-[18px] shrink-0 items-center">
          <ChevronLeft
            className="h-[12px] w-[12px] text-[#241268]"
            strokeWidth={2.5}
          />
          <span className="absolute inset-x-0 text-center text-[11px] font-bold leading-none text-[#241268]">
            Book Consultation
          </span>
        </div>

        {/* Select Service */}
        <span className="mt-[16px] shrink-0 text-[8.5px] font-bold leading-none text-[#241268]">
          Select Service
        </span>
        <div className="mt-[7px] flex h-[30px] shrink-0 items-center justify-between rounded-[9px] border border-[#EBE9F5] bg-[#FCFBFE] px-[10px]">
          <span className="text-[9px] font-semibold leading-none text-[#3A3560]">
            Kundali Reading
          </span>
          <ChevronDown
            className="h-[11px] w-[11px] text-[#3A2E86]"
            strokeWidth={2}
          />
        </div>

        {/* Select Astrologer */}
        <span className="mt-[13px] shrink-0 text-[8.5px] font-bold leading-none text-[#241268]">
          Select Astrologer
        </span>
        <div className="mt-[7px] flex h-[42px] shrink-0 items-center gap-[8px] rounded-[9px] border border-[#EBE9F5] bg-[#FCFBFE] px-[9px]">
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
            alt="Dr. Asha Verma"
            width={28}
            height={28}
            className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[9px] font-bold leading-none text-[#241268]">
              Dr. Asha Verma
            </span>
            <span className="mt-[4px] flex items-center gap-[3px] leading-none">
              <Star className="h-[8px] w-[8px] fill-[#F5A623] text-[#F5A623]" />
              <span className="text-[7.5px] text-[#8E8AA3]">
                4.8 (156 reviews)
              </span>
            </span>
          </div>
          <ChevronDown
            className="h-[11px] w-[11px] shrink-0 text-[#3A2E86]"
            strokeWidth={2}
          />
        </div>

        {/* Select Date & Time */}
        <span className="mt-[13px] shrink-0 text-[8.5px] font-bold leading-none text-[#241268]">
          Select Date &amp; Time
        </span>
        <div className="mt-[7px] flex h-[30px] shrink-0 items-center justify-between rounded-[9px] border border-[#EBE9F5] bg-[#FCFBFE] px-[10px]">
          <span className="text-[9px] font-semibold leading-none text-[#3A3560]">
            18 May 2025, 06:30 PM
          </span>
          <ChevronDown
            className="h-[11px] w-[11px] text-[#3A2E86]"
            strokeWidth={2}
          />
        </div>

        {/* Confirm */}
        <div className="mt-auto flex h-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#3A1C96] shadow-[0_4px_10px_-3px_rgba(58,28,150,0.5)]">
          <span className="text-[9.5px] font-bold leading-none text-white">
            Confirm Booking
          </span>
        </div>
      </div>
    </Phone>
  );
}
