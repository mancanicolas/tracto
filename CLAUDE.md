# CLAUDE.md — Tracto

Tracto es una agenda + CRM para gestión de cobranzas y cuentas. Los usuarios son **operadores de cobranza** que trabajan ocho horas sobre listas de deudores: llaman, registran promesas de pago, agendan seguimientos y cargan pagos. Cada decisión de UI se evalúa contra una pregunta: **¿esto le ahorra segundos al operador o se los cuesta?**

Idioma del producto: español (Argentina, voseo). Moneda por defecto: ARS. Zona horaria: `America/Argentina/Buenos_Aires`.

---

## 0. Principios de producto (leer antes de codear)

1. **Densidad sobre aire.** Mostrar más filas, menos decoración. Una tabla de cartera vale más que cinco tarjetas.
2. **Teclado primero.** Toda acción frecuente tiene atajo. El mouse es opcional, nunca obligatorio.
3. **El estado de la deuda es la información principal.** El color se reserva para estados de cobranza; el resto de la UI es neutro (azul marino + blanco).
4. **El celeste es la mirada de Tracto.** El acento celeste del logo se usa sólo para lo interactivo y lo enfocado: foco, selección, acción primaria. Nunca como decoración ni para estados.
5. **Los montos se leen en columna.** Siempre monoespaciados, tabulares y alineados a la derecha.

---

## 1. Design tokens y colores

### 1.1 Colores de marca (extraídos del logo)

| Token | Hex | Origen |
|---|---|---|
| `brand-navy` | `#111F3D` | Fondo azul marino del logo |
| `brand-white` | `#EDEDED` | Blanco cálido del logotipo |
| `brand-sky` | `#8FD7F9` | Celeste de la variante clara del logo |

El modo oscuro es el default. El navy de marca es la **superficie principal**; el canvas es un tono más profundo para que las superficies se lean por luminosidad, no por sombra.

### 1.2 Tokens semánticos

Definir **siempre** como variables CSS y consumirlas vía Tailwind. Nunca usar hex sueltos ni colores default de Tailwind (`slate-800`, `blue-500`, etc.) en componentes.

