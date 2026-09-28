-- CLOSED is created only by the atomic closure RPC. Existing rows are untouched.
CREATE OR REPLACE FUNCTION public.check_user_app_state_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
      -- This is the application-admin path, not a DBA maintenance mechanism.
      IF current_setting('app.allow_admin_cleanup', true) IS DISTINCT FROM 'true'
         OR public.is_admin() IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'CANNOT_DELETE_CLOSED: Impossibile eliminare una annualita chiusa'
          USING ERRCODE = 'P0001';
      END IF;
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

DROP TRIGGER IF EXISTS enforce_user_app_state_closed_immutability ON public.user_app_state;

CREATE TRIGGER enforce_user_app_state_closed_immutability
BEFORE INSERT OR UPDATE OR DELETE ON public.user_app_state
FOR EACH ROW
EXECUTE FUNCTION public.check_user_app_state_immutability();

-- Authenticated clients cannot spoof app.in_atomic_closure to UPDATE into CLOSED.
-- The SECURITY DEFINER closure RPC runs as postgres (BYPASSRLS; no FORCE RLS).
CREATE POLICY "user_app_state_update_no_direct_closed" ON public.user_app_state
AS RESTRICTIVE FOR UPDATE TO authenticated
USING (true)
WITH CHECK ((fund_data->'metadata'->>'snapshotStatus') IS DISTINCT FROM 'CLOSED');

-- TRUNCATE bypasses row-level security and row triggers.
REVOKE TRUNCATE ON TABLE public.user_app_state FROM PUBLIC, anon, authenticated;

-- Client roles cannot define triggers or reference this table from foreign keys.
REVOKE TRIGGER, REFERENCES ON TABLE public.user_app_state FROM PUBLIC, anon, authenticated;
