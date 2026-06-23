import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";
import { MESSAGE_BASE_COLUMNS } from "@/lib/supabase/query-columns";

export const runtime = "nodejs";

/** GET — 시스템 디버그 데이터 */
export async function GET() {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();

  const [
    { data: failedMessages },
    { data: pendingMessages },
    { data: webhookConnections },
    { data: translationFailures },
  ] = await Promise.all([
    supabase
      .from("messages")
      .select(`${MESSAGE_BASE_COLUMNS}, conversations(store_id, customer_name, channel)`)
      .eq("delivery_status", "FAILED")
      .eq("sender", "STORE")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("messages")
      .select(`${MESSAGE_BASE_COLUMNS}, conversations(store_id, customer_name, channel)`)
      .in("delivery_status", ["PENDING", "SENDING", "TRANSLATING"])
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("store_channel_connections")
      .select(
        "id, store_id, channel, status, last_webhook_at, last_webhook_summary, error_message, stores(name)",
      )
      .not("last_webhook_at", "is", null)
      .order("last_webhook_at", { ascending: false })
      .limit(20),
    supabase
      .from("messages")
      .select(`${MESSAGE_BASE_COLUMNS}, conversations(store_id, channel)`)
      .eq("sender", "CUSTOMER")
      .eq("delivery_status", "FAILED")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      failedMessages: failedMessages ?? [],
      pendingMessages: pendingMessages ?? [],
      webhookConnections: webhookConnections ?? [],
      translationFailures: translationFailures ?? [],
    },
  });
}
