"use client";

import { useState, useTransition } from "react";
import Select from "@/components/ui/select";
import { useDialog } from "@/components/providers/dialog-provider";
import type { StatusSelectProps } from "@/types/ui";

/** 상태 변경 셀렉트 (서버 액션 연동) */
const StatusSelect = ({ value, options, onChange, className, size = "md" }: StatusSelectProps) => {
  const { openAlert } = useDialog();
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();

  const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setCurrent(next);
    startTransition(() => {
      void (async () => {
        const res = await onChange(next);
        if (!res.ok) {
          setCurrent(value);
          if (res.message) {
            await openAlert({ title: "변경 실패", message: res.message });
          }
        }
      })();
    });
  };

  return (
    <Select
      size={size}
      value={current}
      onChange={onSelect}
      disabled={pending}
      options={options}
      className={className}
    />
  );
};

export default StatusSelect;
