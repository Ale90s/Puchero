# 🍲 Puchero — Documento definitivo

> Planificador de comidas familiar. Genera menús semanales aleatorios y permite a cada miembro
> desapuntarse de comer o cenar en casa. Pensado para una familia, con el modelo preparado para
> escalar a varias en el futuro.

---

## 1. Objetivo

Una aplicación que:

- Genere automáticamente un **menú semanal** (comida + cena, de lunes a domingo) para que nadie tenga que pensar qué cocinar.
- Permita **re-rollear** un día/servicio concreto sin rehacer toda la semana.
- Incluya un **calendario de asistencia**: cada miembro puede marcar que un día, en una comida o cena concreta, **no come en casa**, para que quien cocina sepa para cuántos preparar.
- Esté **desplegada, funcionando y en uso real por la familia**.

---

## 2. Plataforma

**PWA (Progressive Web App) hecha con Angular.**

- Es una web normal que se "instala" en el móvil con un icono en la pantalla de inicio. Se abre a pantalla completa, sin barra del navegador. Para el usuario es indistinguible de una app nativa.
- **Cero publicación en stores** (ni Android ni iOS). Se despliega la web y listo.
- Soporta **push notifications vía Firebase Cloud Messaging** para la V4.
- ⚠️ Matiz iOS: las push en PWA solo funcionan si el usuario añade la web a la pantalla de inicio y tiene iOS 16.4+. No afecta al MVP (las notis son V4).

---

## 3. Stack y arquitectura general

| Capa            | Tecnología                                  |
|-----------------|---------------------------------------------|
| Frontend        | Angular (standalone, v17+) + TypeScript     |
| UI              | Angular Material                            |
| Estado          | Signals + servicios (sin NgRx)             |
| Hosting front   | Vercel                                       |
| Backend         | .NET + Entity Framework Core + CQRS (MediatR)|
| Hosting backend | Render (plan free)                           |
| Base de datos   | Supabase (PostgreSQL)                        |
| Autenticación   | Supabase Auth (email/password, JWT)         |

---

## 4. Modelo de datos

> Multi-tenant: **todas las tablas relevantes llevan `FamilyId` y todas las queries se filtran por él**,
> pero **no se construye UI de gestión de familias** en el MVP. Se siembra la familia a mano en la BD.
> Ids tipo `Guid` (para encajar con el uuid que asigna Supabase).

```mermaid
erDiagram
    FAMILY ||--o{ USER : tiene
    FAMILY ||--o{ MEAL : tiene
    FAMILY ||--o{ WEEKLYPLAN : tiene
    WEEKLYPLAN ||--o{ WEEKLYPLANSLOT : contiene
    MEAL ||--o{ WEEKLYPLANSLOT : asignada
    USER ||--o{ MEALATTENDANCE : marca
    FAMILY {
        Guid Id PK
        string Name
    }
    USER {
        Guid Id PK
        string Email
        Guid FamilyId FK
    }
    MEAL {
        Guid Id PK
        string Name
        Guid FamilyId FK
    }
    WEEKLYPLAN {
        Guid Id PK
        Guid FamilyId FK
        DateOnly WeekStartDate
    }
    WEEKLYPLANSLOT {
        Guid Id PK
        Guid WeeklyPlanId FK
        DateOnly Date
        Service Service
        Guid MealId FK
    }
    MEALATTENDANCE {
        Guid Id PK
        Guid UserId FK
        DateOnly Date
        Service Service
        bool IsAttending
    }
```

**Entidades:**

- **Family** — `Id`, `Name`.
- **User** — `Id` (= el uuid que asigna Supabase en el login), `Email`, `FamilyId`.
- **Meal** — `Id`, `Name`, `FamilyId`. (Las categorías llegan en V2.)
- **WeeklyPlan** — `Id`, `FamilyId`, `WeekStartDate`.
- **WeeklyPlanSlot** — `Id`, `WeeklyPlanId`, `Date`, `Service` (enum `Lunch` / `Dinner`), `MealId`. Cada semana son **14 slots** (7 días × 2 servicios).
- **MealAttendance** — `Id`, `UserId`, `Date`, `Service`, `IsAttending`. Por defecto todos comen en casa; una fila aquí representa una excepción ("este día, en este servicio, fulano no está").

**Convenciones:**

- La semana va de **lunes a domingo**.
- La "semana actual" es la que **contiene el día de hoy**.

---

## 5. Autenticación y multi-tenant

**Flujo:**

```mermaid
flowchart LR
    A[Login en el front<br/>Supabase Auth] --> B[Front recibe JWT]
    B --> C[Interceptor adjunta el JWT<br/>en cabecera Authorization]
    C --> D[.NET valida el JWT<br/>vía JWKS o secret de Supabase]
    D --> E[Lee el 'sub' del JWT<br/>= uuid del usuario]
    E --> F[Busca el User en BD<br/>y obtiene su FamilyId]
    F --> G[Todas las consultas<br/>se filtran por FamilyId]
```

