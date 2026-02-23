-- Fix Admin Entity Visibility

-- 1. Create a secure function to check admin status
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_app_state
    where user_id = auth.uid()
    and role = 'ADMIN'
  );
$$;

-- 2. Drop existing restrictive policies
drop policy if exists "Admins can view all entities" on public.entities;
drop policy if exists "Admins can delete any entity" on public.entities;
drop policy if exists "Users can view own entities" on public.entities;
drop policy if exists "Users can insert own entities" on public.entities;
drop policy if exists "Users can update own entities" on public.entities;
drop policy if exists "Users can delete own entities" on public.entities;

-- 3. Re-create Owner Access Policies
create policy "Users can view own entities" on public.entities for select using (auth.uid() = user_id);
create policy "Users can insert own entities" on public.entities for insert with check (auth.uid() = user_id);
create policy "Users can update own entities" on public.entities for update using (auth.uid() = user_id);
create policy "Users can delete own entities" on public.entities for delete using (auth.uid() = user_id);

-- 4. Create Admin Global Access Policies
create policy "Admins can view all entities" on public.entities
for select using (
  public.is_admin()
);

create policy "Admins can delete any entity" on public.entities
for delete using (
  public.is_admin()
);

create policy "Admins can update any entity" on public.entities
for update using (
  public.is_admin()
);
