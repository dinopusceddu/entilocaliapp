-- B1-I LOCAL REVIEW ONLY. Not an automatic release migration.
DO $$ BEGIN IF to_regprocedure('public.is_admin(uuid)') IS NULL THEN RAISE EXCEPTION 'B1I_PRE_UUID_MISSING'; END IF; END $$;
CREATE OR REPLACE FUNCTION public.is_admin(user_uid uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,pg_temp AS $$ BEGIN RETURN EXISTS(SELECT 1 FROM public.profiles WHERE id=user_uid AND role='admin'); END;$$;
