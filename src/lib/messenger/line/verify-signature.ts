import crypto from "crypto";

/** LINE Webhook X-Line-Signature 검증 */
export const verifyLineSignature = (
  rawBody: string,
  signature: string | null,
  channelSecret: string,
) => {
  if (!signature?.trim()) return false;

  const digest = crypto
    .createHmac("SHA256", channelSecret)
    .update(rawBody)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature.trim()),
    );
  } catch {
    return false;
  }
};
