
-- 1. Create a secure function to check role WITHOUT recursion (Security Definer skips RLS)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND UPPER(role) = 'ADMIN'
  );
END;
$$;

-- 2. Sync Function (Same, but explicitly using profiles search path)
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'GUEST'),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = COALESCE(profiles.role, EXCLUDED.role),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 4. Sync Gaps
INSERT INTO public.profiles (id, email, role, updated_at)
SELECT 
    u.id, 
    u.email, 
    COALESCE(s.role::text, 'GUEST'),
    COALESCE(s.updated_at, u.created_at)
FROM auth.users u
LEFT JOIN (
    SELECT DISTINCT ON (user_id) user_id, role, updated_at
    FROM public.user_app_state
    ORDER BY user_id, updated_at DESC
) s ON u.id = s.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 5. RE-CREATE RLS POLICIES USING THE SECURE FUNCTION (NO RECURSION)
-- First wipe old ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Users can always see their own row
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Use check_is_admin() instead of direct query to avoid recursion
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT USING (public.check_is_admin());

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE USING (public.check_is_admin());
