"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import AdminChatLogLayout from "@/components/admin/admin-chat-log-layout";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { Conversation, Store } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";

type ChatsData = {
  stores: Pick<Store, "id" | "name">[];
  conversations: Conversation[];
  messages: MessageWithAttachments[];
  storeId?: string;
  conversationId?: string;
  listPage: number;
  listTotalPages: number;
};

/** 대화 로그 — CSR */
const AdminChatsPage = () => {
  const { ready } = useAdminSession();
  const searchParams = useSearchParams();

  const queryPath = useMemo(() => {
    if (!ready) return null;
    const params = new URLSearchParams();
    for (const key of ["store", "conversation", "page"] as const) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return `/api/admin/chats${qs ? `?${qs}` : ""}`;
  }, [ready, searchParams]);

  const { data, loading } = useApiQuery<ChatsData>(queryPath, ready);

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="대화 로그" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader title="대화 로그" description="매장 대화 조회 (읽기 전용)" />
      <PageBody>
        <AdminChatLogLayout
          stores={data?.stores ?? []}
          conversations={data?.conversations ?? []}
          messages={data?.messages ?? []}
          storeId={data?.storeId}
          conversationId={data?.conversationId}
          listPage={data?.listPage}
          listTotalPages={data?.listTotalPages}
        />
      </PageBody>
    </>
  );
};

export default AdminChatsPage;
