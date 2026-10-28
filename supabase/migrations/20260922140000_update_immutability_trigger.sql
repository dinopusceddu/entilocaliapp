-- Migration: 20260922140000_update_immutability_trigger.sql
-- Scopo: Protezione completa immutabilità annualità chiuse (Fase 8: UPDATE diretto e DELETE)

CREATE OR REPLACE FUNCTION public.check_user_app_state_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Tentativo di DELETE su annualità CLOSED
  IF TG_OP = 'DELETE' THEN
    IF OLD.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
      IF current_setting('app.allow_admin_cleanup', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'CANNOT_DELETE_CLOSED: Impossibile eliminare una annualita chiusa'
          USING ERRCODE = 'P0001';
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  -- 2. Tentativo di UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- A) Immutabilità dati: una riga già CLOSED non può subire modifiche
    IF OLD.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
      RAISE EXCEPTION 'SNAPSHOT_CLOSED: Annualita chiusa non modificabile'
        USING ERRCODE = 'P0001';
    END IF;

    -- B) Transizione di stato protetta: passaggio da OPEN a CLOSED consentito SOLO tramite close_annual_snapshot_atomic
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
BEFORE UPDATE OR DELETE ON public.user_app_state
FOR EACH ROW
EXECUTE FUNCTION public.check_user_app_state_immutability();
