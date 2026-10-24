-- B1-I2 LOCAL REVIEW ONLY. Order 01; requires f911 CLOSED trigger/function. No historical DML.
BEGIN;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.user_app_state'::regclass AND tgname='enforce_user_app_state_closed_immutability' AND tgfoid='public.check_user_app_state_immutability()'::regprocedure AND tgtype=31 AND tgenabled='O') THEN RAISE EXCEPTION 'B1I2_CLOSED_PRE_MISMATCH'; END IF;

 IF (SELECT count(*) FROM pg_constraint c WHERE c.contype='f' AND c.confdeltype='c' AND (
  (c.conrelid='public.user_app_state'::regclass AND c.confrelid='public.entities'::regclass AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE%') OR
  (c.conrelid='public.user_app_state'::regclass AND c.confrelid='auth.users'::regclass AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE%') OR
  (c.conrelid='public.entities'::regclass AND c.confrelid='auth.users'::regclass AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE%')
 )) <> 3 THEN RAISE EXCEPTION 'B1I2_FK_PRE_MISMATCH'; END IF;
END $$;
-- CLOSED is created only by the atomic closure RPC. Existing rows are untouched.
CREATE OR REPLACE FUNCTION public.check_user_app_state_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- N+1 inserted by the RPC is OPEN; no session flag permits INSERT CLOSED.
    IF NEW.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
      RAISE EXCEPTION 'CANNOT_INSERT_CLOSED: Una annualita chiusa richiede la RPC di chiusura atomica'
        USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
      RAISE EXCEPTION 'SNAPSHOT_CLOSED: Impossibile eliminare una annualita chiusa'
        USING ERRCODE = '23514';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
      RAISE EXCEPTION 'SNAPSHOT_CLOSED: Annualita chiusa non modificabile'
        USING ERRCODE = 'P0001';
    END IF;

    IF (OLD.fund_data->'metadata'->>'snapshotStatus' IS DISTINCT FROM 'CLOSED')
       AND (NEW.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED') THEN
      IF current_setting('app.in_atomic_closure', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'CANNOT_CLOSE_DIRECTLY: La chiusura deve avvenire tramite RPC close_annual_snapshot_atomic'
          USING ERRCODE = 'P0001';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;


-- TRUNCATE does not fire row guards, including privileged application writers.
CREATE FUNCTION public.b1i2_protect_closed_truncate() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,pg_temp AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM public.user_app_state WHERE fund_data#>>'{metadata,snapshotStatus}'='CLOSED') THEN
  RAISE EXCEPTION 'SNAPSHOT_CLOSED: TRUNCATE negato' USING ERRCODE='23514';
 END IF; RETURN NULL;
END $$;
ALTER FUNCTION public.b1i2_protect_closed_truncate() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.b1i2_protect_closed_truncate() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER b1i2_closed_truncate BEFORE TRUNCATE ON public.user_app_state FOR EACH STATEMENT EXECUTE FUNCTION public.b1i2_protect_closed_truncate();
COMMIT;