```css
/* app/globals.css — Tailwind CSS v4 */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root,
.dark {
  /* Backgrounds */
  --bg-canvas:        #0B1530; /* fondo de la app, detrás de todo */
  --bg-surface:       #111F3D; /* paneles, sidebar, tablas (navy de marca) */
  --bg-raised:        #172849; /* cards, filas hover, popovers */
  --bg-overlay:       #1D3057; /* modales, command palette, menús */
  --bg-input:         #0E1A35; /* inputs, selects, textareas */
  --bg-row-selected:  rgb(143 215 249 / 0.10);
  --bg-row-hover:     #15254A;

  /* Bordes */
  --border-subtle:    #20345C; /* divisores de tabla, separadores */
  --border-default:   #2A4170; /* inputs, cards */
  --border-strong:    #3A5486; /* inputs hover, elementos activos */

  /* Texto */
  --text-primary:     #EDEDED; /* títulos, valores, montos */
  --text-secondary:   #B3C0D8; /* cuerpo, celdas de tabla */
  --text-muted:       #7D8FB0; /* metadatos, placeholders, timestamps (AA sobre surface) */
  --text-disabled:    #4A5B7D;
  --text-on-accent:   #111F3D; /* texto sobre botón celeste */

  /* Acento interactivo (celeste de marca) */
  --accent:           #8FD7F9;
  --accent-hover:     #B4E4FB;
  --accent-pressed:   #6CC8F5;
  --accent-subtle:    rgb(143 215 249 / 0.12);
  --accent-border:    rgb(143 215 249 / 0.40);
  --focus-ring:       #8FD7F9;

  /* Acento secundario: fucsia (énfasis y variación, NO estados ni acciones) */
  --accent-2:         #F27FC9;
  --accent-2-hover:   #F7A3D9;
  --accent-2-subtle:  rgb(242 127 201 / 0.12);
  --accent-2-border:  rgb(242 127 201 / 0.40);
  --text-on-accent-2: #111F3D;

  /* Estados de cobranza */
  --success:          #3DD68C; /* pago recibido */
  --success-subtle:   rgb(61 214 140 / 0.12);
  --success-border:   rgb(61 214 140 / 0.35);

  --warning:          #F5B841; /* promesa por vencer */
  --warning-subtle:   rgb(245 184 65 / 0.12);
  --warning-border:   rgb(245 184 65 / 0.35);

  --danger:           #F2545B; /* mora alta / llamada fallida */
  --danger-subtle:    rgb(242 84 91 / 0.12);
  --danger-border:    rgb(242 84 91 / 0.35);

  --info:             #B39DFA; /* seguimiento agendado */
  --info-subtle:      rgb(179 157 250 / 0.12);
  --info-border:      rgb(179 157 250 / 0.35);

  --neutral:          #7D8FB0; /* sin gestión / cerrado */
  --neutral-subtle:   rgb(125 143 176 / 0.12);
}

/* Modo claro (opt-in), basado en la variante celeste del logo */
.light {
  --bg-canvas:        #EEF6FB;
  --bg-surface:       #FFFFFF;
  --bg-raised:        #F5F9FC;
  --bg-overlay:       #FFFFFF;
  --bg-input:         #FFFFFF;
  --bg-row-selected:  rgb(17 31 61 / 0.06);
  --bg-row-hover:     #F0F5FA;
  --border-subtle:    #E1E8F0;
  --border-default:   #CBD6E3;
  --border-strong:    #9FB1C8;
  --text-primary:     #111F3D;
  --text-secondary:   #33476B;
  --text-muted:       #5D6F8F;
  --text-disabled:    #A3B0C4;
  --text-on-accent:   #FFFFFF;
  --accent:           #111F3D; /* en claro el navy es el acento */
  --accent-hover:     #1D3057;
  --accent-pressed:   #0B1530;
  --accent-subtle:    rgb(17 31 61 / 0.08);
  --accent-border:    rgb(17 31 61 / 0.30);
  --focus-ring:       #2A9BD6;
  --accent-2:         #B0236F;
  --accent-2-hover:   #941C5D;
  --accent-2-subtle:  rgb(176 35 111 / 0.08);
  --accent-2-border:  rgb(176 35 111 / 0.30);
  --text-on-accent-2: #FFFFFF;
  --success:          #11875A;
  --warning:          #A86A00;
  --danger:           #C9283A;
  --info:             #6B4FD8;
  --neutral:          #5D6F8F;
}

@theme inline {
  --color-canvas:       var(--bg-canvas);
  --color-surface:      var(--bg-surface);
  --color-raised:       var(--bg-raised);
  --color-overlay:      var(--bg-overlay);
  --color-input:        var(--bg-input);
  --color-row-hover:    var(--bg-row-hover);
  --color-row-selected: var(--bg-row-selected);

  --color-line-subtle:  var(--border-subtle);
  --color-line:         var(--border-default);
  --color-line-strong:  var(--border-strong);

  --color-fg:           var(--text-primary);
  --color-fg-secondary: var(--text-secondary);
  --color-fg-muted:     var(--text-muted);
  --color-fg-disabled:  var(--text-disabled);
  --color-fg-on-accent: var(--text-on-accent);

  --color-accent:         var(--accent);
  --color-accent-hover:   var(--accent-hover);
  --color-accent-pressed: var(--accent-pressed);
  --color-accent-subtle:  var(--accent-subtle);
  --color-accent-border:  var(--accent-border);
  --color-focus:          var(--focus-ring);

  --color-accent-2:        var(--accent-2);
  --color-accent-2-hover:  var(--accent-2-hover);
  --color-accent-2-subtle: var(--accent-2-subtle);
  --color-accent-2-border: var(--accent-2-border);
  --color-fg-on-accent-2:  var(--text-on-accent-2);

  --color-success: var(--success);  --color-success-subtle: var(--success-subtle);  --color-success-border: var(--success-border);
  --color-warning: var(--warning);  --color-warning-subtle: var(--warning-subtle);  --color-warning-border: var(--warning-border);
  --color-danger:  var(--danger);   --color-danger-subtle:  var(--danger-subtle);   --color-danger-border:  var(--danger-border);
  --color-info:    var(--info);     --color-info-subtle:    var(--info-subtle);     --color-info-border:    var(--info-border);
  --color-neutral: var(--neutral);  --color-neutral-subtle: var(--neutral-subtle);

  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, "SF Mono", monospace;

  --radius-xs: 3px;  /* badges, kbd, checkboxes */
  --radius-sm: 4px;  /* inputs, botones, celdas editables */
  --radius-md: 6px;  /* cards, popovers, dropdowns */
  --radius-lg: 10px; /* modales, command palette, drawers */

  --shadow-popover: 0 4px 12px rgb(4 9 22 / 0.45), 0 0 0 1px var(--border-default);
  --shadow-modal:   0 16px 40px rgb(4 9 22 / 0.60), 0 0 0 1px var(--border-strong);
  --shadow-inset:   inset 0 1px 0 rgb(237 237 237 / 0.04); /* brillo superior en superficies elevadas */
}
```

