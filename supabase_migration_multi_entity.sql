-- 0. CLEANUP (Handle existing conflict)
-- The checks below ensure we start with a clean state for the new implementation.
-- We drop the column from user_app_state first to release the dependency.
alter table public.user_app_state drop column if exists entity_id;

-- Then we drop the entities table if it exists (CASCADE will handle other deps if any, but better be safe).
drop table if exists public.entities cascade;

-- 1. Create table for Entities
create table public.entities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add entity_id to user_app_state
alter table public.user_app_state add column entity_id uuid references public.entities(id);

-- 3. Migrate existing data (Create a default entity for each user and link existing data)
do $$
declare
    r record;
    new_entity_id uuid;
begin
    -- Loop through each distinct user in user_app_state who doesn't have an entity assigned yet
    for r in select distinct user_id from public.user_app_state
    loop
        -- Create a default entity for this user
        insert into public.entities (user_id, name)
        values (r.user_id, 'Mio Ente')
        returning id into new_entity_id;

        -- Update their existing records to point to this new entity
        update public.user_app_state
        set entity_id = new_entity_id
        where user_id = r.user_id;
    end loop;
end $$;

-- 4. Make entity_id NOT NULL after migration
alter table public.user_app_state alter column entity_id set not null;

-- 5. Update Primary Key
-- Drop old PK
alter table public.user_app_state drop constraint if exists user_app_state_pkey;
-- Add new PK
alter table public.user_app_state add primary key (entity_id, current_year);

-- 6. Enable RLS on entities
alter table public.entities enable row level security;

-- 7. RLS Policies for entities
create policy "Users can view own entities" on public.entities for select using (auth.uid() = user_id);
create policy "Users can insert own entities" on public.entities for insert with check (auth.uid() = user_id);
create policy "Users can update own entities" on public.entities for update using (auth.uid() = user_id);
create policy "Users can delete own entities" on public.entities for delete using (auth.uid() = user_id);

-- 8. Existing policies for user_app_state remain valid as they check auth.uid() = user_id.
