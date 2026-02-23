-- Create custom types for communications

-- Tabelle `messages`
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- null means broadcast
    title text NOT NULL,
    content text NOT NULL,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin who sent it
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabella `message_reads` (to track read status)
CREATE TABLE IF NOT EXISTS public.message_reads (
    message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (message_id, user_id)
);

-- Tabella `notifications`
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin who sent it
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabella `notification_reads`
CREATE TABLE IF NOT EXISTS public.notification_reads (
    notification_id uuid REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (notification_id, user_id)
);

-- Abilita RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- Criterio Admin generale
-- user_app_state.role = 'ADMIN' 

-- RLS per messages
CREATE POLICY "Admin can insert messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS ( SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN' )
    );

CREATE POLICY "Admin can update messages"
    ON public.messages
    FOR UPDATE
    USING (
        EXISTS ( SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN' )
    );

CREATE POLICY "Admin can delete messages"
    ON public.messages
    FOR DELETE
    USING (
        EXISTS ( SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN' )
    );

CREATE POLICY "Users can view messages directed to them or broadcast"
    ON public.messages
    FOR SELECT
    USING (
        -- Can view if admin, or if user_id matches, or if user_id is null (broadcast)
        EXISTS ( SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN' )
        OR user_id = auth.uid()
        OR user_id IS NULL
    );

-- RLS per message_reads
CREATE POLICY "Users can insert their own reads"
    ON public.message_reads
    FOR INSERT
    WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Users can view their own reads"
    ON public.message_reads
    FOR SELECT
    USING ( user_id = auth.uid() );

-- RLS per notifications
CREATE POLICY "Admin can insert notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (
        EXISTS ( SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN' )
    );

CREATE POLICY "Admin can update notifications"
    ON public.notifications
    FOR UPDATE
    USING (
        EXISTS ( SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN' )
    );

CREATE POLICY "Admin can delete notifications"
    ON public.notifications
    FOR DELETE
    USING (
        EXISTS ( SELECT 1 FROM public.user_app_state WHERE user_id = auth.uid() AND role = 'ADMIN' )
    );

CREATE POLICY "Users can view all notifications"
    ON public.notifications
    FOR SELECT
    USING ( true );

-- RLS per notification_reads
CREATE POLICY "Users can insert their own notification reads"
    ON public.notification_reads
    FOR INSERT
    WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Users can view their own notification reads"
    ON public.notification_reads
    FOR SELECT
    USING ( user_id = auth.uid() );
