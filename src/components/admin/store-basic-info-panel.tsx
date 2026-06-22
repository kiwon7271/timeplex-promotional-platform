"use client";

import { useRouter } from "next/navigation";
import { onUpdateStoreStatus, onUpdateStorePlan } from "@/actions/stores";
import { PLAN_CODES } from "@/lib/constants";
import { STORE_STATUS_OPTIONS } from "@/lib/status-label";
import type { Store } from "@/types/database";
import Card from "@/components/ui/card";
import StatusSelect from "@/components/ui/status-select";

export interface StoreBasicInfoPanelProps {
  store: Store;
}

/** 매장 기본 정보 — 상태·요금제 변경 */
const StoreBasicInfoPanel = ({ store }: StoreBasicInfoPanelProps) => {
  const router = useRouter();

  const onChangeStoreStatus = async (next: string) => {
    const res = await onUpdateStoreStatus(store.id, next);
    if (res.ok) router.refresh();
    return res;
  };

  const onChangeStorePlan = async (next: string) => {
    const res = await onUpdateStorePlan(store.id, next);
    if (res.ok) router.refresh();
    return res;
  };

  const contactText =
    [store.email, store.phone].filter(Boolean).join(" / ") || "-";

  return (
    <Card flush>
      <dl className="space-y-3 p-5 text-[14px] leading-[20px]">
        <div className="flex justify-between gap-4">
          <dt className="shrink-0 text-gray-600">매장명</dt>
          <dd className="text-right font-medium text-gray-900">{store.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="shrink-0 text-gray-600">이메일 / 전화</dt>
          <dd className="text-right text-gray-900">{contactText}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">주소</dt>
          <dd className="text-right text-gray-900">{store.address ?? "-"}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-gray-600">상태</dt>
          <dd className="min-w-0">
            <StatusSelect
              value={store.status}
              options={STORE_STATUS_OPTIONS}
              onChange={onChangeStoreStatus}
              className="w-full min-w-[8rem] sm:w-auto"
            />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-gray-600">요금제</dt>
          <dd className="min-w-0">
            <StatusSelect
              value={store.plan_code}
              options={PLAN_CODES}
              onChange={onChangeStorePlan}
              className="w-full min-w-[8rem] sm:w-auto"
            />
          </dd>
        </div>
      </dl>
    </Card>
  );
};

export default StoreBasicInfoPanel;
