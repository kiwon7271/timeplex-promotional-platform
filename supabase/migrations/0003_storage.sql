-- Timeplex Admin MVP: 스토리지 버킷 및 정책
-- 버킷: store-documents, chat-attachments
-- 허용: jpg/jpeg/png, 최대 5MB (애플리케이션에서 추가 검증)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('store-documents', 'store-documents', false, 5242880,
    array['image/jpeg', 'image/jpg', 'image/png']),
  ('chat-attachments', 'chat-attachments', false, 5242880,
    array['image/jpeg', 'image/jpg', 'image/png'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 경로 첫 세그먼트(store_id) 기준 접근 제어
-- store-documents/{store_id}/{doc_type}/{file_name}
-- chat-attachments/{store_id}/{conversation_id}/{file_name}

drop policy if exists store_documents_access on storage.objects;
create policy store_documents_access on storage.objects
  for all using (
    bucket_id = 'store-documents'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_store_id()::text
    )
  ) with check (
    bucket_id = 'store-documents'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_store_id()::text
    )
  );

drop policy if exists chat_attachments_access on storage.objects;
create policy chat_attachments_access on storage.objects
  for all using (
    bucket_id = 'chat-attachments'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_store_id()::text
    )
  ) with check (
    bucket_id = 'chat-attachments'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_store_id()::text
    )
  );
