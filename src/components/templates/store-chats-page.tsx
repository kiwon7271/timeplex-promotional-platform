"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useStoreSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import StoreChatLiveLayout from "@/components/store/store-chat-live-layout";
import StoreChatConsentGate from "@/components/store/store-chat-consent-gate";
import StoreAgreedConsentPanel from "@/components/store/store-agreed-consent-panel";
import StoreChannelConnectModal from "@/components/store/store-channel-connect-modal";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { ConsentNotice, Conversation, ReservationLink } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";
import type { LineConnectionDiagnostic } from "@/types/store";

type ConsentBootstrap = { mode: "consent"; pendingNotices: ConsentNotice[] };

type ChatBootstrap = {
  mode: "chat";
  storeId: string;
  conversations: Conversation[];
  messages: MessageWithAttachments[];
  conversationId?: string;
  q?: string;
  channel?: string;
  reservationLinks: ReservationLink[];
  channelConnections: unknown[];
  agreedConsents: unknown[];
  translationEnabled: boolean;
  lineWebhookUrl: string;
  lineDiagnostic: LineConnectionDiagnostic;
  listPage: number;
  listTotalPages: number;
};

type ChatsData = ConsentBootstrap | ChatBootstrap;

/** 고객 대화 — CSR */
const StoreChatsPage = () => {
  const { ready, storeId } = useStoreSession();
  const searchParams = useSearchParams();

  const queryPath = useMemo(() => {
    if (!ready) return null;
    const params = new URLSearchParams();
    for (const key of ["q", "channel", "conversation", "page"] as const) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return `/api/store/chats/bootstrap${qs ? `?${qs}` : ""}`;
  }, [ready, searchParams]);

  const { data, loading, refresh } = useApiQuery<ChatsData>(queryPath, ready);

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="고객 대화" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  if (!storeId) {
    return (
      <>
        <PageHeader title="고객 대화" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  if (data?.mode === "consent") {
    return (
      <>
        <PageHeader title="고객 대화" description="외국인 고객과 실시간으로 대화합니다." />
        <PageBody>
          <StoreChatConsentGate notices={data.pendingNotices} onMutated={refresh} />
        </PageBody>
      </>
    );
  }

  if (data?.mode !== "chat") return null;

  return (
    <>
      <PageHeader
        title="고객 대화"
        description="외국인 고객과 실시간으로 대화합니다."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StoreChannelConnectModal
              connections={data.channelConnections as never}
              lineWebhookUrl={data.lineWebhookUrl}
              lineDiagnostic={data.lineDiagnostic}
              translationEnabled={data.translationEnabled}
              onMutated={refresh}
            />
            <StoreAgreedConsentPanel consents={data.agreedConsents as never} />
          </div>
        }
      />
      <PageBody>
        <StoreChatLiveLayout
          storeId={data.storeId}
          conversations={data.conversations}
          messages={data.messages}
          conversationId={data.conversationId}
          q={data.q}
          channel={data.channel}
          reservationLinks={data.reservationLinks}
          translationEnabled={data.translationEnabled}
          listPage={data.listPage}
          listTotalPages={data.listTotalPages}
        />
      </PageBody>
    </>
  );
};

export default StoreChatsPage;
