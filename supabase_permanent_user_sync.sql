
-- 1. CLEANUP OLD TRIGGER AND FUNCTION (To allow zero-entity onboarding)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user_initialization();

-- 2. One-time sync for existing users who are missing from user_app_state (LEGACY - Manual run only if needed)
/*
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
*/
