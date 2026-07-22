import { ChevronLeft, Send, Sparkles } from "lucide-react";

import Phone, { StatusBar } from "../Phone";

export default function ChatPhone() {
  return (
    <Phone>
      <StatusBar tone="dark" />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex h-[24px] shrink-0 items-center gap-[7px] border-b border-[#F1EFF7] px-[11px]">
          <ChevronLeft
            className="h-[12px] w-[12px] text-[#241268]"
            strokeWidth={2.5}
          />
          <span className="text-[10.5px] font-bold leading-none text-[#241268]">
            AI Astro Chat
          </span>
        </div>

        {/* Messages */}
        <div className="flex min-h-0 flex-1 flex-col gap-[8px] px-[11px] pt-[12px]">
          {/* user bubble */}
          <div className="flex justify-end">
            <p className="max-w-[78%] rounded-[11px] rounded-br-[3px] bg-[#4A22DE] px-[9px] py-[7px] text-[8.5px] font-medium leading-[1.35] text-white">
              What does my birth chart say about my career?
            </p>
          </div>

          {/* AI avatar + bubble */}
          <div className="flex items-start gap-[5px]">
            <span className="mt-[1px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-[#EDE7FF]">
              <Sparkles
                className="h-[8px] w-[8px] text-[#5B34D6]"
                strokeWidth={2}
              />
            </span>
            <p className="max-w-[80%] rounded-[11px] rounded-tl-[3px] bg-[#F2F1F6] px-[9px] py-[7px] text-[8.5px] font-medium leading-[1.35] text-[#2E2A46]">
              Your birth chart shows strong leadership qualities. You may excel
              in management and business.
            </p>
          </div>

          {/* user bubble */}
          <div className="flex justify-end">
            <p className="max-w-[78%] rounded-[11px] rounded-br-[3px] bg-[#4A22DE] px-[9px] py-[7px] text-[8.5px] font-medium leading-[1.35] text-white">
              Great! Any suggestions?
            </p>
          </div>

          {/* AI bubble */}
          <div className="flex items-start gap-[5px] pl-[20px]">
            <p className="max-w-[80%] rounded-[11px] rounded-tl-[3px] bg-[#F2F1F6] px-[9px] py-[7px] text-[8.5px] font-medium leading-[1.35] text-[#2E2A46]">
              Focus on skill development and stay consistent.
            </p>
          </div>
        </div>

        {/* Input bar */}
        <div className="flex shrink-0 items-center gap-[6px] px-[10px] pb-[10px] pt-[6px]">
          <div className="flex h-[26px] flex-1 items-center rounded-full bg-[#F2F1F6] px-[11px]">
            <span className="text-[8.5px] leading-none text-[#A7A3B6]">
              Type your message...
            </span>
          </div>
          <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#4A22DE]">
            <Send className="h-[11px] w-[11px] text-white" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Phone>
  );
}
