"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import type { Conversation } from "@/lib/types";
import { EmptyState, ErrorState } from "@/app/components/states";
import StartChatButton from "./StartChatButton";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function useConversations(refreshKey: number) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const genRef = useRef(0);

  const fetch_ = useCallback(() => {
    const gen = ++genRef.current;
    setLoading(true);
    setError(null);
    api.chat
      .getConversations()
      .then((res: unknown) => {
        if (gen !== genRef.current) return;
        const d = res as { data?: Conversation[] };
        const list = Array.isArray(d?.data)
          ? d.data
          : Array.isArray(res)
            ? (res as Conversation[])
            : [];
        setConversations(list);
      })
      .catch((e: unknown) => {
        if (gen !== genRef.current) return;
        setError((e as Error)?.message || "Failed to load conversations");
      })
      .finally(() => {
        if (gen !== genRef.current) return;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch_();
    const gen = genRef;
    return () => {
      gen.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return { conversations, loading, error, refetch: fetch_ };
}

export default function ConversationList({
  activeId,
  onSelect,
  unreadRefresh,
}: {
  activeId: number | null;
  onSelect: (conv: Conversation) => void;
  unreadRefresh?: number;
}) {
  const { conversations, loading, error, refetch } =
    useConversations(unreadRefresh ?? 0);
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.expert_name.toLowerCase().includes(q) ||
      c.user_name.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-[12px] p-3">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[#f0eaf8]" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-24 animate-pulse rounded bg-[#f0eaf8]" />
              <div className="mt-2 h-2.5 w-36 animate-pulse rounded bg-[#f0eaf8]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorState message={error} onRetry={refetch} tone="dashboard" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Search */}
      <div className="shrink-0 border-b border-[#efe6d6] px-4 pt-3 pb-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a09aab]"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-full border border-[#e7ddcb] bg-white pl-10 pr-4 text-[13px] text-[#2b0f47] placeholder:text-[#a09aab] focus:border-[#6d28d9] focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            title="No conversations yet"
            message="Start a chat with an expert to see your conversations here."
            icon={<MessageSquare className="h-6 w-6" strokeWidth={1.8} />}
            tone="dashboard"
            action={<StartChatButton variant="primary" />}
          />
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv)}
                className={`flex w-full items-center gap-3 border-b border-[#f4f1f8] px-4 py-3 text-left transition-colors hover:bg-[#faf7f2] ${
                  isActive ? "bg-[#f3ecfb]" : ""
                }`}
              >
                {/* Expert avatar */}
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                  {conv.expert_avatar ? (
                    <Image
                      src={conv.expert_avatar}
                      alt={conv.expert_name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-[#4a1c7d] text-[14px] font-bold text-white">
                      {conv.expert_name?.charAt(0)?.toUpperCase() || "E"}
                    </span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13.5px] font-semibold text-[#2b0f47]">
                      {sanitize(conv.expert_name)}
                    </p>
                    <span className="shrink-0 text-[11px] text-[#a09aab]">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] text-[#8b8697]">
                      {conv.last_message_at
                        ? "Tap to open"
                        : "No messages yet"}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#e9b85c] px-1.5 text-[10px] font-bold text-[#2a1148]">
                        {conv.unread_count > 99 ? "99+" : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
