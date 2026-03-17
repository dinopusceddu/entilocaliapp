
-- 1. Correct notifications table: Add user_id if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
    ALTER TABLE public.notifications ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Update RLS policies for notifications
-- We use the check_is_admin() function created in previous sync script for better security/performance
DROP POLICY IF EXISTS "Admin can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their notifications or broadcast" ON public.notifications;

-- Admin policies
CREATE POLICY "Admin can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK ( public.check_is_admin() );

CREATE POLICY "Admin can update notifications"
    ON public.notifications FOR UPDATE
    USING ( public.check_is_admin() );

CREATE POLICY "Admin can delete notifications"
    ON public.notifications FOR DELETE
    USING ( public.check_is_admin() );

-- User visibility policy: Own notifications OR broadcast (user_id is null) OR is admin
CREATE POLICY "Users can view their notifications or broadcast"
    ON public.notifications FOR SELECT
    USING (
        public.check_is_admin()
        OR user_id = auth.uid()
        OR user_id IS NULL
    );

-- 3. Cleanup: Ensure sync function uses profiles for role check if needed
-- (Already handled in previous recovery script, but good to keep in mind)
