import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { parseLineCredentials } from "@/lib/messenger/line/credentials";
import type { LineChannelCredentials } from "@/lib/messenger/line/types";
import { verifyLineSignature } from "@/lib/messenger/line/verify-signature";

export type LineConnectionLookupResult =
  | {
      ok: true;
      storeId: string;
      channelSecret: string;
      credentials: LineChannelCredentials;
      displayName: string | null;
    }
  | {
      ok: false;
      reason: "NOT_FOUND" | "NOT_CONNECTED" | "MISSING_CREDENTIALS" | "DB_ERROR";
      message: string;
    };

type LineConnectionRow = {
  store_id: string;
  credentials: unknown;
  display_name: string | null;
  status: string;
  external_account_id: string | null;
};

const toConnectionResult = (
  data: LineConnectionRow,
): LineConnectionLookupResult => {
  if (data.status !== "CONNECTED") {
    return {
      ok: false,
      reason: "NOT_CONNECTED",
      message: `LINE 연결 상태가 ${data.status}입니다. 다시 연결해 주세요.`,
    };
  }

  const credentials = parseLineCredentials(data.credentials);
  if (!credentials) {
    return {
      ok: false,
      reason: "MISSING_CREDENTIALS",
      message:
        "LINE Secret/Token이 저장되어 있지 않습니다. 「연결 정보 수정」에서 세 값을 다시 입력하고 저장하세요.",
    };
  }

  return {
    ok: true,
    storeId: data.store_id,
    channelSecret: credentials.channel_secret,
    credentials,
    displayName: data.display_name,
  };
};

/** Channel ID(destination) 자동 보정 — Verify 시 Secret은 맞고 ID만 틀린 경우 */
const bindLineDestinationIfNeeded = async (
  storeId: string,
  destination: string,
  currentExternalId: string | null,
) => {
  if (currentExternalId === destination) return;

  const supabase = createServiceClient();
  await supabase
    .from("store_channel_connections")
    .update({
      external_account_id: destination,
      status: "CONNECTED",
      error_message: null,
    })
    .eq("store_id", storeId)
    .eq("channel", "LINE");

  console.info(
    "[LINE webhook] auto-bound destination=%s for store=%s (was %s)",
    destination,
    storeId,
    currentExternalId ?? "null",
  );
};

/** 서명으로 매장 LINE 연결 찾기 — Channel ID 불일치 시 Verify·초기 연결용 */
const findLineConnectionBySignature = async (
  rawBody: string,
  signature: string | null,
  destination: string,
) => {
  if (!signature?.trim()) return null;

  const supabase = createServiceClient();
  const { data: rows, error } = await supabase
    .from("store_channel_connections")
    .select("store_id, credentials, display_name, status, external_account_id")
    .eq("channel", "LINE")
    .eq("status", "CONNECTED");

  if (error || !rows?.length) return null;

  for (const row of rows) {
    const credentials = parseLineCredentials(row.credentials);
    if (!credentials) continue;

    if (!verifyLineSignature(rawBody, signature, credentials.channel_secret)) {
      continue;
    }

    await bindLineDestinationIfNeeded(
      row.store_id,
      destination,
      row.external_account_id,
    );

    return toConnectionResult(row);
  }

  return null;
};

/** Webhook destination → 매장 LINE 연결 조회 */
export const findLineConnectionByDestination = async (
  destination: string,
): Promise<LineConnectionLookupResult> => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("store_channel_connections")
    .select("store_id, credentials, display_name, status, external_account_id")
    .eq("channel", "LINE")
    .eq("external_account_id", destination)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      reason: "DB_ERROR",
      message: error.message,
    };
  }

  if (!data) {
    return {
      ok: false,
      reason: "NOT_FOUND",
      message:
        "Timeplex에 이 Channel ID(destination)로 저장된 LINE 연결이 없습니다. /store/chats에서 Secret·Token을 먼저 저장하세요.",
    };
  }

  return toConnectionResult(data);
};

