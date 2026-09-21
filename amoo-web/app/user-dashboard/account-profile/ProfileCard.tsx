"use client";

import Image from "next/image";
import { useRef, useState } from "react";
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
import { useAuth } from "@/lib/auth-context";
import type { Subscription, User } from "@/lib/types";

type ProfilePayload = {
  user?: User;
  expert?: User;
} & Partial<User>;

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
  const { isExpert } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data: profile,
    loading,
    error,
    refetch,
  } = useApi<ProfilePayload>(() =>
    isExpert ? api.getExpertProfile() : api.getProfile(),
  );
  // /api/subscriptions is paginated -> `{ data, meta }`, never a bare array.
  const { items: subs } = useApiList<Subscription>(() =>
    api.getSubscriptions(),
  );
  const user = (profile?.expert || profile?.user || profile || {}) as User;
  const hasPremium = subs.some((s) => s.status === "active");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("avatar", file);

      if (isExpert) {
        await api.updateExpertProfile(formData);
      } else {
        await api.updateProfile(formData);
      }

      await refetch();
    } catch (err) {
      console.error("Avatar update failed:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const avatarUrl = user.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `http://localhost:4000${user.avatar}`
    : "";
  console.log("AVATAR URL:", avatarUrl);

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
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="block h-full w-full overflow-hidden rounded-full ring-[3px] ring-[#e9b85c] ring-offset-[3px] ring-offset-white"
              aria-label="View profile"
            >
              {user.avatar ? (
                <img
                  src={avatarUrl}
                  alt={user.name || "User"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error(
                      "AVATAR LOAD FAILED:",
                      avatarUrl,
                      e.currentTarget.src,
                    );
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#f1e9fb] text-[40px] font-bold text-[#6b3fa0]">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              aria-label="Change photo"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-[2px] right-[6px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#6b3fa0] ring-[3px] ring-white disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-[16px] w-[16px] animate-spin text-white" />
              ) : (
                <Camera
                  className="h-[16px] w-[16px] text-white"
                  strokeWidth={1.9}
                />
              )}
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
              {isExpert
                ? "Astrologer"
                : hasPremium
                  ? "Premium User"
                  : "Free User"}
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

      {profileOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <div className="h-[120px] w-[120px] overflow-hidden rounded-full ring-[3px] ring-[#e9b85c] ring-offset-[3px]">
                {user.avatar ? (
                  <img
                    src={avatarUrl}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error(
                        "AVATAR LOAD FAILED:",
                        avatarUrl,
                        e.currentTarget.src,
                      );
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#f1e9fb] text-[40px] font-bold text-[#6b3fa0]">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className="mt-4 text-[21px] font-bold text-[#2b0f47]">
                {user.name || "User"}
              </h3>

              <span className="mt-2 rounded-full bg-[#f1e9fb] px-3 py-1 text-[12px] font-semibold text-[#6b3fa0]">
                {isExpert
                  ? "Astrologer"
                  : hasPremium
                    ? "Premium User"
                    : "Free User"}
              </span>

              <div className="mt-5 w-full space-y-3">
                <div className="flex items-center gap-3 text-[13px] text-[#2b0f47]">
                  <Mail className="h-4 w-4 text-[#6b3fa0]" />
                  <span>{user.email || "—"}</span>
                </div>

                <div className="flex items-center gap-3 text-[13px] text-[#2b0f47]">
                  <Phone className="h-4 w-4 text-[#6b3fa0]" />
                  <span>{user.phone || "—"}</span>
                </div>

                <div className="flex items-center gap-3 text-[13px] text-[#2b0f47]">
                  <MapPin className="h-4 w-4 text-[#6b3fa0]" />
                  <span>
                    {[user.city, user.state, user.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="mt-6 w-full rounded-lg bg-[#6b3fa0] py-2.5 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
