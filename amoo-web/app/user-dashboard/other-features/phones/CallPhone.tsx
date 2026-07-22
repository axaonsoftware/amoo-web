import Image from "next/image";
import {
  CameraOff,
  ChevronLeft,
  Clock,
  Mic,
  Phone as PhoneIcon,
  ScreenShare,
} from "lucide-react";

import Phone, { StatusBar } from "../Phone";

export default function CallPhone() {
  return (
    <Phone>
      <div className="relative flex h-full flex-col bg-[#17140F]">
        {/* full-screen video feed */}
        <Image
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
          alt="Dr. Asha Verma on video call"
          fill
          sizes="148px"
          className="object-cover"
        />
        {/* darkening overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/30" />

        <div className="relative flex h-full flex-col">
          <StatusBar tone="light" />

          {/* top overlay row */}
          <div className="flex shrink-0 items-center gap-[4px] px-[10px] pt-[6px]">
            <div className="flex w-[14px] shrink-0 justify-start">
              <ChevronLeft
                className="h-[12px] w-[12px] text-white"
                strokeWidth={2.25}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <span className="text-[8px] font-bold leading-none text-white">
                Dr. Asha Verma
              </span>
              <span className="mt-[3px] text-[7px] leading-none text-white/80">
                10:04
              </span>
            </div>
            <div className="flex w-[14px] shrink-0 justify-end">
              <Clock
                className="h-[13px] w-[13px] text-white"
                strokeWidth={1.75}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1" />

          {/* bottom control bar */}
          <div className="shrink-0 rounded-t-[18px] bg-[#0A0A12] px-[9px] pt-[14px] pb-[9px]">
            <div className="flex items-center justify-between">
              <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white">
                <Mic
                  className="h-[11px] w-[11px] text-[#2B0E6E]"
                  strokeWidth={2}
                />
              </span>
              <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#2C2C34]">
                <CameraOff
                  className="h-[11px] w-[11px] text-white"
                  strokeWidth={2}
                />
              </span>
              <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#2C2C34]">
                <ScreenShare
                  className="h-[11px] w-[11px] text-white"
                  strokeWidth={2}
                />
              </span>
              <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#E93B3B]">
                <PhoneIcon
                  className="h-[13px] w-[13px] rotate-[135deg] text-white"
                  strokeWidth={2}
                />
              </span>
            </div>

            {/* home indicator */}
            <div className="mx-auto mt-[18px] h-[2px] w-[56px] rounded-full bg-white" />
          </div>
        </div>
      </div>
    </Phone>
  );
}
