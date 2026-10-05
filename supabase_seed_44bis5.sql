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
  where operador_id = v_operator and dni between '30100001' and '30100050';

  for r in
    select *
    from (
      values
        (1, 'Gómez Marcela', 'CENCOSUD LIGA', 'suelto', 850000, null, null, null, null, null, 0, null, null, 'cuotas', false),
        (2, 'Sosa Roberto', 'BIA GROUP', 'suelto', 1240000, null, null, null, null, null, 0, null, null, 'cuotas', false),
        (3, 'Ferreyra Lucía', 'CENCOSUD LIGA', 'suelto', 2100000, null, null, null, null, null, 0, null, null, 'cuotas', false),
        (4, 'Paz Diego', 'UALA', 'suelto', 3450000, null, null, null, null, null, 0, null, null, 'cuotas', false),
        (5, 'Ibarra Carolina', 'BIA GROUP', 'suelto', 980000, null, null, null, null, null, 0, null, null, 'cuotas', false),
        (6, 'Molina Héctor', 'CENCOSUD LIGA', 'suelto', 1760000, null, null, null, null, null, 0, null, null, 'cuotas', false),
        (7, 'Acosta Valeria', 'PARETO', 'suelto', 4200000, null, null, null, null, null, 0, null, null, 'cuotas', false),
        (8, 'Benítez Sergio', 'BIA GROUP', 'suelto', 1530000, null, null, null, null, null, 0, null, null, 'cuotas', false),
        (9, 'Castro Natalia', 'UALA', 'suelto', 2670000, null, null, null, null, null, 0, null, null, 'cuotas', false),

        (10, 'Domínguez Pablo', 'CENCOSUD LIGA', 'acuerdo', null, 400000, 6, 0, 25, 0, 0, null, null, 'cuotas', false),
        (11, 'Escobar Julieta', 'BIA GROUP', 'acuerdo', null, 180000, 6, 1, 10, 0, 0, null, null, 'cuotas', false),
        (12, 'Figueroa Matías', 'UALA', 'acuerdo', null, 500000, 6, 0, 28, 0, 600000, 'TC', null, 'cuotas', false),
        (13, 'Giménez Romina', 'CENCOSUD LIGA', 'acuerdo', null, 600000, 6, 1, 5, 0, 0, null, null, 'cuotas', false),
        (14, 'Herrera Gustavo', 'BIA GROUP', 'acuerdo', null, 250000, 6, 0, 22, 0, 0, null, null, 'cuotas', false),
        (15, 'Juárez Florencia', 'RECUPERO DE ACTIVOS', 'acuerdo', null, 300000, 3, 2, 15, 0, 0, null, null, 'cuotas', false),
        (16, 'Kowalski Daniel', 'CENCOSUD LIGA', 'acuerdo', null, 350000, 4, 1, 18, 0, 400000, null, null, 'cuotas', false),

        (17, 'Luna Camila', 'BIA GROUP', 'colchon', null, 500000, 5, -2, 10, 2, 0, null, null, 'cuotas', false),
        (18, 'Medina Fernando', 'CENCOSUD LIGA', 'colchon', null, 400000, 6, -2, 12, 2, 0, null, null, 'cuotas', false),
        (19, 'Navarro Silvina', 'BIA GROUP', 'colchon', null, 180000, 6, -3, 8, 3, 0, null, null, 'cuotas', false),
        (20, 'Ojeda Ricardo', 'UALA', 'colchon', null, 600000, 4, -2, 20, 2, 0, 'PYC', null, 'cuotas', false),
        (21, 'Peralta Mónica', 'CENCOSUD LIGA', 'colchon', null, 250000, 6, -1, 15, 1, 0, null, null, 'cuotas', false),
        (22, 'Quiroga Andrés', 'BIA GROUP', 'colchon', null, 450000, 5, -2, 25, 1, 0, null, null, 'cuotas', false),
        (23, 'Ramírez Soledad', 'UALA', 'colchon', null, 200000, 6, -1, 10, 1, 0, 'TC', null, 'cuotas', false),
        (24, 'Salinas Javier', 'CENCOSUD LIGA', 'colchon', null, 300000, 6, -3, 5, 2, 0, null, null, 'cuotas', false),

        (25, 'Torres Patricia', 'CENCOSUD LIGA', 'cancelado', null, 400000, 3, -4, 10, 3, 0, null, null, 'cuotas', false),
        (26, 'Urquiza Leandro', 'BIA GROUP', 'cancelado', null, 180000, 4, -5, 12, 4, 0, null, null, 'cuotas', false),
        (27, 'Vega Gabriela', 'UALA', 'cancelado', null, 500000, 3, -3, 8, 3, 0, 'TC', null, 'cuotas', false),
        (28, 'Williams Claudio', 'PARETO', 'cancelado', null, 250000, 4, -4, 20, 4, 0, null, null, 'cuotas', false),

        (29, 'Yáñez Verónica', 'BIA GROUP', 'pago', null, 2000000, 6, -1, 10, 1, 0, null, null, 'cuotas', false),
        (30, 'Zárate Martín', 'CENCOSUD LIGA', 'pago', null, 1000000, 5, -2, 12, 2, 0, null, null, 'cuotas', false),
        (31, 'Aguirre Elena', 'BIA GROUP', 'pago', null, 1000000, 4, 0, 5, 0, 0, null, null, 'cuotas', false),
        (32, 'Bravo Nicolás', 'CENCOSUD LIGA', 'pago', null, 500000, 6, -1, 8, 1, 0, null, null, 'cuotas', false),
        (33, 'Cabrera Laura', 'UALA', 'pago', null, 2000000, 3, 0, 10, 0, 0, 'TC', null, 'cuotas', false),
        (34, 'Duarte Oscar', 'BIA GROUP', 'pago', null, 1000000, 6, -3, 15, 3, 0, null, null, 'cuotas', false),
        (35, 'Espíndola Mariana', 'CENCOSUD LIGA', 'pago', null, 600000, 6, -2, 20, 2, 0, null, null, 'cuotas', false),
        (36, 'Funes Raúl', 'RECUPERO DE ACTIVOS', 'pago', null, 400000, 6, -1, 18, 1, 0, null, null, 'cuotas', false),

        (37, 'Aráoz Beatriz', 'BANCO MACRO', 'venc', null, 300000, 3, 0, 1, 0, 0, null, 2, 'cuotas', false),
        (38, 'Barrios Ezequiel', 'UALA', 'venc', null, 450000, 4, 0, 1, 1, 0, 'TC', 2, 'cuotas', false),
        (39, 'Correa Mirta', 'BIA GROUP', 'venc', null, 250000, 6, 0, 1, 0, 0, null, 1, 'cuotas', false),
        (40, 'Delgado Hugo', 'CENCOSUD EXTRA', 'venc', null, 380000, 5, 0, 1, 2, 0, null, 1, 'cuotas', false),
        (41, 'Echeverría Paula', 'EXI GROUP', 'venc', null, 500000, 1, 0, 1, 0, 0, null, 1, 'parcial', false),
        (42, 'Fernández Ariel', 'PARETO', 'venc', null, 320000, 4, 0, 1, 0, 0, null, 0, 'cuotas', false),
        (43, 'Godoy Lorena', 'CENCOSUD LIGA', 'venc', null, 280000, 6, 0, 1, 1, 0, null, 0, 'cuotas', false),
        (44, 'Heredia Tomás', 'UALA', 'venc', null, 700000, 3, 0, 1, 0, 0, 'PYC', 0, 'cuotas', false),
        (45, 'Iglesias Marta', 'BIA GROUP', 'venc', null, 220000, 6, 0, 1, 0, 0, null, -1, 'cuotas', false),
        (46, 'Jaime Cristian', 'BANCO COMAFI', 'venc', null, 600000, 1, 0, 1, 0, 0, null, -1, 'parcial', false),
        (47, 'Lescano Brenda', 'CREDITO DIRECTO', 'venc', null, 340000, 5, 0, 1, 1, 0, null, -3, 'cuotas', false),
        (48, 'Maldonado Esteban', 'RECUPERO DE ACTIVOS', 'venc', null, 260000, 4, 0, 1, 0, 0, null, -7, 'cuotas', false),

        (49, 'Núñez Alicia', 'CENCOSUD LIGA', 'suelto', 1450000, null, null, null, null, null, 0, null, null, 'cuotas', true),
        (50, 'Olmos Fabián', 'BIA GROUP', 'cancelado', null, 300000, 3, -4, 10, 3, 0, null, null, 'cuotas', true)
    ) as t(idx, nombre, entidad, categoria, deuda, cuota, n_cuotas, off_months, due_day, paid_prev, anticipo, producto, off_days, tipo, archivado)
    order by idx
  loop
    v_case := gen_random_uuid();

    if r.categoria = 'suelto' then
      v_total := r.deuda::bigint * 100;
    elsif r.categoria = 'venc' then
      v_total := r.cuota::bigint * r.n_cuotas * 100;
    else
      v_total := (r.cuota::bigint * r.n_cuotas + r.anticipo) * 100;
    end if;

    insert into public.casos (id, operador_id, dni, nombre, telefono, cartera, entidad, monto, mail, archivado)
    values (
      v_case,
      v_operator,
      '301' || lpad(r.idx::text, 5, '0'),
      r.nombre,
      '11' || lpad((60000000 + r.idx * 7919)::text, 8, '0'),
      'General',
      r.entidad,
      v_total,
      case when r.idx % 3 = 0 then 'caso' || r.idx || '@correo.test' else null end,
      r.archivado
    );

    if r.categoria <> 'suelto' then
      v_agreement := gen_random_uuid();
      v_first := (v_month + make_interval(months => r.off_months))::date + (r.due_day - 1);

      insert into public.acuerdos (id, operador_id, caso_id, producto, tipo)
      values (v_agreement, v_operator, v_case, r.producto, r.tipo);

      if r.anticipo > 0 then
        insert into public.cuotas (acuerdo_id, operador_id, orden, tipo, numero, monto, fecha, pagada, sumada_metricas)
        values (v_agreement, v_operator, 0, 'anticipo', null, r.anticipo::bigint * 100, v_first - 12, false, false);
      end if;

      for k in 1..r.n_cuotas loop
        if r.categoria = 'venc' then
          v_due := (v_today + r.off_days + make_interval(months => k - r.paid_prev - 1))::date;
        else
          v_due := (v_first + make_interval(months => k - 1))::date;
        end if;
        v_paid := false;
        v_paid_on := null;
        v_counted := false;

        if r.categoria = 'cancelado' then
          v_paid := true;
          v_paid_on := v_due;
        elsif r.categoria = 'colchon' and k <= r.paid_prev then
          v_paid := true;
          v_paid_on := v_due;
        elsif r.categoria = 'venc' and k <= r.paid_prev then
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
        values (
          v_agreement,
          v_operator,
          k,
          case when r.tipo = 'parcial' then 'parcial' else 'cuota' end,
          case when r.tipo = 'parcial' then null else k end,
          r.cuota::bigint * 100,
          v_due,
          v_paid,
          v_paid_on,
          v_counted
        );
      end loop;
    end if;
  end loop;

  raise notice 'Casos cargados: %, acuerdos: %, cuotas: %',
    (select count(*) from public.casos where operador_id = v_operator and dni between '30100001' and '30100050'),
    (select count(*) from public.acuerdos a join public.casos c on c.id = a.caso_id
      where c.operador_id = v_operator and c.dni between '30100001' and '30100050'),
    (select count(*) from public.cuotas q join public.acuerdos a on a.id = q.acuerdo_id
      join public.casos c on c.id = a.caso_id
      where c.operador_id = v_operator and c.dni between '30100001' and '30100050');
end
$$;
