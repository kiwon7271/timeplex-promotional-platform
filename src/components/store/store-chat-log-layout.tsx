"use client";

import { useRouter } from "next/navigation";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { CHANNELS } from "@/lib/constants";
import { getControlIconSize, ICON_SIZE, ICON_STROKE, toolbarRowClass } from "@/lib/icon-size";
import type { StoreChatLogLayoutProps } from "@/types/store";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import IconButton from "@/components/ui/icon-button";
import ChatLogLayout from "@/components/chat/chat-log-layout";
import MessageComposer from "@/components/chat/message-composer";

/** 매장관리자 고객 대화 — 검색/필터 + 입력 */
const StoreChatLogLayout = ({
  conversations,
  messages,
  conversationId,
  q,
  channel,
  reservationLinks,
}: StoreChatLogLayoutProps) => {
  const router = useRouter();

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
                options={[{ value: "", label: "전체" }, ...CHANNELS.map((c) => ({ value: c, label: c }))]}
              />
            </Field>
          </div>
          {conversationId ? <input type="hidden" name="conversation" value={conversationId} /> : null}
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
      composer={
        conversationId ? (
          <MessageComposer conversationId={conversationId} reservationLinks={reservationLinks} />
        ) : undefined
      }
    />
  );
};

export default StoreChatLogLayout;
