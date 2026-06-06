# 🍲 Puchero — Brief de diseño

> Documento para entregar a **Claude Design**. Recoge la identidad, la paleta de colores, la
> tipografía, los componentes y el detalle de cada pantalla, para que **toda la app siga la misma
> línea visual y la misma paleta** en todas sus vistas.

---

## 1. La idea en una frase

**Puchero** es un planificador de comidas familiar. La sensación debe ser la de una **cocina de casa**:
cálida, tranquila, sin prisas y sin ruido visual. Lo contrario de una app "tecnológica" y fría.

**Usuario principal: los padres** (no técnicos, posiblemente con vista cansada). Esto manda sobre todo
lo demás: **simplicidad, legibilidad y botones grandes** por encima de cualquier floritura.

### Adjetivos guía
Serena · cálida · acogedora · clara · sencilla · de fiar.

### Anti-adjetivos (evitar)
Recargada · estridente · "corporativa" · fría · saturada · con jerga.

---

## 2. Principios de diseño

1. **Calma ante todo.** Mucho espacio en blanco (crema), pocos elementos por pantalla, jerarquía clara.
2. **Legible para los padres.** Texto base grande (≥16px, idealmente 17-18px), buen contraste, nada de gris claro sobre crema para texto importante.
3. **Tap targets generosos.** Mínimo 48×48px en cualquier cosa pulsable. Botones anchos y cómodos.
4. **Una acción principal por pantalla.** Que siempre quede obvio qué es lo siguiente que hacer.
5. **Consistencia total.** El mismo botón, la misma tarjeta y el mismo espaciado en todas las vistas.
6. **Mobile-first.** Es una PWA que vivirá en el móvil. Diseñar primero para móvil; el escritorio es secundario.
7. **Calidez sin ruido.** Bordes redondeados suaves, sombras muy sutiles, ilustración mínima y amable.

---

## 3. Paleta de colores

Base **crema**, principal **terracota** (la olla de barro), secundario **salvia** (las hierbas),
acento **azafrán** (las especias). Todos en tonos apagados y serenos.

### Neutros / crema (fondos y superficies)

| Token         | Hex       | Uso |
|---------------|-----------|-----|
| `cream-50`    | `#FDFBF6` | Superficie de tarjetas (un blanco cálido) |
| `cream-100`   | `#FAF6EF` | **Fondo principal de la app** |
| `cream-200`   | `#F2EBDD` | Superficies secundarias, secciones, fondos de input |
| `cream-300`   | `#E8E0D0` | Bordes sutiles, divisores |
| `cream-400`   | `#D8CEBA` | Bordes marcados, estados hover sobre crema |

### Terracota / barro (color principal — acciones)

| Token       | Hex       | Uso |
|-------------|-----------|-----|
| `clay-100`  | `#F3E2D9` | Fondos suaves, chips, badges |
| `clay-300`  | `#D9A287` | Estados suaves, iconos decorativos |
| `clay-500`  | `#C0785A` | Color de marca / acentos |
| `clay-600`  | `#A8623F` | **Relleno de botón primario** |
| `clay-700`  | `#8A4E32` | Hover/pressed del botón primario, texto de énfasis |

### Salvia (secundario — apoyo, estados positivos suaves)

| Token       | Hex       | Uso |
|-------------|-----------|-----|
| `sage-100`  | `#E6EBE0` | Fondos suaves, chip "come en casa" |
| `sage-300`  | `#AFBDA0` | Bordes, iconos |
| `sage-500`  | `#889A75` | Acentos secundarios, botón secundario |
| `sage-600`  | `#6E8160` | Hover secundario |
| `sage-700`  | `#56654A` | Texto sobre fondo salvia claro |

### Azafrán (acento — usar con cuentagotas, solo para destacar)

| Token         | Hex       | Uso |
|---------------|-----------|-----|
| `saffron-100` | `#F8E9CC` | Fondo de destacado suave |
| `saffron-500` | `#E0A85A` | Highlight (p. ej. el día de hoy) |
| `saffron-600` | `#C68C3E` | Texto/borde de acento |

### Texto

| Token            | Hex       | Uso |
|------------------|-----------|-----|
| `text-primary`   | `#3D382F` | Texto principal (negro cálido, nunca negro puro) |
| `text-secondary` | `#756E61` | Texto secundario, subtítulos |
| `text-tertiary`  | `#A39C8C` | Pistas, placeholders, metadatos |
| `text-on-clay`   | `#FDFBF6` | Texto sobre botones terracota |

### Semánticos (apagados, para no romper la calma)

| Estado    | Texto/icono | Fondo suave | Uso |
|-----------|-------------|-------------|-----|
| Éxito     | `#3F6B3C`   | `#E4EEDD`   | Confirmaciones ("comida guardada") |
| Aviso     | `#97651F`   | `#F8E9CC`   | Avisos suaves |
| Error     | `#8A3A2F`   | `#F4DAD5`   | Errores, validación (rojo ladrillo apagado, nunca rojo chillón) |
| Info      | `#455667`   | `#E1E8EE`   | Mensajes informativos (pizarra suave, muy puntual) |

