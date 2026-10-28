-- POST-ASTRA: remove unused client DDL privileges; preserve CRUD/RLS.
-- Existing objects only. No data, policy, trigger or service_role changes.
-- postgres/supabase_admin defaults remain deferred: future application
-- migrations must satisfy the client ACL guard in securityMigrations.test.ts.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE
  public.document_chunks,
  public.entities,
  public.knowledge_documents,
  public.message_reads,
  public.messages,
  public.notification_reads,
  public.notifications,
  public.pareri_aran_staging,
  public.profiles,
  public.wizard2026_drafts
FROM anon, authenticated;

-- Table quarantine does not revoke privileges on its associated sequence.
REVOKE SELECT, UPDATE, USAGE ON SEQUENCE
  public.registrazioni_calcolo_fondo_id_registrazione_seq
FROM anon, authenticated;
