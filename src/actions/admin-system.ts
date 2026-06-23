"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { enqueueJob } from "@/jobs/queue";
import { createServiceClient } from "@/lib/supabase/service";
import type { ActionResult } from "@/types/action-result";

/** 실패 메시지 배달 재시도 */
export const onRetryMessageDelivery = async (
  messageId: string,
  conversationId: string,
): Promise<ActionResult> => {
  await requireSuperAdmin();

  if (!messageId || !conversationId) {
    return { ok: false, message: "메시지 정보가 없습니다." };
  }

  const supabase = createServiceClient();

  const { data: message } = await supabase
    .from("messages")
    .select("id, sender, delivery_status")
    .eq("id", messageId)
    .eq("conversation_id", conversationId)
    .maybeSingle();

  if (!message) return { ok: false, message: "메시지를 찾을 수 없습니다." };
  if (message.sender !== "STORE") {
    return { ok: false, message: "매장 발신 메시지만 재시도할 수 있습니다." };
  }

  await supabase
    .from("messages")
    .update({
      delivery_status: "PENDING",
      failed_reason: null,
      delivered_at: null,
    })
    .eq("id", messageId);

  enqueueJob("deliver-message", { messageId, conversationId });

  revalidatePath("/admin/system");
  return { ok: true, message: "재시도 요청을 접수했습니다." };
};

/** 번역 실패 고객 메시지 재번역 */
export const onRetryMessageTranslation = async (
  messageId: string,
  conversationId: string,
): Promise<ActionResult> => {
  await requireSuperAdmin();

  if (!messageId || !conversationId) {
    return { ok: false, message: "메시지 정보가 없습니다." };
  }

  const supabase = createServiceClient();

  const { data: message } = await supabase
    .from("messages")
    .select("id, sender")
    .eq("id", messageId)
    .eq("conversation_id", conversationId)
    .maybeSingle();

  if (!message) return { ok: false, message: "메시지를 찾을 수 없습니다." };
  if (message.sender !== "CUSTOMER") {
    return { ok: false, message: "고객 메시지만 재번역할 수 있습니다." };
  }

  await supabase
    .from("messages")
    .update({
      delivery_status: "PENDING",
      failed_reason: null,
      translated_body: null,
    })
    .eq("id", messageId);

  enqueueJob("translate-message", { messageId, conversationId });

  revalidatePath("/admin/system");
  return { ok: true, message: "재번역 요청을 접수했습니다." };
};
