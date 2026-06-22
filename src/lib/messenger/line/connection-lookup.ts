import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { parseLineCredentials } from "@/lib/messenger/line/credentials";

export type LineConnectionLookupResult =
  | {
      ok: true;
      storeId: string;
      channelSecret: string;
      credentials: ReturnType<typeof parseLineCredentials> & object;
      displayName: string | null;
    }
  | {
      ok: false;
      reason: "NOT_FOUND" | "NOT_CONNECTED" | "MISSING_CREDENTIALS" | "DB_ERROR";
      message: string;
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
        "Timeplex에 이 Channel ID(destination)로 저장된 LINE 연결이 없습니다. /store/chats에서 Channel ID를 다시 확인하세요.",
    };
  }

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
        "LINE Secret/Token이 저장되어 있지 않습니다. 「연결 정보 수정」에서 세 값을 다시 입력하고 저장하세요. (0015 마이그레이션 적용 후 재저장 필요)",
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

/** 매장 LINE 연결 진단 — UI 표시용 */
export const getLineConnectionDiagnostic = async (storeId: string) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("store_channel_connections")
    .select("status, external_account_id, error_message, credentials")
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
    hints.push("연결은 되어 있으나 Secret/Token이 비어 있습니다. 연결 정보를 다시 저장하세요.");
  }
  if (data.error_message) {
    hints.push(`최근 Webhook 오류: ${data.error_message}`);
  }

  return {
    serviceRoleConfigured,
    status: data.status,
    channelId: data.external_account_id,
    hasCredentials,
    errorMessage: data.error_message,
    hints,
  };
};

/** Webhook 처리 오류 기록 */
export const recordLineWebhookError = async (
  destination: string,
  errorMessage: string,
) => {
  const supabase = createServiceClient();
  await supabase
    .from("store_channel_connections")
    .update({ error_message: errorMessage.slice(0, 500) })
    .eq("channel", "LINE")
    .eq("external_account_id", destination);
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
