alter table public.profiles add column if not exists last_seen_at timestamptz;

create table if not exists public.sesiones_activas (
  session_id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  ip text,
  user_agent text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists sesiones_activas_user_idx on public.sesiones_activas (user_id, last_seen_at desc);

alter table public.sesiones_activas enable row level security;
revoke all on public.sesiones_activas from anon, authenticated;

create or replace function public.registrar_actividad()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  v_session uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  v_ip text := nullif(btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), '');
  v_agent text := nullif(left(v_headers ->> 'user-agent', 300), '');
begin
  update public.profiles set last_seen_at = now() where id = auth.uid();

  if v_session is not null and auth.uid() is not null then
    insert into public.sesiones_activas (session_id, user_id, ip, user_agent)
    values (v_session, auth.uid(), v_ip, v_agent)
    on conflict (session_id) do update
      set last_seen_at = now(), ip = coalesce(excluded.ip, public.sesiones_activas.ip), user_agent = excluded.user_agent;

    delete from public.sesiones_activas where last_seen_at < now() - interval '2 days';
  end if;
end;
$$;

revoke all on function public.registrar_actividad() from public, anon;
grant execute on function public.registrar_actividad() to authenticated;

create or replace function public.cerrar_sesion()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.sesiones_activas
  where session_id = nullif(auth.jwt() ->> 'session_id', '')::uuid and user_id = auth.uid();
$$;

revoke all on function public.cerrar_sesion() from public, anon;
grant execute on function public.cerrar_sesion() to authenticated;
