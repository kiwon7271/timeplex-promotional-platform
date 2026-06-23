import { actionJson } from "@/lib/api/action-json";
import { onRetryMessageDelivery, onRetryMessageTranslation } from "@/actions/admin-system";

export const runtime = "nodejs";

/** POST — 메시지 재시도 */
export async function POST(request: Request) {
  const { messageId, conversationId, mode } = (await request.json()) as {
    messageId: string;
    conversationId: string;
    mode: "delivery" | "translation";
  };

  if (mode === "delivery") {
    return actionJson(await onRetryMessageDelivery(messageId, conversationId));
  }
  return actionJson(await onRetryMessageTranslation(messageId, conversationId));
}