**Decisiones clave:**

- Login con **Supabase Auth** (email/password). Nada de auth manual: Supabase emite y firma el JWT; el .NET solo lo **valida**.
- **Tú pre-creas las cuentas** de los familiares desde el panel de Supabase (o un seed). Así ellos no pasan por registros ni confirmaciones de email; solo meten email + contraseña una vez y el navegador la recuerda.
- El JWT de Supabase **no trae el `FamilyId`** (es un concepto propio, no de Supabase). Por eso `User.Id` usa **el mismo uuid que Supabase**: en cada petición se lee el `sub` del token, se busca el `User` y se obtiene su `FamilyId`. Una query trivial, sin necesidad de configurar custom claims.

---

## 6. Arquitectura del backend (.NET)

**CQRS ligero** (separar lectura de escritura) sobre una base de capas finas. Sin event sourcing, sin doble base de datos — eso sería overengineering.

### Flujo

```
Cliente (Angular PWA)
        │  JWT
        ▼
API Controller (fino, solo enruta)
        │
        ▼
IMediator (MediatR)
        │
   ┌────┴─────────────────────┐
   ▼ ESCRITURA                 ▼ LECTURA
Command handler            Query handler
(= tu capa de servicio)    (= tu capa de servicio)
   │                           │
   ▼                           ▼
DbContext directo          DbContext directo
(EF Core hace de repo +    + proyección a DTO (.Select())
 unit of work)             (se salta cualquier repo)
   │                           │
   └───────────┬───────────────┘
               ▼
        PostgreSQL (Supabase)
```

### Decisiones

- **Controller fino**: solo traduce HTTP ↔ command/query y lo manda por `IMediator`. Depende únicamente de MediatR.
- **El handler es la capa de servicio.** No hay una capa "Service" aparte que se solape con el handler.
- **Acceso a datos con `DbContext` directo en ambos lados** (lectura y escritura). **Sin capa de repositorio**: con EF Core, el `DbContext` ya es el Unit of Work y cada `DbSet<T>` ya es el repositorio. El handler **usa** EF Core; nunca hace de repositorio él mismo.
- **Lectura**: el query handler proyecta directo a DTO con `.Select()`.
- **Escritura**: el command handler carga la entidad, la muta y hace `SaveChangesAsync()`.
- **`WeekGenerator`** vive como **domain service**, invocado por el `GenerateWeeklyPlanCommandHandler`.
- **MediatR** como mediator. ⚠️ Verificar su **licencia actual** antes de añadirlo (hubo un cambio hacia modelo comercial en 2025); para un proyecto familiar pequeño casi seguro se cae en el tramo gratuito.

### Estructura de carpetas

```
/backend
  /Api              → Controllers finos
  /Application
    /Commands       → CreateMeal, GenerateWeeklyPlan, RerollSlot, SetAttendance...
    /Queries        → GetCurrentWeeklyPlan, GetMeals...
                      (cada uno: request + handler + response/DTO)
  /Domain           → Entidades, enums (Service), domain services (WeekGenerator)
  /Infrastructure   → DbContext (EF Core), migraciones, config validación JWT Supabase
```

### Secretos

- Connection string de Supabase, secret/JWKS del JWT, etc. → **siempre por variables de entorno**, nunca hardcodeados.

---

## 7. Arquitectura del frontend (Angular)

- **Standalone components** (v17+), sin el boilerplate de `NgModule`.
- **TypeScript** (tipado de punta a punta; las interfaces del front reflejan los DTOs del back).
- Estado con **signals + servicios**. Nada de NgRx.
- UI con **Angular Material** (lista, botones y, sobre todo, el datepicker para el calendario).

### Estructura de carpetas

```
/frontend/src/app
  /core
      auth.service.ts        → cliente de Supabase (login)
      api.service.ts         → cliente HTTP hacia el .NET
      jwt.interceptor.ts     → adjunta el JWT en cada petición  ← pegamento front/back
      auth.guard.ts          → protege rutas
  /features
      /auth                  → pantalla de login
      /meals                 → listar y crear comidas
      /planner               → vista semanal (lunes-domingo, comida/cena, botón re-roll)
      /calendar              → asistencia (desapuntarse por servicio)
  /shared
      /components            → reutilizables
      /models                → interfaces TS que reflejan los DTOs del backend
```

### Pantalla de carga (cold start)

Como el backend usa el plan free de Render (ver §9), tras un rato sin uso el primer acceso tarda ~30-60s en "despertar". Para que la experiencia sea buena, el front muestra una **pantalla de carga maja** ("Preparando el menú…" con un spinner) mientras el back arranca, en vez de una pantalla en blanco.

---

## 8. API (endpoints)

