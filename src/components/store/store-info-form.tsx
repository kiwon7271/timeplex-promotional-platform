"use client";

import { useState } from "react";
import {
  IconBuildingStore,
  IconDeviceFloppy,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { apiPost } from "@/lib/api-client";
import type { StoreInfoFormProps } from "@/types/store";
import ListSection from "@/components/ui/list-section";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import { useDialog } from "@/components/providers/dialog-provider";

/** 매장 기본 정보 수정 폼 (이메일 readonly) */
const StoreInfoForm = ({ store, onMutated }: StoreInfoFormProps) => {
  const { openAlert } = useDialog();
  const [saved, setSaved] = useState(false);

  const onSubmit = async (formData: FormData) => {
    const res = await apiPost("/api/store/info", formData);
    if (!res.ok) {
      await openAlert({
        title: "저장 실패",
        message: res.message ?? "저장 실패",
      });
      return;
    }
    setSaved(true);
    onMutated?.();
  };

  return (
    <ListSection title="기본 정보" className="max-w-lg">
      <form action={onSubmit} className="space-y-4 p-4 sm:p-5">
        <Field label="매장명">
          <Input
            name="name"
            defaultValue={store.name}
            required
            leadingIcon={
              <IconBuildingStore size={ICON_SIZE.md} stroke={ICON_STROKE} />
            }
          />
        </Field>
        <Field label="이메일 (수정 불가)">
          <Input
            defaultValue={store.email ?? ""}
            disabled
            leadingIcon={<IconMail size={ICON_SIZE.md} stroke={ICON_STROKE} />}
          />
        </Field>
        <Field label="전화">
          <Input
            name="phone"
            defaultValue={store.phone ?? ""}
            leadingIcon={<IconPhone size={ICON_SIZE.md} stroke={ICON_STROKE} />}
          />
        </Field>
        <Field label="주소">
          <Input
            name="address"
            defaultValue={store.address ?? ""}
            leadingIcon={
              <IconMapPin size={ICON_SIZE.md} stroke={ICON_STROKE} />
            }
          />
        </Field>
        <Field label="설명">
          <Textarea
            name="description"
            defaultValue={store.description ?? ""}
            rows={3}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            icon={<IconDeviceFloppy size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          >
            저장
          </Button>
          {saved ? (
            <Text.Body2 className="text-gray-600">저장되었습니다.</Text.Body2>
          ) : null}
        </div>
      </form>
    </ListSection>
  );
};

export default StoreInfoForm;
