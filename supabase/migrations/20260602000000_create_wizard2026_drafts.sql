-- =============================================================
-- MOD-037B1-FIX1 — Migrazione: wizard2026_drafts
-- HARDENING: Definizione funzioni sicure, trigger e policy RLS idempotenti
-- ATTENZIONE: Non eseguire su produzione senza autorizzazione
-- =============================================================

-- 1. Funzione dedicata all'auditing per il modulo Wizard 2026 (non sovrascrive public.is_admin())
-- Legge il ruolo dalla tabella public.profiles (source of truth per i ruoli)
CREATE OR REPLACE FUNCTION public.is_wizard2026_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND UPPER(role) = 'ADMIN'
  );
$$;

-- 2. Creazione Tabella wizard2026_drafts
CREATE TABLE IF NOT EXISTS public.wizard2026_drafts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id        uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  year             integer NOT NULL,
  draft_state      jsonb DEFAULT NULL,
  last_transfer    jsonb DEFAULT NULL,
  local_sources    jsonb DEFAULT NULL,
  checksum         text DEFAULT NULL,
  schema_version   integer NOT NULL DEFAULT 1,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz DEFAULT NULL,
  CONSTRAINT wizard2026_drafts_unique UNIQUE (user_id, entity_id, year)
);

-- 3. Indici per query e join rapide
CREATE INDEX IF NOT EXISTS idx_wizard2026_drafts_user_id 
  ON public.wizard2026_drafts(user_id);

CREATE INDEX IF NOT EXISTS idx_wizard2026_drafts_entity_id 
  ON public.wizard2026_drafts(entity_id);

CREATE INDEX IF NOT EXISTS idx_wizard2026_drafts_entity_year 
  ON public.wizard2026_drafts(entity_id, year);

-- 4. Funzione e trigger per l'aggiornamento automatico di updated_at
CREATE OR REPLACE FUNCTION public.update_wizard2026_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wizard2026_drafts_updated_at ON public.wizard2026_drafts;
CREATE TRIGGER trg_wizard2026_drafts_updated_at
  BEFORE UPDATE ON public.wizard2026_drafts
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_wizard2026_drafts_updated_at();

-- 5. Abilita Row Level Security (RLS)
ALTER TABLE public.wizard2026_drafts ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Pulizia preventiva per garantire l'idempotenza
DROP POLICY IF EXISTS "wizard_draft_select_own" ON public.wizard2026_drafts;
DROP POLICY IF EXISTS "wizard_draft_insert_own" ON public.wizard2026_drafts;
DROP POLICY IF EXISTS "wizard_draft_update_own" ON public.wizard2026_drafts;
DROP POLICY IF EXISTS "wizard_draft_delete_own" ON public.wizard2026_drafts;
DROP POLICY IF EXISTS "wizard_draft_select_admin" ON public.wizard2026_drafts;

-- Policy utenti standard: accesso completo alle proprie bozze attive
CREATE POLICY "wizard_draft_select_own"
  ON public.wizard2026_drafts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "wizard_draft_insert_own"
  ON public.wizard2026_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wizard_draft_update_own"
  ON public.wizard2026_drafts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wizard_draft_delete_own"
  ON public.wizard2026_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Policy ADMIN: lettura di tutte le bozze (per supporto/debug), comprese quelle soft-deleted
CREATE POLICY "wizard_draft_select_admin"
  ON public.wizard2026_drafts FOR SELECT
  USING (public.is_wizard2026_admin());
