import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { refetchStoreMessage, sendStoreMessage } from "@/lib/chat-send-message";
import { runDeliverMessageJob } from "@/jobs/deliver-message";
import { runUpdateUsageJob } from "@/jobs/update-usage";
import { captureRouteError, log } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

/** POST — 매장 메시지 전송 (저장 → 번역·LINE Push 완료 후 응답) */
export async function POST(request: Request) {
  try {
    const auth = await requireStoreApiUser();
    if ("response" in auth) return auth.response;

    const formData = await request.formData();
    const conversationId = String(formData.get("conversation_id") ?? "");
    const body = String(formData.get("body") ?? "");
    const file = formData.get("file") as File | null;
    const reservationLinkId = String(formData.get("reservation_link_id") ?? "");

    const supabase = createClient();
    const result = await sendStoreMessage({
      supabase,
      profile: auth.profile,
      conversationId,
      body,
      file: file && file.size > 0 ? file : null,
      reservationLinkId,
      formData,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: result.status ?? 400 },
      );
    }

    const delivery = await runDeliverMessageJob({
      messageId: result.data.id,
      conversationId,
    });

    void runUpdateUsageJob({ storeId: auth.profile.store_id! }).catch(() => {
      // 사용량 집계 실패는 전송 성공과 무관
    });

    const serviceSupabase = createServiceClient();
    const data =
      (await refetchStoreMessage(serviceSupabase, result.data.id)) ?? result.data;

    if (!delivery.ok || data.delivery_status === "FAILED") {
      const message =
        delivery.failedReason ??
        data.failed_reason ??
        "고객에게 메시지를 전송하지 못했습니다.";
      log.warn("Store message delivery failed", {
        messageId: result.data.id,
        conversationId,
        deliveryStatus: data.delivery_status,
        reason: message,
      });
      return NextResponse.json({ ok: false, message, data }, { status: 502 });
    }

    if (data.delivery_status !== "SENT") {
      const message = "메시지 전송이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.";
      log.warn("Store message delivery incomplete", {
        messageId: result.data.id,
        conversationId,
        deliveryStatus: data.delivery_status,
      });
      return NextResponse.json({ ok: false, message, data }, { status: 502 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    captureRouteError("/api/store/chats/messages", error);
    const message = error instanceof Error ? error.message : "전송 중 오류가 발생했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
