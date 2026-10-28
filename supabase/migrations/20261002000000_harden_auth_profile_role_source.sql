-- New profiles start as GUEST. Existing roles, including NULL, are
-- preserved by excluding role from the conflict update.
-- Trigger events, email synchronization and timestamp behavior are unchanged.
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'GUEST',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;
