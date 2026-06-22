import { NextResponse } from "next/server";
import {
  getLineChannelSecretByDestination,
  handleLineWebhook,
} from "@/lib/messenger/line/handle-webhook";
import type { LineWebhookBody } from "@/lib/messenger/line/types";
import { verifyLineSignature } from "@/lib/messenger/line/verify-signature";

export const runtime = "nodejs";

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

  const channelSecret = await getLineChannelSecretByDestination(destination);
  if (!channelSecret) {
    console.error("[LINE webhook] no connection for destination:", destination);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Timeplex에 등록되지 않은 Channel ID입니다. /store/chats → 라인 연결에서 Channel ID(destination)를 확인하세요.",
        destination,
      },
      { status: 503 },
    );
  }

  if (!verifyLineSignature(rawBody, signature, channelSecret)) {
    console.error("[LINE webhook] invalid signature for destination:", destination);
    return NextResponse.json({ message: "invalid signature" }, { status: 401 });
  }

  try {
    const result = await handleLineWebhook(payload);

    if (!result.ok) {
      console.error("[LINE webhook] handle failed:", result.message);
      return NextResponse.json(
        { ok: false, message: result.message, reason: result.reason },
        { status: 500 },
      );
    }

    console.info(
      "[LINE webhook] ok destination=%s processed=%d skipped=%d",
      destination,
      result.processed,
      result.skipped,
    );

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      skipped: result.skipped,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "internal error";
    console.error("[LINE webhook] unhandled error:", message);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
