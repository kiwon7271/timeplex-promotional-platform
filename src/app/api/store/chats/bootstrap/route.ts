import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { attachMessageSignedUrls, MESSAGE_SELECT } from "@/lib/chat-messages";
import {
  CONVERSATION_COLUMNS,
  RESERVATION_LINK_COLUMNS,
} from "@/lib/supabase/query-columns";
import {
  getConversationListRange,
  getConversationTotalPages,
  parseConversationPage,
} from "@/lib/conversation-list";
import { getAgreedConsentNotices, getPendingConsentNotices } from "@/lib/consent";
import { getLineWebhookUrl } from "@/lib/app-url";
import { getLineConnectionDiagnostic } from "@/lib/messenger/line/connection-lookup";
import { isTranslationConfigured } from "@/lib/translate";
import type { MessageWithAttachments } from "@/types/chat";

export const runtime = "nodejs";

/** GET — 고객 대화 페이지 초기 데이터 */
export async function GET(request: Request) {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const storeId = auth.profile.store_id!;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const channel = searchParams.get("channel") ?? undefined;
  const conversationId = searchParams.get("conversation") ?? undefined;
  const page = parseConversationPage(searchParams.get("page") ?? undefined);

  const supabase = createClient();
  const pendingNotices = await getPendingConsentNotices(storeId);

  if (pendingNotices.length > 0) {
    return NextResponse.json({
      ok: true,
      data: { mode: "consent" as const, pendingNotices },
    });
  }

  let countQuery = supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId);

  if (channel) countQuery = countQuery.eq("channel", channel);
  if (q) {
    countQuery = countQuery.or(
      `customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`,
    );
  }

  const { count } = await countQuery;
  const total = count ?? 0;
  const totalPages = getConversationTotalPages(total);
  const safePage = Math.min(page, totalPages);
  const { from, to } = getConversationListRange(safePage);

  let convQuery = supabase
    .from("conversations")
    .select(CONVERSATION_COLUMNS)
    .eq("store_id", storeId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .range(from, to);

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
        .select(RESERVATION_LINK_COLUMNS)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("store_channel_connections")
        .select(
          "id, store_id, channel, status, external_account_id, display_name, connected_at, error_message, created_at",
        )
        .eq("store_id", storeId),
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

  const agreedConsents = await getAgreedConsentNotices(storeId);

  return NextResponse.json({
    ok: true,
    data: {
      mode: "chat" as const,
      storeId,
      conversations: conversations ?? [],
      messages,
      conversationId,
      q,
      channel,
      reservationLinks: reservationLinks ?? [],
      channelConnections: channelConnections ?? [],
      agreedConsents,
      translationEnabled: isTranslationConfigured(),
      lineWebhookUrl: getLineWebhookUrl(),
      lineDiagnostic: await getLineConnectionDiagnostic(storeId),
      listPage: safePage,
      listTotalPages: totalPages,
    },
  });
}
