# Handoff: Puchero — planificador de comidas familiar (MVP / V1)

## Overview
Puchero es una **PWA familiar** para planificar las comidas de la semana. Genera un menú
semanal aleatorio (7 días × comida + cena = 14 platos sin repetir), permite **re-roll** de
un plato concreto, y deja marcar **quién come en casa** en cada comida para saber para
cuántos cocinar. Está pensada para padres no técnicos: prima la **calma, la legibilidad y los
botones grandes** sobre cualquier floritura.

Este paquete documenta el diseño hi-fi y todo lo necesario para implementarlo en el stack
real del proyecto.

## About the design files
Los archivos de `prototype/` son una **referencia de diseño hecha en HTML/React** (prototipo
que muestra el aspecto y el comportamiento deseados). **No son código de producción para
copiar y pegar.** La tarea es **recrear estas pantallas en el entorno real del proyecto**
(Angular 17+ standalone + Angular Material + TypeScript + Signals), siguiendo sus patrones.

> El prototipo usa React + Babel inline solo porque es el medio del prototipo. La lógica
> (estado, generación, re-roll, toggles) y los estilos (tokens CSS) se trasladan 1:1; los
> componentes se reescriben con Angular Material.

## Fidelity
**Alta fidelidad (hi-fi).** Colores, tipografía, espaciado e interacciones son los
definitivos. Recrear pixel-perfect con la librería del proyecto. Los valores exactos están
en *Design tokens*.

---

## Stack objetivo (del README del repo)
| Capa | Tecnología |
|---|---|
| Frontend | Angular 17+ standalone + TypeScript, Angular Material, Signals + servicios |
| Backend | .NET + EF Core + CQRS (MediatR) |
| BD | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password, JWT) |
| Hosting | Front → Vercel · Back → Render (free) |

---

## Modelo de datos (fuente de verdad — mapea a entidades de backend)
El prototipo ya modela los datos en una forma muy cercana a las entidades. Recomendado:

```
Family
  id (uuid, PK)
  name

User (miembro de la familia)
  id (uuid, PK)            // = Supabase Auth user id
  familyId (FK → Family)
  name (string)            // "Marta", "Javier"…
  colorIndex (int 0–4)     // tono del avatar (ver AVATAR_TONES)
  email (string, unique)

Meal (plato del "pool"/recetario)
  id (uuid, PK)
  familyId (FK → Family)
  name (string)            // "Lentejas estofadas"
  category (enum: 'lunch' | 'dinner' | 'both')  // comida / cena / ambas
  createdAt (timestamptz)
  // V2+: lastUsedAt (para "evitar recientes")

WeekPlan
  id (uuid, PK)
  familyId (FK → Family)
  weekStart (date)         // lunes de la semana (ISO)

PlanSlot   (14 por WeekPlan)
  id (uuid, PK)
  weekPlanId (FK → WeekPlan)
  dayOfWeek (int 0–6)      // 0 = lunes … 6 = domingo
  service (enum: 'lunch' | 'dinner')
  mealId (FK → Meal, nullable)

Attendance   (excepciones — por defecto TODOS comen)
  // Solo se guardan los que NO comen, como en el prototipo (slot.absent[])
  id (uuid, PK)
  planSlotId (FK → PlanSlot)
  userId (FK → User)
  // existencia de la fila = "este usuario NO come en este slot"
```

**Decisión de diseño clave (del prototipo):** la asistencia se modela por **ausencia**.
Por defecto todos cuentan; solo se persiste quién se desapunta (`absent` en el front,
filas en `Attendance` en el back). Así `comensales = totalMiembros − ausentes`.

### Lógica de generación (replicar en backend, comando CQRS `GenerateWeekPlan`)
- **Las comidas tienen categoría** (`lunch` / `dinner` / `both`). Un slot de **comida** solo
  puede recibir platos `lunch` o `both`; un slot de **cena**, platos `dinner` o `both`. Nunca se
  cruzan.
- Para cada uno de los 14 slots, elegir al azar un `Meal` **elegible para ese servicio** que no
  se haya usado ya esa semana (sin repetir dentro de la semana).
- Si no quedan platos elegibles sin usar para un servicio, se permite repetir (avisar en UI).
- Para una semana sin repetir hacen falta **≥7 platos elegibles por servicio** (es decir, 7
  para comida y 7 para cena, contando los `both` en ambos).
