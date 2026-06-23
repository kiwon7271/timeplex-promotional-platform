import { actionJson } from "@/lib/api/action-json";
import { onCloseConversation } from "@/actions/chats";

export const runtime = "nodejs";

/** POST — 대화 종료 */
export async function POST(
  _request: Request,
  { params }: { params: { conversationId: string } },
) {
  return actionJson(await onCloseConversation(params.conversationId));
}
