CREATE OR REPLACE FUNCTION public.check_user_app_state_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
    RAISE EXCEPTION 'SNAPSHOT_CLOSED: Annualita chiusa non modificabile'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_user_app_state_closed_immutability ON public.user_app_state;

CREATE TRIGGER enforce_user_app_state_closed_immutability
BEFORE UPDATE ON public.user_app_state
FOR EACH ROW
EXECUTE FUNCTION public.check_user_app_state_immutability();