### 1.3 Mapa de estados de cobranza

Un solo componente (`<StatusBadge status="..." />`) resuelve color, ícono y texto. **Nunca** comunicar un estado sólo con color: siempre ícono + texto.

| Estado de dominio | Token | Ícono Lucide | Texto UI |
|---|---|---|---|
| `paid` — pago recibido | `success` | `CircleCheck` | Pagado |
| `partial` — pago parcial | `success` | `CircleDashed` | Pago parcial |
| `promise_due` — promesa por vencer (≤ 48 h) | `warning` | `Clock` | Promesa vence {fecha} |
| `promise_broken` — promesa incumplida | `danger` | `CalendarX` | Promesa incumplida |
| `high_delinquency` — mora alta | `danger` | `TriangleAlert` | Mora {n} días |
| `call_failed` — llamada fallida | `danger` | `PhoneMissed` | No contesta |
| `follow_up` — seguimiento agendado | `info` | `CalendarClock` | Seguimiento {fecha} |
| `no_action` — sin gestión | `neutral` | `Circle` | Sin gestión |

Por qué `info` es violeta y no azul: el celeste está reservado para interacción (foco, selección). Si "seguimiento" fuera celeste, el operador confundiría un estado con una fila seleccionada.

Receta del badge:
```tsx
// bg-{token}-subtle text-{token} border border-{token}-border rounded-xs h-5 px-1.5 text-[11px] font-medium gap-1
```

### 1.4 Reglas de uso del color

- Superficies apiladas: `canvas → surface → raised → overlay`. Nunca saltear niveles ni repetir el mismo nivel anidado.
- El acento celeste aparece **como máximo en un botón primario por vista**. Si hay dos acciones principales, una es secundaria.
- Los montos en mora usan `text-danger` sólo en la celda del monto vencido, no en toda la fila.
- Filas de tabla: no colorear el fondo por estado. El estado vive en el badge; la fila se mantiene neutra para no generar ruido visual en listas de 200 filas.

### 1.5 Acento secundario (fucsia `#F27FC9`)

El fucsia contrasta con el celeste y el navy, y no se pisa con ningún estado de cobranza. El naranja, que sería el complementario directo del celeste, se confundiría con alerta y peligro.

Se usa para:
- La segunda serie en gráficos y KPIs comparativos (por ejemplo, "cobrado" en celeste vs. "prometido" en fucsia).
- Etiquetas de segmentación y campañas definidas por el usuario (tags de cartera, origen del lote).
- Marcas de novedad: badge "Nuevo", onboarding y destacados de funcionalidades.
- Momentos de marca, como el splash, pantallas vacías ilustradas y el resumen de cierre del día.

No se usa para:
- Estados de cobranza. Para eso está el mapa de la sección 1.3, sin excepciones.
- Botones, links, foco o selección. Lo interactivo es siempre celeste.
- Texto de cuerpo ni fondos grandes. Como fondo, sólo `bg-accent-2-subtle`.

Puede aparecer como máximo en un elemento de énfasis por pantalla de trabajo. Si todo está destacado, nada lo está.

