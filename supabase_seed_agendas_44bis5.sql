alter table public.agenda add column if not exists hora text;
alter table public.agenda drop constraint if exists agenda_hora_check;
alter table public.agenda
  add constraint agenda_hora_check check (hora is null or hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

do $$
declare
  v_operator uuid;
  v_today date := (now() at time zone 'America/Argentina/Buenos_Aires')::date;
  v_case uuid;
  r record;
begin
  select id into v_operator from public.profiles where full_name = '44bis5' order by created_at limit 1;

  if v_operator is null then
    raise exception 'No existe un perfil con full_name 44bis5. Ejecutá: update public.profiles set full_name = ''44bis5'' where email = ''tu-email@ejemplo.com'';';
  end if;

  delete from public.casos
  where operador_id = v_operator and dni between '30200001' and '30200015';

  for r in
    select *
    from (
      values
        (1, 'Alvarez Sofía', 'BIA GROUP', 'Llamar para confirmar el pago', '10:00'),
        (2, 'Bustos Ramiro', 'UALA', 'Consultar si recibió el convenio', '11:00'),
        (3, 'Cardozo Miriam', 'PARETO', 'Pedir comprobante de transferencia', '11:45'),
        (4, 'Dávila Esteban', 'BANCO MACRO', 'Reconfirmar fecha de la primera cuota', '12:30'),

        (5, 'Espeche Lorena', 'CENCOSUD LIGA', 'Volver a llamar durante el día', null),
        (6, 'Farías Gonzalo', 'BIA GROUP', 'Enviar recordatorio por WhatsApp', null),
        (7, 'Giordano Paula', 'RECUPERO DE ACTIVOS', 'Consultar por propuesta de pago', null),
        (8, 'Herrera Joaquín', 'EXI GROUP', 'Hablar con el titular sobre la deuda', null),

        (9, 'Ibáñez Camila', 'BIA GROUP', 'Alarma de prueba 13:43 (1)', '13:43'),
        (10, 'Juárez Tomás', 'UALA', 'Alarma de prueba 13:43 (2)', '13:43'),
        (11, 'Koch Valentina', 'CENCOSUD EXTRA', 'Alarma de prueba 13:43 (3)', '13:43'),

        (12, 'Ledesma Franco', 'BANCO COMAFI', 'Llamar a la tarde', '14:30'),
        (13, 'Medina Rocío', 'CREDITO DIRECTO', 'Seguimiento de promesa de pago', '15:15'),
        (14, 'Núñez Agustín', 'PARETO', 'Confirmar acreditación del pago', '16:00'),
        (15, 'Ortiz Daniela', 'CREDITIA CENTAURUS', 'Último llamado del día', '17:30')
    ) as t(idx, nombre, entidad, motivo, hora)
    order by idx
  loop
    v_case := gen_random_uuid();

    insert into public.casos (id, operador_id, dni, nombre, telefono, cartera, entidad, monto)
    values (
      v_case,
      v_operator,
      '302' || lpad(r.idx::text, 5, '0'),
      r.nombre,
      '11' || lpad((50000000 + r.idx * 6151)::text, 8, '0'),
      'General',
      r.entidad,
      (800000 + r.idx * 120000)::bigint * 100
    );

    insert into public.agenda (operador_id, caso_id, fecha, motivo, resuelto, hora)
    values (v_operator, v_case, v_today, r.motivo, false, r.hora);
  end loop;

  raise notice 'Casos con agenda cargados: %',
    (select count(*) from public.casos where operador_id = v_operator and dni between '30200001' and '30200015');
end
$$;
