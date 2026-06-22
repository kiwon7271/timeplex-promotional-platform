import { tableBodyClass, tableHeadCellClass } from "@/lib/ui-table";
import type { TableProps } from "@/types/ui";

/** 테이블 프레임 (반응형 가로 스크롤, 셀 패딩 내장) */
const Table = ({ headers, children }: TableProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((h) => (
              <th key={h} className={tableHeadCellClass}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={tableBodyClass}>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
