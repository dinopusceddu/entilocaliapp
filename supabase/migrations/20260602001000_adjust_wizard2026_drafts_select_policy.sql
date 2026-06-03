-- Adjust SELECT RLS policy for standard users to allow updates that set deleted_at
DROP POLICY IF EXISTS "wizard_draft_select_own" ON public.wizard2026_drafts;

CREATE POLICY "wizard_draft_select_own"
  ON public.wizard2026_drafts FOR SELECT
  USING (auth.uid() = user_id);
