import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";

/** 매장별 월간 사용량 */
const AdminUsage = async () => {
  /** Supabase: usage_monthly·stores — 월간 사용량 목록 조회 */
  const supabase = createClient();
  const [{ data: usage }, { data: stores }] = await Promise.all([
    supabase.from("usage_monthly").select("*").order("year_month", { ascending: false }),
    supabase.from("stores").select("id, name"),
  ]);

  const nameMap = new Map((stores ?? []).map((s) => [s.id, s.name]));

  return (
    <>
      <PageHeader title="채팅사용량" description="매장별 월간 채팅 사용량" />
      <PageBody>
        <ListSection title="월간 사용량">
          {usage && usage.length > 0 ? (
            <Table headers={["매장명", "월", "메시지 수", "대화 수"]}>
              {usage.map((u) => (
                <tr key={u.id}>
                  <td>{nameMap.get(u.store_id) ?? u.store_id}</td>
                  <td>{u.year_month}</td>
                  <td>{u.message_count}</td>
                  <td>{u.conversation_count}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState plain message="사용량 데이터가 없습니다." />
          )}
        </ListSection>
      </PageBody>
    </>
  );
};

export default AdminUsage;
