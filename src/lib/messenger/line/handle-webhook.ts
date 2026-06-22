import "server-only";

import {
  findOrCreateCustomerConversation,
  updateConversationCustomerName,
} from "@/lib/chat-conversation";
import { receiveCustomerMessage } from "@/lib/chat-inbound";
import {
  clearLineWebhookError,
  findLineConnectionByDestination,
  recordLineWebhookError,
} from "@/lib/messenger/line/connection-lookup";
import { fetchLineUserProfile } from "@/lib/messenger/line/fetch-profile";
import { getLineInboundBody, getLineUserId } from "@/lib/messenger/line/parse-event";
import type { LineWebhookBody } from "@/lib/messenger/line/types";

export type LineWebhookHandleResult =
  | { ok: true; processed: number; skipped: number }
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
    return {
      ok: false,
      message: connection.message,
      reason: connection.reason,
    };
  }

  const events = payload.events ?? [];
  if (events.length === 0) {
    await clearLineWebhookError(destination);
    return { ok: true, processed: 0, skipped: 0 };
  }

  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const event of events) {
    const lineUserId = getLineUserId(event);
    if (!lineUserId) {
      skipped += 1;
      continue;
    }

    const parsed = getLineInboundBody(event);
    if (!parsed) {
      skipped += 1;
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

    const profile = await fetchLineUserProfile(
      lineUserId,
      connection.credentials.channel_access_token,
    );

    if (profile?.displayName) {
      await updateConversationCustomerName(
        conversationResult.conversationId,
        profile.displayName,
      );
    }

    const messageResult = await receiveCustomerMessage({
      conversationId: conversationResult.conversationId,
      body: parsed.body,
      externalMessageId: parsed.externalMessageId,
    });

    if (!messageResult.ok) {
      errors.push(messageResult.message);
      console.error("[LINE webhook] message save failed:", messageResult.message);
      continue;
    }

    if (!messageResult.duplicate) {
      processed += 1;
    }
  }

  if (errors.length > 0) {
    const summary = errors[0]!;
    await recordLineWebhookError(destination, summary);
    return { ok: false, message: summary, reason: "PROCESS_ERROR" };
  }

  await clearLineWebhookError(destination);
  return { ok: true, processed, skipped };
};

/** Webhook 서명 검증용 channel secret */
export const getLineChannelSecretByDestination = async (destination: string) => {
  const connection = await findLineConnectionByDestination(destination);
  if (!connection.ok) return null;
  return connection.channelSecret;
};
