"use client";

import { useRouter } from "next/navigation";
import type { AdminChatLogLayoutProps } from "@/types/admin";
import Field from "@/components/ui/field";
import SearchableSelect from "@/components/ui/searchable-select";
import ChatLogLayout from "@/components/chat/chat-log-layout";

/** 통합관리자 대화 로그 — 매장 선택 + 읽기 전용 */
const AdminChatLogLayout = ({
  stores,
  conversations,
  messages,
  storeId,
  conversationId,
}: AdminChatLogLayoutProps) => {
  const router = useRouter();

  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));

  const onChangeStore = (nextStoreId: string) => {
    router.push(`/admin/chats?store=${nextStoreId}`);
  };

  const onSelectConversation = (id: string) => {
    if (!storeId) return;
    router.push(`/admin/chats?store=${storeId}&conversation=${id}`);
  };

  return (
    <ChatLogLayout
      toolbar={
        <Field label="매장">
          <SearchableSelect
            options={storeOptions}
            value={storeId}
            onChange={onChangeStore}
            placeholder="매장을 선택하세요"
            searchPlaceholder="매장명 검색"
            emptyMessage="매장을 찾을 수 없습니다."
            className="max-w-md"
          />
        </Field>
      }
      conversations={conversations}
      messages={messages}
      conversationId={conversationId}
      onSelectConversation={onSelectConversation}
      listPlaceholder={storeId ? undefined : "매장을 선택하세요."}
    />
  );
};

export default AdminChatLogLayout;
