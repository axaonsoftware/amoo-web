"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { connectChatWebSocket, type WsHandle } from "@/lib/ws";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";

type Conversation = {
  id: number;
  user_id: number;
  expert_id: number;
  user_name: string;
  user_avatar: string | null;
  expert_name: string;
  expert_avatar: string | null;
  last_message_at: string | null;
  unread_count: number;
};

type ConversationMeta = {
  id: number;
  expert_name: string;
  expert_avatar: string | null;
  user_name: string;
  user_avatar: string | null;
};

export type ChatMessage = {
  id: number | string;
  conversation_id: number;
  sender_type: string;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  client_id?: string;
};

type AddMessageHandler = (msg: ChatMessage) => void;
type UpdateReadHandler = (convId: number) => void;

export default function ChatApp() {
  const { user } = useAuth();
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [showThread, setShowThread] = useState(false);
  const [ws, setWs] = useState<WsHandle | null>(null);
  const [unreadRefresh, setUnreadRefresh] = useState(0);
  const wsRef = useRef<WsHandle | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const startWsRef = useRef<() => void>(() => {});

  const addMessageRef = useRef<AddMessageHandler | null>(null);
  const updateReadRef = useRef<UpdateReadHandler | null>(null);

  const registerAddMessage = useCallback((handler: AddMessageHandler) => {
    addMessageRef.current = handler;
  }, []);

  const registerUpdateRead = useCallback((handler: UpdateReadHandler) => {
    updateReadRef.current = handler;
  }, []);

  const startWs = useCallback(() => {
    const handle = connectChatWebSocket({
      onOpen: () => {
        reconnectAttempts.current = 0;
      },
      message: (data: unknown) => {
        const msg = data as {
          id: number;
          conversationId: number;
          senderType: string;
          senderId: number;
          content: string;
          isRead: boolean;
          createdAt: string;
          client_id?: string;
        };
        addMessageRef.current?.({
          id: msg.id,
          conversation_id: msg.conversationId,
          sender_type: msg.senderType,
          sender_id: msg.senderId,
          content: msg.content,
          is_read: msg.isRead,
          created_at: msg.createdAt,
          client_id: msg.client_id,
        });
        setUnreadRefresh((n) => n + 1);
      },
      read: (data: unknown) => {
        const msg = data as { conversationId: number };
        updateReadRef.current?.(msg.conversationId);
        setUnreadRefresh((n) => n + 1);
      },
      error: (data: unknown) => {
        console.warn("[chat ws] server error:", data);
      },
      onClose: () => {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          30000,
        );
        reconnectAttempts.current++;
        reconnectTimer.current = setTimeout(startWsRef.current, delay);
      },
    });

    wsRef.current = handle;
    setWs(handle);
  }, []);

  useEffect(() => {
    startWsRef.current = startWs;
  });

  useEffect(() => {
    startWs();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [startWs]);

  const handleSelect = useCallback((conv: Conversation) => {
    setActiveConv(conv);
    setShowThread(true);
  }, []);

  const handleBack = useCallback(() => {
    setShowThread(false);
  }, []);

  const conversationMeta: ConversationMeta | null = activeConv
    ? {
        id: activeConv.id,
        expert_name: activeConv.expert_name,
        expert_avatar: activeConv.expert_avatar,
        user_name: activeConv.user_name,
        user_avatar: activeConv.user_avatar,
      }
    : null;

  return (
    <main
      id="main-content"
      className="flex min-h-0 flex-1 overflow-hidden rounded-[16px] border border-[#efe6d6] bg-white shadow-[0_2px_12px_rgba(43,15,71,.06)]"
      style={{ height: "calc(100vh - 140px)" }}
    >
      {/* Conversation list panel */}
      <div
        className={`w-full shrink-0 border-r border-[#efe6d6] md:w-[340px] lg:w-[320px] ${
          showThread ? "hidden lg:flex" : "flex"
        } min-h-0 flex-col`}
      >
        <ConversationList
          activeId={activeConv?.id ?? null}
          onSelect={handleSelect}
          unreadRefresh={unreadRefresh}
        />
      </div>

      {/* Message thread panel */}
      <div
        className={`min-h-0 flex-1 ${
          showThread ? "flex" : "hidden lg:flex"
        } min-w-0 flex-col`}
      >
        {conversationMeta ? (
          <MessageThread
            key={conversationMeta.id}
            conversationId={conversationMeta.id}
            conversation={conversationMeta}
            myId={user?.id ?? 0}
            myKind={user?.kind ?? "user"}
            onBack={handleBack}
            ws={ws}
            onRegisterHandlers={registerAddMessage}
            onRegisterReadHandler={registerUpdateRead}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3ecfb]">
              <svg
                className="h-8 w-8 text-[#6d28d9]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
            </div>
            <p className="mt-4 text-[15px] font-semibold text-[#2b0f47]">
              Select a conversation
            </p>
            <p className="mt-1 text-[13px] text-[#8b8697]">
              Choose an expert from the list to start chatting.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
