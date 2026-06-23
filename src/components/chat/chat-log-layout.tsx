"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { getLocaleLabelKo } from "@/lib/locale";
import type { ChatLogLayoutProps } from "@/types/chat";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import ChatThreadLog from "@/components/chat/chat-thread-log";
import ClientDateTime from "@/components/chat/elements/client-date-time";
import ListPagination from "@/components/ui/list-pagination";

const panelHeaderClass =
  "flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 px-4";

/** 공통 채팅방 템플릿 — 통합관리자(읽기) / 매장관리자(입력) 공용 */
const ChatLogLayout = ({
  toolbar,
  conversations,
  messages,
  conversationId,
  onSelectConversation,
  listPlaceholder,
  composer,
  conversationActions,
  loadingMessages,
  listPage,
  listTotalPages,
  listBasePath,
  listQuery,
}: ChatLogLayoutProps) => {
  const logScrollRef = useRef<HTMLDivElement>(null);
  const mediaScrollTimerRef = useRef<number | null>(null);
  const selectedConversation = conversations.find((c) => c.id === conversationId);
  const lastMessageId = messages.at(-1)?.id;

  // 데이터 로드·방 전환 시 페int 전 한 번만 하단으로 이동
  useLayoutEffect(() => {
    if (!conversationId) return;

    const el = logScrollRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [conversationId, lastMessageId, messages.length]);

  const onMediaLoad = () => {
    if (mediaScrollTimerRef.current) window.clearTimeout(mediaScrollTimerRef.current);

    // 이미지 높이 반영 후 한 번만 보정
    mediaScrollTimerRef.current = window.setTimeout(() => {
      const el = logScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      mediaScrollTimerRef.current = null;
    }, 150);
  };

  return (
    <div className="space-y-4">
      {toolbar}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex h-[min(70vh,640px)] min-h-[480px] flex-col lg:flex-row">
          <aside className="flex min-h-0 w-full flex-col border-b border-gray-200 max-lg:max-h-[45%] lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className={panelHeaderClass}>
              <span className="text-[13px] font-medium text-gray-900">대화 목록</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {listPlaceholder ? (
                <EmptyState plain message={listPlaceholder} />
              ) : conversations.length > 0 ? (
                <ul className="space-y-1">
                  {conversations.map((c) => {
                    const active = conversationId === c.id;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => onSelectConversation(c.id)}
                          className={cn(
                            "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                            active
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-800 hover:bg-gray-50",
                          )}
                        >
                          <p className="flex items-center justify-between gap-2 text-[14px] font-medium leading-[20px]">
                            <span className="truncate">{c.customer_name ?? "고객"}</span>
                            {!active && (c.unread_count ?? 0) > 0 ? (
                              <span className="shrink-0 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                                {c.unread_count > 99 ? "99+" : c.unread_count}
                              </span>
                            ) : null}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge value={c.channel} />
                            {c.last_message_at ? (
                              <ClientDateTime
                                value={c.last_message_at}
                                className="text-[11px] text-gray-500"
                              />
                            ) : (
                              <span className="text-[11px] text-gray-500">-</span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState plain message="대화가 없습니다." />
              )}
              {listBasePath && listTotalPages && listTotalPages > 1 && listPage ? (
                <ListPagination
                  className="border-t border-gray-100 p-2"
                  basePath={listBasePath}
                  page={listPage}
                  totalPages={listTotalPages}
                  query={listQuery}
                  size="sm"
                />
              ) : null}
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className={cn(panelHeaderClass, "justify-between")}>
              {selectedConversation ? (
                <>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <p className="truncate text-[14px] font-medium leading-[20px] text-gray-900">
                      {selectedConversation.customer_name ?? "고객"}
                    </p>
                    <Badge value={selectedConversation.channel} />
                    {selectedConversation.customer_locale ? (
                      <span className="truncate text-[12px] font-normal text-gray-500">
                        고객 언어: {getLocaleLabelKo(selectedConversation.customer_locale)}
                      </span>
                    ) : null}
                    {selectedConversation.customer_phone ? (
                      <span className="truncate text-[12px] font-normal text-gray-500">
                        {selectedConversation.customer_phone}
                      </span>
                    ) : null}
                  </div>
                  {conversationActions ? (
                    <div className="shrink-0">{conversationActions}</div>
                  ) : null}
                </>
              ) : (
                <p className="text-[13px] font-normal text-gray-500">대화를 선택하세요.</p>
              )}
            </div>
            <div
              ref={logScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-50 p-4"
            >
              {conversationId ? (
                loadingMessages && messages.length === 0 ? (
                  <div className="flex h-full min-h-[160px] items-center justify-center">
                    <p className="text-[13px] text-gray-500">메시지 불러오는 중…</p>
                  </div>
                ) : (
                  <ChatThreadLog
                    key={conversationId}
                    messages={messages}
                    customerName={selectedConversation?.customer_name ?? undefined}
                    customerLocale={selectedConversation?.customer_locale}
                    onMediaLoad={onMediaLoad}
                  />
                )
              ) : (
                <div className="flex h-full min-h-[160px] items-center justify-center">
                  <EmptyState plain message="좌측에서 대화를 선택하세요." />
                </div>
              )}
            </div>
            {composer && conversationId ? (
              <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:px-4">{composer}</div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChatLogLayout;
