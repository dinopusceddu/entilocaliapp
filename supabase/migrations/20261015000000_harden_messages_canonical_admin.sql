-- PROPOSAL ONLY. Never applied remotely. Separate staging authorization required.
-- Forward-only. Four messages policies; canonical notifications and broadcasts preserved.
BEGIN;
SET LOCAL lock_timeout='2s';
SET LOCAL statement_timeout='10s';
DO $guard$
DECLARE helper oid:=to_regprocedure('public.check_is_admin()'); body text;
BEGIN
 IF helper IS NULL THEN RAISE EXCEPTION 'Missing canonical helper'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_roles r ON r.oid=p.proowner
  WHERE p.oid=helper AND p.prosecdef AND p.provolatile='s' AND p.pronargs=0
  AND p.prorettype='boolean'::regtype AND p.proconfig @> ARRAY['search_path=public']
  AND r.rolbypassrls)
 OR NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.profiles'::regclass
  AND relrowsecurity AND NOT relforcerowsecurity)
 THEN RAISE EXCEPTION 'Unreviewed helper security or profiles RLS'; END IF;
 SELECT lower(regexp_replace(prosrc,'\s+','','g')) INTO body FROM pg_proc WHERE oid=helper;
 IF body NOT IN (
  'beginreturnexists(select1frompublic.profileswhereid=auth.uid()andupper(role)=''admin'');end;',
  'selectexists(select1frompublic.profileswhereid=auth.uid()andupper(role)=''admin'');'
 ) THEN RAISE EXCEPTION 'Unreviewed helper source'; END IF;
 IF has_schema_privilege('anon','public','CREATE')
 OR has_schema_privilege('authenticated','public','CREATE')
 OR has_schema_privilege('anon','auth','CREATE')
 OR has_schema_privilege('authenticated','auth','CREATE')
 OR NOT has_function_privilege('authenticated',helper,'EXECUTE')
 OR NOT has_function_privilege('anon',helper,'EXECUTE')
 THEN RAISE EXCEPTION 'Unreviewed namespaces or helper execution grants'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.messages'::regclass AND relrowsecurity)
 OR (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='messages')<>4
 OR (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='messages'
  AND policyname IN ('Admin can insert messages','Admin can update messages',
  'Admin can delete messages','Users can view messages directed to them or broadcast'))<>4
 THEN RAISE EXCEPTION 'Unexpected messages policy set'; END IF;
END $guard$;
ALTER POLICY "Admin can insert messages" ON public.messages
 TO authenticated WITH CHECK ((SELECT public.check_is_admin()));
ALTER POLICY "Admin can update messages" ON public.messages
 TO authenticated USING ((SELECT public.check_is_admin()))
 WITH CHECK ((SELECT public.check_is_admin()));
ALTER POLICY "Admin can delete messages" ON public.messages
 TO authenticated USING ((SELECT public.check_is_admin()));
ALTER POLICY "Users can view messages directed to them or broadcast" ON public.messages
 TO public USING ((SELECT public.check_is_admin()) OR user_id=auth.uid() OR user_id IS NULL);
-- No data, grants, roles, helpers, RLS flags, read receipts or notifications changed.
COMMIT;

