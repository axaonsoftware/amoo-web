"use client";

import Image from "next/image";
import {
  Camera,
  Crown,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  UserRound,
  Lock,
  ShieldCheck,
  Bell,
  Link2,
  Power,
  Loader2,
} from "lucide-react";
import { useApi, useApiList } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Subscription, User } from "@/lib/types";

type ProfilePayload = { user?: User } & Partial<User>;

const settingsNav = [
  { label: "Account & Profile", Icon: UserRound, active: true },
  { label: "Personal & Birth Details", Icon: CalendarDays },
  { label: "Change Password", Icon: Lock },
  { label: "Privacy & Security", Icon: ShieldCheck },
  { label: "Notification Preferences", Icon: Bell },
  { label: "Linked Accounts", Icon: Link2 },
  { label: "Deactivate Account", Icon: Power },
];

export default function ProfileCard() {
  const {
    data: profile,
    loading,
    error,
  } = useApi<ProfilePayload>(() => api.getProfile());
  // /api/subscriptions is paginated -> `{ data, meta }`, never a bare array.
  const { items: subs } = useApiList<Subscription>(() =>
    api.getSubscriptions(),
  );
  const user = (profile?.user || profile || {}) as User;
  const hasPremium = subs.some((s) => s.status === "active");
  return (
    <div className="overflow-hidden rounded-[16px] border border-[#efe6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile...
        </div>
      ) : error ? (
        <p className="px-5 py-4 text-[12.5px] text-red-500">{error}</p>
      ) : (
        <div className="px-5 pt-7 pb-5">
          {/* Avatar */}
          <div className="relative mx-auto h-[128px] w-[128px]">
            <span className="block h-full w-full overflow-hidden rounded-full ring-[3px] ring-[#e9b85c] ring-offset-[3px] ring-offset-white">
              <Image
                src={
                  user.avatar ||
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80"
                }
                alt={user.name || "User"}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </span>
            <button
              type="button"
              aria-label="Change photo"
              className="absolute bottom-[2px] right-[6px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#6b3fa0] ring-[3px] ring-white"
            >
              <Camera
                className="h-[16px] w-[16px] text-white"
                strokeWidth={1.9}
              />
            </button>
          </div>

          {/* Name + badge */}
          <h2 className="mt-4 text-center font-display text-[22px] font-bold text-[#2b0f47]">
            {user.name || "User"}
          </h2>
          <div className="mt-[10px] flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1e9fb] px-[13px] py-[5px] text-[12px] font-semibold text-[#6b3fa0]">
              <Crown
                className="h-[13px] w-[13px] text-[#e9a11e]"
                fill="#e9a11e"
                strokeWidth={1.5}
              />
              {hasPremium ? "Premium User" : "Free User"}
            </span>
          </div>

          {/* Contact info */}
          <div className="mt-5 flex flex-col gap-[15px]">
            <div className="flex items-center gap-3 text-[13px] text-[#2b0f47]">
              <Mail
                className="h-[16px] w-[16px] shrink-0 text-[#6b3fa0]"
                strokeWidth={1.8}
              />
              <span>{user.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-[#2b0f47]">
              <Phone
                className="h-[16px] w-[16px] shrink-0 text-[#6b3fa0]"
                strokeWidth={1.8}
              />
              <span>{user.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-[#2b0f47]">
              <MapPin
                className="h-[16px] w-[16px] shrink-0 text-[#6b3fa0]"
                strokeWidth={1.8}
              />
              <span>
                {[user.city, user.state, user.country]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays
                className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[#6b3fa0]"
                strokeWidth={1.8}
              />
              <div className="leading-[1.35]">
                <p className="text-[11.5px] text-[#8b8697]">Member Since</p>
                <p className="text-[13px] font-medium text-[#2b0f47]">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-5 h-px bg-[#efe6d6]" />

      {/* Settings nav */}
      <nav className="py-[10px]">
        {settingsNav.map(({ label, Icon, active }) => (
          <button
            key={label}
            type="button"
            className={
              active
                ? "flex w-full items-center gap-3 border-l-[3px] border-[#e9b85c] bg-[#f3eefc] py-[11px] pl-[17px] pr-4 text-left text-[13.5px] font-semibold text-[#5b2b9e]"
                : "flex w-full items-center gap-3 border-l-[3px] border-transparent py-[11px] pl-[17px] pr-4 text-left text-[13.5px] font-medium text-[#2b2540] transition-colors hover:bg-[#faf7fd]"
            }
          >
            <Icon
              className={`h-[17px] w-[17px] shrink-0 ${active ? "text-[#5b2b9e]" : "text-[#6b3fa0]"}`}
              strokeWidth={1.8}
            />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
