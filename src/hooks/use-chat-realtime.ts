"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchConversationMessagesClient } from "@/lib/chat-messages-client";
import type { Conversation } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";

/** Realtime 보조 — 구독 누락 시만 */
const POLL_INTERVAL_MS = 15_000;

const toRealtimeMessage = (row: Record<string, unknown>): MessageWithAttachments => ({
  id: String(row.id ?? ""),
  conversation_id: String(row.conversation_id ?? ""),
  sender: String(row.sender ?? "CUSTOMER"),
  body: String(row.body ?? ""),
  translated_body: row.translated_body ? String(row.translated_body) : null,
  external_message_id: row.external_message_id ? String(row.external_message_id) : null,
  created_at: String(row.created_at ?? new Date().toISOString()),
});

/** 고객 대화 Realtime — 즉시 반영 + Supabase 직접 조회 */
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
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

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
      // 기존 값 유지
    }
  }, [storeId, q, channel]);

  const refreshMessages = useCallback(async (targetConversationId?: string) => {
    const activeId = targetConversationId ?? conversationIdRef.current;
    if (!activeId) return;

    try {
      const data = await fetchConversationMessagesClient(activeId);
      if (activeId === conversationIdRef.current) {
        setMessages(data);
      }
    } catch {
      // 기존 값 유지
    }
  }, []);

  const appendMessageIfActive = useCallback((row: Record<string, unknown>) => {
    const activeId = conversationIdRef.current;
    const newConversationId = String(row.conversation_id ?? "");
    if (!activeId || newConversationId !== activeId) return;

    const incoming = toRealtimeMessage(row);
    setMessages((prev) => {
      if (prev.some((item) => item.id === incoming.id)) return prev;
      // Realtime 수신 — 낙관적(pending) 메시지 제거
      const withoutPending = prev.filter((item) => !item.id.startsWith("pending-"));
      return [...withoutPending, incoming];
    });
  }, []);

  const appendOptimisticStoreMessage = useCallback((body: string) => {
    const activeId = conversationIdRef.current;
    const tempId = `pending-${Date.now()}`;
    if (!activeId) return tempId;

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: activeId,
        sender: "STORE",
        body,
        translated_body: null,
        external_message_id: null,
        created_at: new Date().toISOString(),
      },
    ]);

    return tempId;
  }, []);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setMessages((prev) => prev.filter((item) => item.id !== tempId));
  }, []);

  const patchMessageIfActive = useCallback((row: Record<string, unknown>) => {
    const activeId = conversationIdRef.current;
    const newConversationId = String(row.conversation_id ?? "");
    if (!activeId || newConversationId !== activeId) return;

    const incoming = toRealtimeMessage(row);
    setMessages((prev) => {
      const index = prev.findIndex((item) => item.id === incoming.id);
      if (index === -1) return prev;
      const next = [...prev];
      next[index] = { ...next[index], ...incoming };
      return next;
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `store-chat-${storeId}`;

    const onMessageInsert = (payload: { new: Record<string, unknown> }) => {
      const sender = String(payload.new.sender ?? "");
      // 매장 발신(첨부·링크) — Realtime row만으로는 관계 데이터 없음 → refetch
      if (sender === "STORE") {
        void refreshMessages();
      } else {
        appendMessageIfActive(payload.new);
      }
      void refreshConversations();
    };

    const onMessageUpdate = (payload: { new: Record<string, unknown> }) => {
      patchMessageIfActive(payload.new);
      void refreshConversations();
    };

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
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        onMessageInsert,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        onMessageUpdate,
      )
      .subscribe();

    const pollId = window.setInterval(() => {
      void refreshConversations();
      void refreshMessages();
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshConversations();
        void refreshMessages();
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
  }, [storeId, appendMessageIfActive, patchMessageIfActive, refreshConversations, refreshMessages]);

  return {
    conversations,
    messages,
    refreshMessages,
    refreshConversations,
    appendOptimisticStoreMessage,
    removeOptimisticMessage,
  };
};
