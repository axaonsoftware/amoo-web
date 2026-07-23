"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { sanitize } from "../../lib/sanitize";

type Notification = {
  id: number;
  user_id: number | null;
  title: string;
  message: string;
  type: string;
  is_read: number | boolean;
  created_at: string;
};

const TYPE_ICON: Record<string, typeof Bell> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertTriangle,
};

const TYPE_TINT: Record<string, string> = {
  info: "bg-[#e6effb] text-[#3b78cc]",
  warning: "bg-[#fdf0d5] text-[#c2820b]",
  success: "bg-[#e6f7ec] text-[#1f9254]",
  error: "bg-[#fdeaf0] text-[#e0567f]",
};

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [fetchingCount, setFetchingCount] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      const res: any = await api.getUnreadCount();
      setUnread(Number(res?.count ?? 0));
    } catch {
      /* keep stale count */
    } finally {
      setFetchingCount(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoadingList(true);
    try {
      const res: any = await api.getNotifications();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNotifications(list);
    } catch {
      /* silent */
    } finally {
      setLoadingList(false);
    }
  }, []);

  /* fetch unread count on mount + every 30 s */
  useEffect(() => {
    refreshCount();
    timerRef.current = setInterval(refreshCount, 30000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [refreshCount]);

  /* fetch list on open */
  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markOne = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
    setUnread((prev) => Math.max(0, (prev ?? 1) - 1));
    try { await api.markRead(id); } catch { /* best-effort */ }
  };

  const markAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnread(0);
    try { await api.markAllRead(); } catch { /* best-effort */ }
  };

  const displayCount = unread ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#4a1c7d] transition-colors hover:bg-[#f1e9fc]"
      >
        <Bell className="h-[22px] w-[22px]" strokeWidth={1.7} />
        {fetchingCount ? null : displayCount > 0 ? (
          <span className="absolute -top-[1px] right-0 flex min-w-[17px] items-center justify-center rounded-full bg-[#e9b85c] px-1 text-[9.5px] font-bold leading-[17px] text-[#2a1148]">
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        ) : null}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-[14px] border border-[#ece3d5] bg-white shadow-[0_12px_40px_rgba(43,15,71,0.12)]">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-[#f1e8da] px-4 py-3">
            <h3 className="text-[14px] font-bold text-[#2b0f47]">Notifications</h3>
            {displayCount > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[#7c3aed] hover:text-[#5b21b6]"
              >
                <CheckCheck className="h-[14px] w-[14px]" strokeWidth={2} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-[#8b8697]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-[#d4ccec]" strokeWidth={1.4} />
                <p className="mt-2 text-[13px] font-medium text-[#2b0f47]">No notifications</p>
                <p className="mt-1 text-[11.5px] text-[#8b8697]">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.is_read;
                const Icon = TYPE_ICON[n.type] || Info;
                const tint = TYPE_TINT[n.type] || TYPE_TINT.info;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => { if (isUnread) markOne(n.id); }}
                    className={`flex w-full gap-3 border-b border-[#f4f1f8] px-4 py-3 text-left transition-colors hover:bg-[#faf7f2] ${
                      isUnread ? "bg-[#fdfbf7]" : ""
                    }`}
                  >
                    <span
                      className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] ${tint}`}
                    >
                      <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-[12.5px] leading-[1.35] ${
                            isUnread ? "font-bold text-[#2b0f47]" : "font-semibold text-[#4b4458]"
                          }`}
                        >
                          {sanitize(n.title)}
                        </p>
                        {isUnread && (
                          <span className="mt-1 h-[7px] w-[7px] shrink-0 rounded-full bg-[#e9b85c]" />
                        )}
                      </div>
                      <p className="mt-[3px] text-[11.5px] leading-[1.4] text-[#8b8697] line-clamp-2">
                        {sanitize(n.message)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10.5px] text-[#a09aab]">
                        <Clock className="h-[10px] w-[10px]" strokeWidth={2} />
                        {timeAgo(n.created_at)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