> **Requisito de accesibilidad:** todo el texto debe cumplir **WCAG AA** (contraste ≥4.5:1 para texto
> normal, ≥3:1 para texto grande). El texto blanco solo va sobre `clay-600` o más oscuro, y siempre
> en ≥16px semibold. Comprueba los contrastes al maquetar.

### Modo oscuro (opcional, fuera del MVP)
Si se hace más adelante, un **oscuro cálido** (no negro puro): fondos hacia `#26231E` / `#322E27`,
texto crema, y los mismos terracota/salvia algo más luminosos. No es prioritario para la V1.

---

## 4. Tipografía

Combinación de un **serif cálido** para titulares (sensación de libro de cocina) y un **sans humanista
y legible** para el resto.

- **Titulares / logo:** `Fraunces` (o alternativa: `Lora`). Cálida, con carácter, acogedora.
- **Cuerpo y UI:** `Nunito Sans` (o alternativa: `Inter`). Redondeada, muy legible.

> Ambas están en Google Fonts. Si hay que elegir una sola por simplicidad, usar **Nunito Sans** en todo.

### Escala (mobile-first)

| Rol            | Tamaño | Peso        | Tipo        |
|----------------|--------|-------------|-------------|
| Display / logo | 32px   | 600         | Fraunces    |
| H1             | 26px   | 600         | Fraunces    |
| H2             | 21px   | 600         | Fraunces / Nunito |
| Cuerpo grande  | 18px   | 400         | Nunito Sans |
| Cuerpo         | 16px   | 400         | Nunito Sans |
| Etiqueta/botón | 16px   | 600         | Nunito Sans |
| Metadato       | 14px   | 400/500     | Nunito Sans |

Interlineado cómodo: **1.5** en cuerpo, **1.25** en titulares.

---

## 5. Forma, espacio y elevación

- **Espaciado:** escala de 4 → 4, 8, 12, 16, 24, 32, 48px. Generoso; respira.
- **Radios (suaves y acogedores):**
  - Botones e inputs: `12px`
  - Tarjetas: `16px`
  - Chips/pills: `999px` (totalmente redondeados)
- **Sombras (muy sutiles, nada de sombras duras):**
  - Tarjeta: `0 1px 3px rgba(61,56,47,0.06), 0 4px 12px rgba(61,56,47,0.04)`
  - Elemento elevado (menú, modal): `0 8px 24px rgba(61,56,47,0.10)`
- **Bordes:** 1px en `cream-300` por defecto; `cream-400` en hover.

---

## 6. Iconografía e ilustración

- **Iconos:** set de línea redondeada y consistente (**Lucide** o **Tabler**, variante outline). Grosor uniforme. Tamaño 20-24px. Color `text-secondary` por defecto, `clay-600` cuando son interactivos/activos.
- **Ilustración:** mínima y cálida. Un único motivo de marca recurrente: una **olla de barro / puchero** sencilla, de línea, en terracota. Aparece en el splash, en estados vacíos y como icono de la app. Nada de ilustraciones recargadas.
- **Emojis:** evitar en la UI final (sí valen en este brief). Mejor iconos consistentes.

---

## 7. Componentes (librería base)

Definir estos componentes una sola vez y reutilizarlos en todas las pantallas:

- **Botón primario** — relleno `clay-600`, texto `text-on-clay`, radio 12px, alto ≥48px, ancho cómodo. Hover `clay-700`.
- **Botón secundario** — borde `sage-500`, texto `sage-700`, fondo transparente.
- **Botón terciario / texto** — solo texto `clay-600`, sin fondo.
- **Botón-icono circular** (para el re-roll 🔄) — círculo, fondo `clay-100`, icono `clay-600`, 44-48px.
- **Tarjeta** — fondo `cream-50`, radio 16px, sombra de tarjeta, padding 16px.
- **Tarjeta de día** — muestra el día + sus dos slots (comida y cena). Ver pantalla principal.
- **Slot de comida** — nombre del plato + botón re-roll + indicador de asistencia.
- **Input de texto** — fondo `cream-200`, borde `cream-300`, radio 12px, label visible arriba, alto ≥48px.
- **Toggle / switch** (para "como / no como en casa") — activo en `sage-500`.
- **Chip / pill** — para servicio (Comida/Cena) y para asistencia. Fondo `clay-100` o `sage-100` según contexto.
- **Avatar** — inicial del familiar sobre círculo de color suave (rotar entre clay-100 / sage-100 / saffron-100).
- **Barra de navegación inferior** — 3 destinos: Semana · Comidas · Calendario. Icono + label. Activo en `clay-600`.
- **Top bar** — título de la pantalla en serif, fondo `cream-100`, sin sombra (o sombra mínima al hacer scroll).
- **Estado vacío** — el motivo del puchero + un texto amable + el botón de acción.
- **Estado de carga** — ver pantalla de carga.
- **Toast / aviso** — esquina/inferior, fondo según semántico, breve.

