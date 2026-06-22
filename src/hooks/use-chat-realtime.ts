"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getConversationMessages } from "@/actions/chats";
import type { Conversation } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";

const POLL_INTERVAL_MS = 30_000;

/** 고객 대화 Realtime — 대화 목록·메시지 갱신 */
export const useChatRealtime = ({
  storeId,
  conversationId,
  initialConversations,
  initialMessages,
  q,
  channel,
}: {
  storeId: string;
  conversationId?: string;
  initialConversations: Conversation[];
  initialMessages: MessageWithAttachments[];
  q?: string;
  channel?: string;
}) => {
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const refreshConversations = useCallback(async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from("conversations")
        .select("*")
        .eq("store_id", storeId)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (channel) query = query.eq("channel", channel);
      if (q) {
        query = query.or(
          `customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`,
        );
      }

      const { data } = await query;
      if (data) setConversations(data);
    } catch {
      // 네트워크·RLS 오류 시 기존 값 유지
    }
  }, [storeId, q, channel]);

  const refreshMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      const res = await getConversationMessages(conversationId);
      if (res.ok && res.data) setMessages(res.data);
    } catch {
      // 기존 값 유지
    }
  }, [conversationId]);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `store-chat-${storeId}-${conversationId ?? "list"}`;

    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          void refreshConversations();
        },
      );

    if (conversationId) {
      realtimeChannel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void refreshMessages();
        },
      );
    }

    realtimeChannel.subscribe();

    const pollId = window.setInterval(() => {
      void refreshConversations();
      if (conversationId) void refreshMessages();
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshConversations();
        if (conversationId) void refreshMessages();
      }
    };

    window.addEventListener("focus", refreshConversations);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener("focus", refreshConversations);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [storeId, conversationId, refreshConversations, refreshMessages]);

  return { conversations, messages };
};
