"use client";

import { useState } from "react";
import { IconCopy, IconPlugConnected } from "@tabler/icons-react";
import { apiDelete, apiPost } from "@/lib/api-client";
import {
  CHANNEL_CONNECTION_STATUS_LABEL,
  type ChannelConnectionStatus,
} from "@/lib/constants";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import type { LineConnectionDiagnostic } from "@/types/store";
import type { StoreChannelConnection } from "@/types/database";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import Text from "@/components/ui/text";
import { useDialog } from "@/components/providers/dialog-provider";
import ClientDateTime from "@/components/chat/elements/client-date-time";

interface StoreLineConnectCardProps {
  connection?: StoreChannelConnection;
  lineWebhookUrl: string;
  lineDiagnostic: LineConnectionDiagnostic;
  /** 채널 패널 내부 — 바깥 테두리 제거 */
  embeddedInPanel?: boolean;
  onMutated?: () => void;
}

/** 매장주에게 불필요한 서버/배포 관련 안내 제외 */
const filterStoreOwnerHints = (hints: string[]) =>
  hints.filter(
    (hint) =>
      !/SERVICE_ROLE|Vercel|Redeploy|OPENAI|\.env/i.test(hint),
  );

/** LINE 연결 */
const StoreLineConnectCard = ({
  connection,
  lineWebhookUrl,
  lineDiagnostic,
  embeddedInPanel = false,
  onMutated,
}: StoreLineConnectCardProps) => {
  const { openAlert, openConfirm } = useDialog();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const status = (connection?.status ?? "DISCONNECTED") as ChannelConnectionStatus;
  const isConnected = status === "CONNECTED";
  const visibleHints = filterStoreOwnerHints(lineDiagnostic.hints);

  const onClickOpenModal = () => {
    setOpen(true);
  };

  const onCloseModal = () => {
    if (!saving) setOpen(false);
  };

  const onClickCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(lineWebhookUrl);
      await openAlert({ message: "Webhook URL을 복사했습니다." });
    } catch {
      await openAlert({ message: "복사에 실패했습니다. URL을 직접 복사해 주세요." });
    }
  };

  const onSubmitConnect = async (formData: FormData) => {
    setSaving(true);
    try {
      const res = await apiPost("/api/store/channels/line", formData);
      if (!res.ok) {
        await openAlert({ title: "저장 실패", message: res.message ?? "저장에 실패했습니다." });
        return;
      }

      await openAlert({
        title: "저장 완료",
        message:
          "LINE Developers에서 Webhook URL을 등록한 뒤 Verify를 누르고, Use webhook을 켜 주세요.",
      });
      setOpen(false);
      onMutated?.();
    } finally {
      setSaving(false);
    }
  };

  const onClickDisconnect = async () => {
    const confirmed = await openConfirm({
      title: "라인 연결 해제",
      message: "연결을 해제하면 새 메시지를 받을 수 없습니다. 계속할까요?",
    });

    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await apiDelete("/api/store/channels/line");
      if (!res.ok) {
        await openAlert({ title: "해제 실패", message: res.message ?? "해제에 실패했습니다." });
        return;
      }
      onMutated?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={embeddedInPanel ? "space-y-3" : "space-y-3 rounded-lg border border-gray-200 bg-white p-4"}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {!embeddedInPanel ? <Badge value={CHANNEL_CONNECTION_STATUS_LABEL[status]} /> : null}
          <div className={embeddedInPanel ? "flex w-full flex-wrap gap-2" : "flex flex-wrap gap-2"}>
            <Button
              type="button"
              variant={isConnected ? "outline" : "primary"}
              size="sm"
              icon={<IconPlugConnected size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
              onClick={onClickOpenModal}
              disabled={saving}
            >
              {isConnected ? "연결 정보 수정" : "Secret · Token 입력"}
            </Button>
            {isConnected ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClickDisconnect}
                disabled={saving}
              >
                연결 해제
              </Button>
            ) : null}
          </div>
        </div>

        {!isConnected ? (
          <ol className="list-decimal space-y-1 pl-4 text-[13px] leading-relaxed text-gray-700">
            <li>아래 Webhook URL을 LINE Developers에 등록합니다.</li>
            <li>「Secret · Token 입력」에서 값을 저장합니다.</li>
            <li>LINE Developers에서 Verify 후 Use webhook을 켭니다.</li>
          </ol>
        ) : (
          <Text.Body3 className="text-[13px] text-gray-600">
            Channel ID: {connection?.external_account_id ?? lineDiagnostic.channelId ?? "-"}
            {connection?.display_name ? ` · ${connection.display_name}` : ""}
          </Text.Body3>
        )}

        <div className="space-y-2 rounded-md bg-gray-50 px-3 py-2.5">
          <Text.Body3 className="text-[12px] font-medium text-gray-700">Webhook URL</Text.Body3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 break-all rounded bg-white px-2 py-1.5 text-[12px] text-gray-800 ring-1 ring-gray-200">
              {lineWebhookUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<IconCopy size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
              onClick={onClickCopyWebhookUrl}
            >
              복사
            </Button>
          </div>
        </div>

        {visibleHints.length > 0 ? (
          <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            {visibleHints.map((hint) => (
              <Text.Body3 key={hint} className="text-[12px] leading-relaxed text-amber-900">
                · {hint}
              </Text.Body3>
            ))}
          </div>
        ) : null}

        {isConnected && lineDiagnostic.lastWebhookAt ? (
          <Text.Body3 className="text-[12px] text-gray-500">
            마지막 메시지 수신:{" "}
            <ClientDateTime
              value={lineDiagnostic.lastWebhookAt}
              className="inline text-[12px] text-gray-500"
            />
          </Text.Body3>
        ) : null}
      </div>

      <Modal open={open} title="라인 연결 정보" onClose={onCloseModal} size="md">
        <form action={onSubmitConnect} className="space-y-4">
          <Text.Body3 className="text-[13px] text-gray-600">
            LINE Developers Console → 해당 채널에서 값을 복사해 입력하세요.
          </Text.Body3>

          <Field label="Channel ID">
            <Input
              name="channel_id"
              defaultValue={connection?.external_account_id ?? ""}
              placeholder="1234567890"
              required
            />
          </Field>

          <Field label="Channel secret">
            <Input
              name="channel_secret"
              type="password"
              placeholder="Channel secret"
              required
              autoComplete="off"
            />
          </Field>

          <Field label="Channel access token">
            <Input
              name="channel_access_token"
              type="password"
              placeholder="Long-lived token"
              required
              autoComplete="off"
            />
          </Field>

          <Field label="표시 이름 (선택)">
            <Input
              name="display_name"
              defaultValue={connection?.display_name ?? ""}
              placeholder="예: 강남점"
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCloseModal} disabled={saving}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "저장 중…" : "저장"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default StoreLineConnectCard;
