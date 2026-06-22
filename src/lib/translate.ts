import "server-only";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

/** OpenAI API 키 설정 여부 */
export const isTranslationConfigured = () =>
  Boolean(process.env.OPENAI_API_KEY?.trim());

const getTranslationModel = () =>
  process.env.OPENAI_TRANSLATION_MODEL?.trim() || "gpt-4o-mini";

const callOpenAI = async (
  messages: { role: "system" | "user"; content: string }[],
): Promise<string | null> => {
  if (!isTranslationConfigured()) return null;

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getTranslationModel(),
        messages,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error(
        "[translate] OpenAI API error:",
        response.status,
        errBody.slice(0, 300),
      );
      return null;
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
};

/** 텍스트 번역 — 실패 시 null */
export const translateText = async (params: {
  text: string;
  targetLocale: string;
  sourceLocale?: string;
}): Promise<string | null> => {
  const trimmed = params.text.trim();
  if (!trimmed) return null;

  const fromHint = params.sourceLocale
    ? ` from ${params.sourceLocale}`
    : "";

  return callOpenAI([
    {
      role: "system",
      content: `Translate the user's message${fromHint} to ${params.targetLocale}. Reply with ONLY the translation. No quotes or explanation.`,
    },
    { role: "user", content: trimmed },
  ]);
};

/** 고객 첫 메시지 언어 감지 — ISO 639-1 */
export const detectLocale = async (text: string): Promise<string | null> => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const result = await callOpenAI([
    {
      role: "system",
      content:
        "Detect the language of the user message. Reply with ONLY the ISO 639-1 code (e.g. en, ja, ko, zh).",
    },
    { role: "user", content: trimmed },
  ]);

  if (!result) return null;

  const code = result.toLowerCase().replace(/[^a-z-]/g, "").slice(0, 5);
  return code || null;
};

/** 고객 → 매장: 언어 감지 + 한국어 번역 (API 1회) */
export const translateInboundForStore = async (
  text: string,
): Promise<{ customerLocale: string; translated_body: string | null } | null> => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const result = await callOpenAI([
    {
      role: "system",
      content:
        'Detect the customer message language (ISO 639-1, e.g. en, ja). Translate it to Korean for the store owner. Reply with ONLY minified JSON: {"locale":"en","translation":"한국어 번역문"}',
    },
    { role: "user", content: trimmed },
  ]);

  if (!result) return null;

  try {
    const parsed = JSON.parse(result) as { locale?: string; translation?: string };
    const customerLocale =
      parsed.locale?.toLowerCase().replace(/[^a-z-]/g, "").slice(0, 5) || "en";
    const translated_body = parsed.translation?.trim() || null;
    return { customerLocale, translated_body };
  } catch {
    console.error("[translate] inbound JSON parse failed:", result.slice(0, 200));
    return null;
  }
};
