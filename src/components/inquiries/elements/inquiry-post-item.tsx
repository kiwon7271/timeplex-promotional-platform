"use client";

import { useState, useTransition } from "react";
import { IconDeviceFloppy, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import {
  onDeleteInquiryMessage,
  onUpdateInquiryMessage,
  onUpdateInquiryOpening,
} from "@/actions/inquiries";
import {
  canDeleteInquiryPost,
  canEditInquiryPost,
  getInquiryAuthorLabel,
  isStoreInquiryAuthor,
  type InquiryPost,
  type InquiryThreadPayload,
} from "@/lib/inquiry-thread";
import { formatDateTime } from "@/lib/format-datetime";
import {
  getInquiryCategoryLabel,
  INQUIRY_CATEGORY_OPTIONS,
  isInquiryCategory,
} from "@/lib/inquiry-category";
import { cn } from "@/lib/cn";
import { useDialog } from "@/components/providers/dialog-provider";
import Badge from "@/components/ui/badge";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import ActionButton from "@/components/ui/action-button";
import { getControlIconSize, ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";

export interface InquiryPostItemProps {
  post: InquiryPost;
  thread: InquiryThreadPayload;
  onUpdated: () => void;
}

/** 문의 게시판 — 글 1건 (수정·삭제) */
const InquiryPostItem = ({ post, thread, onUpdated }: InquiryPostItemProps) => {
  const { openAlert } = useDialog();
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(thread.inquiry.title);
  const [categoryDraft, setCategoryDraft] = useState(thread.inquiry.category);
  const [draft, setDraft] = useState(post.body);
  const [pending, startTransition] = useTransition();

  const isStore = isStoreInquiryAuthor(post.author_role);
  const permissionCtx = {
    isAdmin: thread.isAdmin,
    viewerId: thread.viewerId,
    viewerStoreId: thread.viewerStoreId,
    inquiryStoreId: thread.inquiry.store_id,
  };
  const canEdit = canEditInquiryPost(post, permissionCtx);
  const canDelete = canDeleteInquiryPost(post, permissionCtx);

  const onClickEditButton = () => {
    if (post.isOpening) {
      setTitleDraft(thread.inquiry.title);
      setCategoryDraft(thread.inquiry.category);
    }
    setDraft(post.body);
    setEditing(true);
  };

  const onClickCancelEdit = () => {
    if (post.isOpening) {
      setTitleDraft(thread.inquiry.title);
      setCategoryDraft(thread.inquiry.category);
    }
    setDraft(post.body);
    setEditing(false);
  };

  const onClickSaveEdit = () => {
    const trimmed = draft.trim();
    if (post.isOpening) {
      const trimmedTitle = titleDraft.trim();
      if (!trimmedTitle) {
        void openAlert({ title: "입력 필요", message: "제목을 입력해 주세요." });
        return;
      }
      if (!isInquiryCategory(categoryDraft)) {
        void openAlert({ title: "입력 필요", message: "구분을 선택해 주세요." });
        return;
      }
      if (!trimmed) {
        void openAlert({ title: "입력 필요", message: "내용을 입력해 주세요." });
        return;
      }
    } else if (!trimmed) {
      void openAlert({ title: "입력 필요", message: "내용을 입력해 주세요." });
      return;
    }

    startTransition(async () => {
      const res = post.isOpening
        ? await onUpdateInquiryOpening(
            thread.inquiry.id,
            titleDraft,
            trimmed,
            categoryDraft,
          )
        : await onUpdateInquiryMessage(post.id, trimmed);

      if (!res.ok) {
        await openAlert({
          title: "수정 실패",
          message: res.message ?? "수정 실패",
        });
        return;
      }

      setEditing(false);
      onUpdated();
    });
  };

  const onDeleteAction = async () => {
    const res = await onDeleteInquiryMessage(post.id);
    if (res.ok) onUpdated();
    return res;
  };

  return (
    <li
      className={cn(
        "px-4 py-4 sm:px-5",
        isStore ? "bg-white" : "bg-gray-50/80",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold leading-[20px] text-gray-900">
            {getInquiryAuthorLabel(post)}
          </span>
          {post.isOpening ? (
            <>
              <Badge variant="muted">문의</Badge>
              <Badge variant="muted">{getInquiryCategoryLabel(thread.inquiry.category)}</Badge>
            </>
          ) : isStore ? (
            <Badge variant="default">매장</Badge>
          ) : (
            <Badge variant="info">운영팀</Badge>
          )}
          <span className="text-[12px] leading-[16px] text-gray-500">
            {formatDateTime(post.created_at)}
          </span>
        </div>

        {(canEdit || canDelete) && !editing ? (
          <div className="flex items-center gap-1">
            {canEdit ? (
              <IconButton
                type="button"
                variant="outline"
                size="sm"
                tooltip="수정"
                tooltipPlacement="bottom"
                aria-label="수정"
                icon={<IconPencil size={getControlIconSize("sm")} stroke={ICON_STROKE} />}
                onClick={onClickEditButton}
              />
            ) : null}
            {canDelete ? (
              <ActionButton
                variant="danger"
                size="sm"
                iconOnly
                tooltip="삭제"
                tooltipPlacement="bottom"
                ariaLabel="삭제"
                confirm="이 글을 삭제할까요?"
                icon={<IconTrash size={getControlIconSize("sm")} stroke={ICON_STROKE} />}
                onAction={onDeleteAction}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className="space-y-3">
          {post.isOpening ? (
            <Field label="구분">
              <Select
                value={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
                disabled={pending}
                options={INQUIRY_CATEGORY_OPTIONS}
              />
            </Field>
          ) : null}
          {post.isOpening ? (
            <Field label="제목">
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                disabled={pending}
              />
            </Field>
          ) : null}
          {post.isOpening ? (
            <Field label="내용">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                disabled={pending}
              />
            </Field>
          ) : (
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              disabled={pending}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClickCancelEdit}
              disabled={pending}
              icon={<IconX size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onClickSaveEdit}
              disabled={pending}
              icon={<IconDeviceFloppy size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
            >
              {pending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap break-words text-[14px] leading-[22px] text-gray-800">
          {post.body}
        </p>
      )}
    </li>
  );
};

export default InquiryPostItem;
