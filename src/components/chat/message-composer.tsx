"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { IconLink, IconPaperclip, IconSend, IconX } from "@tabler/icons-react";
import { onSendMessage } from "@/actions/chats";
import { validateImageFile, normalizeUploadFileName, appendDisplayFileName } from "@/lib/upload";
import {
  RESERVATION_PROVIDER_LABEL,
  type ReservationProvider,
} from "@/lib/constants";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";
import { cn } from "@/lib/cn";
import { getControlHeightClass } from "@/lib/ui-control";
import type { MessageComposerProps } from "@/types/chat";
import type { ReservationLink } from "@/types/database";
import IconButton from "@/components/ui/icon-button";
import Text from "@/components/ui/text";
import Textarea from "@/components/ui/textarea";
import ReservationLinkPicker from "@/components/chat/reservation-link-picker";
import { useDialog } from "@/components/providers/dialog-provider";

/** 채팅 입력줄 — 버튼·textarea 동일 md 높이 */
const composerInputClass = cn(
  getControlHeightClass("md"),
  "max-h-32 flex-1 resize-none !py-0",
);

const getProviderLabel = (provider: string) =>
  RESERVATION_PROVIDER_LABEL[provider as ReservationProvider] ?? provider;

/** 챗봇형 메시지 입력 — Enter 전송, 첨부·예약링크 액션 버튼 */
const MessageComposer = ({
  conversationId,
  reservationLinks,
  translationEnabled = false,
  onSentMessage,
  onOptimisticSend,
  onOptimisticRollback,
}: MessageComposerProps) => {
  const { openAlert } = useDialog();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sending, setSending] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<ReservationLink | null>(
    null,
  );
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const isComposingRef = useRef(false);
  const submittingRef = useRef(false);

  const focusMessageInput = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => textareaRef.current?.focus());
    });
  };

  const hasSendableContent = () => {
    const body = textareaRef.current?.value.trim() ?? "";
    const hasFile = !!fileRef.current?.files?.[0]?.size;
    return !!(body || selectedLink || hasFile || fileName);
  };

  const onSubmit = async (formData: FormData) => {
    if (submittingRef.current) return;

    const file = formData.get("file") as File | null;
    if (file && file.size > 0) {
      const invalid = validateImageFile(file);
      if (invalid) {
        await openAlert({ title: "첨부 오류", message: invalid });
        return;
      }
      appendDisplayFileName(formData, file);
    }

    if (selectedLink) {
      formData.set("reservation_link_id", selectedLink.id);
    }

    if (!hasSendableContent()) {
      await openAlert({
        message: "메시지, 이미지, 예약 링크 중 하나를 입력하세요.",
      });
      return;
    }

    submittingRef.current = true;
    setSending(true);

    const bodyText = textareaRef.current?.value.trim() ?? "";
    const hasAttachFile = !!(file && file.size > 0);
    const isTextOnly = !!bodyText && !hasAttachFile && !selectedLink;
    let optimisticId: string | undefined;

    if (isTextOnly && onOptimisticSend) {
      optimisticId = onOptimisticSend(bodyText);
      formRef.current?.reset();
      setFileName(null);
      setSelectedLink(null);
      focusMessageInput();
    }

    try {
      const res = await onSendMessage(formData);
      if (!res.ok) {
        if (optimisticId && onOptimisticRollback) {
          onOptimisticRollback(optimisticId);
        }
        await openAlert({
          title: "전송 실패",
          message: res.message ?? "전송 실패",
        });
        return;
      }

      if (!isTextOnly) {
        formRef.current?.reset();
        setFileName(null);
        setSelectedLink(null);
        onSentMessage?.();
        focusMessageInput();
      }
    } finally {
      submittingRef.current = false;
      setSending(false);
    }
  };

  const onClickAttachButton = () => {
    fileRef.current?.click();
  };

  const onClickLinkButton = () => {
    setLinkPickerOpen(true);
  };

  const onSelectReservationLink = (link: ReservationLink) => {
    setSelectedLink(link);
    setLinkPickerOpen(false);
    focusMessageInput();
  };

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      return;
    }

    const invalid = validateImageFile(file);
    if (invalid) {
      await openAlert({ title: "첨부 오류", message: invalid });
      e.target.value = "";
      setFileName(null);
      return;
    }

    setFileName(normalizeUploadFileName(file.name));
    focusMessageInput();
  };

  const onClickRemoveFile = () => {
    if (fileRef.current) fileRef.current.value = "";
    setFileName(null);
  };

  const onClickRemoveLink = () => {
    setSelectedLink(null);
  };

  const onCompositionStart = () => {
    isComposingRef.current = true;
  };

  const onCompositionEnd = () => {
    isComposingRef.current = false;
  };

  const onKeyDownMessage = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;

    // IME 조합 중 Enter — 한글 입력 확정용, 전송하지 않음
    if (
      e.nativeEvent.isComposing ||
      isComposingRef.current ||
      e.keyCode === 229
    ) {
      return;
    }

    e.preventDefault();
    if (!sending && !submittingRef.current && hasSendableContent()) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <>
      <form
        ref={formRef}
        action={onSubmit}
        className="space-y-2"
        onSubmit={(e) => {
          if (submittingRef.current) e.preventDefault();
        }}
      >
        <input type="hidden" name="conversation_id" value={conversationId} />
        {selectedLink ? (
          <input
            type="hidden"
            name="reservation_link_id"
            value={selectedLink.id}
          />
        ) : null}
        <input
          ref={fileRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={onChangeFile}
        />

        {fileName ? (
          <div className="flex items-center justify-between gap-2 rounded-md bg-gray-100 px-3 py-1.5">
            <Text.Body3 className="min-w-0 truncate text-gray-700">
              첨부: {fileName}
            </Text.Body3>
            <IconButton
              type="button"
              variant="outline"
              size="md"
              icon={<IconX size={getControlIconSize("md")} stroke={ICON_STROKE} />}
              aria-label="첨부 제거"
              onClick={onClickRemoveFile}
              disabled={sending}
            />
          </div>
        ) : null}

        {selectedLink ? (
          <div className="flex items-center justify-between gap-2 rounded-md bg-gray-100 px-3 py-1.5">
            <Text.Body3 className="min-w-0 truncate text-gray-700">
              링크: {getProviderLabel(selectedLink.provider)} ·{" "}
              {selectedLink.url}
            </Text.Body3>
            <IconButton
              type="button"
              variant="outline"
              size="md"
              icon={<IconX size={getControlIconSize("md")} stroke={ICON_STROKE} />}
              aria-label="링크 제거"
              onClick={onClickRemoveLink}
              disabled={sending}
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <IconButton
            type="button"
            variant="outline"
            size="md"
            icon={<IconPaperclip size={getControlIconSize("md")} stroke={ICON_STROKE} />}
            aria-label="이미지 첨부"
            onClick={onClickAttachButton}
            disabled={sending}
          />
          <IconButton
            type="button"
            variant="outline"
            size="md"
            icon={<IconLink size={getControlIconSize("md")} stroke={ICON_STROKE} />}
            aria-label="예약 링크 첨부"
            onClick={onClickLinkButton}
            disabled={sending}
          />
          <Textarea
            ref={textareaRef}
            name="body"
            rows={1}
            size="md"
            placeholder={
              translationEnabled
                ? "한국어로 입력하세요. 고객 언어로 자동 번역되어 전송됩니다. (Enter 전송)"
                : "메시지 입력 (Enter 전송 · Shift+Enter 줄바꿈)"
            }
            className={composerInputClass}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            onKeyDown={onKeyDownMessage}
            disabled={sending}
          />
          <IconButton
            type="submit"
            variant="primary"
            size="md"
            icon={<IconSend size={getControlIconSize("md")} stroke={ICON_STROKE} />}
            aria-label={sending ? "전송 중" : "전송"}
            disabled={sending}
          />
        </div>
      </form>

      <ReservationLinkPicker
        open={linkPickerOpen}
        links={reservationLinks}
        onClose={() => setLinkPickerOpen(false)}
        onSelect={onSelectReservationLink}
      />
    </>
  );
};

export default MessageComposer;
