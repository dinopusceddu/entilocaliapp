-- Migration: 20260921000000_fix_user_app_state_ownership_rls.sql
-- Scopo: Allineamento canonico dell'ownership su public.user_app_state basata su entities.user_id
-- Risolve la criticità Admin Cross-Owner garantendo che:
-- 1. entities.user_id sia l'unica fonte di verità per l'ownership.
-- 2. user_app_state.user_id rifletta sempre entities.user_id.
-- 3. Gli amministratori possano creare, aggiornare ed eliminare annualità su enti altrui preservando l'ownership originaria.

-- 1. Helper Function is_admin() e get_my_role() canoniche (basate ESCLUSIVAMENTE su public.profiles per prevenire role escalation)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND UPPER(role) = 'ADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Drop delle vecchie policy su public.user_app_state
DROP POLICY IF EXISTS "Users can view own data" ON public.user_app_state;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_app_state;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_app_state;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.user_app_state;
DROP POLICY IF EXISTS "Admins can view all data" ON public.user_app_state;
DROP POLICY IF EXISTS "Admins can update all data" ON public.user_app_state;
DROP POLICY IF EXISTS "Admins can delete all data" ON public.user_app_state;
DROP POLICY IF EXISTS "Admins can insert all data" ON public.user_app_state;

DROP POLICY IF EXISTS "user_app_state_select_owner" ON public.user_app_state;
DROP POLICY IF EXISTS "user_app_state_select_admin" ON public.user_app_state;
DROP POLICY IF EXISTS "user_app_state_insert_owner" ON public.user_app_state;
DROP POLICY IF EXISTS "user_app_state_insert_admin" ON public.user_app_state;
DROP POLICY IF EXISTS "user_app_state_update_owner" ON public.user_app_state;
DROP POLICY IF EXISTS "user_app_state_update_admin" ON public.user_app_state;
DROP POLICY IF EXISTS "user_app_state_delete_owner" ON public.user_app_state;
DROP POLICY IF EXISTS "user_app_state_delete_admin" ON public.user_app_state;

-- 3. Nuove Policy RLS basate sulla relazione con public.entities

-- SELECT
-- Owner normale: può leggere lo stato dei propri enti
CREATE POLICY "user_app_state_select_owner" ON public.user_app_state
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.entities e
    WHERE e.id = user_app_state.entity_id
      AND e.user_id = auth.uid()
  )
);

-- Admin: può leggere gli stati di tutti gli enti
CREATE POLICY "user_app_state_select_admin" ON public.user_app_state
FOR SELECT USING (
  public.is_admin()
);

-- INSERT
-- Owner normale: può inserire annualità per i propri enti assicurando che user_id coincida con l'owner
CREATE POLICY "user_app_state_insert_owner" ON public.user_app_state
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.entities e
    WHERE e.id = user_app_state.entity_id
      AND e.user_id = auth.uid()
      AND e.user_id = user_app_state.user_id
  )
);

-- Admin: può inserire annualità per qualsiasi ente MA user_id DEVE coincidere con l'owner dell'ente
CREATE POLICY "user_app_state_insert_admin" ON public.user_app_state
FOR INSERT WITH CHECK (
  public.is_admin()
  AND EXISTS (
    SELECT 1 FROM public.entities e
    WHERE e.id = user_app_state.entity_id
      AND e.user_id = user_app_state.user_id
  )
);

-- UPDATE
-- Owner normale: può aggiornare lo stato dei propri enti garantendo che user_id resti allineato all'owner
CREATE POLICY "user_app_state_update_owner" ON public.user_app_state
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.entities e
    WHERE e.id = user_app_state.entity_id
      AND e.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.entities e
    WHERE e.id = user_app_state.entity_id
      AND e.user_id = auth.uid()
      AND e.user_id = user_app_state.user_id
  )
);

-- Admin: può aggiornare qualsiasi stato MA non può alterare user_id (deve rimanere identico a entities.user_id)
CREATE POLICY "user_app_state_update_admin" ON public.user_app_state
FOR UPDATE USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
  AND EXISTS (
    SELECT 1 FROM public.entities e
    WHERE e.id = user_app_state.entity_id
      AND e.user_id = user_app_state.user_id
  )
);

-- DELETE
-- Owner normale: può eliminare annualità dei propri enti
CREATE POLICY "user_app_state_delete_owner" ON public.user_app_state
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.entities e
    WHERE e.id = user_app_state.entity_id
      AND e.user_id = auth.uid()
  )
);

-- Admin: può eliminare annualità di qualsiasi ente
CREATE POLICY "user_app_state_delete_admin" ON public.user_app_state
FOR DELETE USING (
  public.is_admin()
);

-- 4. Backfill di sanificazione (Idempotente): riallinea user_app_state.user_id all'owner effettivo dell'ente
UPDATE public.user_app_state uas
SET user_id = e.user_id
FROM public.entities e
WHERE e.id = uas.entity_id
  AND uas.user_id IS DISTINCT FROM e.user_id;