- **Re-roll** (`RerollSlot`): elegir un `Meal` al azar **elegible para el servicio de ese slot**,
  **excluyendo el actual** e, idealmente, los ya usados esa semana.

---

## Endpoints sugeridos (CQRS / MediatR)
```
POST   /auth (Supabase)                      → login email/password, devuelve JWT
GET    /api/meals                            → pool de la familia
POST   /api/meals            {name, category}  → añadir plato
DELETE /api/meals/{id}                       → eliminar plato
GET    /api/week?weekStart=YYYY-MM-DD        → WeekPlan + slots + meals + attendance
POST   /api/week/generate    {weekStart}     → genera/regenera la semana (14 slots)
POST   /api/week/slots/{id}/reroll           → cambia el plato de un slot
PUT    /api/week/slots/{id}/attendance {userId, eats:bool}  → marca asistencia
GET    /health                               → para el cron anti-sleep de Render
```
Todas las rutas `/api/*` validan el JWT de Supabase (interceptor en Angular añade
`Authorization: Bearer`).

---

## Screens / Views

La app tiene **2 pestañas** (barra inferior): **Semana · Comidas**. Más **Splash** y
**Login** fuera de la navegación. *(La antigua pestaña "Calendario/Asistencia" se fusionó en
Semana: ver nota al final sobre código legado.)*

### 1. Splash / carga (cold start)
- **Propósito:** cubrir el arranque en frío del backend en Render free (~30–60 s) sin
  pantalla en blanco.
- **Layout:** fondo `cream-100`, centrado vertical. Olla de barro (SVG de línea, terracota)
  con **vapor animado**, wordmark "Puchero" (Fraunces 40px), microcopy rotatorio, 3 puntos
  que parpadean.
- **Microcopy (rota cada 1.5 s):** "Poniendo el puchero al fuego…", "Preparando el menú de la
  semana…", "Avivando las brasas…".
- **Comportamiento:** auto-avanza al Login a los ~2.7 s (en producción: avanzar cuando
  `/health` responda OK; mantener el splash mientras el back despierta).

### 2. Login
- **Propósito:** entrar. No hay registro (las cuentas las crea quien organiza la casa).
- **Layout:** fondo `cream-100`, padding 28px. Olla con vapor (76px) + "Puchero" (Fraunces
  38px, `clay-700`) + saludo "¡Hola! ¿Qué comemos hoy?" (`body-l`, `text-secondary`).
  Dos campos (Email, Contraseña con ojo de mostrar/ocultar), botón primario "Entrar" (full,
  lg). Texto de ayuda abajo: "Las cuentas las crea quien organiza la casa. ¿No puedes entrar?
  Pídele ayuda."
- **Estados:** error de credenciales en rojo ladrillo (`error-fg #8A3A2F`) bajo el campo;
  botón con spinner mientras valida. Enter envía.
- **Validación (prototipo):** email y contraseña no vacíos → si no, "Revisa tu email y
  contraseña." En real: error de Supabase Auth.

### 3. Semana (pantalla principal)
- **Propósito:** ver/ajustar el menú de la semana y quién come.
- **Top bar:** sticky, fondo `cream-100`. Subtítulo (`meta`) "¿Qué comemos? · 9–15 jun" +
  título "La semana" (Fraunces 28px). A la derecha, botón-icono circular de **regenerar**
  (refresh). Sombra hairline al hacer scroll.
- **Contenido:** lista vertical de **7 tarjetas de día** (lunes→domingo), gap 12px, padding
  lateral 16px. El **día de hoy** lleva borde de acento `saffron-500` (1.5px). Pie:
  "14 platos · sin repetir esta semana".
- **Tarjeta de día** (`Card`: `cream-50`, radio 16, sombra de tarjeta, borde `cream-300`,
  padding 14/16):
  - Cabecera: nombre del día (Fraunces 20px) + fecha (`meta`, `text-tertiary`, nowrap) o chip
    "Hoy" (`saffron`).
  - Divisor `cream-200`, luego **dos slots** (comida, cena) separados por divisor:
    - **ServiceMark:** cuadro 38px radio 11. Comida → fondo `clay-100`, icono `utensils`
      `clay-600`. Cena → fondo `sage-100`, icono `moon` `sage-600`.
    - Eyebrow "COMIDA"/"CENA" (`meta` 12.5px bold; comida `clay-600`, cena `sage-600`).
    - Nombre del plato (Nunito 700, 18px, `text-primary`).
    - **Fila de caras** (debajo del plato): los 5 avatares (24px) solapados −7px; **atenuado
      = no viene** (gris + tachado). Es un botón → abre el **bottom sheet de asistencia**.
    - **Botón re-roll** a la derecha (botón-icono circular 42px, fondo `clay-100`, icono
      `refresh` `clay-600`).
