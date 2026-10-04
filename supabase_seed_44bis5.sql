do $$
declare
  v_operator uuid;
  v_month date := date_trunc('month', current_date)::date;
  v_today date := current_date;
  r record;
  v_case uuid;
  v_agreement uuid;
  v_first date;
  v_due date;
  v_total bigint;
  v_paid boolean;
  v_paid_on date;
  v_counted boolean;
  k int;
begin
  select id into v_operator from public.profiles where full_name = '44bis5' order by created_at limit 1;

  if v_operator is null then
    raise exception 'No existe un perfil con full_name 44bis5. Ejecutá: update public.profiles set full_name = ''44bis5'' where email = ''tu-email@ejemplo.com'';';
  end if;

  delete from public.casos
  where operador_id = v_operator and dni between '30100001' and '30100036';

  for r in
    select *
    from (
      values
        (1, 'Gómez Marcela', 'CENCOSUD', 'suelto', 850000, null, null, null, null, null, 0, null),
        (2, 'Sosa Roberto', 'BIA GROUP', 'suelto', 1240000, null, null, null, null, null, 0, null),
        (3, 'Ferreyra Lucía', 'CENCOSUD', 'suelto', 2100000, null, null, null, null, null, 0, null),
        (4, 'Paz Diego', 'UALA', 'suelto', 3450000, null, null, null, null, null, 0, null),
        (5, 'Ibarra Carolina', 'BIA GROUP', 'suelto', 980000, null, null, null, null, null, 0, null),
        (6, 'Molina Héctor', 'CENCOSUD', 'suelto', 1760000, null, null, null, null, null, 0, null),
        (7, 'Acosta Valeria', 'PARETO', 'suelto', 4200000, null, null, null, null, null, 0, null),
        (8, 'Benítez Sergio', 'BIA GROUP', 'suelto', 1530000, null, null, null, null, null, 0, null),
        (9, 'Castro Natalia', 'UALA', 'suelto', 2670000, null, null, null, null, null, 0, null),

        (10, 'Domínguez Pablo', 'CENCOSUD', 'acuerdo', null, 400000, 6, 0, 25, 0, 0, null),
        (11, 'Escobar Julieta', 'BIA GROUP', 'acuerdo', null, 180000, 6, 1, 10, 0, 0, null),
        (12, 'Figueroa Matías', 'UALA', 'acuerdo', null, 500000, 6, 0, 28, 0, 600000, 'TC'),
        (13, 'Giménez Romina', 'CENCOSUD', 'acuerdo', null, 600000, 6, 1, 5, 0, 0, null),
        (14, 'Herrera Gustavo', 'BIA GROUP', 'acuerdo', null, 250000, 6, 0, 22, 0, 0, null),
        (15, 'Juárez Florencia', 'RECUPERO DE ACTIVOS', 'acuerdo', null, 300000, 3, 2, 15, 0, 0, null),
        (16, 'Kowalski Daniel', 'CENCOSUD', 'acuerdo', null, 350000, 4, 1, 18, 0, 400000, null),

        (17, 'Luna Camila', 'BIA GROUP', 'colchon', null, 500000, 5, -2, 10, 2, 0, null),
        (18, 'Medina Fernando', 'CENCOSUD', 'colchon', null, 400000, 6, -2, 12, 2, 0, null),
        (19, 'Navarro Silvina', 'BIA GROUP', 'colchon', null, 180000, 6, -3, 8, 3, 0, null),
        (20, 'Ojeda Ricardo', 'UALA', 'colchon', null, 600000, 4, -2, 20, 2, 0, 'PYC'),
        (21, 'Peralta Mónica', 'CENCOSUD', 'colchon', null, 250000, 6, -1, 15, 1, 0, null),
        (22, 'Quiroga Andrés', 'BIA GROUP', 'colchon', null, 450000, 5, -2, 25, 1, 0, null),
        (23, 'Ramírez Soledad', 'UALA', 'colchon', null, 200000, 6, -1, 10, 1, 0, 'TC'),
        (24, 'Salinas Javier', 'CENCOSUD', 'colchon', null, 300000, 6, -3, 5, 2, 0, null),

        (25, 'Torres Patricia', 'CENCOSUD', 'cancelado', null, 400000, 3, -4, 10, 3, 0, null),
        (26, 'Urquiza Leandro', 'BIA GROUP', 'cancelado', null, 180000, 4, -5, 12, 4, 0, null),
        (27, 'Vega Gabriela', 'UALA', 'cancelado', null, 500000, 3, -3, 8, 3, 0, 'TC'),
        (28, 'Williams Claudio', 'PARETO', 'cancelado', null, 250000, 4, -4, 20, 4, 0, null),

        (29, 'Yáñez Verónica', 'BIA GROUP', 'pago', null, 2000000, 6, -1, 10, 1, 0, null),
        (30, 'Zárate Martín', 'CENCOSUD', 'pago', null, 1000000, 5, -2, 12, 2, 0, null),
        (31, 'Aguirre Elena', 'BIA GROUP', 'pago', null, 1000000, 4, 0, 5, 0, 0, null),
        (32, 'Bravo Nicolás', 'CENCOSUD', 'pago', null, 500000, 6, -1, 8, 1, 0, null),
        (33, 'Cabrera Laura', 'UALA', 'pago', null, 2000000, 3, 0, 10, 0, 0, 'TC'),
        (34, 'Duarte Oscar', 'BIA GROUP', 'pago', null, 1000000, 6, -3, 15, 3, 0, null),
        (35, 'Espíndola Mariana', 'CENCOSUD', 'pago', null, 600000, 6, -2, 20, 2, 0, null),
        (36, 'Funes Raúl', 'RECUPERO DE ACTIVOS', 'pago', null, 400000, 6, -1, 18, 1, 0, null)
    ) as t(idx, nombre, entidad, categoria, deuda, cuota, n_cuotas, off_months, due_day, paid_prev, anticipo, producto)
    order by idx
  loop
    v_case := gen_random_uuid();

    if r.categoria = 'suelto' then
      v_total := r.deuda::bigint * 100;
    else
      v_total := (r.cuota::bigint * r.n_cuotas + r.anticipo) * 100;
    end if;

    insert into public.casos (id, operador_id, dni, nombre, telefono, cartera, entidad, monto, mail)
    values (
      v_case,
      v_operator,
      '301' || lpad(r.idx::text, 5, '0'),
      r.nombre,
      '11' || lpad((60000000 + r.idx * 7919)::text, 8, '0'),
      'General',
      r.entidad,
      v_total,
      case when r.idx % 3 = 0 then 'caso' || r.idx || '@correo.test' else null end
    );

    if r.categoria <> 'suelto' then
      v_agreement := gen_random_uuid();
      v_first := (v_month + make_interval(months => r.off_months))::date + (r.due_day - 1);

      insert into public.acuerdos (id, operador_id, caso_id, producto, tipo)
      values (v_agreement, v_operator, v_case, r.producto, 'cuotas');

      if r.anticipo > 0 then
        insert into public.cuotas (acuerdo_id, operador_id, orden, tipo, numero, monto, fecha, pagada, sumada_metricas)
        values (v_agreement, v_operator, 0, 'anticipo', null, r.anticipo::bigint * 100, v_first - 12, false, false);
      end if;

      for k in 1..r.n_cuotas loop
        v_due := (v_first + make_interval(months => k - 1))::date;
        v_paid := false;
        v_paid_on := null;
        v_counted := false;

        if r.categoria = 'cancelado' then
          v_paid := true;
          v_paid_on := v_due;
        elsif r.categoria = 'colchon' and k <= r.paid_prev then
          v_paid := true;
          v_paid_on := v_due;
        elsif r.categoria = 'pago' and k <= r.paid_prev then
          v_paid := true;
          v_paid_on := v_due;
        elsif r.categoria = 'pago' and k = r.paid_prev + 1 then
          v_paid := true;
          v_paid_on := least(v_today, v_due);
          v_counted := true;
        end if;

        insert into public.cuotas (acuerdo_id, operador_id, orden, tipo, numero, monto, fecha, pagada, pagada_fecha, sumada_metricas)
        values (v_agreement, v_operator, k, 'cuota', k, r.cuota::bigint * 100, v_due, v_paid, v_paid_on, v_counted);
      end loop;
    end if;
  end loop;

  raise notice 'Casos cargados: %, acuerdos: %, cuotas: %',
    (select count(*) from public.casos where operador_id = v_operator and dni between '30100001' and '30100036'),
    (select count(*) from public.acuerdos a join public.casos c on c.id = a.caso_id
      where c.operador_id = v_operator and c.dni between '30100001' and '30100036'),
    (select count(*) from public.cuotas q join public.acuerdos a on a.id = q.acuerdo_id
      join public.casos c on c.id = a.caso_id
      where c.operador_id = v_operator and c.dni between '30100001' and '30100036');
end
$$;