/** Webhook 인증 — destination 조회 후 실패 시 서명으로 fallback */
export const resolveLineWebhookConnection = async (params: {
  destination: string;
  rawBody: string;
  signature: string | null;
  isVerifyRequest: boolean;
}): Promise<LineConnectionLookupResult> => {
  const byDestination = await findLineConnectionByDestination(params.destination);
  if (byDestination.ok) return byDestination;

  // Verify(빈 events) 또는 Channel ID 오입력 — Secret 서명으로 매칭
  if (params.isVerifyRequest || byDestination.reason === "NOT_FOUND") {
    const bySignature = await findLineConnectionBySignature(
      params.rawBody,
      params.signature,
      params.destination,
    );

    if (bySignature?.ok) return bySignature;
  }

  return byDestination;
};

/** 매장 LINE 연결 진단 — UI 표시용 */
export const getLineConnectionDiagnostic = async (storeId: string) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("store_channel_connections")
    .select("status, external_account_id, error_message, credentials, last_webhook_at, last_webhook_summary")
    .eq("store_id", storeId)
    .eq("channel", "LINE")
    .maybeSingle();

  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  if (error || !data) {
    return {
      serviceRoleConfigured,
      status: "DISCONNECTED" as const,
      channelId: null as string | null,
      hasCredentials: false,
      errorMessage: null as string | null,
      lastWebhookAt: null as string | null,
      lastWebhookSummary: null as string | null,
      hints: [
        serviceRoleConfigured
          ? null
          : "Vercel에 SUPABASE_SERVICE_ROLE_KEY가 없으면 Webhook이 DB에 저장하지 못합니다.",
        "「라인 연결하기」에서 Channel ID, Secret, Token을 저장하세요.",
      ].filter(Boolean) as string[],
    };
  }

  const hasCredentials = !!parseLineCredentials(data.credentials);

  const hints: string[] = [];
  if (!serviceRoleConfigured) {
    hints.push("Vercel 환경 변수 SUPABASE_SERVICE_ROLE_KEY를 설정한 뒤 Redeploy 하세요.");
  }
  if (data.status === "CONNECTED" && !hasCredentials) {
    hints.push("Secret/Token이 비어 있습니다. 연결 정보를 다시 저장하세요.");
  }
  if (
    data.status === "CONNECTED" &&
    hasCredentials &&
    !data.external_account_id
  ) {
    hints.push(
      "Channel ID가 비어 있습니다. Secret·Token 저장 후 LINE Console에서 Verify를 누르면 자동으로 맞춰집니다.",
    );
  }
  if (data.error_message) {
    hints.push(`최근 Webhook 오류: ${data.error_message}`);
  }
  if (!data.last_webhook_at && data.status === "CONNECTED" && hasCredentials) {
    hints.push(
      "아직 Webhook 수신 기록이 없습니다. LINE 앱에서 공식 계정에 메시지를 보내 보세요.",
    );
  }

  return {
    serviceRoleConfigured,
    status: data.status,
    channelId: data.external_account_id,
    hasCredentials,
    errorMessage: data.error_message,
    lastWebhookAt: data.last_webhook_at,
    lastWebhookSummary: data.last_webhook_summary,
    hints,
  };
};

/** Webhook 수신 기록 — /store/chats 진단용 */
export const recordLineWebhookActivity = async (
  destination: string,
  summary: string,
  hasError: boolean,
) => {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("store_channel_connections")
      .update({
        last_webhook_at: new Date().toISOString(),
        last_webhook_summary: summary.slice(0, 500),
        error_message: hasError ? summary.slice(0, 500) : null,
      })
      .eq("channel", "LINE")
      .eq("external_account_id", destination);

    if (error) {
      console.error("[LINE webhook] record activity failed:", error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[LINE webhook] record activity exception:", message);
  }
};

/** Webhook 처리 성공 시 오류 메시지 초기화 */
export const clearLineWebhookError = async (destination: string) => {
  const supabase = createServiceClient();
  await supabase
    .from("store_channel_connections")
    .update({ error_message: null })
    .eq("channel", "LINE")
    .eq("external_account_id", destination);
};
