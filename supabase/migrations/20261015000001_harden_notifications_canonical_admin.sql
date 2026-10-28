-- STAGING_VALIDATED_NOT_PRODUCTION_APPLY_APPROVED
-- Forward-only: canonical ADMIN predicate; recipient/broadcast audience unchanged.
BEGIN;
SET LOCAL lock_timeout='2s';
SET LOCAL statement_timeout='10s';
SET LOCAL search_path=pg_catalog,public;
DO $guard$
DECLARE
 helper oid:=to_regprocedure('public.check_is_admin()'); body text;
 legacy text:='(exists(select1fromuser_app_statewhere((user_app_state.user_id=auth.uid())and(user_app_state.role=''admin''::text))))';
 recipient text:='((exists(select1fromuser_app_statewhere((user_app_state.user_id=auth.uid())and(user_app_state.role=''admin''::text))))or(user_id=auth.uid())or(user_idisnull))';
 p record;
BEGIN
 IF helper IS NULL THEN RAISE EXCEPTION 'Missing canonical helper'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc f JOIN pg_roles r ON r.oid=f.proowner
  WHERE f.oid=helper AND f.pronargs=0 AND f.prorettype='boolean'::regtype
  AND f.proowner='postgres'::regrole AND r.rolbypassrls
  AND f.prosecdef AND f.provolatile='s' AND f.proconfig=ARRAY['search_path=public'])
 OR NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.profiles'::regclass
  AND relrowsecurity AND NOT relforcerowsecurity AND relowner='postgres'::regrole)
 THEN RAISE EXCEPTION 'Unreviewed helper or profiles security'; END IF;
 SELECT lower(regexp_replace(prosrc,'\s+','','g')) INTO body FROM pg_proc WHERE oid=helper;
 IF body NOT IN (
  'beginreturnexists(select1frompublic.profileswhereid=auth.uid()andupper(role)=''admin'');end;',
  'selectexists(select1frompublic.profileswhereid=auth.uid()andupper(role)=''admin'');'
 ) THEN RAISE EXCEPTION 'Unreviewed canonical helper source'; END IF;
 IF has_schema_privilege('anon','public','CREATE') OR has_schema_privilege('authenticated','public','CREATE')
 OR has_schema_privilege('anon','auth','CREATE') OR has_schema_privilege('authenticated','auth','CREATE')
 OR NOT has_function_privilege('anon',helper,'EXECUTE')
 OR NOT has_function_privilege('authenticated',helper,'EXECUTE')
 THEN RAISE EXCEPTION 'Unreviewed namespace or execution privileges'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.notifications'::regclass AND relrowsecurity)
 OR (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='notifications')<>4
 THEN RAISE EXCEPTION 'Unexpected notifications policy set'; END IF;
 FOR p IN SELECT policyname,cmd,permissive,roles::text AS roles,
  lower(regexp_replace(qual,'\s+','','g')) AS q,
  lower(regexp_replace(with_check,'\s+','','g')) AS c
  FROM pg_policies WHERE schemaname='public' AND tablename='notifications'
 LOOP
  IF p.permissive<>'PERMISSIVE' OR p.roles<>'{public}'
  THEN RAISE EXCEPTION 'Unexpected notifications audience'; END IF;
  IF p.policyname='Admin can insert notifications' AND p.cmd='INSERT'
   AND p.q IS NULL AND p.c=legacy THEN CONTINUE;
  ELSIF p.policyname='Admin can update notifications' AND p.cmd='UPDATE'
   AND p.q=legacy AND p.c IS NULL THEN CONTINUE;
  ELSIF p.policyname='Admin can delete notifications' AND p.cmd='DELETE'
   AND p.q=legacy AND p.c IS NULL THEN CONTINUE;
  ELSIF p.policyname='Users can view their notifications or broadcast' AND p.cmd='SELECT'
   AND p.q=recipient AND p.c IS NULL THEN CONTINUE;
  ELSE RAISE EXCEPTION 'Notifications policy is not the reviewed legacy definition: %',p.policyname;
  END IF;
 END LOOP;
END $guard$;
-- TO omitted intentionally: preserve the original policy roles exactly.
ALTER POLICY "Admin can insert notifications" ON public.notifications
 WITH CHECK ((SELECT public.check_is_admin()));
ALTER POLICY "Admin can update notifications" ON public.notifications
 USING ((SELECT public.check_is_admin()));
-- WITH CHECK remains NULL: PostgreSQL applies USING to the new UPDATE row too.
ALTER POLICY "Admin can delete notifications" ON public.notifications
 USING ((SELECT public.check_is_admin()));
ALTER POLICY "Users can view their notifications or broadcast" ON public.notifications
 USING ((SELECT public.check_is_admin()) OR user_id=auth.uid() OR user_id IS NULL);
COMMIT;
