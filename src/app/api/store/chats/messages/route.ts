import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { sendStoreMessage } from "@/lib/chat-send-message";
import { scheduleBackgroundJob } from "@/lib/schedule-background";
import { captureRouteError } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

/** POST — 매장 메시지 전송 */
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

    // 번역·LINE 전송 — waitUntil로 응답 후 백그라운드 실행
    scheduleBackgroundJob("deliver-message", {
      messageId: result.data.id,
      conversationId,
    });
    scheduleBackgroundJob("update-usage", { storeId: auth.profile.store_id! });

    return NextResponse.json({ ok: true, data: result.data });
  } catch (error) {
    captureRouteError("/api/store/chats/messages", error);
    const message = error instanceof Error ? error.message : "전송 중 오류가 발생했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
