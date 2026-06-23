import { actionJson } from "@/lib/api/action-json";
import { onConnectLineChannel, onDisconnectLineChannel } from "@/actions/channel-connections";

export const runtime = "nodejs";

/** POST — LINE 연결 */
export async function POST(request: Request) {
  return actionJson(await onConnectLineChannel(await request.formData()));
}

/** DELETE — LINE 연결 해제 */
export async function DELETE() {
  return actionJson(await onDisconnectLineChannel());
}
