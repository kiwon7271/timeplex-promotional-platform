import { NextResponse } from "next/server";
import { handleLineWebhook } from "@/lib/messenger/line/handle-webhook";
import { resolveLineWebhookConnection } from "@/lib/messenger/line/connection-lookup";
import type { LineWebhookBody } from "@/lib/messenger/line/types";
import { verifyLineSignature } from "@/lib/messenger/line/verify-signature";

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

/** LINE Messaging API Webhook — 서명 확인 후 즉시 200, 처리는 백그라운드 */
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

  const isVerifyRequest = (payload.events ?? []).length === 0;

  const connection = await resolveLineWebhookConnection({
    destination,
    rawBody,
    signature,
    isVerifyRequest,
  });

  if (!connection.ok) {
    console.error(
      "[LINE webhook] connection resolve failed:",
      connection.reason,
      connection.message,
      destination,
    );
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
    console.error("[LINE webhook] invalid signature for destination:", destination);
    return NextResponse.json({ message: "invalid signature" }, { status: 401 });
  }

  // LINE은 빠른 200 응답 필요 — DB 저장은 백그라운드
  void handleLineWebhook(payload)
    .then((result) => {
      if (!result.ok) {
        console.error("[LINE webhook] background handle failed:", result.message);
        return;
      }
      console.info(
        "[LINE webhook] background ok destination=%s processed=%d skipped=%d",
        destination,
        result.processed,
        result.skipped,
      );
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "internal error";
      console.error("[LINE webhook] background unhandled error:", message);
    });

  return NextResponse.json({ ok: true });
}
