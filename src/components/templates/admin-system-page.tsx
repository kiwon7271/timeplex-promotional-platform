"use client";

import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { getDeliveryStatusLabel } from "@/lib/delivery-status";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import SystemRetryButton from "@/components/admin/elements/system-retry-button";
import PageSkeleton from "@/components/ui/page-skeleton";

type ConversationMeta = {
  store_id: string;
  customer_name: string | null;
  channel: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  body: string;
  sender: string;
  delivery_status: string | null;
  failed_reason: string | null;
  created_at: string;
  conversations: ConversationMeta | ConversationMeta[] | null;
};

type WebhookRow = {
  id: string;
  store_id: string;
  channel: string;
  status: string;
  last_webhook_at: string | null;
  last_webhook_summary: string | null;
  error_message: string | null;
  stores: { name: string } | { name: string }[] | null;
};

type SystemData = {
  failedMessages: MessageRow[];
  pendingMessages: MessageRow[];
  webhookConnections: WebhookRow[];
  translationFailures: MessageRow[];
};

const resolveConversation = (row: MessageRow): ConversationMeta | null => {
  const raw = row.conversations;
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
};

/** 시스템 디버그 — CSR */
const AdminSystemPage = () => {
  const { ready } = useAdminSession();
  const { data, loading } = useApiQuery<SystemData>(ready ? "/api/admin/system" : null, ready);

  const renderMessageRows = (
    rows: MessageRow[] | null | undefined,
    options?: { retryMode?: "delivery" | "translation" },
  ) => {
    if (!rows?.length) return <EmptyState plain message="해당 항목이 없습니다." />;

    const headers = options?.retryMode
      ? ["시각", "매장/채널", "발신", "상태", "내용", "사유", "액션"]
      : ["시각", "매장/채널", "발신", "상태", "내용", "사유"];

    return (
      <Table headers={headers}>
        {rows.map((row) => {
          const conversation = resolveConversation(row);
          return (
            <tr key={row.id}>
              <td className="whitespace-nowrap text-[12px]">{row.created_at.slice(0, 19)}</td>
              <td className="text-[12px]">
                {conversation?.customer_name ?? "-"} / {conversation?.channel ?? "-"}
              </td>
              <td className="text-[12px]">{row.sender}</td>
              <td className="text-[12px]">{getDeliveryStatusLabel(row.delivery_status as never)}</td>
              <td className="max-w-[200px] truncate text-[12px]">{row.body}</td>
              <td className="text-[12px] text-red-600">{row.failed_reason ?? "-"}</td>
              {options?.retryMode ? (
                <td className="text-[12px]">
                  <SystemRetryButton
                    messageId={row.id}
                    conversationId={row.conversation_id}
                    mode={options.retryMode}
                  />
                </td>
              ) : null}
            </tr>
          );
        })}
      </Table>
    );
  };

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="시스템 디버그" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  const webhookConnections = data?.webhookConnections ?? [];

  return (
    <>
      <PageHeader title="시스템 디버그" description="배달 실패·대기 메시지 및 웹훅 로그 (내부용)" />
      <PageBody className="space-y-8">
        <ListSection title="전송 실패 메시지">
          {renderMessageRows(data?.failedMessages, { retryMode: "delivery" })}
        </ListSection>

        <ListSection title="배달 대기 메시지">
          {renderMessageRows(data?.pendingMessages)}
        </ListSection>

        <ListSection title="번역 실패 (고객 메시지)">
          {renderMessageRows(data?.translationFailures, { retryMode: "translation" })}
        </ListSection>

        <ListSection title="최근 Webhook 수신">
          {webhookConnections.length > 0 ? (
            <Table headers={["시각", "매장", "채널", "상태", "요약", "오류"]}>
              {webhookConnections.map((row) => {
                const storeRaw = row.stores as unknown;
                const store = (Array.isArray(storeRaw) ? storeRaw[0] : storeRaw) as
                  | { name: string }
                  | null
                  | undefined;
                return (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap text-[12px]">
                      {row.last_webhook_at?.slice(0, 19) ?? "-"}
                    </td>
                    <td className="text-[12px]">{store?.name ?? row.store_id}</td>
                    <td className="text-[12px]">{row.channel}</td>
                    <td className="text-[12px]">{row.status}</td>
                    <td className="max-w-[240px] truncate text-[12px]">
                      {row.last_webhook_summary ?? "-"}
                    </td>
                    <td className="text-[12px] text-red-600">{row.error_message ?? "-"}</td>
                  </tr>
                );
              })}
            </Table>
          ) : (
            <EmptyState plain message="Webhook 로그가 없습니다." />
          )}
        </ListSection>
      </PageBody>
    </>
  );
};

export default AdminSystemPage;
