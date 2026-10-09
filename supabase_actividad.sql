alter table public.profiles add column if not exists last_seen_at timestamptz;

create or replace function public.registrar_actividad()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set last_seen_at = now() where id = auth.uid();
$$;

revoke all on function public.registrar_actividad() from public, anon;
grant execute on function public.registrar_actividad() to authenticated;