Receta para un tag:
```tsx
// bg-accent-2-subtle text-accent-2 border border-accent-2-border rounded-xs h-5 px-1.5 text-[11px] font-medium
```

### 1.6 Paleta de gráficos

Seguí este orden de series: `accent` (celeste) → `accent-2` (fucsia) → `fg-secondary` → `fg-muted`. Cuando un gráfico representa estados (por ejemplo, cartera por estado), usá los tokens de estado y no esta secuencia.

---

## 2. Tipografía y jerarquía

### 2.1 Familias

- **UI: Geist Sans** (`next/font/google`, variable `--font-geist`). Grotesca técnica, compacta, legible a 12–13 px y con un carácter geométrico que acompaña al logotipo.
- **Datos: JetBrains Mono** (variable `--font-jetbrains`). Para montos, CUIT/DNI, números de cuenta, teléfonos, IDs y fechas en tablas.

```tsx
// app/layout.tsx
import { Geist, JetBrains_Mono } from "next/font/google";
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
// <html lang="es-AR" className={`dark ${geist.variable} ${mono.variable}`}>
```

Todo dato numérico lleva `font-mono tabular-nums`. Los montos además van `text-right`.

### 2.2 Escala

Base de la app: **13 px** (densidad operativa). El cuerpo largo (notas, historial) sube a 14 px.

| Rol | Clase Tailwind | Tamaño / interlineado | Peso |
|---|---|---|---|
| Título de página | `text-xl leading-7` | 20 / 28 | 600 |
| Título de sección / panel | `text-[15px] leading-6` | 15 / 24 | 600 |
| Título de card / modal | `text-sm leading-5` | 14 / 20 | 600 |
| Cuerpo largo (notas) | `text-sm leading-5` | 14 / 20 | 400 |
| Cuerpo UI / celdas | `text-[13px] leading-5` | 13 / 20 | 400 |
| Encabezado de tabla | `text-xs leading-4 text-fg-muted` | 12 / 16 | 500 |
| Labels de formulario | `text-xs leading-4 text-fg-secondary` | 12 / 16 | 500 |
| Badges de estado | `text-[11px] leading-4` | 11 / 16 | 500 |
| Monto destacado (ficha de cuenta) | `font-mono text-2xl tabular-nums` | 24 / 32 | 500 |
| Monto en tabla | `font-mono text-[13px] tabular-nums` | 13 / 20 | 400 (vencido: 500) |
| Atajo de teclado (`<Kbd>`) | `font-mono text-[11px]` | 11 / 16 | 500 |

Reglas:
- **Sentence case siempre.** Nada en mayúsculas sostenidas: ni encabezados de tabla, ni labels, ni badges.
- Jerarquía por peso y color (`fg` / `fg-secondary` / `fg-muted`), no por tamaño. Máximo tres tamaños distintos visibles en una misma pantalla de trabajo.
- Truncar con `truncate` + `title` (o tooltip) en celdas; nunca dejar que una celda rompa la altura de fila.

### 2.3 Formato de datos

- Montos: `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })` → `$ 1.234.567,89`. Helper único `formatMoney()` en `lib/format.ts`.
- Fechas en tabla: `dd/MM` si es el año en curso, `dd/MM/yy` si no. Relativas ("hoy", "mañana", "hace 3 días") sólo en columnas de próxima gestión y vencimiento de promesa.
- Horas: 24 h (`14:30`).
- Teléfonos: formato argentino con código de área, monoespaciado.

---

## 3. Componentes y densidad

### 3.1 Métricas de densidad

| Elemento | Altura | Clases base |
|---|---|---|
| Fila de tabla (default) | 32 px | `h-8 px-3` |
| Fila de tabla (compacta, toggle) | 28 px | `h-7 px-2` |
| Input / select | 32 px | `h-8 px-2.5 text-[13px]` |
| Botón default | 32 px | `h-8 px-3 text-[13px] font-medium` |
| Botón small (toolbar, acciones de fila) | 28 px | `h-7 px-2 text-xs` |
| Icon button | 28 × 28 | `size-7` con ícono `size-4` |
| Header de app | 44 px | `h-11` |
| Sidebar | 220 px (colapsada 52 px) | |

