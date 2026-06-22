"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreUser } from "@/lib/auth";
import { hasStoreChatConsent } from "@/lib/consent";
import type { ActionResult } from "@/types/action-result";

/** LINE Messaging API 연결 저장 */
export const onConnectLineChannel = async (formData: FormData): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const consented = await hasStoreChatConsent(profile.store_id);
  if (!consented) {
    return { ok: false, message: "고객 대화 약관 동의 후 연결할 수 있습니다." };
  }

  const channelId = String(formData.get("channel_id") ?? "").trim();
  const channelSecret = String(formData.get("channel_secret") ?? "").trim();
  const channelAccessToken = String(formData.get("channel_access_token") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!channelId) return { ok: false, message: "Channel ID를 입력하세요." };
  if (!channelSecret) return { ok: false, message: "Channel secret을 입력하세요." };
  if (!channelAccessToken) {
    return { ok: false, message: "Channel access token을 입력하세요." };
  }

  const supabase = createClient();

  const { data: duplicate } = await supabase
    .from("store_channel_connections")
    .select("store_id")
    .eq("channel", "LINE")
    .eq("external_account_id", channelId)
    .neq("store_id", profile.store_id)
    .maybeSingle();

  if (duplicate) {
    return { ok: false, message: "이 Channel ID는 다른 매장에서 사용 중입니다." };
  }

  const row = {
    store_id: profile.store_id,
    channel: "LINE",
    status: "CONNECTED",
    external_account_id: channelId,
    display_name: displayName || null,
    connected_at: new Date().toISOString(),
    error_message: null,
    credentials: {
      channel_secret: channelSecret,
      channel_access_token: channelAccessToken,
    },
  };

  const { error } = await supabase.from("store_channel_connections").upsert(row, {
    onConflict: "store_id,channel",
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/store/chats");
  return { ok: true };
};

/** LINE 연결 해제 */
export const onDisconnectLineChannel = async (): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const supabase = createClient();

  const { error } = await supabase
    .from("store_channel_connections")
    .upsert(
      {
        store_id: profile.store_id,
        channel: "LINE",
        status: "DISCONNECTED",
        external_account_id: null,
        display_name: null,
        connected_at: null,
        error_message: null,
        credentials: null,
      },
      { onConflict: "store_id,channel" },
    );

  if (error) return { ok: false, message: error.message };

  revalidatePath("/store/chats");
  return { ok: true };
};
