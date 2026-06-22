"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { onBackfillConversationTranslations, onSyncLineCustomerProfile } from "@/actions/chats";
import { CHANNEL_LABEL_KO, CHANNELS } from "@/lib/constants";
import { getControlIconSize, ICON_SIZE, ICON_STROKE, toolbarRowClass } from "@/lib/icon-size";
import { useChatRealtime } from "@/hooks/use-chat-realtime";
import type { StoreChatLiveLayoutProps } from "@/types/store";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import IconButton from "@/components/ui/icon-button";
import ChatLogLayout from "@/components/chat/chat-log-layout";
import MessageComposer from "@/components/chat/message-composer";
import StoreChatCloseButton from "@/components/store/elements/store-chat-close-button";

/** 매장 고객 대화 — Realtime + 채팅 UI */
const StoreChatLiveLayout = ({
  storeId,
  conversations: initialConversations,
  messages: initialMessages,
  conversationId,
  q,
  channel,
  reservationLinks,
  translationEnabled,
}: StoreChatLiveLayoutProps) => {
  const router = useRouter();

  const {
    conversations,
    messages,
    refreshMessages,
    refreshConversations,
    appendOptimisticStoreMessage,
    removeOptimisticMessage,
  } = useChatRealtime({
    storeId,
    conversationId,
    initialConversations,
    initialMessages,
    q,
    channel,
  });

  const buildChatUrl = (params: { conversation?: string; q?: string; channel?: string }) => {
    const search = new URLSearchParams();
    const nextQ = params.q ?? q;
    const nextChannel = params.channel ?? channel;
    const nextConversation = params.conversation;

    if (nextQ) search.set("q", nextQ);
    if (nextChannel) search.set("channel", nextChannel);
    if (nextConversation) search.set("conversation", nextConversation);

    const query = search.toString();
    return query ? `/store/chats?${query}` : "/store/chats";
  };

  const onSelectConversation = (id: string) => {
    router.push(buildChatUrl({ conversation: id }));
  };

  const selectedConversation = conversations.find((item) => item.id === conversationId);

  // 번역·LINE 프로필 누락 보강
  useEffect(() => {
    if (!conversationId) return;

    void Promise.all([
      onBackfillConversationTranslations(conversationId),
      onSyncLineCustomerProfile(conversationId),
    ]).then(() => {
      void refreshMessages();
      void refreshConversations();
    });
  }, [conversationId, refreshMessages, refreshConversations]);

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
            {conversationId ? (
              <input type="hidden" name="conversation" value={conversationId} />
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
        conversationId={conversationId}
        onSelectConversation={onSelectConversation}
        conversationActions={
          conversationId ? (
            <StoreChatCloseButton
              conversationId={conversationId}
              customerName={selectedConversation?.customer_name}
              redirectPath={buildChatUrl({ conversation: undefined })}
            />
          ) : undefined
        }
        composer={
          conversationId ? (
            <MessageComposer
              conversationId={conversationId}
              reservationLinks={reservationLinks}
              translationEnabled={translationEnabled}
              onOptimisticSend={appendOptimisticStoreMessage}
              onOptimisticRollback={removeOptimisticMessage}
              onSentMessage={() => void refreshMessages()}
            />
          ) : undefined
        }
      />
  );
};

export default StoreChatLiveLayout;
