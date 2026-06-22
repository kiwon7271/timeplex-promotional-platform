import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";

/** 방문자 분석 (일자별 이벤트, 매장별 클릭 수) */
const AdminVisitors = async () => {
  /** Supabase: store_events·stores — 일자별/매장별 클릭 집계 */
  const supabase = createClient();
  const [{ data: events }, { data: stores }] = await Promise.all([
    supabase.from("store_events").select("store_id, event_type, created_at"),
    supabase.from("stores").select("id, name"),
  ]);

  const nameMap = new Map((stores ?? []).map((s) => [s.id, s.name]));

  const daily = new Map<string, number>();
  const clicks = new Map<string, number>();

  for (const e of events ?? []) {
    const day = (e.created_at ?? "").slice(0, 10);
    if (day) daily.set(day, (daily.get(day) ?? 0) + 1);
    if (e.event_type === "CLICK") clicks.set(e.store_id, (clicks.get(e.store_id) ?? 0) + 1);
  }

  const dailyRows = [...daily.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const clickRows = [...clicks.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader title="방문자 통계" description="일자별 이벤트 / 매장 클릭" />
      <PageBody>
        <ListSection title="일자별 이벤트 수">
          {dailyRows.length > 0 ? (
            <Table headers={["일자", "이벤트 수"]}>
              {dailyRows.map(([day, count]) => (
                <tr key={day}>
                  <td>{day}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState plain message="이벤트가 없습니다." />
          )}
        </ListSection>

        <ListSection title="매장 클릭 수" motionDelay={0.05}>
          {clickRows.length > 0 ? (
            <Table headers={["매장명", "클릭 수"]}>
              {clickRows.map(([storeId, count]) => (
                <tr key={storeId}>
                  <td>{nameMap.get(storeId) ?? storeId}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState plain message="클릭 데이터가 없습니다." />
          )}
        </ListSection>
      </PageBody>
    </>
  );
};

export default AdminVisitors;
