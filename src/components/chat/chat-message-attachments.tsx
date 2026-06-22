import Image from "next/image";

import { cn } from "@/lib/cn";
import { normalizeUploadFileName } from "@/lib/upload";
import type { MessageAttachmentPreview } from "@/types/chat";

interface ChatMessageAttachmentsProps {
  attachments: MessageAttachmentPreview[];
  align?: "left" | "right";
  className?: string;
  /** 이미지 로드 후 스크롤 갱신 */
  onMediaLoad?: () => void;
}

/** 채팅 첨부 이미지/파일명 */
const ChatMessageAttachments = ({
  attachments,
  align = "left",
  className,
  onMediaLoad,
}: ChatMessageAttachmentsProps) => {
  return (
    <div className={cn("space-y-2", align === "right" && "flex flex-col items-end", className)}>
      {attachments.map((attachment) => {
        const label = normalizeUploadFileName(attachment.file_name);
        const key = attachment.file_path ?? attachment.file_name;

        return (
          <div key={key} className={cn("space-y-1", align === "right" && "text-right")}>
            {attachment.url ? (
              <a href={attachment.url} target="_blank" rel="noreferrer" className="inline-block max-w-full">
                <Image
                  src={attachment.url}
                  alt={label}
                  width={800}
                  height={600}
                  unoptimized
                  className="max-h-64 max-w-full rounded-lg border border-gray-200 object-contain"
                  onLoad={onMediaLoad}
                />
              </a>
            ) : (
              <p className="text-[12px] text-gray-500">이미지를 불러올 수 없습니다.</p>
            )}
            <p className="break-all text-[11px] leading-[16px] text-gray-500">{label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessageAttachments;
