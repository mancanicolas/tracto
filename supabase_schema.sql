create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  is_licensed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

create table if not exists public.etiquetas (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) between 1 and 24),
  color text not null check (color in ('fucsia', 'turquesa', 'naranja', 'lima', 'indigo', 'gris')),
  created_at timestamptz not null default now()
);

create unique index if not exists etiquetas_operador_nombre_key
  on public.etiquetas (operador_id, lower(nombre));

create table if not exists public.casos (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dni text not null check (dni ~ '^[0-9]{7,8}$'),
  nombre text,
  telefono text,
  cartera text,
  producto text,
  entidad text,
  monto bigint check (monto is null or monto >= 0),
  mail text,
  ultimo_pago_fecha date,
  pagos_previos boolean not null default false,
  created_at timestamptz not null default now(),
  unique (operador_id, dni)
);

alter table public.casos add column if not exists producto text;

create table if not exists public.caso_etiquetas (
  caso_id uuid not null references public.casos (id) on delete cascade,
  etiqueta_id uuid not null references public.etiquetas (id) on delete cascade,
  operador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (caso_id, etiqueta_id)
);

create table if not exists public.acuerdos (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  caso_id uuid not null unique references public.casos (id) on delete cascade,
  creado timestamptz not null default now()
);

create table if not exists public.cuotas (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  acuerdo_id uuid not null references public.acuerdos (id) on delete cascade,
  orden integer not null,
  tipo text not null check (tipo in ('anticipo', 'cuota')),
  numero integer,
  monto bigint not null check (monto > 0),
  fecha date not null,
  pagada boolean not null default false,
  pagada_fecha date,
  sumada_metricas boolean not null default false
);

create index if not exists cuotas_acuerdo_idx on public.cuotas (acuerdo_id, orden);

create table if not exists public.notas (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  caso_id uuid not null references public.casos (id) on delete cascade,
  texto text not null check (char_length(btrim(texto)) > 0),
  creada timestamptz not null default now()
);

create index if not exists notas_caso_idx on public.notas (caso_id, creada desc);

create table if not exists public.agenda (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  caso_id uuid not null unique references public.casos (id) on delete cascade,
  fecha date not null,
  motivo text not null check (char_length(btrim(motivo)) > 0),
  resuelto boolean not null default false
);

alter table public.etiquetas enable row level security;
alter table public.casos enable row level security;
alter table public.caso_etiquetas enable row level security;
alter table public.acuerdos enable row level security;
alter table public.cuotas enable row level security;
alter table public.notas enable row level security;
alter table public.agenda enable row level security;

drop policy if exists "etiquetas_propias" on public.etiquetas;
create policy "etiquetas_propias"
  on public.etiquetas
  for all
  to authenticated
  using (operador_id = (select auth.uid()))
  with check (operador_id = (select auth.uid()));

drop policy if exists "casos_propios" on public.casos;
create policy "casos_propios"
  on public.casos
  for all
  to authenticated
  using (operador_id = (select auth.uid()))
  with check (operador_id = (select auth.uid()));

drop policy if exists "caso_etiquetas_propias" on public.caso_etiquetas;
create policy "caso_etiquetas_propias"
  on public.caso_etiquetas
  for all
  to authenticated
  using (operador_id = (select auth.uid()))
  with check (
    operador_id = (select auth.uid())
    and exists (select 1 from public.casos c where c.id = caso_id and c.operador_id = (select auth.uid()))
    and exists (select 1 from public.etiquetas e where e.id = etiqueta_id and e.operador_id = (select auth.uid()))
  );

drop policy if exists "acuerdos_propios" on public.acuerdos;
create policy "acuerdos_propios"
  on public.acuerdos
  for all
  to authenticated
  using (operador_id = (select auth.uid()))
  with check (
    operador_id = (select auth.uid())
    and exists (select 1 from public.casos c where c.id = caso_id and c.operador_id = (select auth.uid()))
  );

drop policy if exists "cuotas_propias" on public.cuotas;
create policy "cuotas_propias"
  on public.cuotas
  for all
  to authenticated
  using (operador_id = (select auth.uid()))
  with check (
    operador_id = (select auth.uid())
    and exists (select 1 from public.acuerdos a where a.id = acuerdo_id and a.operador_id = (select auth.uid()))
  );

drop policy if exists "notas_propias" on public.notas;
create policy "notas_propias"
  on public.notas
  for all
  to authenticated
  using (operador_id = (select auth.uid()))
  with check (
    operador_id = (select auth.uid())
    and exists (select 1 from public.casos c where c.id = caso_id and c.operador_id = (select auth.uid()))
  );

drop policy if exists "agenda_propia" on public.agenda;
create policy "agenda_propia"
  on public.agenda
  for all
  to authenticated
  using (operador_id = (select auth.uid()))
  with check (
    operador_id = (select auth.uid())
    and exists (select 1 from public.casos c where c.id = caso_id and c.operador_id = (select auth.uid()))
  );

revoke all on public.etiquetas, public.casos, public.caso_etiquetas, public.acuerdos, public.cuotas, public.notas, public.agenda
  from anon;
grant select, insert, update, delete
  on public.etiquetas, public.casos, public.caso_etiquetas, public.acuerdos, public.cuotas, public.notas, public.agenda
  to authenticated;

create or replace function public.reemplazar_acuerdo(
  p_caso_id uuid,
  p_acuerdo_id uuid,
  p_cuotas jsonb,
  p_pagos_previos boolean
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.acuerdos where caso_id = p_caso_id;

  insert into public.acuerdos (id, caso_id) values (p_acuerdo_id, p_caso_id);

  insert into public.cuotas (id, acuerdo_id, orden, tipo, numero, monto, fecha)
  select c.id, p_acuerdo_id, c.orden, c.tipo, c.numero, c.monto, c.fecha
  from jsonb_to_recordset(p_cuotas) as c(id uuid, orden integer, tipo text, numero integer, monto bigint, fecha date);

  update public.casos set pagos_previos = p_pagos_previos where id = p_caso_id;
end;
$$;

revoke all on function public.reemplazar_acuerdo(uuid, uuid, jsonb, boolean) from public, anon;
grant execute on function public.reemplazar_acuerdo(uuid, uuid, jsonb, boolean) to authenticated;
