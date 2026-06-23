"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchChatMessagesApi,
  openChatConversationSessionApi,
} from "@/lib/chat-api-client";
import { CONVERSATION_COLUMNS } from "@/lib/supabase/query-columns";
import type { Conversation } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";

/** Realtime 보조 — 연결 중에는 폴링 최소화 */
const POLL_INTERVAL_MS = 60_000;

const toRealtimeMessage = (row: Record<string, unknown>): MessageWithAttachments => ({
  id: String(row.id ?? ""),
  conversation_id: String(row.conversation_id ?? ""),
  sender: String(row.sender ?? "CUSTOMER"),
  body: String(row.body ?? ""),
  translated_body: row.translated_body ? String(row.translated_body) : null,
  external_message_id: row.external_message_id ? String(row.external_message_id) : null,
  delivery_status: row.delivery_status
    ? (String(row.delivery_status) as MessageWithAttachments["delivery_status"])
    : null,
  delivered_at: row.delivered_at ? String(row.delivered_at) : null,
  failed_reason: row.failed_reason ? String(row.failed_reason) : null,
  metadata: null,
  created_at: String(row.created_at ?? new Date().toISOString()),
});

/** 고객 대화 — 클라이언트 전환 + Realtime */
export const useChatRealtime = ({
  storeId,
  initialConversationId,
  initialConversations,
  initialMessages,
  q,
  channel,
  buildConversationUrl,
}: {
  storeId: string;
  initialConversationId?: string;
  initialConversations: Conversation[];
  initialMessages: MessageWithAttachments[];
  q?: string;
  channel?: string;
  buildConversationUrl: (conversationId?: string) => string;
}) => {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const conversationIdRef = useRef(initialConversationId);
  const messagesCacheRef = useRef<Record<string, MessageWithAttachments[]>>({});
  const storeRefreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialConversationId && initialMessages.length > 0) {
      messagesCacheRef.current[initialConversationId] = initialMessages;
    }
    if (initialConversationId) {
      openChatConversationSessionApi(initialConversationId);
    }
  }, [initialConversationId, initialMessages]);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const refreshConversations = useCallback(async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from("conversations")
        .select(CONVERSATION_COLUMNS)
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

  const loadMessages = useCallback(async (targetConversationId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);

    try {
      const cached = messagesCacheRef.current[targetConversationId];
      if (cached && conversationIdRef.current === targetConversationId) {
        setMessages(cached);
      }

      const data = await fetchChatMessagesApi(targetConversationId);
      if (data.length > 0 || !messagesCacheRef.current[targetConversationId]?.length) {
        messagesCacheRef.current[targetConversationId] = data;
        if (conversationIdRef.current === targetConversationId) {
          setMessages(data);
        }
      }
    } catch {
      // 기존 값 유지
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  const selectConversation = useCallback(
    (id: string) => {
      if (conversationIdRef.current === id) return;

      conversationIdRef.current = id;
      setActiveConversationId(id);

      window.history.replaceState(null, "", buildConversationUrl(id));

      const cached = messagesCacheRef.current[id];
      setMessages(cached ?? []);
      setLoadingMessages(!cached);

      openChatConversationSessionApi(id);
      void loadMessages(id, !!cached);
    },
    [buildConversationUrl, loadMessages],
  );

  const appendMessageIfActive = useCallback((row: Record<string, unknown>) => {
    const activeId = conversationIdRef.current;
    const newConversationId = String(row.conversation_id ?? "");
    if (!activeId || newConversationId !== activeId) return;

    const incoming = toRealtimeMessage(row);
    setMessages((prev) => {
      if (prev.some((item) => item.id === incoming.id)) return prev;
      const withoutPending = prev.filter((item) => !item.id.startsWith("pending-"));
      const next = [...withoutPending, incoming];
      messagesCacheRef.current[activeId] = next;
      return next;
    });
  }, []);

  const appendOptimisticStoreMessage = useCallback((body: string) => {
    const activeId = conversationIdRef.current;
    const tempId = `pending-${Date.now()}`;
    if (!activeId) return tempId;

    setMessages((prev) => {
      const next: MessageWithAttachments[] = [
        ...prev,
        {
          id: tempId,
          conversation_id: activeId,
          sender: "STORE",
          body,
          translated_body: null,
          external_message_id: null,
          delivery_status: "PENDING",
          delivered_at: null,
          failed_reason: null,
          metadata: null,
          created_at: new Date().toISOString(),
        },
      ];
      messagesCacheRef.current[activeId] = next;
      return next;
    });

    return tempId;
  }, []);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    const activeId = conversationIdRef.current;
    setMessages((prev) => {
      const next = prev.filter((item) => item.id !== tempId);
      if (activeId) messagesCacheRef.current[activeId] = next;
      return next;
    });
  }, []);

  const confirmOptimisticStoreMessage = useCallback(
    (tempId: string, message: MessageWithAttachments) => {
      const activeId = conversationIdRef.current;
      setMessages((prev) => {
        const next = [
          ...prev.filter(
            (item) => item.id !== message.id && (tempId ? item.id !== tempId : true),
          ),
          message,
        ];
        if (activeId) messagesCacheRef.current[activeId] = next;
        return next;
      });
      void refreshConversations();
    },
    [refreshConversations],
  );

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
      messagesCacheRef.current[activeId] = next;
      return next;
    });
  }, []);

  const scheduleStoreMessageRefresh = useCallback(() => {
    const activeId = conversationIdRef.current;
    if (!activeId) return;

    if (storeRefreshTimerRef.current) window.clearTimeout(storeRefreshTimerRef.current);
    storeRefreshTimerRef.current = window.setTimeout(() => {
      void loadMessages(activeId, true);
      storeRefreshTimerRef.current = null;
    }, 400);
  }, [loadMessages]);

  // 대화 목록 Realtime
  useEffect(() => {
    const supabase = createClient();
    const channelName = `store-conversations-${storeId}`;

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
      .subscribe();

    const pollId = window.setInterval(() => {
      void refreshConversations();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(pollId);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [storeId, refreshConversations]);

  // 메시지 Realtime — activeConversationId 기준
  useEffect(() => {
    if (!activeConversationId) return;

    const supabase = createClient();
    const channelName = `store-messages-${activeConversationId}`;

    const onMessageInsert = (payload: { new: Record<string, unknown> }) => {
      const sender = String(payload.new.sender ?? "");
      if (sender === "STORE") {
        appendMessageIfActive(payload.new);
        scheduleStoreMessageRefresh();
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
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        onMessageInsert,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        onMessageUpdate,
      )
      .subscribe();

    return () => {
      if (storeRefreshTimerRef.current) {
        window.clearTimeout(storeRefreshTimerRef.current);
        storeRefreshTimerRef.current = null;
      }
      void supabase.removeChannel(realtimeChannel);
    };
  }, [
    activeConversationId,
    appendMessageIfActive,
    patchMessageIfActive,
    refreshConversations,
    scheduleStoreMessageRefresh,
  ]);

  return {
    conversations,
    messages,
    activeConversationId,
    loadingMessages,
    selectConversation,
    refreshConversations,
    appendOptimisticStoreMessage,
    removeOptimisticMessage,
    confirmOptimisticStoreMessage,
  };
};
