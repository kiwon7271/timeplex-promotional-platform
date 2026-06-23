"use client";

import { useCallback } from "react";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { useChatRealtime } from "@/hooks/use-chat-realtime";
import { CHANNEL_LABEL_KO, CHANNELS } from "@/lib/constants";
import { getControlIconSize, ICON_SIZE, ICON_STROKE, toolbarRowClass } from "@/lib/icon-size";
import type { StoreChatLiveLayoutProps } from "@/types/store";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import IconButton from "@/components/ui/icon-button";
import ChatLogLayout from "@/components/chat/chat-log-layout";
import MessageComposer from "@/components/chat/message-composer";
import StoreChatCloseButton from "@/components/store/elements/store-chat-close-button";

/** 매장 고객 대화 — 클라이언트 전환 + Route API */
const StoreChatLiveLayout = ({
  storeId,
  conversations: initialConversations,
  messages: initialMessages,
  conversationId: initialConversationId,
  q,
  channel,
  reservationLinks,
  translationEnabled,
  listPage,
  listTotalPages,
}: StoreChatLiveLayoutProps) => {
  const buildChatUrl = useCallback(
    (params: { conversation?: string; q?: string; channel?: string }) => {
      const search = new URLSearchParams();
      const nextQ = params.q ?? q;
      const nextChannel = params.channel ?? channel;
      const nextConversation = params.conversation;

      if (nextQ) search.set("q", nextQ);
      if (nextChannel) search.set("channel", nextChannel);
      if (nextConversation) search.set("conversation", nextConversation);
      if (listPage && listPage > 1) search.set("page", String(listPage));

      const query = search.toString();
      return query ? `/store/chats?${query}` : "/store/chats";
    },
    [q, channel, listPage],
  );

  const buildConversationUrl = useCallback(
    (conversation?: string) => buildChatUrl({ conversation }),
    [buildChatUrl],
  );

  const {
    conversations,
    messages,
    activeConversationId,
    loadingMessages,
    selectConversation,
    appendOptimisticStoreMessage,
    removeOptimisticMessage,
    confirmOptimisticStoreMessage,
  } = useChatRealtime({
    storeId,
    initialConversationId,
    initialConversations,
    initialMessages,
    q,
    channel,
    buildConversationUrl,
  });

  const onSelectConversation = (id: string) => {
    selectConversation(id);
  };

  const selectedConversation = conversations.find((item) => item.id === activeConversationId);

  return (
    <ChatLogLayout
      toolbar={
        <form method="get" className={toolbarRowClass}>
          <div className="min-w-0 flex-1">
            <Field label="검색">
              <Input
                name="q"
                defaultValue={q ?? ""}
                placeholder="이름 / 전화 / 이메일"
                leadingIcon={<IconSearch size={ICON_SIZE.md} stroke={ICON_STROKE} />}
              />
            </Field>
          </div>
          <div className="w-full sm:w-40">
            <Field label="채널">
              <Select
                name="channel"
                defaultValue={channel ?? ""}
                leadingIcon={<IconFilter size={ICON_SIZE.md} stroke={ICON_STROKE} />}
                options={[
                  { value: "", label: "전체" },
                  ...CHANNELS.map((item) => ({
                    value: item,
                    label: CHANNEL_LABEL_KO[item],
                  })),
                ]}
              />
            </Field>
          </div>
          {activeConversationId ? (
            <input type="hidden" name="conversation" value={activeConversationId} />
          ) : null}
          {listPage && listPage > 1 ? (
            <input type="hidden" name="page" value={String(listPage)} />
          ) : null}
          <IconButton
            type="submit"
            variant="default"
            size="md"
            icon={<IconSearch size={getControlIconSize("md")} stroke={ICON_STROKE} />}
            aria-label="검색"
          />
        </form>
      }
      conversations={conversations}
      messages={messages}
      conversationId={activeConversationId}
      loadingMessages={loadingMessages}
      onSelectConversation={onSelectConversation}
      conversationActions={
        activeConversationId ? (
          <StoreChatCloseButton
            conversationId={activeConversationId}
            customerName={selectedConversation?.customer_name}
            redirectPath={buildChatUrl({ conversation: undefined })}
          />
        ) : undefined
      }
      composer={
        activeConversationId ? (
          <MessageComposer
            conversationId={activeConversationId}
            reservationLinks={reservationLinks}
            translationEnabled={translationEnabled}
            onOptimisticSend={appendOptimisticStoreMessage}
            onOptimisticRollback={removeOptimisticMessage}
            onConfirmSent={confirmOptimisticStoreMessage}
          />
        ) : undefined
      }
      listPage={listPage}
      listTotalPages={listTotalPages}
      listBasePath="/store/chats"
      listQuery={{
        q,
        channel,
        conversation: activeConversationId,
      }}
    />
  );
};

export default StoreChatLiveLayout;
