import { NextResponse } from "next/server";

/** Server Action 결과 → Route API JSON */
export const actionJson = <T extends { ok: boolean }>(result: T, okStatus = 200) =>
  NextResponse.json(result, { status: result.ok ? okStatus : 400 });
