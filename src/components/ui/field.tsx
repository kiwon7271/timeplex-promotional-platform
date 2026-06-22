"use client";

import Text from "@/components/ui/text";
import type { FieldProps } from "@/types/ui";

/** 라벨 + 입력 필드 래퍼 */
const Field = ({ label, children, hint }: FieldProps) => {
  return (
    <label className="block space-y-2">
      <Text.Body2 className="font-medium text-gray-800">{label}</Text.Body2>
      {children}
      {hint ? <Text.Body3 className="text-gray-500">{hint}</Text.Body3> : null}
    </label>
  );
};

export default Field;
