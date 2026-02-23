-- 1. Create table if not exists
create table if not exists public.user_app_state (
  user_id uuid references auth.users not null,
  current_year int not null,
  email text, -- ADDED: Email column
  role text default 'GUEST',
  fund_data jsonb,
  personale_servizio jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, current_year)
);

-- Ensure email column exists (idempotent)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'user_app_state' and column_name = 'email') then
    alter table public.user_app_state add column email text;
  end if;
end $$;

-- 2. Enable RLS
alter table public.user_app_state enable row level security;

-- 3. Helper function to avoid RLS recursion (Security Definer bypasses RLS)
create or replace function public.get_my_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.user_app_state where user_id = auth.uid() limit 1;
$$;

-- 4. Clean up old policies to allow idempotent runs
drop policy if exists "Users can view own data" on public.user_app_state;
drop policy if exists "Users can insert own data" on public.user_app_state;
drop policy if exists "Users can update own data" on public.user_app_state;
drop policy if exists "Users can delete their own data" on public.user_app_state;
drop policy if exists "Admins can view all data" on public.user_app_state;
drop policy if exists "Admins can update all data" on public.user_app_state;
drop policy if exists "Admins can delete all data" on public.user_app_state;

-- 5. Re-create Standard User Policies
create policy "Users can view own data" on public.user_app_state for select using (auth.uid() = user_id);
create policy "Users can insert own data" on public.user_app_state for insert with check (auth.uid() = user_id);
create policy "Users can update own data" on public.user_app_state for update using (auth.uid() = user_id);
create policy "Users can delete their own data" on public.user_app_state for delete using (auth.uid() = user_id);

-- 6. Create Safe Admin Policies (Using the function)
create policy "Admins can view all data" on public.user_app_state for select using (public.get_my_role() = 'ADMIN');
create policy "Admins can update all data" on public.user_app_state for update using (public.get_my_role() = 'ADMIN');
create policy "Admins can delete all data" on public.user_app_state for delete using (public.get_my_role() = 'ADMIN');
