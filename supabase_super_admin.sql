alter table public.profiles drop constraint if exists profiles_rol_check;
alter table public.profiles
  add constraint profiles_rol_check check (rol in ('admin', 'operador', 'super_admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.rol in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
