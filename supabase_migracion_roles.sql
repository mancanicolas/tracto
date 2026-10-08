alter table public.profiles add column if not exists rol text not null default 'operador';
alter table public.profiles add column if not exists admin_id uuid references public.profiles (id) on delete set null;

alter table public.profiles drop constraint if exists profiles_rol_check;
alter table public.profiles add constraint profiles_rol_check check (rol in ('admin', 'operador'));

alter table public.profiles drop constraint if exists profiles_admin_id_check;
alter table public.profiles
  add constraint profiles_admin_id_check check (admin_id is null or (rol = 'operador' and admin_id <> id));

create index if not exists profiles_admin_id_idx on public.profiles (admin_id);

create or replace function public.validate_profile_admin()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.admin_id is not null
    and not exists (select 1 from public.profiles p where p.id = new.admin_id and p.rol = 'admin') then
    raise exception 'admin_id debe apuntar a un perfil con rol admin';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_validate_admin on public.profiles;
create trigger profiles_validate_admin
  before insert or update of admin_id, rol on public.profiles
  for each row execute function public.validate_profile_admin();

drop policy if exists "profiles_select_operadores" on public.profiles;
create policy "profiles_select_operadores"
  on public.profiles
  for select
  to authenticated
  using (admin_id = (select auth.uid()));

do $$
declare
  v_admin_count int;
  v_admin_id uuid;
  v_operators int;
begin
  select count(*) into v_admin_count from public.profiles where btrim(full_name) = '44';

  if v_admin_count <> 1 then
    raise exception 'Se esperaba exactamente una cuenta con full_name 44 y se encontraron %', v_admin_count;
  end if;

  select id into v_admin_id from public.profiles where btrim(full_name) = '44';

  update public.profiles set rol = 'admin', admin_id = null where id = v_admin_id;

  update public.profiles
  set rol = 'operador', admin_id = v_admin_id
  where btrim(full_name) ~ '^44bis[0-9]*$' and id <> v_admin_id;

  get diagnostics v_operators = row_count;

  raise notice 'Admin: %, operadores vinculados: %', v_admin_id, v_operators;
end
$$;

select p.full_name, p.email, p.rol, a.full_name as admin
from public.profiles p
left join public.profiles a on a.id = p.admin_id
where p.rol = 'admin' or p.admin_id is not null
order by p.rol, p.full_name;
