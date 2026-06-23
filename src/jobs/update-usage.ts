import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { log } from "@/lib/logger";

export type UpdateUsagePayload = {
  storeId: string;
  /** YYYY-MM */
  yearMonth?: string;
};

const currentYearMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

/** 월별 메시지 사용량 증가 */
export const runUpdateUsageJob = async (payload: UpdateUsagePayload) => {
  const supabase = createServiceClient();
  const yearMonth = payload.yearMonth ?? currentYearMonth();

  const { data: existing } = await supabase
    .from("usage_monthly")
    .select("id, message_count")
    .eq("store_id", payload.storeId)
    .eq("year_month", yearMonth)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("usage_monthly")
      .update({ message_count: (existing.message_count ?? 0) + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("usage_monthly").insert({
      store_id: payload.storeId,
      year_month: yearMonth,
      message_count: 1,
      conversation_count: 0,
    });
  }

  log.debug("Usage updated", { storeId: payload.storeId, yearMonth });
};