- **Estado vacío:** olla (`clay-300` 84px) + "Aún no hay menú esta semana" + cuerpo + botón
  primario lg "Generar semana" (con icono `sparkle`).
- **Estado generando:** botón con spinner (~0.95 s en el prototipo; en real, durante la
  llamada). Toast de éxito "¡Menú de la semana listo!".

### 3b. Bottom sheet — "¿Quién come?"
- **Disparador:** tocar la fila de caras de un slot.
- **Layout:** scrim `rgba(61,56,47,0.38)` que cierra al tocar. Hoja inferior `cream-100`,
  esquinas superiores radio 26, sube desde abajo (animación .3s `cubic-bezier(.2,.7,.2,1)`).
  Asa (40×5 `cream-400`). Cabecera: ServiceMark 44px + "Lunes · COMIDA" (eyebrow) + nombre del
  plato (Fraunces 19px). Línea resumen: "Cocinas para todos / Cocinas para N / No cocinas para
  nadie".
- **Lista:** los 5 miembros, cada uno fila (radio 12, borde `cream-300`, fondo `cream-50` si
  viene / `cream-200` si no): avatar 38px (atenuado si no viene) + nombre (Nunito 700 16.5px) +
  estado "Come en casa"/"No come en casa" (`meta`) + **CheckCircle** (28px; relleno `clay-600`
  con check blanco si viene, contorno `cream-400` si no).
- **Interacción:** tocar una fila alterna asistencia de ese miembro (**cualquiera puede marcar
  a cualquiera** — dispositivo compartido en casa). Botón primario "Listo" cierra.

### 4. Comidas (recetario / pool)
- **Propósito:** mantener el pool de platos de la familia.
- **Top bar:** subtítulo "Vuestro recetario" + título "Comidas". Chip (`clay`) con el conteo
  "N platos".
- **Aviso (si faltan platos por servicio):** banda `saffron-100`, icono `sparkle`
  `saffron-600`, texto `warning-fg`: "Para que la semana salga sin repetir necesitas 7 comidas
  y 7 cenas. Tienes X para comer y Y para cenar." (se muestra si comidas elegibles < 7 o cenas
  elegibles < 7).
- **Categoría del plato:** al añadir, un control segmentado **Comida · Cena · Ambas** (por
  defecto "Ambas"). Cada plato de la lista muestra su categoría como chip (Comida → `clay`,
  Cena → `sage`, Ambas → `cream`) y un icono en el tile (cubiertos / luna / olla).
- **Añadir:** botón primario full lg "Añadir comida" (icono `plus`). Al pulsar, se sustituye
  por una tarjeta con campo "Nombre del plato" (autofocus) + "Guardar plato" / "Cancelar".
  Enter guarda. Toast "Plato añadido al recetario".
- **Lista:** tarjetas simples (fila): cuadro 38px `clay-100` con mini-olla `clay-500` + nombre
  (`body-l` 600) + botón-icono `x` discreto (`text-tertiary`) para eliminar. Toast "Plato
  eliminado".
- **Estado vacío:** olla + "Tu recetario está vacío" + cuerpo + botón "Añadir el primero".

---

## Interactions & Behavior
- **Transiciones globales:** `all .15s ease` en interactivos.
- **Botón primario:** hover `clay-600`→`clay-700` + `translateY(-1px)`. Spinner blanco al
  cargar.
- **Re-roll:** el botón gira (`refresh` rotando .76s) y el nombre del plato hace blur+fade
  (`p-dishroll` .76s) y vuelve con el nuevo plato. En real: deshabilitar el slot mientras
  llega la respuesta; si falla, revertir + toast de error.
- **Bottom sheet:** entra con slide-up .3s; scrim fade .45s; cierra al tocar scrim o "Listo".
- **Toast:** abajo (sobre la nav), entra .25s, se auto-oculta a los ~2.3 s. Tonos: success
  (`#E4EEDD`/`#3F6B3C`), info, warning.
