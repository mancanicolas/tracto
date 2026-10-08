create table if not exists public.entidades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 80),
  productos text[] not null default array['General'] check (cardinality(productos) >= 1),
  carteras text[] not null default array['General'] check (cardinality(carteras) >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists entidades_nombre_key on public.entidades ((lower(btrim(nombre))));

create table if not exists public.metodos_pago (
  id uuid primary key default gen_random_uuid(),
  entidad_id uuid not null references public.entidades (id) on delete cascade,
  producto text not null default 'General',
  etiqueta text not null check (char_length(btrim(etiqueta)) > 0),
  valor text not null check (char_length(btrim(valor)) > 0),
  orden integer not null default 0
);

create index if not exists metodos_pago_entidad_idx on public.metodos_pago (entidad_id, orden);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.rol = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.entidades enable row level security;
alter table public.metodos_pago enable row level security;

drop policy if exists "entidades_lectura" on public.entidades;
create policy "entidades_lectura" on public.entidades for select to authenticated using (true);

drop policy if exists "entidades_admin_insert" on public.entidades;
create policy "entidades_admin_insert" on public.entidades for insert to authenticated with check (public.is_admin());

drop policy if exists "entidades_admin_update" on public.entidades;
create policy "entidades_admin_update" on public.entidades
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "entidades_admin_delete" on public.entidades;
create policy "entidades_admin_delete" on public.entidades for delete to authenticated using (public.is_admin());

drop policy if exists "metodos_pago_lectura" on public.metodos_pago;
create policy "metodos_pago_lectura" on public.metodos_pago for select to authenticated using (true);

drop policy if exists "metodos_pago_admin_insert" on public.metodos_pago;
create policy "metodos_pago_admin_insert" on public.metodos_pago
  for insert to authenticated with check (public.is_admin());

drop policy if exists "metodos_pago_admin_update" on public.metodos_pago;
create policy "metodos_pago_admin_update" on public.metodos_pago
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "metodos_pago_admin_delete" on public.metodos_pago;
create policy "metodos_pago_admin_delete" on public.metodos_pago
  for delete to authenticated using (public.is_admin());

revoke all on public.entidades, public.metodos_pago from anon, authenticated;
grant select, insert, update, delete on public.entidades, public.metodos_pago to authenticated;

create or replace function public.guardar_entidad(
  p_id uuid,
  p_nombre text,
  p_productos text[],
  p_carteras text[],
  p_metodos jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_id is null then
    insert into public.entidades (nombre, productos, carteras)
    values (btrim(p_nombre), p_productos, p_carteras)
    returning id into v_id;
  else
    update public.entidades
    set productos = p_productos, carteras = p_carteras, updated_at = now()
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'No se pudo actualizar la entidad: no existe o no tenés permisos';
    end if;
  end if;

  delete from public.metodos_pago where entidad_id = v_id;

  insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
  select v_id, m.producto, btrim(m.etiqueta), btrim(m.valor), m.orden
  from jsonb_to_recordset(coalesce(p_metodos, '[]'::jsonb)) as m(producto text, etiqueta text, valor text, orden integer);

  return v_id;
end;
$$;

revoke all on function public.guardar_entidad(uuid, text, text[], text[], jsonb) from public, anon;
grant execute on function public.guardar_entidad(uuid, text, text[], text[], jsonb) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.entidades;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.metodos_pago;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('BANCO MACRO', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'CUIT', '30500010084', 0),
      (v_id, 'General', 'CBU', '2850811-3-3009400374292-1', 1),
      (v_id, 'General', 'Alias', 'solido.chueco.bigote', 2),
      (v_id, 'General', 'Cuenta', '381109400374292 (Convenio 30788)', 3);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('BANCO COMAFI', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Pago Fácil', 'DNI + Importe a pagar', 0),
      (v_id, 'General', 'Pago Online', 'pagosenlinea.pagofacil.com.ar', 1),
      (v_id, 'General', 'Transferencia/depósito', 'Consultar con asesor', 2);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('BIA GROUP', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Cta. Cte.', '$ 123-009519/0', 0),
      (v_id, 'General', 'CBU', '0170123020000000951906', 1),
      (v_id, 'General', 'Alias', 'GRUPOBIA.BBVA', 2),
      (v_id, 'General', 'Rapipago', 'CGF COBRANZAS + ID', 3),
      (v_id, 'General', 'Pago Fácil', 'CGF COBRANZAS + DNI', 4);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('CENCOSUD EXTRA', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Línea de cajas', 'Indicando nro. de tarjeta cencosud e importe a pagar (Easy, Disco, Jumbo y Vea)', 0),
      (v_id, 'General', 'Mercado pago', 'Sección pago mis cuentas, indicando nro. de tarjeta cencosud e importe a pagar', 1);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('CENCOSUD LIGA', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Línea de cajas', 'Indicando nro. de tarjeta cencosud e importe a pagar (Easy, Disco, Jumbo y Vea)', 0),
      (v_id, 'General', 'Mercado pago', 'Sección pago mis cuentas, indicando nro. de tarjeta cencosud e importe a pagar', 1);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('CREDITO DIRECTO', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Titular cuenta', 'CREDITIO DIRECTO S.A.', 0),
      (v_id, 'General', 'CUIT', '30-71210113-6', 1),
      (v_id, 'General', 'CBU', '3380014930000000248447', 2);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('UALA', array['TC', 'PYC'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'TC', 'Banco', 'WILOBANK SAU', 0),
      (v_id, 'TC', 'Titular cuenta', 'WILOBANK S.A.U.', 1),
      (v_id, 'TC', 'CUIT', '30715654632', 2),
      (v_id, 'TC', 'CBU', '3840100200000000619567', 3),
      (v_id, 'PYC', 'Banco', 'WILOBANK', 0),
      (v_id, 'PYC', 'Titular cuenta', 'ALAU TECNOLOGIA S.A.U.', 1),
      (v_id, 'PYC', 'CUIT', '30-71542170-0', 2),
      (v_id, 'PYC', 'CBU', '3840100200000004686158 (Solo préstamos y cuotificación)', 3);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('EXI GROUP', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Cta. Cte.', '$ 18156-5 339-3', 0),
      (v_id, 'General', 'CBU', '0070339820000018156535', 1),
      (v_id, 'General', 'Alias', 'EXISACOB', 2),
      (v_id, 'General', 'Rapipago', 'Código de Empresa 3875 (EXI SA)', 3);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('PARETO', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Banco', 'Banco Bind (Cuenta corriente)', 0),
      (v_id, 'General', 'Titular cuenta', 'Espacio Digital S.A', 1),
      (v_id, 'General', 'CUIT', '30-71550240-9', 2),
      (v_id, 'General', 'CBU', '3220001805007135800029', 3),
      (v_id, 'General', 'Alias', 'cuotapareto', 4);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('RECUPERO DE ACTIVOS', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Titular cuenta', 'RECUPERO DE ACTIVOS FIDEICOMISO FINANCIERO', 0),
      (v_id, 'General', 'Cuenta', '00004194-6 024-7', 1),
      (v_id, 'General', 'CBU', '0070024520000004194671', 2),
      (v_id, 'General', 'Rapipago', 'Código de Empresa 3946 (RECUPERO DE ACTIVOS)', 3),
      (v_id, 'General', 'Pago Fácil', 'Código de Empresa 2913 (RECUPERO DE ACTIVOS)', 4);
  end if;
end
$$;

do $$
declare
  v_id uuid;
begin
  insert into public.entidades (nombre, productos, carteras)
  values ('CREDITIA CENTAURUS', array['General'], array['General'])
  on conflict ((lower(btrim(nombre)))) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.metodos_pago (entidad_id, producto, etiqueta, valor, orden)
    values
      (v_id, 'General', 'Banco', 'BBVA Banco Francés S.A.', 0),
      (v_id, 'General', 'Titular cuenta', 'FIDE PRIV ADM CENTAURUS', 1),
      (v_id, 'General', 'CUIT', '30-71789342-1', 2),
      (v_id, 'General', 'Cta. Cte.', '099-720777/6', 3),
      (v_id, 'General', 'CBU', '0170099220000072077766', 4);
  end if;
end
$$;
