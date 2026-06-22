import { NextResponse } from "next/server";
import {
  getLineChannelSecretByDestination,
  handleLineWebhook,
} from "@/lib/messenger/line/handle-webhook";
import type { LineWebhookBody } from "@/lib/messenger/line/types";
import { verifyLineSignature } from "@/lib/messenger/line/verify-signature";

export const runtime = "nodejs";

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
    // 미등록 채널 — LINE 재전송 방지
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!verifyLineSignature(rawBody, signature, channelSecret)) {
    return NextResponse.json({ message: "invalid signature" }, { status: 401 });
  }

  await handleLineWebhook(payload);

  return NextResponse.json({ ok: true });
}