Espaciado: escala de 4 px. Gaps internos de componentes `gap-1.5`/`gap-2`; entre bloques `gap-3`/`gap-4`. Nada por encima de `gap-6` en vistas de trabajo.

Íconos Lucide: `size-4` (16 px) por defecto, `size-3.5` dentro de badges, `strokeWidth={1.75}`.

### 3.2 Bordes, radios y elevación

- **Los bordes separan, no las sombras.** En oscuro, las sombras casi no se perciben: la elevación se comunica con el nivel de superficie + `border-line` + `shadow-inset`.
- Divisores de tabla: `border-b border-line-subtle`. Sin bordes verticales entre columnas.
- Radio según jerarquía (no un único radio para todo): `rounded-xs` badges/kbd → `rounded-sm` controles → `rounded-md` cards/popovers → `rounded-lg` modales.
- Sombras sólo en capas flotantes: `shadow-[var(--shadow-popover)]` para menús/tooltips, `shadow-[var(--shadow-modal)]` para modales y command palette.

### 3.3 Estados interactivos

| Estado | Tratamiento |
|---|---|
| Hover (fila) | `hover:bg-row-hover` |
| Hover (control) | `hover:border-line-strong` |
| Focus visible | `focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus` — **nunca** quitar el outline sin reemplazo |
| Fila seleccionada / activa con teclado | `bg-row-selected` + barra izquierda `shadow-[inset_2px_0_0_var(--accent)]` |
| Disabled | `opacity-50 cursor-not-allowed` + `aria-disabled` |
| Botón primario | `bg-accent text-fg-on-accent hover:bg-accent-hover active:bg-accent-pressed` |
| Botón secundario | `bg-raised border border-line text-fg hover:border-line-strong` |
| Botón ghost | `text-fg-secondary hover:bg-raised hover:text-fg` |
| Botón destructivo | `bg-danger-subtle text-danger border border-danger-border hover:bg-danger/20` |

Transiciones: `transition-colors duration-100`. Sin animaciones de entrada en listas ni cards. Movimiento sólo como respuesta a una acción (abrir panel, confirmar pago). Respetar `motion-reduce:transition-none`.

### 3.4 Patrones de pantalla

**Layout de trabajo (vista Cartera / Agenda):**
```
┌──────────┬──────────────────────────────────────────┬──────────────────┐
│ Sidebar  │ Toolbar: filtros · búsqueda · vista      │                  │
│          ├──────────────────────────────────────────┤  Ficha de cuenta │
│ Agenda   │ Tabla de cuentas (virtualizada)          │  (panel derecho, │
│ Cartera  │  ▸ fila activa                           │   no modal)      │
│ Promesas │                                          │  saldo · estado  │
│ Pagos    │                                          │  historial       │
│          │                                          │  acciones rápidas│
└──────────┴──────────────────────────────────────────┴──────────────────┘
```
- La ficha de cuenta se abre en **panel lateral** (420–480 px), no en modal ni en otra página: el operador no pierde su lugar en la lista.
- Las acciones de gestión (registrar llamada, promesa, pago, nota) se abren como **popover/inline form** dentro de la ficha, no como modal de pantalla completa.
- Modales sólo para acciones destructivas o irreversibles.

**Tablas:**
- Virtualizar a partir de 100 filas (`@tanstack/react-virtual`).
- Encabezado sticky. Columna de deudor sticky a la izquierda; columna de monto a la derecha.
- Orden y filtros persistidos en la URL (search params), para compartir vistas y no perder estado al recargar.
- Selección múltiple con `Shift+click` y `Shift+↑/↓`.

**Estados vacíos y errores** (tono directo, sin disculpas):
- Vacío: "No hay gestiones agendadas para hoy." + acción "Ver cartera".
- Error: decir qué falló y qué hacer: "No se pudo registrar el pago. Revisá la conexión y probá de nuevo." Conservar lo que el operador ya escribió.

### 3.5 Teclado

Atajos globales (registrar en `lib/shortcuts.ts`, un único hook `useShortcut`):

