import { getRoleLabel } from "@/lib/status-label";
import type { StoreMemberRow } from "@/types/admin";
import Card from "@/components/ui/card";
import Table from "@/components/ui/table";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";

export interface StoreMembersPanelProps {
  members: StoreMemberRow[];
}

/** 매장 소속 직원 목록 */
const StoreMembersPanel = ({ members }: StoreMembersPanelProps) => {
  if (members.length === 0) {
    return (
      <Card flush>
        <EmptyState plain message="소속 직원이 없습니다." />
      </Card>
    );
  }

  return (
    <Card flush>
      <Table headers={["역할", "이메일"]}>
        {members.map((m) => (
          <tr key={m.id}>
            <td>
              <Badge value={m.role}>{getRoleLabel(m.role)}</Badge>
            </td>
            <td>{m.email}</td>
          </tr>
        ))}
      </Table>
    </Card>
  );
};

export default StoreMembersPanel;
