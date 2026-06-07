# CLAUDE.md

Guía operativa para trabajar en **Puchero** (planificador de comidas familiar, PWA).
Esto NO es la especificación: la spec completa (producto, modelo de datos, API, lógica) vive en
[`docs/documento-definitivo.md`](docs/documento-definitivo.md) y el diseño visual en
[`design/`](design/README.md). Aquí solo van convenciones, comandos y gotchas.

## Estructura del repo
- `backend/Puchero/Puchero.Api/` — API .NET 10 (un único proyecto; `.sln` solo del backend).
- `frontend/` — PWA Angular (aún sin scaffold).
- `docs/` — especificación (`documento-definitivo.md`) + `docs/archive/` (histórico).
- `design/` — fuente de verdad visual: `tokens-for-angular.css`, `prototype/`, `screenshots/`.

## Backend — comandos
Desde `backend/Puchero/Puchero.Api/`:
- Build: `dotnet build`
- Run: `dotnet run --launch-profile http` (Swagger en `http://localhost:5299/swagger`)
- Migraciones: `dotnet ef migrations add <Nombre> -o Migrations` · `dotnet ef database update`

## Convenciones (IMPORTANTE)
- **CQRS ligero SIN MediatR**: el controller fino inyecta y llama al handler directamente.
  Handlers en `Application/Commands` y `Application/Queries`; DTOs en `Application/Dtos`.
- **Multi-tenant**: todo se filtra por `FamilyId`. Se obtiene con `ICurrentUser` (lee el claim
  `sub` del JWT → busca el `User` → su `FamilyId`). Todo handler empieza por ahí.
- **Rutas sin prefijo** `/api` (ej. `/meals`, `/weekly-plan/...`).
- **BD en snake_case** (EFCore.NamingConventions); **enums guardados como texto**; en JSON los
  enums van en camelCase (`lunch`/`dinner`/`both`).
- **Comentarios de código en inglés**; **mensajes de commit en español** y **sin** línea
  `Co-Authored-By: Claude`.
- **Secretos** (connection string, etc.) en `dotnet user-secrets`, **nunca** en el repo.

## Supabase / Auth
- Proyecto ref `wgcxqdwsukmhpnkfjjkh` (región eu-west-2). Auth con JWT asimétrico (ES256, JWKS).
  Issuer `https://wgcxqdwsukmhpnkfjjkh.supabase.co/auth/v1`, audience `authenticated`.
- `User.Id` = uuid de Supabase Auth (el `sub` del token).
- ⚠️ **La conexión directa a la BD (`db.<ref>.supabase.co`) NO resuelve** desde esta red
  (IPv6). Usar la **Session pooler** (`aws-1-eu-west-2.pooler.supabase.com:5432`, usuario
  `postgres.<ref>`). Para runtime en Render se usará la Transaction pooler (6543).

## Probar endpoints protegidos (obtener un JWT real)
El token del dashboard de Supabase NO sirve (otro issuer). Pedir uno a tu proyecto:
```powershell
$body = @{ email = "<email>"; password = "<pass>" } | ConvertTo-Json
(Invoke-RestMethod -Method Post `
  -Uri "https://wgcxqdwsukmhpnkfjjkh.supabase.co/auth/v1/token?grant_type=password" `
  -Headers @{ apikey = "<ANON_KEY>"; "Content-Type" = "application/json" } -Body $body).access_token
```
Pegarlo en **Authorize** de Swagger. Requiere que el **seed** de `family` + `users` esté corrido.

## Entorno
- Windows + PowerShell. IDE: Visual Studio (backend) + VS Code (frontend). .NET 10 (LTS).
