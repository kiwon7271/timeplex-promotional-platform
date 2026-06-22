import type { LineChannelCredentials } from "@/lib/messenger/line/types";

/** DB credentials jsonb → LINE credential */
export const parseLineCredentials = (
  value: unknown,
): LineChannelCredentials | null => {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const channel_secret = String(record.channel_secret ?? "").trim();
  const channel_access_token = String(record.channel_access_token ?? "").trim();

  if (!channel_secret || !channel_access_token) return null;

  return { channel_secret, channel_access_token };
};
