import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";

/** 매장 수요 랭킹 (store_events 기준) */
const AdminDemand = async () => {
  /** Supabase: store_events·stores — 매장별 이벤트 수 집계 */
  const supabase = createClient();
  const [{ data: events }, { data: stores }] = await Promise.all([
    supabase.from("store_events").select("store_id"),
    supabase.from("stores").select("id, name"),
  ]);

  const nameMap = new Map((stores ?? []).map((s) => [s.id, s.name]));
  const counts = new Map<string, number>();
  for (const e of events ?? []) {
    counts.set(e.store_id, (counts.get(e.store_id) ?? 0) + 1);
  }
  const ranking = [...counts.entries()]
    .map(([storeId, count]) => ({ storeId, count, name: nameMap.get(storeId) ?? storeId }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <PageHeader title="매장 수요" description="이벤트 기준 매장 수요 랭킹" />
      <PageBody>
        <ListSection title="수요 랭킹">
          {ranking.length > 0 ? (
            <Table headers={["순위", "매장명", "이벤트 수"]}>
              {ranking.map((row, idx) => (
                <tr key={row.storeId}>
                  <td>{idx + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState plain message="이벤트 데이터가 없습니다." />
          )}
        </ListSection>
      </PageBody>
    </>
  );
};

export default AdminDemand;
