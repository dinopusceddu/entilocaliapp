-- Enable Admins to view all entities
create policy "Admins can view all entities" on public.entities
for select using (
  auth.uid() in (
    select user_id from public.user_app_state where role = 'ADMIN'
  )
);

-- Enable Admins to delete any entity
create policy "Admins can delete any entity" on public.entities
for delete using (
  auth.uid() in (
    select user_id from public.user_app_state where role = 'ADMIN'
  )
);
