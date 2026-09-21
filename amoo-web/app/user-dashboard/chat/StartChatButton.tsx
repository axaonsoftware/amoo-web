"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Props = {
  expertId?: number;
  userId?: number;
  variant?: "primary" | "secondary" | "icon";
  className?: string;
};

export default function StartChatButton({
  expertId,
  userId,
  className = "",
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let conversationId: number | null = null;

      if (user.kind === "expert") {
        if (!userId) {
          throw new Error("User ID is required.");
        }

        const response = await api.chat.getConversations();

        const conversations = Array.isArray(response)
          ? response
          : (response?.data ?? []);

        const conversation = conversations.find(
          (item: any) =>
            Number(item.user_id) === Number(userId) &&
            Number(item.expert_id) === Number(user.id),
        );

        if (!conversation?.id) {
          throw new Error("Conversation not found.");
        }

        conversationId = conversation.id;
      } else {
        if (!expertId) {
          throw new Error("Expert ID is required.");
        }

        const conversation = await api.chat.openConversation(expertId);

        if (!conversation?.id) {
          throw new Error("Conversation could not be opened.");
        }

        conversationId = conversation.id;
      }

      router.push(`/user-dashboard/chat?conversationId=${conversationId}`);
    } catch (error) {
      console.error("Start chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleStartChat}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      {loading ? "Opening Chat..." : "Chat"}
    </button>
  );
}
