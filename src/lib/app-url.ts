/** Webhook·절대 URL 생성 — Vercel / 로컬 */
export const getAppBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
};

export const getLineWebhookUrl = () => `${getAppBaseUrl()}/api/webhooks/line`;
