import { NextResponse } from "next/server";
import { handleLineWebhook } from "@/lib/messenger/line/handle-webhook";
import {
  recordLineWebhookActivity,
  resolveLineWebhookConnection,
} from "@/lib/messenger/line/connection-lookup";
import type { LineWebhookBody } from "@/lib/messenger/line/types";
import { verifyLineSignature } from "@/lib/messenger/line/verify-signature";
import { captureRouteError, captureWebhookError, log } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Webhook URL 동작 확인용 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "line-webhook",
    hint: "LINE Console에서 POST Webhook URL로 이 주소를 등록하세요.",
  });
}

/** LINE Messaging API Webhook */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  let payload: LineWebhookBody;
  try {
    payload = JSON.parse(rawBody) as LineWebhookBody;
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }

  const destination = payload.destination?.trim();
  if (!destination) {
    return NextResponse.json({ message: "destination required" }, { status: 400 });
  }

  const eventCount = payload.events?.length ?? 0;
  const isVerifyRequest = eventCount === 0;

  const connection = await resolveLineWebhookConnection({
    destination,
    rawBody,
    signature,
    isVerifyRequest,
  });

  if (!connection.ok) {
    captureWebhookError("LINE", new Error(connection.message), {
      reason: connection.reason,
      destination,
    });
    return NextResponse.json(
      {
        ok: false,
        message: connection.message,
        destination,
      },
      { status: 503 },
    );
  }

  if (!verifyLineSignature(rawBody, signature, connection.channelSecret)) {
    captureWebhookError("LINE", new Error("invalid signature"), { destination });
    return NextResponse.json({ message: "invalid signature" }, { status: 401 });
  }

  // Vercel은 응답 후 백그라운드 작업을 종료함 — 반드시 await 후 200 반환
  await recordLineWebhookActivity(
    destination,
    `POST 수신 (events=${eventCount})`,
    false,
  );

  try {
    const result = await handleLineWebhook(payload);

    if (!result.ok) {
      captureWebhookError("LINE", new Error(result.message), { destination, reason: result.reason });
      // LINE 재전송 폭주 방지 — 처리 실패해도 200 (오류는 DB·로그에 기록됨)
      return NextResponse.json({ ok: true, warning: result.message });
    }

    log.info("LINE webhook processed", {
      destination,
      processed: result.processed,
      skipped: result.skipped,
    });

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      skipped: result.skipped,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "internal error";
    captureRouteError("/api/webhooks/line", error, { destination });
    await recordLineWebhookActivity(destination, `처리 오류: ${message}`, true);
    return NextResponse.json({ ok: true, warning: message });
  }
}
