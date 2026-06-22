"use client";

import { IconSpeakerphone } from "@tabler/icons-react";
import Badge from "@/components/ui/badge";
import Text from "@/components/ui/text";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";

interface ConsentNoticeItemProps {
  title: string;
  content: string;
  version: string;
  agreedAt?: string;
}

/** 동의/고지 약관 단일 항목 */
const ConsentNoticeItem = ({ title, content, version, agreedAt }: ConsentNoticeItemProps) => {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-blue-50 px-4 py-3">
      <IconSpeakerphone
        size={ICON_SIZE.xl}
        stroke={ICON_STROKE}
        className="mt-0.5 shrink-0 text-blue-600"
        aria-hidden
      />
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Text.Body2 className="font-medium text-gray-900">{title}</Text.Body2>
          <Badge variant="muted" className="shrink-0">
            {version}
          </Badge>
        </div>
        {agreedAt ? (
          <Text.Body3 className="text-gray-500">
            동의 일시: {new Date(agreedAt).toLocaleString("ko-KR")}
          </Text.Body3>
        ) : null}
        <Text.Body2 className="whitespace-pre-wrap break-words text-gray-800">{content}</Text.Body2>
      </div>
    </div>
  );
};

export default ConsentNoticeItem;
