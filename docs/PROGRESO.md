# 🍲 Puchero — Progreso y próximos pasos

Seguimiento del estado de implementación. La especificación completa está en
[`documento-definitivo.md`](documento-definitivo.md) (§13 tiene el orden de implementación).

> Última actualización: 2026-06-07.

---

## ✅ Hecho

- [x] **Supabase**: proyecto creado, Auth (email/password, sign-up cerrado), 5 usuarios.
- [x] **Seed**: familia "Algarra Toyos" + 5 usuarios (con sus UUID de Auth y `colorIndex`).
- [x] **Backend scaffold**: proyecto .NET 10, EF Core + Npgsql (snake_case), entidades del modelo
      canónico + enums, `PucheroDbContext`, migración inicial aplicada a Supabase.
- [x] **Auth**: validación del JWT de Supabase (JWKS/ES256), `ICurrentUser` (sub → FamilyId).
- [x] **Endpoint `/health`** (anónimo, para el cron anti-sleep).
- [x] **CRUD de comidas**: `GET/POST/DELETE /meals` (CQRS sin MediatR), **probado end-to-end**.
- [x] **Generar semana**: `WeekGenerator` + `POST /weekly-plan/generate` — 14 slots, por
      categoría, repeticiones repartidas. **Probado.**
- [x] **Ver semana actual**: `GET /weekly-plan/current` — menú + miembros + asistencia. **Probado.**
- [x] **Re-roll**: `PUT /weekly-plan/slots/{slotId}/reroll`. **Probado.**
- [x] **Asistencia**: `PUT /weekly-plan/slots/{slotId}/attendance` (por ausencia). **Probado.**
- [x] **Swagger UI** con botón Authorize.
- [x] **Docs** consolidadas (una fuente de verdad por tema) + `CLAUDE.md`.

> **La API del MVP está funcionalmente completa.** Todos los endpoints probados con JWT real.

---

## ⏳ Pendiente

### Backend — pulido (opcional para cerrar al 100%)
- [ ] **Manejo de errores coherente**: hoy, si el usuario del token no está en ninguna familia,
      `ICurrentUser` lanza y devuelve 500. Mapear a 401/403 limpio; 400 con mensaje si faltan
      datos. (Funciona, pero los errores no son finos.)

### Frontend — Angular PWA
- [ ] `ng new` standalone + Angular Material + tema Puchero (tokens de `design/`) + fuentes + iconos Lucide.
- [ ] Layout: bottom nav 2 pestañas (Semana · Comidas) + router.
- [ ] Auth: login Supabase + interceptor JWT + guard. Splash gateado por `/health`.
- [ ] Pantalla **Comidas**: listar + añadir + eliminar (signals + servicio, contra `/meals`).
- [ ] Pantalla **Semana**: generar + tarjetas de día + re-roll + bottom sheet de asistencia.

### Deploy y cierre
- [ ] PWA: manifest + service worker.
- [ ] Front a **Vercel**, backend a **Render** (con la Transaction pooler de Supabase, puerto 6543).
- [ ] **cron-job.org** sobre `/health` cada 10 min (anti-sleep de Render).
- [ ] Probar con la familia 🎉

---

## 🗒️ Notas / decisiones recientes
- Modelo de datos = el del handoff de diseño (`category`, `colorIndex`, asistencia por ausencia).
- CQRS **sin MediatR**; rutas **sin** prefijo `/api`; comentarios en inglés, commits en español.
- Conexión a Supabase: usar la **Session pooler** (la directa no resuelve por IPv6). Ver `CLAUDE.md`.