| Método | Ruta                                   | Descripción |
|--------|----------------------------------------|-------------|
| `POST` | `/weekly-plan/generate`                | Genera la semana (14 slots). |
| `GET`  | `/weekly-plan/current`                 | Devuelve el menú de la semana actual **+ la asistencia de toda la familia** (una sola llamada). |
| `PUT`  | `/weekly-plan/slots/{slotId}/reroll`   | Cambia la comida de un slot concreto. |
| `GET`  | `/meals`                               | Lista las comidas de la familia. |
| `POST` | `/meals`                               | Crea una comida. |
| `PUT`  | `/attendance`                          | Marca asistencia. Body: `{ date, service, isAttending }`. El `userId` sale del JWT (cada uno marca la suya). |
| `GET`  | `/health`                              | Endpoint tonto (200 OK) para el cron que mantiene despierto el backend. |

---

## 9. Lógica de negocio

### Generar semana

- Se generan **14 slots** (7 días × comida + cena).
- Reparto **sin repetir** (sin reemplazo) a partir del pool de comidas de la familia.
- Si el pool tiene **menos de 14 comidas**, se permite **repetir lo mínimo imprescindible** para completar la semana, en vez de que la generación falle. Así siempre se genera, aunque haya pocas comidas.
- 💡 Recomendado tener ≥14 comidas sembradas (idealmente 20-25) para una semana sin repeticiones.

### Re-roll

- Reemplaza **un único slot**.
- La nueva comida debe ser **distinta a las que ya están en la semana** (cuando el pool lo permita).

### Asistencia

- Por defecto, todos comen en casa.
- Cada usuario marca **su propia** asistencia, por **día y servicio** ("hoy no ceno").
- El menú y la asistencia son **independientes**: el planner decide *qué* se cocina; la asistencia dice *para cuántos*. Solo se muestran juntos.

---

## 10. Hosting y "always-on"

| Parte         | Plataforma          |
|---------------|---------------------|
| Frontend      | Vercel (siempre activo) |
| Backend       | Render (plan free)  |
| DB + Auth     | Supabase            |

**Sobre el "sleep" del backend (Render free):**

- Tras ~15 min sin actividad, el servicio se duerme. La siguiente petición lo despierta sola (no hay que hacer nada manual), pero ese arranque tarda ~30-60s.
- **Mitigación elegida:**
  1. Endpoint `GET /health` que devuelve `200 OK`.
  2. **cron-job.org** (gratis): un cronjob que llama a `https://<tu-backend>.onrender.com/health` **cada 10 min**, para que nunca pase 15 min sin actividad → nunca se duerme.
  3. La pantalla de carga del front (§7) como red de seguridad por si acaso.
- Si en algún momento molesta, el salto a Render/Railway de pago (~5 $/mes, sin sleep) es trivial.

**Notas:**

- El **sleep solo afecta al backend**. Vercel (front) y los datos en Supabase no se ven afectados.
- El plan free de Supabase pausa la BD tras ~1 semana sin **ninguna** actividad; con uso familiar semanal real no se llega a eso.

---

## 11. Roadmap

### 🥇 V1 (MVP)
- Login (Supabase)
- CRUD de comidas (crear + listar)
- Generar semana
- Re-roll de slot
- Calendario de asistencia (desapuntarse)
- Deploy funcional

### 🥈 V2
- Historial de semanas
- Categorías de comida
- Evitar comidas recientes

### 🥉 V3
- Favoritos
- Preferencias
- Lista de la compra automática

### 🧠 V4 (pro)
- IA para sugerencias
- Notificaciones (Firebase Cloud Messaging)
- Multiusuario completo (invitar familiares + UI de gestión de familias)

---

## 12. Decisiones importantes

**✅ Sí hacer**
- Código limpio y lógica clara
- CQRS ligero (separar lectura/escritura)
- `FamilyId` en el modelo desde el día 1
- Deploy funcional
- UX simple
- Secretos por variables de entorno

**❌ No hacer**
- Auth manual
- Microservicios / Kubernetes
- Repositorio genérico sobre EF Core
- NgRx
- UI de gestión de familias en el MVP
- Overengineering en general

---

## 13. Orden de implementación sugerido

1. **Supabase**: crear proyecto, habilitar Auth, crear las cuentas de la familia a mano, sembrar `Family` y los `User` (con el uuid de Supabase como `Id`).
2. **Backend base**: proyecto .NET, EF Core apuntando a Supabase, entidades + migración inicial, validación del JWT de Supabase, endpoint `/health`.
3. **CRUD de comidas**: `GET /meals`, `POST /meals` (filtrando por `FamilyId`).
4. **Generar semana**: `WeekGenerator` (domain service) + `POST /weekly-plan/generate` + `GET /weekly-plan/current`.
5. **Re-roll**: `PUT /weekly-plan/slots/{slotId}/reroll`.
6. **Asistencia**: `PUT /attendance` + incluir la asistencia en `GET /weekly-plan/current`.
7. **Frontend**: login + interceptor JWT, vista del planner, gestión de comidas, calendario de asistencia, pantalla de carga.
8. **Deploy**: front a Vercel, back a Render, cron-job.org sobre `/health`.
9. **Probar con la familia** 🎉

---

## 🎯 Objetivo final

Una app que **esté desplegada, funcione, y la use tu familia**.
