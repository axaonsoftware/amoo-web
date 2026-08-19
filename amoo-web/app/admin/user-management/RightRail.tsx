"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Copy, CircleCheck, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";
import type { User } from "../../../lib/types";

type AccountRow = {
  label: string;
  value: string;
  kind: "semibold" | "medium" | "chip" | "check";
};

export default function RightRail({ userId }: { userId?: number }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    api.admin
      .getUsers("?limit=1")
      .then((res: unknown) => {
        const payload = res as { data?: User[] } | User[];
        const items = Array.isArray(payload)
          ? (payload as User[])
          : (payload?.data ?? []);
        if (items.length) {
          setSelectedUser(items[0]);
        }
      })
      .catch(() => {});
  }, [userId]);

  const userName = selectedUser?.name || "Select User";
  const userEmail = selectedUser?.email || "No email available";
  const userRole = selectedUser?.role ? selectedUser.role.toUpperCase() : "User";
  const userStatus = selectedUser?.status || "Active";
  const userCreated = selectedUser?.created_at
    ? new Date(selectedUser.created_at).toLocaleDateString("en-IN")
    : "—";

  const accountRows: AccountRow[] = [
    { label: "Role", value: userRole, kind: "semibold" },
    { label: "Status", value: userStatus, kind: "chip" },
    { label: "Joined On", value: userCreated, kind: "medium" },
    { label: "Email Verified", value: "", kind: "check" },
  ];

  const activitySummary = [
    { caption: "Total Bookings", value: String((selectedUser as { bookings_count?: number })?.bookings_count ?? (selectedUser ? 1 : 0)) },
    { caption: "Status", value: userStatus },
    { caption: "User ID", value: selectedUser?.id ? `#USR${selectedUser.id}` : "—" },
  ];

  const recentActivity: { dot: string; title: string; sub: string }[] = [
    {
      dot: "bg-[#22C55E]",
      title: "Account Registered",
      sub: userCreated,
    },
    {
      dot: "bg-[#2563EB]",
      title: "Status Active",
      sub: "Verified User",
    },
  ];
  return (
    <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[16px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[12.5px] font-semibold text-[#221C33]">
          User Details
        </h2>
        <button type="button" aria-label="Close" className="text-[#8B879C]">
          <X size={15} />
        </button>
      </div>

      {/* Identity */}
      <div className="mt-[14px] flex items-start gap-[10px]">
        <Image
          src={selectedUser?.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"}
          alt={userName}
          width={52}
          height={52}
          className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-[6px]">
            <p className="text-[12.5px] font-semibold text-[#221C33]">
              {userName}
            </p>
            {selectedUser?.verified && (
              <span className="inline-flex h-[17px] items-center rounded-[5px] bg-[#EDE7FB] px-[6px] text-[9px] font-medium text-[#6D28D9]">
                Verified
              </span>
            )}
          </div>
          <p className="mt-[4px] text-[10px] text-[#8B879C]">
            {userEmail}
          </p>
          <p className="mt-[2px] text-[10px] text-[#8B879C]">{selectedUser?.phone || "—"}</p>
          <div className="mt-[6px] flex items-center gap-[4px]">
            <span className="text-[9.5px] text-[#8B879C]">User ID:</span>
            <span className="text-[9.5px] font-semibold text-[#2E2A3B]">
              {selectedUser?.id ? `#USR${selectedUser.id}` : "—"}
            </span>
            <Copy size={11} className="text-[#8B879C]" />
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="mt-[14px] border-t border-[#F1F0F6] pt-[12px]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11.5px] font-semibold text-[#221C33]">
            Account Information
          </h3>
          <button
            type="button"
            className="h-[22px] rounded-[6px] border border-[#E2DFEA] px-[10px] text-[9.5px] font-medium text-[#6D28D9]"
          >
            Edit
          </button>
        </div>

        <div className="mt-[10px] space-y-[2px]">
          {accountRows.map(({ label, value, kind }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[10px] text-[#8B879C]">{label}</span>

              {kind === "semibold" && (
                <span className="text-[10px] font-semibold text-[#2E2A3B]">
                  {value}
                </span>
              )}

              {kind === "medium" && (
                <span className="text-[10px] font-medium text-[#2E2A3B]">
                  {value}
                </span>
              )}

              {kind === "chip" && (
                <span className="rounded-[5px] bg-[#E3F7EC] px-[7px] py-[2px] text-[9px] font-medium text-[#16A34A]">
                  {value}
                </span>
              )}

              {kind === "check" && (
                <CircleCheck size={14} className="fill-[#22C55E] text-white" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="mt-[14px] border-t border-[#F1F0F6] pt-[12px]">
        <h3 className="text-[11.5px] font-semibold text-[#221C33]">
          Activity Summary
        </h3>

        <div className="mt-[10px] grid grid-cols-3 overflow-hidden rounded-[10px] border border-[#F0EFF5] [&>*:nth-child(3n)]:border-r-0 [&>*:nth-child(n+4)]:border-b-0">
          {activitySummary.map(({ caption, value }) => (
            <div
              key={caption}
              className="border-b border-r border-[#F0EFF5] px-[6px] py-[7px]"
            >
              <p className="whitespace-nowrap text-[7.5px] leading-tight text-[#8B879C]">
                {caption}
              </p>
              <p className="mt-[3px] text-[10.5px] font-bold text-[#1D1630]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-[14px] border-t border-[#F1F0F6] pt-[12px]">
        <h3 className="text-[11.5px] font-semibold text-[#221C33]">
          Quick Actions
        </h3>

        <div className="mt-[12px] grid grid-cols-2 gap-[12px]">
          <button
            type="button"
            className="inline-flex h-[34px] items-center justify-center gap-[4px] rounded-[8px] border border-[#D9CFF2] bg-white text-[9.5px] font-medium text-[#6D28D9]"
          >
            View Full Profile
          </button>
          <button
            type="button"
            className="inline-flex h-[34px] items-center justify-center gap-[4px] rounded-[8px] bg-gradient-to-b from-[#F0C46B] to-[#E0A845] text-[9.5px] font-medium text-[#3A1866]"
          >
            Login as User
          </button>
          <button
            type="button"
            className="inline-flex h-[34px] items-center justify-center gap-[4px] rounded-[8px] border border-[#F3C7C7] bg-white text-[9.5px] font-medium text-[#EF4444]"
          >
            Block User
          </button>
          <button
            type="button"
            className="inline-flex h-[34px] items-center justify-center gap-[4px] rounded-[8px] border border-[#F3C7C7] bg-[#FDF3F3] text-[9.5px] font-medium text-[#EF4444]"
          >
            <Trash2 size={11} />
            Delete User
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-[14px] border-t border-[#F1F0F6] pt-[12px]">
        <h3 className="text-[11.5px] font-semibold text-[#221C33]">
          Recent Activity
        </h3>

        <ul className="mt-[12px] space-y-[16px]">
          {recentActivity.map(({ dot, title, sub }) => (
            <li key={title} className="flex items-start gap-[8px]">
              <span
                className={`mt-[4px] h-[6px] w-[6px] shrink-0 rounded-full ${dot}`}
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[10px] font-semibold text-[#221C33]">
                  {title}
                </p>
                <p className="mt-[2px] text-[9px] text-[#8B879C]">{sub}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/admin/user-management"
          className="mt-[26px] block text-center text-[10px] font-medium text-[#6D28D9]"
        >
          View All Activity
        </Link>
      </div>
    </section>
  );
}
