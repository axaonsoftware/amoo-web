"use client";

import Link from "next/link";
import { User, CalendarDays, Receipt, Star, UserPlus, Wallet, MessageSquare, RefreshCw } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type AuditRow = {
  id: number;
  actor_id: number;
  actor_type: string;
  action: string;
  entity: string;
  entity_id: number;
  meta: Record<string, unknown>;
  created_at: string;
};

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "";
  const s = Math.max(1, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return `${s} sec ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} day(s) ago`;
}

function describe(row: AuditRow) {
  const a = row.action;
  const e = row.entity;
  const amount = row.meta?.amount;
  if (a.includes("register") || (a === "create" && e === "user"))
    return { title: "New user registered", Icon: UserPlus, fg: "text-[#7c3aed]", bg: "bg-[#f3ecfe]" };
  if (a.includes("booking") || e === "booking")
    return { title: "New booking received", Icon: CalendarDays, fg: "text-[#7c3aed]", bg: "bg-[#f3ecfe]" };
  if (a.includes("payment") || e === "payment" || a.includes("wallet"))
    return {
      title:
        a.includes("credit") || a === "wallet-admin-credit"
          ? `Wallet credited${amount ? ` ₹${amount}` : ""}`
          : `Payment${amount ? ` ₹${amount}` : ""}`,
      Icon: Receipt,
      fg: "text-[#16a34a]",
      bg: "bg-[#e7f7ee]",
    };
  if (a.includes("review") || e === "testimonial")
    return { title: "New review received", Icon: Star, fg: "text-[#dda43c]", bg: "bg-[#fdf3e2]", stars: true };
  if (a.includes("expert") || e === "expert")
    return { title: "Astrologer activity", Icon: User, fg: "text-[#7c3aed]", bg: "bg-[#f3ecfe]" };
  if (a.includes("chat") || e === "conversation")
    return { title: "Chat message", Icon: MessageSquare, fg: "text-[#4f46e5]", bg: "bg-[#eef0fd]" };
  if (a.includes("subscription") || e === "subscription")
    return { title: "Subscription update", Icon: RefreshCw, fg: "text-[#7c3aed]", bg: "bg-[#f3ecfe]" };
  return { title: `${e} ${a}`, Icon: Wallet, fg: "text-[#7c3aed]", bg: "bg-[#f3ecfe]" };
}

export default function RecentActivity() {
  const { data, loading, error } = useApi(() => api.admin.getAudit("?pageSize=8"));
  const rows: AuditRow[] = (data as { data?: AuditRow[] } | null)?.data ?? [];

  return (
    <section className="rounded-[16px] border border-[#f0eaf8] bg-white p-5 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[17px] font-bold text-[#3d1a63]">Recent Activity</h2>
        <Link href="/admin/activity-logs" className="text-[11.5px] font-medium text-[#7c3aed]">
          View All
        </Link>
      </div>

      {loading ? (
        <p className="mt-4 text-[12.5px] text-[#8b8397]">Loading...</p>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-600">Failed to load.</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8397]">No recent activity.</p>
      ) : (
        <ul className="mt-4 space-y-[14px]">
          {rows.map((row) => {
            const { title, Icon, bg, fg, stars } = describe(row);
            return (
              <li key={row.id} className="flex items-start gap-3">
                <span className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full ${bg} ${fg}`}>
                  <Icon className="h-[16px] w-[16px]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-[#2a1148]">{title}</p>
                  <p className="mt-[2px] flex items-center gap-1 truncate text-[11px] text-[#8b8397]">
                    {stars ? (
                      <span className="flex items-center gap-[1px]">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star key={i} className="h-[10px] w-[10px] fill-[#e9b85c] text-[#e9b85c]" strokeWidth={0} />
                        ))}
                      </span>
                    ) : null}
                    <span className="capitalize">{row.actor_type}</span> · {row.entity}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-[10px] text-[#a49bb1]">{timeAgo(row.created_at)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
