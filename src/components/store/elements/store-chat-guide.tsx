"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import Text from "@/components/ui/text";

interface StoreChatGuideProps {
  translationEnabled: boolean;
}

/** 매장주용 고객 대화 이용 안내 */
const StoreChatGuide = ({ translationEnabled }: StoreChatGuideProps) => (
  <details className="group rounded-lg border border-blue-100 bg-blue-50/60">
    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[14px] font-semibold text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
      <IconInfoCircle size={ICON_SIZE.md} stroke={ICON_STROKE} className="shrink-0 text-blue-600" />
      고객 대화 이용 안내
      <span className="ml-auto text-[12px] font-normal text-gray-500 group-open:hidden">
        펼치기
      </span>
    </summary>
    <div className="space-y-3 border-t border-blue-100 px-4 pb-4 pt-3">
      <Text.Body3 className="text-gray-700">
        외국인 고객과 대화할 때 아래 내용을 참고해 주세요.
      </Text.Body3>
      <ul className="space-y-2 text-[13px] leading-relaxed text-gray-700">
        <li>
          · 고객이 <strong>처음 보낸 언어</strong>가 이후 번역 기준이 됩니다.
        </li>
        <li>
          · 고객 메시지는 <strong>한국어 번역</strong>과 원문이 함께 표시됩니다.
        </li>
        <li>
          · 답장은 <strong>한국어로 작성</strong>하면 고객 언어로 자동 번역되어 전달됩니다.
        </li>
        <li>
          · 새 메시지는 <strong>실시간</strong>으로 아래 채팅창에 나타납니다.
        </li>
        <li>
          · 왓츠앱·라인·인스타그램 연동은 준비 중이며, 연결 후 같은 화면에서 확인할 수 있습니다.
        </li>
      </ul>
      {!translationEnabled ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-900">
          번역 기능이 아직 켜져 있지 않습니다. 서비스 관리자에게 OpenAI API 키 설정을
          요청해 주세요. (.env의 OPENAI_API_KEY)
        </p>
      ) : (
        <p className="rounded-md bg-white px-3 py-2 text-[13px] leading-relaxed text-gray-600">
          번역 기능이 켜져 있습니다. 한국어로 입력하면 고객 언어로 번역되어 함께 저장됩니다.
        </p>
      )}
    </div>
  </details>
);

export default StoreChatGuide;
