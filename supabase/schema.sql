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

do $$
declare
  licensed_id uuid := gen_random_uuid();
  unlicensed_id uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email = 'operador@tracto.test') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', licensed_id, 'authenticated', 'authenticated',
      'operador@tracto.test', extensions.crypt('Tracto-Prueba-2026', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Operador de prueba"}', now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), licensed_id, licensed_id::text,
      jsonb_build_object('sub', licensed_id::text, 'email', 'operador@tracto.test', 'email_verified', true),
      'email', now(), now(), now()
    );
  end if;

  if not exists (select 1 from auth.users where email = 'sinlicencia@tracto.test') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', unlicensed_id, 'authenticated', 'authenticated',
      'sinlicencia@tracto.test', extensions.crypt('Tracto-Prueba-2026', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Operador sin licencia"}', now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), unlicensed_id, unlicensed_id::text,
      jsonb_build_object('sub', unlicensed_id::text, 'email', 'sinlicencia@tracto.test', 'email_verified', true),
      'email', now(), now(), now()
    );
  end if;
end
$$;

update public.profiles set is_licensed = true where email = 'operador@tracto.test';
update public.profiles set is_licensed = false where email = 'sinlicencia@tracto.test';
