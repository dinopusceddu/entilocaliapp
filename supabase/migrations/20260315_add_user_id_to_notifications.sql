-- Migration: Add user_id to notifications for targeted alerts
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for notifications
DROP POLICY IF EXISTS "Users can view all notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications or broadcast"
    ON public.notifications
    FOR SELECT
    USING (
        EXISTS ( SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN' )
        OR user_id = auth.uid()
        OR user_id IS NULL
    );

-- Ensure author_id is handled if needed (already exists in previous migration)
-- author_id is the admin who sent the notification.
