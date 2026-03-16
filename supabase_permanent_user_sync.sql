
-- 1. Function to handle new user as state initialization
create or replace function public.handle_new_user_initialization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_entity_id uuid;
begin
  -- 1. Create a default entity for the new user if they don't have one
  insert into public.entities (user_id, name)
  values (new.id, 'Mio Ente')
  returning id into default_entity_id;

  -- 2. Create the initial user_app_state record
  insert into public.user_app_state (user_id, current_year, email, role, entity_id, updated_at)
  values (
    new.id, 
    extract(year from now())::int, 
    new.email, 
    'GUEST', 
    default_entity_id, 
    now()
  );

  return new;
end;
$$;

-- 2. Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_initialization();

-- 3. One-time sync for existing users who are missing from user_app_state
do $$
declare
  user_record record;
  default_entity_id uuid;
begin
  for user_record in 
    select id, email from auth.users 
    where id not in (select user_id from public.user_app_state)
  loop
    -- Create default entity
    insert into public.entities (user_id, name)
    values (user_record.id, 'Mio Ente')
    returning id into default_entity_id;

    -- Create state record
    insert into public.user_app_state (user_id, current_year, email, role, entity_id, updated_at)
    values (
      user_record.id, 
      extract(year from now())::int, 
      user_record.email, 
      'GUEST', 
      default_entity_id, 
      now()
    );
  end loop;
end $$;
