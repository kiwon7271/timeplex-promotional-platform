"use client";

import { cn } from "@/lib/cn";
import { isAttachmentPlaceholderBody } from "@/lib/chat-message-utils";
import {
  getChatBubbleClass,
  getChatLinkLabelClass,
  getChatLinkTextClass,
} from "@/lib/chat-bubble-styles";
import { getLocaleLabelKo } from "@/lib/locale";
import type { ChatThreadLogProps } from "@/types/chat";
import ChatMessageAttachments from "@/components/chat/chat-message-attachments";
import ChatMessageLinks from "@/components/chat/chat-message-links";
import ClientDateTime from "@/components/chat/elements/client-date-time";

const SENDER_ALIGN: Record<string, "left" | "right" | "center"> = {
  CUSTOMER: "left",
  STORE: "right",
  SYSTEM: "center",
};

const getAlign = (sender: string) => SENDER_ALIGN[sender] ?? "left";

const translationNoteClass =
  "w-fit max-w-full break-words rounded-md bg-white/80 px-2.5 py-1.5 text-[12px] leading-[18px] text-gray-600 ring-1 ring-gray-200/80";

/** 챗봇형 대화 로그 — 원문·번역 함께 표시 */
const ChatThreadLog = ({
  messages,
  customerName,
  customerLocale,
  onMediaLoad,
}: ChatThreadLogProps) => {
  const customerLanguageLabel = getLocaleLabelKo(customerLocale);

  const getDisplayName = (sender: string) => {
    if (sender === "CUSTOMER") return customerName ?? "고객";
    if (sender === "SYSTEM") return "시스템";
    return null;
  };

  if (!messages.length) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center">
        <p className="text-[13px] text-gray-500">메시지가 없습니다.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {messages.map((m) => {
        const align = getAlign(m.sender);
        const isRight = align === "right";
        const isCenter = align === "center";
        const isCustomer = m.sender === "CUSTOMER";
        const isStore = m.sender === "STORE";
        const hasAttachments = !!m.attachments?.length;
        const hasReservationLinks = !!m.reservation_links?.length;
        const showBody =
          m.body &&
          !((hasAttachments || hasReservationLinks) && isAttachmentPlaceholderBody(m.body));

        const displayName = getDisplayName(m.sender);
        const bubbleClassName = getChatBubbleClass(isRight, isCenter);

        const primaryText =
          isCustomer && m.translated_body ? m.translated_body : m.body;
        const showPrimaryText =
          primaryText &&
          !(
            (hasAttachments || hasReservationLinks) &&
            isAttachmentPlaceholderBody(primaryText)
          );

        return (
          <li
            key={m.id}
            className={cn(
              "flex w-full min-w-0",
              isCenter ? "justify-center" : isRight ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 max-w-[85%] flex-col gap-1.5 sm:max-w-[72%]",
                isRight && "items-end",
                !isRight && !isCenter && "items-start",
                isCenter && "items-center text-center",
              )}
            >
              {displayName ? (
                <p className="text-[13px] font-semibold leading-[18px] text-gray-900">
                  {displayName}
                </p>
              ) : null}

              {showPrimaryText ? (
                <div className={bubbleClassName}>{primaryText}</div>
              ) : showBody && !isCustomer ? (
                <div className={bubbleClassName}>{m.body}</div>
              ) : null}

              {hasAttachments ? (
                <ChatMessageAttachments
                  attachments={m.attachments!}
                  align={isRight ? "right" : "left"}
                  className="space-y-2"
                  onMediaLoad={onMediaLoad}
                />
              ) : null}

              {hasReservationLinks ? (
                <ChatMessageLinks
                  links={m.reservation_links!}
                  bubbleClassName={bubbleClassName}
                  linkLabelClassName={getChatLinkLabelClass(isRight, isCenter)}
                  linkTextClassName={getChatLinkTextClass(isRight, isCenter)}
                />
              ) : null}

              {isCustomer && m.translated_body && showBody ? (
                <p className={translationNoteClass}>
                  <span className="font-medium text-gray-700">원문 ({customerLanguageLabel}): </span>
                  {m.body}
                </p>
              ) : null}

              {isStore && m.translated_body ? (
                <p className={translationNoteClass}>
                  <span className="font-medium text-gray-700">
                    고객 전달문 ({customerLanguageLabel}):{" "}
                  </span>
                  {m.translated_body}
                </p>
              ) : null}

              <ClientDateTime
                value={m.created_at}
                className="text-[11px] leading-[16px] text-gray-500"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ChatThreadLog;
