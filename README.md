# 🍲 Puchero

> Planificador de comidas familiar. Genera menús semanales aleatorios (comida + cena, de lunes a
> domingo) para que nadie tenga que pensar qué cocinar, y permite a cada miembro **desapuntarse**
> de comer o cenar en casa para saber para cuántos preparar.

Pensado para una familia, con el modelo preparado para escalar a varias en el futuro (multi-tenant).

---

## ✨ Qué hace

- 🎲 **Menú semanal automático** — 14 slots (7 días × comida + cena) generados al azar, sin repetir.
- 🔄 **Re-roll** — cambia un día/servicio concreto sin rehacer toda la semana.
- 📅 **Calendario de asistencia** — cada miembro marca si no come/cena en casa un día concreto.
- 📱 **PWA** — se instala como un icono en el móvil, sin pasar por las stores.

---

## 🧱 Stack

| Capa            | Tecnología                                   |
|-----------------|----------------------------------------------|
| Frontend        | Angular (standalone, v17+) + TypeScript      |
| UI              | Angular Material                             |
| Estado          | Signals + servicios                          |
| Backend         | .NET + Entity Framework Core + CQRS (MediatR)|
| Base de datos   | Supabase (PostgreSQL)                         |
| Autenticación   | Supabase Auth (email/password, JWT)          |
| Hosting front   | Vercel                                        |
| Hosting backend | Render (plan free)                            |

---

## 📂 Estructura del repo

```
puchero/
├── README.md          ← estás aquí
├── docs/
│   └── documento-definitivo.md   ← especificación completa del proyecto
├── backend/           ← API .NET (CQRS + EF Core)
└── frontend/          ← PWA Angular
```

---

## 🚀 Puesta en marcha (resumen)

> La guía completa, con el orden de implementación paso a paso, está en
> [`docs/documento-definitivo.md`](docs/documento-definitivo.md).

1. **Supabase** — crear proyecto, habilitar Auth, crear las cuentas de la familia y sembrar `Family` + `User`.
2. **Backend** — `dotnet new` en `/backend`, EF Core apuntando a Supabase, validación del JWT, endpoint `/health`.
3. **Frontend** — `ng new` en `/frontend`, login con Supabase + interceptor del JWT, vistas del planner y el calendario.
4. **Deploy** — front a Vercel, back a Render, cron-job.org sobre `/health` para evitar el "sleep".

---

## 🗺 Roadmap

- **V1 (MVP)** — login, CRUD de comidas, generar semana, re-roll, calendario de asistencia, deploy.
- **V2** — historial de semanas, categorías, evitar comidas recientes.
- **V3** — favoritos, preferencias, lista de la compra automática.
- **V4** — IA para sugerencias, notificaciones (FCM), invitar familiares.

---

## 📖 Documentación

Toda la especificación (modelo de datos, arquitectura de back y front, endpoints, lógica de negocio,
decisiones de diseño y orden de implementación) vive en
**[`docs/documento-definitivo.md`](docs/documento-definitivo.md)**.
