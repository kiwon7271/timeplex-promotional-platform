import type { LineUserProfile } from "@/lib/messenger/line/types";

/** LINE 사용자 프로필 조회 */
export const fetchLineUserProfile = async (
  lineUserId: string,
  accessToken: string,
): Promise<LineUserProfile | null> => {
  try {
    const response = await fetch(
      `https://api.line.me/v2/bot/profile/${encodeURIComponent(lineUserId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error(
        "[LINE profile] fetch failed:",
        response.status,
        errBody.slice(0, 200),
      );
      return null;
    }

    const json = (await response.json()) as LineUserProfile;
    if (!json.userId) return null;

    return json;
  } catch {
    return null;
  }
};
