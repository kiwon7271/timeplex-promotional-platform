import "server-only";

import {
  findOrCreateCustomerConversation,
  updateConversationCustomerName,
} from "@/lib/chat-conversation";
import { receiveCustomerMessage } from "@/lib/chat-inbound";
import {
  clearLineWebhookError,
  findLineConnectionByDestination,
  recordLineWebhookActivity,
} from "@/lib/messenger/line/connection-lookup";
import { fetchLineUserProfile } from "@/lib/messenger/line/fetch-profile";
import { getLineInboundBody, getLineUserId } from "@/lib/messenger/line/parse-event";
import type { LineWebhookBody } from "@/lib/messenger/line/types";

export type LineWebhookHandleResult =
  | { ok: true; processed: number; skipped: number; skipReasons: string[] }
  | { ok: false; message: string; reason?: string };

/** LINE Webhook 이벤트 처리 */
export const handleLineWebhook = async (
  payload: LineWebhookBody,
): Promise<LineWebhookHandleResult> => {
  const destination = payload.destination?.trim();
  if (!destination) {
    return { ok: false, message: "destination 없음" };
  }

  const connection = await findLineConnectionByDestination(destination);
  if (!connection.ok) {
    console.error("[LINE webhook] connection lookup failed:", connection.reason, connection.message);
    await recordLineWebhookActivity(
      destination,
      `연결 조회 실패: ${connection.message}`,
      true,
    );
    return {
      ok: false,
      message: connection.message,
      reason: connection.reason,
    };
  }

  const events = payload.events ?? [];
  if (events.length === 0) {
    await clearLineWebhookError(destination);
    await recordLineWebhookActivity(destination, "Verify 수신 (events 없음)", false);
    return { ok: true, processed: 0, skipped: 0, skipReasons: [] };
  }

  let processed = 0;
  let skipped = 0;
  const skipReasons: string[] = [];
  const errors: string[] = [];

  for (const event of events) {
    const lineUserId = getLineUserId(event);
    if (!lineUserId) {
      skipped += 1;
      skipReasons.push(`type=${event.type} (1:1 user 아님)`);
      continue;
    }

    const parsed = getLineInboundBody(event);
    if (!parsed) {
      skipped += 1;
      skipReasons.push(`type=${event.type} (처리 불가 이벤트)`);
      continue;
    }

    const conversationResult = await findOrCreateCustomerConversation({
      storeId: connection.storeId,
      channel: "LINE",
      externalThreadId: lineUserId,
    });

    if (!conversationResult.ok) {
      errors.push(conversationResult.message);
      console.error("[LINE webhook] conversation create failed:", conversationResult.message);
      continue;
    }

    const messageResult = await receiveCustomerMessage({
      conversationId: conversationResult.conversationId,
      body: parsed.body,
      externalMessageId: parsed.externalMessageId,
      skipTranslation: true,
    });

    if (!messageResult.ok) {
      errors.push(messageResult.message);
      console.error("[LINE webhook] message save failed:", messageResult.message);
      continue;
    }

    if (!messageResult.duplicate) {
      processed += 1;
    }

    // 프로필 조회는 메시지 저장 후 — Webhook 지연 방지
    void fetchLineUserProfile(lineUserId, connection.credentials.channel_access_token).then(
      (profile) => {
        if (profile?.displayName) {
          void updateConversationCustomerName(
            conversationResult.conversationId,
            profile.displayName,
          );
        }
      },
    );
  }

  const summary = errors.length
    ? `오류: ${errors[0]} (processed=${processed}, skipped=${skipped})`
    : `processed=${processed}, skipped=${skipped}${skipReasons.length ? ` (${skipReasons.join(", ")})` : ""}`;

  await recordLineWebhookActivity(destination, summary, errors.length > 0);

  if (errors.length > 0) {
    return { ok: false, message: errors[0]!, reason: "PROCESS_ERROR" };
  }

  await clearLineWebhookError(destination);
  return { ok: true, processed, skipped, skipReasons };
};

/** Webhook 서명 검증용 channel secret */
export const getLineChannelSecretByDestination = async (destination: string) => {
  const connection = await findLineConnectionByDestination(destination);
  if (!connection.ok) return null;
  return connection.channelSecret;
};
