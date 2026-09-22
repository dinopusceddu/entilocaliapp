-- Migration: 20260922140001_harden_close_annual_snapshot_atomic.sql
-- Scopo: Chiusura atomica, conservativa e idempotente (NF-01, NF-02, S1-S6)

CREATE OR REPLACE FUNCTION public.close_annual_snapshot_atomic(
  p_entity_id uuid,
  p_current_year int,
  p_closed_fund_data jsonb,
  p_next_fund_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid uuid;
  v_is_admin boolean;
  v_entity_user_id uuid;
  v_current_state record;
  v_next_year int;
  v_next_state record;
  v_carry_forward_val text;
  v_carry_forward numeric;
  v_calculated_cf numeric;
  v_distrib_count int;
  v_new_closed_fund_data jsonb;
  v_new_next_fund_data jsonb;
  v_existing_cf text;
  v_recovered_fund_data jsonb;
BEGIN
  -- 1. Autenticazione
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Utente non autenticato' USING ERRCODE = '42501';
  END IF;

  -- 2. Risoluzione Ownership Ente e Controllo Autorizzazione (S1 / S2)
  SELECT user_id INTO v_entity_user_id
  FROM public.entities
  WHERE id = p_entity_id;

  IF v_entity_user_id IS NULL THEN
    RAISE EXCEPTION 'ENTITY_NOT_FOUND: Ente non trovato' USING ERRCODE = 'P0002';
  END IF;

  v_is_admin := public.is_admin();
  IF v_entity_user_id <> v_auth_uid AND NOT v_is_admin THEN
    RAISE EXCEPTION 'FORBIDDEN: Non autorizzato a gestire questo ente' USING ERRCODE = '42501';
  END IF;

  v_next_year := p_current_year + 1;

  -- 3. Abilitazione contesto di chiusura atomica (per consentire transizione protetta OPEN -> CLOSED)
  PERFORM set_config('app.in_atomic_closure', 'true', true);

  -- 4. Lock e Lettura Autorevole dell'Anno Corrente (Fase 3 & Fase 5)
  SELECT * INTO v_current_state
  FROM public.user_app_state
  WHERE entity_id = p_entity_id AND current_year = p_current_year
  FOR UPDATE;

  IF v_current_state IS NULL THEN
    RAISE EXCEPTION 'CURRENT_YEAR_NOT_FOUND: Annualita corrente non trovata' USING ERRCODE = 'P0002';
  END IF;

  -- 5. Determinazione Riporto e Validazione Autorevolezza (S5)
  v_carry_forward_val := p_next_fund_data->'fondoAccessorioDipendenteData'->>'vn_art80c1_sommeNonUtilizzateStabiliPrec';
  IF v_carry_forward_val IS NOT NULL AND v_carry_forward_val ~ '^-?[0-9]+(\.[0-9]+)?$' THEN
    v_carry_forward := v_carry_forward_val::numeric;
  ELSE
    v_carry_forward := 0;
  END IF;

  -- Calcolo autorevole lato DB dai risparmi di distribuzioneRisorseData se presenti
  v_calculated_cf := 0;
  v_distrib_count := 0;
  IF (v_current_state.fund_data ? 'distribuzioneRisorseData') AND (v_current_state.fund_data->'distribuzioneRisorseData' IS NOT NULL) THEN
    SELECT COALESCE(SUM((val->>'risparmi')::numeric), 0), COUNT(*)
    INTO v_calculated_cf, v_distrib_count
    FROM jsonb_each(v_current_state.fund_data->'distribuzioneRisorseData') AS kv(key, val)
    WHERE (key LIKE 'p_%' OR key LIKE 'u_%')
      AND jsonb_typeof(val) = 'object'
      AND val ? 'risparmi'
      AND (val->>'risparmi') ~ '^-?[0-9]+(\.[0-9]+)?$';

    -- Se ci sono voci di distribuzione e il riporto inviato non coincide con i risparmi accertati (S5)
    IF v_distrib_count > 0 AND v_calculated_cf <> v_carry_forward THEN
      RAISE EXCEPTION 'CARRY_FORWARD_MISMATCH: Il riporto inviato (%) non coincide con i risparmi dello snapshot corrente (%)', v_carry_forward, v_calculated_cf
        USING ERRCODE = 'P0003';
    END IF;
  END IF;

  -- 6. Gestione Idempotenza se l'anno corrente è già CLOSED
  IF v_current_state.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
    SELECT * INTO v_next_state
    FROM public.user_app_state
    WHERE entity_id = p_entity_id AND current_year = v_next_year
    FOR UPDATE;

    IF v_next_state IS NOT NULL THEN
      v_existing_cf := (v_next_state.fund_data->'fondoAccessorioDipendenteData'->>'vn_art80c1_sommeNonUtilizzateStabiliPrec');
      IF v_existing_cf IS NOT NULL AND v_existing_cf <> '' AND v_existing_cf::numeric <> v_carry_forward THEN
        RAISE EXCEPTION 'CARRY_FORWARD_CONFLICT: L''annualita corrente e gia chiusa e l''anno successivo ha un riporto non coincidente'
          USING ERRCODE = 'P0003';
      END IF;

      RETURN jsonb_build_object(
        'success', true,
        'already_closed', true,
        'closedYear', p_current_year,
        'nextYear', v_next_year,
        'carryForward', v_carry_forward
      );
    ELSE
      -- Recovery anno successivo mancante
      v_recovered_fund_data := COALESCE(p_next_fund_data, '{}'::jsonb);
      IF v_recovered_fund_data->'metadata' IS NULL OR jsonb_typeof(v_recovered_fund_data->'metadata') <> 'object' THEN
        v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{metadata}', '{}'::jsonb, true);
      END IF;
      v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{metadata,snapshotStatus}', '"OPEN"'::jsonb, true);
      v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{metadata,closedAt}', 'null'::jsonb, true);
      v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{metadata,closedBy}', 'null'::jsonb, true);
      v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{metadata,closedByUserId}', 'null'::jsonb, true);
      v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{annualData,annoRiferimento}', to_jsonb(v_next_year), true);
      IF v_current_state.fund_data->'annualData' ? 'denominazioneEnte' THEN
        v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{annualData,denominazioneEnte}', v_current_state.fund_data->'annualData'->'denominazioneEnte', true);
      END IF;
      IF v_recovered_fund_data->'fondoAccessorioDipendenteData' IS NULL OR jsonb_typeof(v_recovered_fund_data->'fondoAccessorioDipendenteData') <> 'object' THEN
        v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{fondoAccessorioDipendenteData}', '{}'::jsonb, true);
      END IF;
      v_recovered_fund_data := jsonb_set(v_recovered_fund_data, '{fondoAccessorioDipendenteData,vn_art80c1_sommeNonUtilizzateStabiliPrec}', to_jsonb(v_carry_forward), true);

      INSERT INTO public.user_app_state (
        user_id,
        entity_id,
        current_year,
        fund_data,
        role,
        email,
        updated_at
      ) VALUES (
        v_entity_user_id,
        p_entity_id,
        v_next_year,
        v_recovered_fund_data,
        v_current_state.role,
        v_current_state.email,
        timezone('utc'::text, now())
      );

      RETURN jsonb_build_object(
        'success', true,
        'recovered', true,
        'closedYear', p_current_year,
        'nextYear', v_next_year,
        'carryForward', v_carry_forward
      );
    END IF;
  END IF;

  -- 7. Chiusura Anno Corrente con Metadati Server-Side (NF-02, S3, S6)
  -- NOTA BENE: I dati economici sono tratti ESCLUSIVAMENTE da v_current_state.fund_data già persistito (S6)
  v_new_closed_fund_data := v_current_state.fund_data;
  IF v_new_closed_fund_data->'metadata' IS NULL OR jsonb_typeof(v_new_closed_fund_data->'metadata') <> 'object' THEN
    v_new_closed_fund_data := jsonb_set(v_new_closed_fund_data, '{metadata}', '{}'::jsonb, true);
  END IF;
  v_new_closed_fund_data := jsonb_set(v_new_closed_fund_data, '{metadata,snapshotStatus}', '"CLOSED"'::jsonb, true);
  v_new_closed_fund_data := jsonb_set(v_new_closed_fund_data, '{metadata,closedAt}', to_jsonb(timezone('utc'::text, now())), true);
  v_new_closed_fund_data := jsonb_set(v_new_closed_fund_data, '{metadata,closedBy}', to_jsonb(COALESCE(auth.jwt()->>'email', auth.uid()::text)), true);
  v_new_closed_fund_data := jsonb_set(v_new_closed_fund_data, '{metadata,closedByUserId}', to_jsonb(auth.uid()::text), true);

  UPDATE public.user_app_state
  SET
    fund_data = v_new_closed_fund_data,
    updated_at = timezone('utc'::text, now())
  WHERE entity_id = p_entity_id AND current_year = p_current_year;

  -- 8. Lock e Gestione Conservativa dell'Anno Successivo (NF-01, S4)
  SELECT * INTO v_next_state
  FROM public.user_app_state
  WHERE entity_id = p_entity_id AND current_year = v_next_year
  FOR UPDATE;

  -- SCENARIO A: L'anno successivo NON esiste ancora
  IF v_next_state IS NULL THEN
    v_new_next_fund_data := COALESCE(p_next_fund_data, '{}'::jsonb);
    IF v_new_next_fund_data->'metadata' IS NULL OR jsonb_typeof(v_new_next_fund_data->'metadata') <> 'object' THEN
      v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{metadata}', '{}'::jsonb, true);
    END IF;
    -- Imposizione metadata OPEN sul successivo (NF-02, S4)
    v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{metadata,snapshotStatus}', '"OPEN"'::jsonb, true);
    v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{metadata,closedAt}', 'null'::jsonb, true);
    v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{metadata,closedBy}', 'null'::jsonb, true);
    v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{metadata,closedByUserId}', 'null'::jsonb, true);
    v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{annualData,annoRiferimento}', to_jsonb(v_next_year), true);
    IF v_current_state.fund_data->'annualData' ? 'denominazioneEnte' THEN
      v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{annualData,denominazioneEnte}', v_current_state.fund_data->'annualData'->'denominazioneEnte', true);
    END IF;
    IF v_new_next_fund_data->'fondoAccessorioDipendenteData' IS NULL OR jsonb_typeof(v_new_next_fund_data->'fondoAccessorioDipendenteData') <> 'object' THEN
      v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{fondoAccessorioDipendenteData}', '{}'::jsonb, true);
    END IF;
    v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{fondoAccessorioDipendenteData,vn_art80c1_sommeNonUtilizzateStabiliPrec}', to_jsonb(v_carry_forward), true);

    INSERT INTO public.user_app_state (
      user_id,
      entity_id,
      current_year,
      fund_data,
      role,
      email,
      updated_at
    ) VALUES (
      v_entity_user_id,
      p_entity_id,
      v_next_year,
      v_new_next_fund_data,
      v_current_state.role,
      v_current_state.email,
      timezone('utc'::text, now())
    );

  -- SCENARIO B: L'anno successivo esiste già ed è OPEN
  ELSIF v_next_state.fund_data->'metadata'->>'snapshotStatus' IS DISTINCT FROM 'CLOSED' THEN
    v_existing_cf := (v_next_state.fund_data->'fondoAccessorioDipendenteData'->>'vn_art80c1_sommeNonUtilizzateStabiliPrec');

    -- Se esiste già un riporto diverso dal riporto calcolato -> CONFLITTO ESPLICITO (T6)
    IF v_existing_cf IS NOT NULL AND v_existing_cf <> '' AND v_existing_cf::numeric <> v_carry_forward THEN
      RAISE EXCEPTION 'CARRY_FORWARD_CONFLICT: Il riporto presente (%) non coincide con il riporto calcolato (%)', v_existing_cf, v_carry_forward
        USING ERRCODE = 'P0003';
    END IF;

    -- Altrimenti: merge conservativo del solo campo di riporto, preservando integralmente tutti gli altri campi (T3, T4, T5)
    v_new_next_fund_data := v_next_state.fund_data;
    IF v_new_next_fund_data->'fondoAccessorioDipendenteData' IS NULL OR jsonb_typeof(v_new_next_fund_data->'fondoAccessorioDipendenteData') <> 'object' THEN
      v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{fondoAccessorioDipendenteData}', '{}'::jsonb, true);
    END IF;
    v_new_next_fund_data := jsonb_set(v_new_next_fund_data, '{fondoAccessorioDipendenteData,vn_art80c1_sommeNonUtilizzateStabiliPrec}', to_jsonb(v_carry_forward), true);

    UPDATE public.user_app_state
    SET
      fund_data = v_new_next_fund_data,
      updated_at = timezone('utc'::text, now())
    WHERE entity_id = p_entity_id AND current_year = v_next_year;

  -- SCENARIO C: L'anno successivo esiste già ed è CLOSED (T7)
  ELSE
    v_existing_cf := (v_next_state.fund_data->'fondoAccessorioDipendenteData'->>'vn_art80c1_sommeNonUtilizzateStabiliPrec');
    IF v_existing_cf IS NOT NULL AND v_existing_cf <> '' AND v_existing_cf::numeric = v_carry_forward THEN
      -- Riporto identico: nessuna alterazione (idempotente)
      NULL;
    ELSE
      RAISE EXCEPTION 'NEXT_YEAR_CLOSED_CONFLICT: L''annualita successiva e gia chiusa con un riporto differente'
        USING ERRCODE = 'P0003';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'closedYear', p_current_year,
    'nextYear', v_next_year,
    'carryForward', v_carry_forward
  );
END;
$$;