---

## 8. Pantallas

Detalle de cada vista, su objetivo, elementos y estados. Todas comparten top bar + navegación inferior (salvo splash y login).

### 8.1 Pantalla de carga (splash / cold start)
- **Objetivo:** cubrir el arranque en frío del backend (~30-60s) sin que parezca rota.
- **Elementos:** fondo `cream-100`, el motivo del puchero centrado (puede tener una animación suave de "vapor" o un spinner sereno), y un texto rotatorio cálido.
- **Microcopy:** "Poniendo el puchero al fuego…", "Preparando el menú de la semana…".
- Nada de pantalla en blanco nunca.

### 8.2 Login
- **Objetivo:** entrar de forma simple. Las cuentas ya están creadas (no hay registro).
- **Elementos:** logo Puchero (serif) + olla, dos inputs (email, contraseña), botón primario "Entrar", y un texto pequeño de ayuda.
- **Tono:** bienvenida cálida → "¡Hola! ¿Qué comemos hoy?".
- **Estados:** error de credenciales en rojo ladrillo apagado, debajo del campo. Botón con estado "cargando".

### 8.3 La semana (pantalla principal)
- **Objetivo:** ver y ajustar el menú de la semana de un vistazo. Es la pantalla estrella.
- **Layout:** lista vertical de **7 tarjetas de día** (lunes → domingo). El **día de hoy destacado** con un borde/acento `saffron`.
- **Cada tarjeta de día** muestra:
  - El nombre del día (serif) y la fecha.
  - **Dos slots:** 🍽 Comida y 🌙 Cena. Cada slot: nombre del plato + botón-icono de **re-roll** + un pequeño indicador de cuántos comen (de la asistencia).
- **Acción principal:** botón "Generar semana" (primario) — visible y claro, sobre todo si aún no hay menú.
- **Estados:**
  - *Vacío* (sin menú aún): motivo del puchero + "Aún no hay menú esta semana" + botón "Generar semana".
  - *Re-roll en curso:* el slot muestra una micro-animación mientras llega el nuevo plato.

### 8.4 Comidas (gestión)
- **Objetivo:** mantener el "pool" de platos de la familia.
- **Elementos:** lista de comidas (tarjetas simples con el nombre), un botón "+ Añadir comida" (primario o FAB), y un formulario sencillo (un input de nombre) para crear.
- **Nota de producto:** editar/eliminar es opcional en el MVP; si se incluye, que sea discreto (deslizar o menú "⋯").
- **Estado vacío:** "Añade los platos que soléis comer en casa" + botón. Recordatorio amable de que con ≥14 platos la semana sale sin repetir.

### 8.5 Calendario / Asistencia
- **Objetivo:** que cada miembro marque si **no** come o cena en casa, y que se vea de un vistazo para cuántos cocinar.
- **Layout:** vista de la semana (reutilizar la estructura de días/servicios), pero el foco aquí es **quién está**.
- **Cada slot** muestra los **avatares** de quien sí come, y un control para **desapuntarse** (toggle "Como / No como en casa") que afecta solo a quien lo pulsa.
- **Microcopy:** "Hoy no ceno", "Cuento contigo".
- **Estado por defecto:** todos cuentan; desapuntarse es la excepción y debe ser un gesto claro y reversible.

### 8.6 Navegación
- **Barra inferior** con tres destinos fijos: **Semana** · **Comidas** · **Calendario**. Icono + etiqueta, activo en `clay-600`.
- (Opcional) acceso a perfil/cerrar sesión desde un icono en la top bar.

---

## 9. Tono de los textos (microcopy)

Cercano, familiar, en español de tú. Cálido pero sin pasarse. Algún guiño de cocina está bien.

- Botones: "Generar semana", "Cambiar plato", "Añadir comida", "Entrar".
- Asistencia: "Como en casa" / "No como en casa", "Hoy no ceno".
- Vacíos: "Aún no hay menú esta semana", "Añade los platos que soléis comer".
- Carga: "Poniendo el puchero al fuego…".

---

## 10. Qué le pido a Claude Design

1. Una **paleta y unos estilos** (tokens) montados a partir de la sección 3, 4 y 5.
2. Una **librería de componentes** base (sección 7).
3. **Mockups de alta fidelidad** de las pantallas de la sección 8, en este orden de prioridad:
   **(1) La semana → (2) Calendario/Asistencia → (3) Comidas → (4) Login → (5) Splash.**
4. Todo **mobile-first**, coherente entre pantallas y cumpliendo el contraste AA.
5. El motivo de marca (la **olla / puchero** de línea en terracota) presente de forma sutil y recurrente.

> Objetivo: que al ver las cinco pantallas juntas parezca, sin lugar a dudas, **la misma app**.
