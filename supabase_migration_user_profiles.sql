
-- 1. Wipe everything to start fresh and avoid conflicts with prior failed runs
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create Profiles Table with TEXT role (avoids enum issues entirely)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'GUEST',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Sync Function: Create or update a user's profile
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'GUEST')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Trigger on auth.users: Keep profiles in sync with Auth
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 6. Backfill existing users (Normalize roles to UPPER case)
INSERT INTO public.profiles (id, email, role, updated_at)
SELECT 
    u.id, 
    u.email, 
    UPPER(TRIM(COALESCE(s.role::text, 'GUEST'))),
    COALESCE(s.updated_at, u.created_at)
FROM auth.users u
LEFT JOIN (
    SELECT DISTINCT ON (user_id) user_id, role, updated_at
    FROM public.user_app_state
    ORDER BY user_id, updated_at DESC
) s ON u.id = s.user_id
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role,
    email = EXCLUDED.email;

-- 7. RLS Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND UPPER(role) = 'ADMIN'
  )
);

CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND UPPER(role) = 'ADMIN'
  )
);
