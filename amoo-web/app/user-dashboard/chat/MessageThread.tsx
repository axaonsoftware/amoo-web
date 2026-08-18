"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import type { WsHandle } from "@/lib/ws";
import type { ChatMessage } from "./ChatApp";

type ConversationMeta = {
  id: number;
  expert_name: string;
  expert_avatar: string | null;
  user_name: string;
  user_avatar: string | null;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (isSameDay(iso, today.toISOString())) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(iso, yesterday.toISOString())) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function useMessages(conversationId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const genRef = useRef(0);

  const fetch_ = useCallback(() => {
    const gen = ++genRef.current;
    setLoading(true);
    setError(null);
    setMessages([]);
    api.chat
      .getMessages(conversationId)
      .then((res: unknown) => {
        if (gen !== genRef.current) return;
        const d = res as { data?: ChatMessage[] };
        const list = Array.isArray(d?.data)
          ? d.data
          : Array.isArray(res)
            ? (res as ChatMessage[])
            : [];
        setMessages(list);
      })
      .catch((e: unknown) => {
        if (gen !== genRef.current) return;
        setError((e as Error)?.message || "Failed to load messages");
      })
      .finally(() => {
        if (gen !== genRef.current) return;
        setLoading(false);
      });
  }, [conversationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch_();
    const gen = genRef;
    return () => {
      gen.current++;
    };
  }, [fetch_]);

  return { messages, setMessages, loading, setLoading, error, setError, refetch: fetch_ };
}

export default function MessageThread({
  conversationId,
  conversation,
  myId,
  myKind,
  onBack,
  ws,
  onRegisterHandlers,
  onRegisterReadHandler,
}: {
  conversationId: number;
  conversation: ConversationMeta;
  myId: number;
  myKind: string;
  onBack: () => void;
  ws: WsHandle | null;
  onRegisterHandlers: (handler: (msg: ChatMessage) => void) => void;
  onRegisterReadHandler: (handler: (convId: number) => void) => void;
}) {
  const { messages, setMessages, loading, error, refetch } =
    useMessages(conversationId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScroll = useRef(true);

  // Mark as read via WS when conversation opens
  useEffect(() => {
    if (!ws || !conversationId) return;
    ws.send({ type: "read", conversationId });
  }, [ws, conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (shouldAutoScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = document.getElementById("chat-scroll-container");
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    shouldAutoScroll.current = atBottom;
  }, []);

  // Textarea auto-resize
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const ta = textareaRef.current;
      if (ta) {
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
      }
    },
    [],
  );

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || sending) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const clientId = uuidv4();
    const optimistic: ChatMessage = {
      id: clientId,
      conversation_id: conversationId,
      sender_type: myKind,
      sender_id: myId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      client_id: clientId,
      status: "pending",
    };
    setMessages((prev) => [...prev, optimistic]);
    shouldAutoScroll.current = true;

    if (ws) {
      ws.send({ type: "message", conversationId, content, client_id: clientId });
    } else {
      setSending(true);
      try {
        const res = (await api.chat.sendMessage(
          conversationId,
          content,
          clientId,
        )) as { id?: number } | undefined;
        const serverId = res?.id;
        if (serverId != null) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.client_id === clientId
                ? { ...msg, id: serverId, status: "sent" }
                : msg,
            ),
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.client_id === clientId
              ? { ...msg, status: "sent" }
              : msg,
          ),
        );
      } finally {
        setSending(false);
      }
    }
  }, [input, sending, conversationId, myId, myKind, ws, setMessages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Register message handler with parent (ChatApp) via ref-based callback
  useEffect(() => {
    onRegisterHandlers((msg: ChatMessage) => {
      if (msg.conversation_id === conversationId) {
        setMessages((prev) => {
          if (msg.client_id) {
            const idx = prev.findIndex(
              (m) => m.client_id === msg.client_id && m.status === "pending",
            );
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                id: msg.id,
                status: "sent",
                is_read: msg.is_read,
                created_at: msg.created_at,
              };
              shouldAutoScroll.current = true;
              return updated;
            }
          }
          if (prev.some((m) => m.id === msg.id)) return prev;
          shouldAutoScroll.current = true;
          return [...prev, msg];
        });
      }
    });
  }, [conversationId, setMessages, onRegisterHandlers]);

  // Register read handler with parent (ChatApp) via ref-based callback
  useEffect(() => {
    onRegisterReadHandler((convId: number) => {
      if (convId === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            !(m.sender_type === myKind && m.sender_id === myId)
              ? { ...m, is_read: true }
              : m,
          ),
        );
      }
    });
  }, [conversationId, myId, myKind, setMessages, onRegisterReadHandler]);

  const expertName = conversation.expert_name;
  const expertInitial = expertName?.charAt(0)?.toUpperCase() || "E";

  // Compute date separators without mutating during render
  const dateSeparators = new Map<number | string, string>();
  {
    let lastDate = "";
    for (const msg of messages) {
      const dateStr = formatDate(msg.created_at);
      if (dateStr !== lastDate) {
        lastDate = dateStr;
        dateSeparators.set(msg.id, dateStr);
      }
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Thread header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#efe6d6] bg-white px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#4a1c7d] transition-colors hover:bg-[#f3ecfb] lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>

        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
          {conversation.expert_avatar ? (
            <Image
              src={conversation.expert_avatar}
              alt={expertName}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[#4a1c7d] text-[13px] font-bold text-white">
              {expertInitial}
            </span>
          )}
        </span>

        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#2b0f47]">
            {sanitize(expertName)}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div
        id="chat-scroll-container"
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#6d28d9]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[13px] font-medium text-[#b42318]">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-3 text-[12px] font-medium text-[#6d28d9] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[13px] font-medium text-[#2b0f47]">
              No messages yet
            </p>
            <p className="mt-1 text-[12px] text-[#8b8697]">
              Send a message to start the conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine =
                msg.sender_type === myKind && msg.sender_id === myId;
              const dateLabel = dateSeparators.get(msg.id);

              return (
                <div key={msg.id}>
                  {dateLabel && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-[#efe6d6]" />
                      <span className="shrink-0 text-[11px] font-medium text-[#a09aab]">
                        {dateLabel}
                      </span>
                      <div className="h-px flex-1 bg-[#efe6d6]" />
                    </div>
                  )}
                  <div
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-[14px] px-4 py-2.5 text-[13px] leading-[1.5] ${
                        isMine
                          ? "rounded-br-[4px] bg-[#4a1c7d] text-white"
                          : "rounded-bl-[4px] bg-[#f2f1f6] text-[#2e2a46]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {sanitize(msg.content)}
                      </p>
                      <p
                        className={`mt-1 text-[10px] ${
                          isMine ? "text-white/60" : "text-[#a09aab]"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-[#efe6d6] bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-full border border-[#e7ddcb] bg-[#faf7f2] px-4 py-2.5 text-[13px] text-[#2b0f47] placeholder:text-[#a09aab] focus:border-[#6d28d9] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4a1c7d] text-white transition-colors hover:bg-[#3d1268] disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Send className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
