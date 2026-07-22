import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Lock,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Phone, { StatusBar } from "../Phone";

const ROWS = [
  { Icon: UserRound, label: "Edit Profile" },
  { Icon: Gift, label: "Birth Details" },
  { Icon: Settings, label: "Preferences" },
  { Icon: Lock, label: "Change Password" },
  { Icon: ShieldCheck, label: "Privacy Settings" },
];

export default function ProfilePhone() {
  return (
    <Phone>
      {/* Purple header */}
      <div className="shrink-0 bg-[#3A1C96]">
        <StatusBar tone="light" />
        <div className="relative flex h-[30px] items-center px-[10px]">
          <ChevronLeft
            className="h-[12px] w-[12px] text-white"
            strokeWidth={2.5}
          />
          <span className="absolute inset-x-0 text-center text-[11px] font-bold leading-none text-white">
            My Profile
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col items-center px-[10px] pt-[14px]">
        <Image
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
          alt="Priya Sharma"
          width={54}
          height={54}
          className="h-[54px] w-[54px] rounded-full border-2 border-white object-cover shadow-[0_2px_6px_rgba(45,25,110,0.14)]"
        />
        <span className="mt-[9px] text-[11px] font-bold leading-none text-[#241268]">
          Priya Sharma
        </span>
        <span className="mt-[5px] text-[8px] leading-none text-[#8E8AA8]">
          priya.sharma@email.com
        </span>

        <div className="mt-[13px] w-full">
          {ROWS.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex h-[36px] items-center gap-[10px] border-b border-[#F1EFF7] px-[6px]"
            >
              <Icon
                className="h-[13px] w-[13px] shrink-0 text-[#4A3A9E]"
                strokeWidth={1.9}
              />
              <span className="flex-1 whitespace-nowrap text-[8.5px] font-semibold leading-none text-[#2E2960]">
                {label}
              </span>
              <ChevronRight
                className="h-[11px] w-[11px] shrink-0 text-[#B7B3C7]"
                strokeWidth={2}
              />
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}
