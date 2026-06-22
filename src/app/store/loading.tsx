/** 매장 영역 페이지 전환 — 즉시 피드백 */
const StoreLoading = () => (
  <div className="animate-pulse space-y-4 p-4 sm:p-6">
    <div className="h-8 w-48 rounded-md bg-gray-200" />
    <div className="h-4 w-72 max-w-full rounded-md bg-gray-100" />
    <div className="mt-6 h-[min(60vh,480px)] rounded-lg border border-gray-200 bg-gray-50" />
  </div>
);

export default StoreLoading;