- **Bottom nav:** 2 destinos (Semana, Comidas). Activo `clay-600` (icono + label 700).
- **Splash:** texto rota cada 1.5 s; puntos parpadean (1.2s, delays 0/.2/.4s).
- **prefers-reduced-motion:** todas las animaciones se desactivan (ya contemplado).
- **Accesibilidad:** tap targets ≥ 48px; texto base ≥ 16px; texto blanco solo sobre
  `clay-600`+ a ≥16px semibold; cumplir **WCAG AA** (≥4.5:1 normal, ≥3:1 grande).

## State Management (front — Angular Signals)
Servicios con signals (equivalentes al estado del prototipo):
- `auth`: sesión/JWT (Supabase). `stage`: splash | login | app.
- `mealsService`: `meals = signal<Meal[]>`. `add(name)`, `remove(id)`.
- `weekService`: `week = signal<WeekPlan>`. `generate()`, `reroll(slotId)`,
  `toggleAttendance(slotId, userId)`. Recalcular comensales como `total − ausentes`.
- UI local: pestaña activa, sheet abierto `{slotId} | null`, flags de carga (generating,
  rerolling), toast.

---

## Design tokens
Pegar `tokens-for-angular.css` en `src/styles.css` (o importarlo). Valores exactos:

**Crema / neutros:** `cream-50 #FDFBF6` (superficie tarjetas) · `cream-100 #FAF6EF` (fondo
app) · `cream-200 #F2EBDD` (superficies 2ª / inputs) · `cream-300 #E8E0D0` (bordes/divisores)
· `cream-400 #D8CEBA` (bordes marcados/hover).

**Terracota (acción principal):** `clay-100 #F3E2D9` · `clay-300 #D9A287` · `clay-500
#C0785A` (marca) · `clay-600 #A8623F` (relleno botón primario) · `clay-700 #8A4E32`
(hover/énfasis).

**Salvia (secundario):** `sage-100 #E6EBE0` · `sage-300 #AFBDA0` · `sage-500 #889A75` · `sage-600
#6E8160` · `sage-700 #56654A`.

**Azafrán (acento, con cuentagotas):** `saffron-100 #F8E9CC` · `saffron-500 #E0A85A` (hoy) ·
`saffron-600 #C68C3E`.

**Texto:** `text-primary #3D382F` · `text-secondary #756E61` · `text-tertiary #A39C8C` ·
`text-on-clay #FDFBF6`.

**Semánticos (texto / fondo):** éxito `#3F6B3C`/`#E4EEDD` · aviso `#97651F`/`#F8E9CC` · error
`#8A3A2F`/`#F4DAD5` · info `#455667`/`#E1E8EE`.

**Avatar tones (colorIndex 0–4):** 0 `clay-100/clay-700` · 1 `sage-100/sage-700` · 2
`saffron-100/saffron-600` · 3 `#E1E8EE/#455667` · 4 `cream-300/text-secondary`.

**Tipografía:** titulares/logo **Fraunces** (600); cuerpo/UI **Nunito Sans** (400/600/700).
Escala (mobile): display/logo 32 · H1 26 · H2 21 · cuerpo-l 18 · cuerpo 16 · etiqueta/botón
16/600 · meta 14. Interlineado 1.5 cuerpo / 1.25 titulares. Ambas en Google Fonts.

**Espaciado (base 4):** 4 · 8 · 12 · 16 · 24 · 32 · 48.

**Radios:** botones/inputs 12 · tarjetas 16 · chips/pills 999. (Bottom sheet 26.)

**Sombras:** tarjeta `0 1px 3px rgba(61,56,47,.06), 0 4px 12px rgba(61,56,47,.04)`; elevado
(modal/sheet/menú) `0 8px 24px rgba(61,56,47,.10)`.

**Bordes:** hairline `cream-300`; marcado `cream-400`.

## Angular Material — notas
- Definir un **tema** con primario = terracota (`clay-600`), secundario = salvia, acento =
  azafrán; superficies en crema. Sobrescribir tipografía de Material por Fraunces (display) +
  Nunito Sans (body) vía `mat.define-typography-config`.
