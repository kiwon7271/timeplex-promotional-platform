/** LINE Push Message — 텍스트 발신 */
export const sendLinePushText = async (params: {
  accessToken: string;
  lineUserId: string;
  text: string;
}) => {
  const trimmed = params.text.trim();
  if (!trimmed) {
    return { ok: false as const, message: "전송할 텍스트가 없습니다." };
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: params.lineUserId,
        messages: [{ type: "text", text: trimmed }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return {
        ok: false as const,
        message: `LINE 발신 실패 (${response.status}): ${detail.slice(0, 200)}`,
      };
    }

    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "LINE 발신 오류";
    return { ok: false as const, message };
  }
};
