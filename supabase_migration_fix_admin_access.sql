-- Create a secure function to check admin status
-- SECURITY DEFINER ensures it runs with privileges to read user_app_state even if RLS somehow blocks it (though it shouldn't for own rows)
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

-- Drop existing complex policies to start fresh
drop policy if exists "Admins can view all entities" on public.entities;
drop policy if exists "Admins can delete any entity" on public.entities;
drop policy if exists "Users can view own entities" on public.entities;
drop policy if exists "Users can insert own entities" on public.entities;
drop policy if exists "Users can update own entities" on public.entities;
drop policy if exists "Users can delete own entities" on public.entities;

-- Re-create Standard Policies (Owner Access)
create policy "Users can view own entities" on public.entities for select using (auth.uid() = user_id);
create policy "Users can insert own entities" on public.entities for insert with check (auth.uid() = user_id);
create policy "Users can update own entities" on public.entities for update using (auth.uid() = user_id);
create policy "Users can delete own entities" on public.entities for delete using (auth.uid() = user_id);

-- Create Admin Policies (Global Access)
-- "using (public.is_admin())" covers ALL rows, so it effectively allows admins to see everything.
-- Since RLS policies are OR'ed, if (is_admin()) is true, they see the row regardless of ownership.

create policy "Admins can view all entities" on public.entities
for select using (
  public.is_admin()
);

create policy "Admins can delete any entity" on public.entities
for delete using (
  public.is_admin()
);

-- Note: We generally don't want admins inserting entities *for* others blindly, but they can create their own.
-- Update? Maybe Admins need to rename others' entities?
create policy "Admins can update any entity" on public.entities
for update using (
  public.is_admin()
);