- `mat-slide-toggle` activo → `sage-500` (toggle de asistencia, si se usa).
- `mat-bottom-sheet` para el panel "¿Quién come?".
- `mat-snack-bar` para los toasts (tonos semánticos).
- Botones: usar `mat-flat-button` estilizado a `clay-600`/`clay-700`, radio 12, alto ≥48.
- **Evitar** que parezca "Material por defecto": quitar mayúsculas de botones, suavizar
  sombras, radios 12/16, nada de ripple agresivo.

## Iconografía
Iconos de **línea redondeada**, stroke 1.75, sin relleno (estilo Lucide/Tabler outline). En
Angular usar **lucide-angular** o `@ng-icons` con Lucide. Nombres usados (equivalente Lucide):
utensils, moon, refresh-cw, plus, check, x, chevron-right/left, search, edit, more-horizontal,
log-out, calendar-days, users, user, eye/eye-off, sparkles, heart. La **olla/puchero** es un
SVG de marca propio (ver `puchero-icons.jsx` → `PucheroPot`): cópialo tal cual como componente
SVG; aparece en splash, login, estados vacíos y mini en el recetario. El vapor son 3 paths
animados (`p-steam`).

## Assets
- **Olla / puchero (motivo de marca):** SVG inline en `puchero-icons.jsx` (`PucheroPot`,
  con prop `steam`). Sin dependencias externas.
- **Iconos:** definidos inline en `puchero-icons.jsx` (`ICON_PATHS`). En producción, usar
  Lucide (mismos nombres arriba).
- **Fuentes:** Fraunces + Nunito Sans (Google Fonts).
- No hay imágenes raster ni fotos (intencionado: avatares = inicial sobre color).

## Files (en `prototype/`)
- `Puchero.html` — entrada; carga tokens, fuentes, animaciones (keyframes) y los scripts.
- `puchero-tokens.css` — tokens y clases de tipo (`.p-h1`, `.p-body`, …).
- `puchero-icons.jsx` — `Icon` (set de línea) + `PucheroPot` (olla con vapor).
- `puchero-ui.jsx` — librería base: `Button`, `IconButton`, `Card`, `Chip`, `Avatar`,
  `Toggle`, `TopBar`, `BottomNav`, `EmptyState`, `Toast`.
- `puchero-data.jsx` — datos de ejemplo + lógica: `FAMILY`, `MEAL_POOL`, `DAYS`,
  `generateWeek()`, `randomDishExcluding()`.
- `puchero-week.jsx` — pantalla Semana, tarjeta de día (`DayCardA`), `AttendeeFaces`,
  `AttendanceSheet`, `CheckCircle`.
- `puchero-screens.jsx` — `LoginScreen`, `SplashScreen`, `MealsScreen`, `TextField`.
- `puchero-app.jsx` — raíz: estado, navegación, handlers (generate/reroll/attendance), sheet.
- `ios-frame.jsx` — solo el marco de iPhone del prototipo; **no se porta** (es chrome de
  presentación).

> **Código legado a ignorar:** `puchero-screens.jsx` aún contiene `CalendarScreen`,
> `MemberPick` y `AttendanceSlot` de cuando Asistencia era una pestaña aparte. Esa pantalla se
> **fusionó en Semana** (caras + bottom sheet). No la implementes; la asistencia vive en el
> slot/sheet de Semana.

## Orden de implementación sugerido (alineado al README del repo)
1. **Supabase:** proyecto, Auth, sembrar `Family` + `User` (5 miembros con `colorIndex`).
2. **Backend:** `dotnet new`, EF Core → Supabase, validación JWT, `/health`. Entidades +
   migraciones. Comandos CQRS: `GenerateWeekPlan`, `RerollSlot`, `SetAttendance`, CRUD `Meal`.
3. **Frontend base:** `ng new` standalone, Angular Material + tema Puchero (tokens), fuentes,
   iconos Lucide. Layout: bottom nav 2 pestañas + router.
4. **Auth front:** login Supabase + interceptor JWT + guard. Splash gateado por `/health`.
5. **Comidas:** lista + añadir + eliminar (signals + servicio).
6. **Semana:** generar + tarjetas de día + re-roll + bottom sheet de asistencia.
7. **PWA + deploy:** manifest + service worker; front a Vercel, back a Render; cron-job.org
   sobre `/health` para evitar el sleep.
```
```
