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
BEGIN
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Utente non autenticato' USING ERRCODE = '42501';
  END IF;

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

  SELECT * INTO v_current_state
  FROM public.user_app_state
  WHERE entity_id = p_entity_id AND current_year = p_current_year
  FOR UPDATE;

  IF v_current_state IS NULL THEN
    RAISE EXCEPTION 'CURRENT_YEAR_NOT_FOUND: Annualita corrente non trovata' USING ERRCODE = 'P0002';
  END IF;

  IF v_current_state.fund_data->'metadata'->>'snapshotStatus' = 'CLOSED' THEN
    SELECT * INTO v_next_state
    FROM public.user_app_state
    WHERE entity_id = p_entity_id AND current_year = v_next_year;

    IF v_next_state IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'already_closed', true,
        'closedYear', p_current_year,
        'nextYear', v_next_year
      );
    ELSE
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
        p_next_fund_data,
        v_current_state.role,
        v_current_state.email,
        timezone('utc'::text, now())
      );

      RETURN jsonb_build_object(
        'success', true,
        'recovered', true,
        'closedYear', p_current_year,
        'nextYear', v_next_year
      );
    END IF;
  END IF;

  UPDATE public.user_app_state
  SET
    fund_data = p_closed_fund_data,
    updated_at = timezone('utc'::text, now())
  WHERE entity_id = p_entity_id AND current_year = p_current_year;

  SELECT * INTO v_next_state
  FROM public.user_app_state
  WHERE entity_id = p_entity_id AND current_year = v_next_year
  FOR UPDATE;

  IF v_next_state IS NULL THEN
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
      p_next_fund_data,
      v_current_state.role,
      v_current_state.email,
      timezone('utc'::text, now())
    );
  ELSE
    UPDATE public.user_app_state
    SET
      fund_data = p_next_fund_data,
      updated_at = timezone('utc'::text, now())
    WHERE entity_id = p_entity_id AND current_year = v_next_year;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'closedYear', p_current_year,
    'nextYear', v_next_year
  );
END;
$$;
