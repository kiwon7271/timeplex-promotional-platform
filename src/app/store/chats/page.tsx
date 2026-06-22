import { requireStoreUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { attachMessageSignedUrls, MESSAGE_SELECT } from "@/lib/chat-messages";
import { getAgreedConsentNotices, getPendingConsentNotices } from "@/lib/consent";
import { getLineWebhookUrl } from "@/lib/app-url";
import { isTranslationConfigured } from "@/lib/translate";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import StoreChatLiveLayout from "@/components/store/store-chat-live-layout";
import StoreChatConsentGate from "@/components/store/store-chat-consent-gate";
import StoreAgreedConsentPanel from "@/components/store/store-agreed-consent-panel";

import type { MessageWithAttachments } from "@/types/chat";
import type { StoreChatsPageProps } from "@/types/pages";

/** 고객 대화 — Realtime, 다국어 번역, 메신저 연결 골격 */
const StoreChats = async ({ searchParams }: StoreChatsPageProps) => {
  const profile = await requireStoreUser();
  if (!profile.store_id) {
    return (
      <>
        <PageHeader title="고객 대화" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  const supabase = createClient();
  const pendingNotices = await getPendingConsentNotices(profile.store_id);

  if (pendingNotices.length > 0) {
    return (
      <>
        <PageHeader
          title="고객 대화"
          description="외국인 고객과 실시간으로 대화합니다."
        />
        <PageBody>
          <StoreChatConsentGate notices={pendingNotices} />
        </PageBody>
      </>
    );
  }

  const { q, channel, conversation: conversationId } = searchParams;

  let convQuery = supabase
    .from("conversations")
    .select("*")
    .eq("store_id", profile.store_id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (channel) convQuery = convQuery.eq("channel", channel);
  if (q) {
    convQuery = convQuery.or(
      `customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`,
    );
  }

  const [{ data: conversations }, { data: reservationLinks }, { data: channelConnections }] =
    await Promise.all([
      convQuery,
      supabase
        .from("reservation_links")
        .select("*")
        .eq("store_id", profile.store_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("store_channel_connections")
        .select(
          "id, store_id, channel, status, external_account_id, display_name, connected_at, error_message, created_at",
        )
        .eq("store_id", profile.store_id),
    ]);

  const { data: messagesRaw } = conversationId
    ? await supabase
        .from("messages")
        .select(MESSAGE_SELECT)
        .eq("conversation_id", conversationId)
        .order("created_at")
    : { data: null };

  const messages = messagesRaw
    ? await attachMessageSignedUrls(messagesRaw as MessageWithAttachments[])
    : [];

  const agreedConsents = await getAgreedConsentNotices(profile.store_id);
  const translationEnabled = isTranslationConfigured();
  const lineWebhookUrl = getLineWebhookUrl();

  return (
    <>
      <PageHeader
        title="고객 대화"
        description="외국인 고객과 실시간으로 대화합니다."
        action={<StoreAgreedConsentPanel consents={agreedConsents} />}
      />
      <PageBody>
        <StoreChatLiveLayout
          storeId={profile.store_id}
          conversations={conversations ?? []}
          messages={messages}
          conversationId={conversationId}
          q={q}
          channel={channel}
          reservationLinks={reservationLinks ?? []}
          channelConnections={channelConnections ?? []}
          translationEnabled={translationEnabled}
          lineWebhookUrl={lineWebhookUrl}
        />
      </PageBody>
    </>
  );
};

export default StoreChats;
