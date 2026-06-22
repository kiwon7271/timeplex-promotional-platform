-- store_documents 반려 사유
alter table public.store_documents
  add column if not exists rejection_reason text;