| Atajo | Acción |
|---|---|
| `⌘K` / `Ctrl+K` | Command palette (buscar cuenta por nombre, DNI, CUIT o teléfono) |
| `J` / `K` o `↓` / `↑` | Fila siguiente / anterior |
| `Enter` | Abrir ficha de la fila activa |
| `Esc` | Cerrar panel / popover activo |
| `L` | Registrar llamada |
| `P` | Registrar promesa de pago |
| `$` | Registrar pago |
| `S` | Agendar seguimiento |
| `N` | Agregar nota |
| `⌘Enter` | Guardar formulario activo |
| `G` luego `A` / `C` / `P` | Ir a Agenda / Cartera / Promesas |
| `?` | Ver todos los atajos |

- Los atajos de una letra se desactivan cuando el foco está en un input.
- Mostrar el atajo junto a la acción con `<Kbd>` en botones, tooltips y menús.
- Después de guardar una gestión, el foco vuelve a la tabla y avanza a la siguiente cuenta pendiente (flujo "trabajar la lista").

### 3.6 Uso del logo

- El ojo (la "o" del logotipo) es un elemento de marca: usarlo sólo en el logo, favicon, splash y loader de pantalla completa.
- No usar el ícono `Eye` de Lucide como decoración. Sólo para su función literal (mostrar/ocultar dato sensible).

---

## 4. Tech stack y reglas de código

### 4.1 Stack

