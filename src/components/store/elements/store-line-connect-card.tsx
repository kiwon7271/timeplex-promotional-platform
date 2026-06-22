"use client";

import { useState } from "react";
import { IconCopy, IconPlugConnected } from "@tabler/icons-react";
import {
  onConnectLineChannel,
  onDisconnectLineChannel,
} from "@/actions/channel-connections";
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
}

/** LINE 연결 카드 — Webhook URL 안내 + credential 입력 */
const StoreLineConnectCard = ({
  connection,
  lineWebhookUrl,
  lineDiagnostic,
}: StoreLineConnectCardProps) => {
  const { openAlert, openConfirm } = useDialog();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const status = (connection?.status ?? "DISCONNECTED") as ChannelConnectionStatus;
  const isConnected = status === "CONNECTED";

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
      const res = await onConnectLineChannel(formData);
      if (!res.ok) {
        await openAlert({ title: "연결 실패", message: res.message ?? "연결 실패" });
        return;
      }

      await openAlert({
        title: "연결 완료",
        message:
          "LINE Developers Console에 Webhook URL을 등록하고 Verify 후 Use webhook을 켜 주세요.",
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const onClickDisconnect = async () => {
    const confirmed = await openConfirm({
      title: "LINE 연결 해제",
      message: "LINE 연결을 해제하면 새 메시지를 받을 수 없습니다. 계속할까요?",
    });

    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await onDisconnectLineChannel();
      if (!res.ok) {
        await openAlert({ title: "해제 실패", message: res.message ?? "해제 실패" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <li className="flex flex-col gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-3 sm:col-span-2 lg:col-span-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-gray-900">라인</span>
            <Badge value={CHANNEL_CONNECTION_STATUS_LABEL[status]} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={isConnected ? "outline" : "primary"}
              size="sm"
              icon={<IconPlugConnected size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
              onClick={onClickOpenModal}
              disabled={saving}
            >
              {isConnected ? "연결 정보 수정" : "라인 연결하기"}
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

        <div className="space-y-2 rounded-md bg-white p-3 ring-1 ring-gray-200/80">
          <Text.Body3 className="font-medium text-gray-800">
            ① Webhook URL (LINE Console에 등록)
          </Text.Body3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 break-all rounded bg-gray-100 px-2 py-1.5 text-[12px] text-gray-800">
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
          <Text.Body3 className="text-[12px] leading-relaxed text-gray-600">
            LINE Developers → Messaging API → Webhook URL 등록 → **Timeplex에서 Secret·Token 저장 후** Verify → Use webhook ON
          </Text.Body3>
        </div>

        {isConnected ? (
          <Text.Body3 className="text-[12px] text-gray-600">
            Channel ID: {connection?.external_account_id ?? lineDiagnostic.channelId ?? "-"}
            {connection?.display_name ? ` · ${connection.display_name}` : ""}
          </Text.Body3>
        ) : (
          <Text.Body3 className="text-[12px] leading-relaxed text-gray-600">
            ② 「라인 연결하기」에서 Secret·Token을 저장하세요. Channel ID가 틀려도 Verify 시 자동 보정됩니다.
          </Text.Body3>
        )}

        {lineDiagnostic.hints.length > 0 ? (
          <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            {lineDiagnostic.hints.map((hint) => (
              <Text.Body3 key={hint} className="text-[12px] leading-relaxed text-amber-900">
                · {hint}
              </Text.Body3>
            ))}
          </div>
        ) : null}

        {lineDiagnostic.lastWebhookAt ? (
          <Text.Body3 className="text-[12px] leading-relaxed text-gray-600">
            마지막 Webhook 수신:{" "}
            <ClientDateTime
              value={lineDiagnostic.lastWebhookAt}
              className="inline text-[12px] text-gray-600"
            />
            {lineDiagnostic.lastWebhookSummary
              ? ` · ${lineDiagnostic.lastWebhookSummary}`
              : ""}
          </Text.Body3>
        ) : null}

        {isConnected && lineDiagnostic.hasCredentials && lineDiagnostic.serviceRoleConfigured ? (
          <Text.Body3 className="text-[12px] text-green-700">
            · Webhook 수신 준비 OK — LINE 앱에서 공식 계정에 메시지를 보내 테스트하세요.
          </Text.Body3>
        ) : null}
      </li>

      <Modal open={open} title="라인 연결" onClose={onCloseModal} size="md">
        <form action={onSubmitConnect} className="space-y-4">
          <Text.Body3 className="text-gray-600">
            LINE Developers Console에서 아래 값을 복사해 입력하세요.
          </Text.Body3>

          <Field label="Channel ID" hint="Basic settings → Channel ID">
            <Input
              name="channel_id"
              defaultValue={connection?.external_account_id ?? ""}
              placeholder="1234567890"
              required
            />
          </Field>

          <Field label="Channel secret" hint="Basic settings → Channel secret">
            <Input
              name="channel_secret"
              type="password"
              placeholder="Channel secret"
              required
              autoComplete="off"
            />
          </Field>

          <Field
            label="Channel access token"
            hint="Messaging API → Channel access token (long-lived)"
          >
            <Input
              name="channel_access_token"
              type="password"
              placeholder="Channel access token"
              required
              autoComplete="off"
            />
          </Field>

          <Field label="표시 이름 (선택)" hint="관리 화면에서 구분용">
            <Input
              name="display_name"
              defaultValue={connection?.display_name ?? ""}
              placeholder="예: 강남점 라인"
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCloseModal} disabled={saving}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "저장 중…" : "연결 저장"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default StoreLineConnectCard;
