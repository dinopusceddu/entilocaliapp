-- B1-I LOCAL REVIEW ONLY. Auth without profile retains existing broadcast access; owner decision open.
ALTER POLICY "Users can insert their own reads" ON public.message_reads WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.messages m WHERE m.id=message_id));
ALTER POLICY "Users can insert their own notification reads" ON public.notification_reads WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.notifications n WHERE n.id=notification_id));
