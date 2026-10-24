-- B1-I2 LOCAL REVIEW ONLY. Order 02 after 01 and f911 ownership policies. No backfill.
BEGIN;
DO $$ BEGIN
 IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='user_app_state' AND policyname IN ('user_app_state_insert_admin','user_app_state_update_owner','user_app_state_update_admin')) <> 3 THEN RAISE EXCEPTION 'B1I2_POLICY_PRE_MISMATCH'; END IF;
END $$;
CREATE FUNCTION public.b1i2_state_identity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,pg_temp AS $$
DECLARE entity_owner uuid; existing public.user_app_state%ROWTYPE;
BEGIN
 IF TG_OP='UPDATE' THEN
  IF ROW(NEW.entity_id,NEW.current_year,NEW.user_id,NEW.email,NEW.role) IS DISTINCT FROM ROW(OLD.entity_id,OLD.current_year,OLD.user_id,OLD.email,OLD.role) THEN
   RAISE EXCEPTION 'HISTORICAL_IDENTITY_IMMUTABLE' USING ERRCODE='23514';
  END IF;
 ELSE
  SELECT * INTO existing FROM public.user_app_state WHERE entity_id=NEW.entity_id AND current_year=NEW.current_year;
  IF FOUND THEN
   IF ROW(NEW.user_id,NEW.email,NEW.role) IS DISTINCT FROM ROW(existing.user_id,existing.email,existing.role) THEN RAISE EXCEPTION 'HISTORICAL_IDENTITY_IMMUTABLE' USING ERRCODE='23514'; END IF;
  ELSE
   SELECT user_id INTO entity_owner FROM public.entities WHERE id=NEW.entity_id FOR SHARE;
   IF NOT FOUND OR NEW.user_id IS DISTINCT FROM entity_owner OR auth.uid() IS NULL OR (auth.uid() IS DISTINCT FROM entity_owner AND public.is_admin() IS DISTINCT FROM true) THEN
    RAISE EXCEPTION 'STATE_ENTITY_OWNER_MISMATCH' USING ERRCODE='42501';
   END IF;
  END IF;
 END IF; RETURN NEW;
END $$;
ALTER FUNCTION public.b1i2_state_identity() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.b1i2_state_identity() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER b1i2_state_identity BEFORE INSERT OR UPDATE ON public.user_app_state FOR EACH ROW EXECUTE FUNCTION public.b1i2_state_identity();
CREATE FUNCTION public.b1i2_entity_identity() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog,public,pg_temp AS $$
BEGIN
 IF ROW(NEW.id,NEW.user_id) IS DISTINCT FROM ROW(OLD.id,OLD.user_id) THEN RAISE EXCEPTION 'ENTITY_IDENTITY_IMMUTABLE' USING ERRCODE='23514'; END IF; RETURN NEW;
END $$;
ALTER FUNCTION public.b1i2_entity_identity() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.b1i2_entity_identity() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER b1i2_entity_identity BEFORE UPDATE ON public.entities FOR EACH ROW EXECUTE FUNCTION public.b1i2_entity_identity();
-- Same UPDATE row scope as f911. Immutable identity is enforced by the trigger above;
-- existing divergent historical user_id need not be rewritten to pass WITH CHECK.
ALTER POLICY user_app_state_update_owner ON public.user_app_state WITH CHECK (EXISTS(SELECT 1 FROM public.entities e WHERE e.id=user_app_state.entity_id AND e.user_id=auth.uid()));
ALTER POLICY user_app_state_update_admin ON public.user_app_state WITH CHECK (public.is_admin());
COMMIT;