- **Next.js (App Router)** + **React** + **TypeScript** (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Tailwind CSS v4** con los tokens de este archivo. Utilidad `cn()` (`clsx` + `tailwind-merge`).
- **Lucide React** para íconos.
- **Radix UI primitives** para comportamiento accesible (Dialog, Popover, DropdownMenu, Tooltip, Select). Estilado 100 % propio con tokens.
- **TanStack Table** + **TanStack Virtual** para tablas.
- **React Hook Form** + **Zod** para formularios. Los schemas Zod se comparten entre cliente y server action.
- **date-fns** con locale `es` y `@date-fns/tz` para la zona horaria.
- `cmdk` para la command palette.

### 4.2 Estructura de carpetas

```
src/
  app/
    (auth)/                  # login, recuperación
    (app)/                   # layout autenticado con sidebar
      agenda/
      cartera/
        [cuentaId]/          # ficha como ruta paralela/interceptada → panel lateral
      promesas/
      pagos/
    api/                     # sólo webhooks e integraciones externas
    globals.css
    layout.tsx
  components/
    ui/                      # primitivos sin lógica de negocio: Button, Input, Badge, Kbd, Table, Panel
    layout/                  # Sidebar, Header, CommandPalette
  features/
    cuentas/
      components/            # AccountTable, AccountPanel, AccountHeader
      actions.ts             # server actions ("use server")
      queries.ts             # lecturas desde Server Components
      schemas.ts             # Zod
      types.ts
    gestiones/               # llamadas, promesas, seguimientos, notas
    pagos/
  lib/
    format.ts                # formatMoney, formatDate, formatPhone, formatDni
    shortcuts.ts
    status.ts                # mapa estado → token/ícono/texto (fuente única)
    cn.ts
  hooks/
```

Reglas:
- `components/ui` nunca importa de `features/`. `features/` puede importar de `components/ui` y `lib/`.
- Un componente por archivo, nombre en `PascalCase.tsx`. Hooks `useCamelCase.ts`. Utilidades `camelCase.ts`.
- Nombres de dominio en español en rutas y features (`cuentas`, `gestiones`, `promesas`); código interno (variables, tipos) en inglés. Textos visibles siempre en español.
- Exports nombrados. `export default` sólo donde Next.js lo exige (page, layout).

### 4.3 Componentes y estilos

- Server Components por defecto. `"use client"` sólo en hojas que necesiten interacción, nunca en layouts ni pages enteras.
- Variantes de componentes con un objeto de variantes tipado (o `cva`), no con ternarios anidados en `className`.
- Prohibido: colores hex o de la paleta default de Tailwind en componentes, `style={{}}` para colores, `!important`, valores arbitrarios de espaciado fuera de la escala de 4 px.
- El estado de una cuenta se resuelve **sólo** vía `lib/status.ts`. No duplicar lógica de colores por estado.

### 4.3.1 Comentarios (regla estricta)

- **Cero comentarios en el código.** Ni obvios (`// Imports`, `// Función para formatear`), ni explicativos, ni separadores de sección, ni JSDoc que repita la firma, ni firmas o marcas de IA o de autoría.
- El código se explica solo por convención de nombres: funciones con verbo (`formatMoney`, `resolveStatus`), booleanos con prefijo (`isOverdue`, `hasPromise`), constantes con nombre en lugar de números mágicos (`SEQUENCE_TIMEOUT_MS`). Si algo necesita un comentario para entenderse, renombrá o extraé una función.
- Rige para TS/TSX, CSS, Rust, JSON/config y HTML. Tampoco se dejan bloques de código comentado: se borran.
- Únicas excepciones: directivas que exige una herramienta (`eslint-disable-next-line` con la regla específica, `// @ts-expect-error`), y sólo cuando no hay alternativa.

### 4.4 Datos, dinero y estado

- **Dinero nunca en `number` flotante.** Persistir y transportar en centavos como entero (`bigint` o `number` entero) o `string` decimal; formatear sólo en la capa de presentación con `formatMoney()`.
- Lecturas: en Server Components (`queries.ts`). Mutaciones: Server Actions (`actions.ts`) que validan con Zod y devuelven `{ ok: true, data } | { ok: false, error, fieldErrors? }`. Nunca lanzar errores crudos al cliente.
- Estado de filtros, orden, paginación y cuenta abierta: **en la URL** (search params / segmentos). Estado efímero de UI (popover abierto, fila con foco): `useState` local. No introducir store global salvo necesidad justificada.
- Gestiones rápidas (registrar llamada, nota) con **actualización optimista** (`useOptimistic`) y rollback visible si falla.
- Toda vista asíncrona contempla los cuatro estados: carga (skeleton con la misma altura de fila, sin spinners en tablas), vacío, error y éxito.
- Acciones irreversibles (anular pago, eliminar promesa) requieren confirmación explícita y registran autor + timestamp.

### 4.5 Accesibilidad (obligatorio)

- Contraste mínimo WCAG AA: 4.5:1 para texto, 3:1 para bordes de controles e íconos con significado. Los tokens de este archivo ya cumplen sobre `surface`; no inventar grises nuevos.
- Foco visible en todo elemento interactivo. Orden de tabulación lógico. Al cerrar un panel, el foco vuelve al elemento que lo abrió.
- Tablas con semántica real (`<table>`, `<th scope>`), o `role="grid"` con navegación por flechas si son interactivas. `aria-sort` en columnas ordenables.
- Estados siempre con texto + ícono, nunca sólo color.
- Icon buttons con `aria-label` en español.
- Formularios: `<label>` asociado, errores con `aria-describedby` y `aria-invalid`, mensajes junto al campo.
- Confirmaciones de acciones (pago registrado, promesa guardada) anunciadas en una región `aria-live="polite"`. Los toasts no se usan como único canal para errores.
- `lang="es-AR"` en `<html>`.

### 4.6 Textos de interfaz

- Voseo, sentence case, verbos concretos: "Registrar pago", "Agendar seguimiento", "Guardar promesa". Nunca "Enviar" o "Aceptar" genéricos.
- La acción mantiene su nombre en todo el flujo: el botón "Registrar pago" produce el aviso "Pago registrado".
- Sin signos de exclamación, sin emojis, sin flechas decorativas en botones.

### 4.7 Antes de cerrar una tarea, verificar

- [ ] Sin colores ni tamaños fuera de los tokens.
- [ ] Montos con `formatMoney`, `font-mono tabular-nums text-right`.
- [ ] La acción nueva tiene atajo de teclado y se ve con `<Kbd>`.
- [ ] Funciona sin mouse de punta a punta.
- [ ] Estados de carga, vacío y error implementados.
- [ ] Sin comentarios en el código (§4.3.1).
- [ ] `pnpm lint` y `pnpm typecheck` sin errores.
