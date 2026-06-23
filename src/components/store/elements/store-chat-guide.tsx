"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import Text from "@/components/ui/text";

interface StoreChatGuideProps {
  translationEnabled: boolean;
}

/** 매장주용 고객 대화 이용 안내 — 상단 항상 표시 */
const StoreChatGuide = ({ translationEnabled }: StoreChatGuideProps) => (
  <section className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
    <div className="mb-2 flex items-center gap-2">
      <IconInfoCircle size={ICON_SIZE.md} stroke={ICON_STROKE} className="shrink-0 text-gray-500" />
      <h3 className="text-[14px] font-semibold text-gray-900">이용 안내</h3>
    </div>
    <ul className="space-y-1.5 pl-0 text-[13px] leading-relaxed text-gray-700">
      <li>· 고객 메시지는 한국어 번역과 원문이 함께 표시됩니다.</li>
      <li>· 답장은 한국어로 작성하면 고객 언어로 번역되어 전달됩니다.</li>
      <li>· SNS를 연결하면 이 화면에서 고객과 대화할 수 있습니다.</li>
    </ul>
    {!translationEnabled ? (
      <Text.Body3 className="mt-2 text-[12px] text-amber-800">
        번역 기능이 꺼져 있습니다. 관리자에게 문의해 주세요.
      </Text.Body3>
    ) : null}
  </section>
);

export default StoreChatGuide;
