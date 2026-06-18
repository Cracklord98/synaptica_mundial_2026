# 📖 Documentación Técnica — La Polla Mundial 2026

> Documentación completa del sistema: arquitectura, base de datos, API, componentes frontend y backend.

---

## Tabla de Contenidos

1. [Arquitectura General](#1-arquitectura-general)
2. [Base de Datos (Supabase / PostgreSQL)](#2-base-de-datos)
3. [API Interna (Endpoints)](#3-api-interna)
4. [Backend — Server Actions](#4-backend--server-actions)
5. [Frontend — Páginas y Rutas](#5-frontend--páginas-y-rutas)
6. [Componentes React](#6-componentes-react)
7. [Middleware de Autenticación](#7-middleware-de-autenticación)
8. [Sistema de Cron Jobs](#8-sistema-de-cron-jobs)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Sistema de Puntuación](#10-sistema-de-puntuación)

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                  │
│         Next.js 15 App Router · Tailwind CSS         │
│         Framer Motion · Recharts · shadcn/ui         │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / RSC
┌──────────────────────▼──────────────────────────────┐
│                  VERCEL (Serverless)                  │
│                                                       │
│  ┌──────────────────┐   ┌──────────────────────────┐ │
│  │  App Pages (RSC) │   │   API Routes (Serverless) │ │
│  │  /dashboard/*    │   │   /api/cron/sync-matches  │ │
│  │  /auth/*         │   │   /api/cron/update-...    │ │
│  └────────┬─────────┘   └──────────┬───────────────┘ │
│           │ Supabase SDK            │ fetch()          │
└───────────┼─────────────────────────┼────────────────┘
            │                         │
┌───────────▼─────────────┐  ┌────────▼──────────────┐
│   SUPABASE (PostgreSQL)  │  │  worldcup26.ir (API)  │
│                          │  │  Resultados Mundial   │
│  Tables:                 │  │  /get/games           │
│  · profiles              │  └───────────────────────┘
│  · teams                 │
│  · matches               │  ┌───────────────────────┐
│  · predictions           │  │    CRON-JOB.ORG        │
│  · bonus_predictions     │  │  Trigger cada 15 min  │
│  · score_history         │  │  GET /api/cron/sync   │
│  · model_cards           │  └───────────────────────┘
│  · rounds_config         │
│                          │
│  Triggers:               │
│  · on_match_finished     │
│  · on_match_winner_prop  │
│  · on_auth_user_created  │
└──────────────────────────┘
```

---

## 2. Base de Datos

### 2.1 Diagrama de Tablas

```
auth.users (Supabase Auth)
    │
    └── profiles ─────────────────────────────────────────┐
         id, username, team_name, partner_id,              │
         partner_email, is_admin                           │
                                                           │
teams                                                      │
    id, name, flag_url, group_name,                        │
    position_in_group, is_qualified, eliminated            │
         │                                                 │
         ├──── matches ──────────────────────────────────┐ │
         │      id, round, team1_id, team2_id,           │ │
         │      team1_score, team2_score, winner_id,      │ │
         │      next_match_id, match_datetime,            │ │
         │      deadline, is_finished                     │ │
         │                                                │ │
         │      ┌───────────────────────────────────────┐│ │
         │      │ predictions                           ││ │
         │      │  user_id, match_id, score_local,      ││ │
         │      │  score_visitor, winner_id             ││ │
         │      └───────────────────────────────────────┘│ │
         │                                                │ │
         └──── bonus_predictions ────────────────────────┘ │
                user_id, champion_id,                       │
                finalist1_id, finalist2_id                  │
                                                            │
score_history ──────────────────────────────────────────────┘
    user_id, match_id, round, points, is_exact

model_cards
    user_id, answers (JSONB), description, repo_url
```

### 2.2 Tablas

#### `public.profiles`
Extiende `auth.users` con datos del participante.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Referencia a `auth.users` |
| `username` | TEXT UNIQUE | Nombre de usuario único |
| `team_name` | TEXT | Nombre del equipo (individual o dupla) |
| `partner_id` | UUID FK | Referencia al perfil del compañero de dupla |
| `partner_email` | TEXT | Email del compañero invitado |
| `is_admin` | BOOLEAN | Si el usuario tiene rol de administrador |
| `created_at` | TIMESTAMPTZ | Fecha de registro |

#### `public.teams`
Equipos del Mundial (32 países).

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Identificador único |
| `name` | TEXT UNIQUE | Nombre del país (en español) |
| `flag_url` | TEXT | URL de la bandera (flagcdn.com) |
| `group_name` | TEXT | Grupo del torneo ('A' a 'L') |
| `position_in_group` | INTEGER | Posición en el grupo (1, 2 o 3) |
| `is_qualified` | BOOLEAN | Si el equipo está clasificado |
| `eliminated` | BOOLEAN | Si el equipo fue eliminado |

#### `public.matches`
Partidos de la fase eliminatoria.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Identificador (UUIDs semánticos en el seed) |
| `round` | TEXT | Ronda: `round_32`, `round_16`, `quarter`, `semi`, `final`, `third_place` |
| `team1_id` | UUID FK | Equipo local |
| `team2_id` | UUID FK | Equipo visitante |
| `team1_score` | INTEGER | Goles del equipo local (90 min) |
| `team2_score` | INTEGER | Goles del equipo visitante (90 min) |
| `winner_id` | UUID FK | Equipo que avanza a la siguiente ronda |
| `next_match_id` | UUID FK (self) | Partido al que avanza el ganador |
| `match_datetime` | TIMESTAMPTZ | Fecha y hora oficial del partido (sync automático) |
| `deadline` | TIMESTAMPTZ | 1 hora antes del partido (cierre de predicciones) |
| `is_finished` | BOOLEAN | Si el partido ha concluido |

**Mapeo del Bracket (UUID → API ID):**

| UUID Sufijo DB | API ID | Ronda |
|---|---|---|
| `...3201` a `...3216` | 73 – 88 | Round of 32 |
| `...1601` a `...1608` | 89 – 96 | Round of 16 |
| `...0801` a `...0804` | 97 – 100 | Quarterfinals |
| `...0401` a `...0402` | 101 – 102 | Semifinals |
| `...3333...` | 103 | Third Place |
| `...f1f1...` | 104 | Final |

#### `public.predictions`
Predicciones de usuarios por partido.

| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | UUID FK | Usuario que predice |
| `match_id` | UUID FK | Partido predicho |
| `score_local` | INTEGER | Goles predichos equipo local (tiempo reglamentario) |
| `score_visitor` | INTEGER | Goles predichos equipo visitante |
| `winner_id` | UUID FK | Equipo predicho como clasificante |
| `submitted_at` | TIMESTAMPTZ | Momento de la predicción |
| UNIQUE | | `(user_id, match_id)` |

#### `public.bonus_predictions`
Predicciones especiales pre-torneo.

| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | UUID FK | Usuario |
| `champion_id` | UUID FK | Campeón predicho |
| `finalist1_id` | UUID FK | Finalista 1 |
| `finalist2_id` | UUID FK | Finalista 2 |

#### `public.score_history`
Historial de puntos por usuario y partido.

| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | UUID FK | Usuario |
| `match_id` | UUID FK | Partido |
| `round` | TEXT | Ronda del partido |
| `points` | INTEGER | Puntos obtenidos |
| `is_exact` | BOOLEAN | Si fue marcador exacto |

#### `public.model_cards`
Fichas metodológicas analíticas de los equipos.

| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | UUID FK | Usuario |
| `answers` | JSONB | Respuestas a las 7 preguntas (q1_data ... q7_link) |
| `description` | TEXT | Resumen del enfoque (copia de q3_approach) |
| `repo_url` | TEXT | Enlace al repositorio o notebook |

### 2.3 Triggers y Funciones de Base de Datos

#### `public.handle_new_user()` — Trigger `on_auth_user_created`
Se dispara al crear un usuario en `auth.users`. Crea automáticamente el registro en `public.profiles`.

#### `public.calculate_match_points(match_uuid)` — Función
Calcula y registra los puntos de todos los participantes que predijeron un partido específico al marcarlo como finalizado.

**Lógica:**
- Marcador exacto → **5 pts** base + **2 pts** si el equipo clasificante también fue correcto.
- Solo resultado correcto (ganador o empate) → **3 pts** + **2 pts** si el clasificante fue correcto.
- Predicción incorrecta → **0 pts**.

#### `public.after_match_finished_trigger()` — Trigger `on_match_finished`
Se dispara tras actualizar `is_finished`, `team1_score`, `team2_score` o `winner_id` en `matches`. Llama a `calculate_match_points()`.

#### `public.propagate_winner_to_next_match()` — Trigger `on_match_winner_propagation`
Se dispara tras actualizar `is_finished` o `winner_id` en un partido. Coloca al ganador como `team1_id` o `team2_id` en el partido de la siguiente ronda (`next_match_id`), determinando la posición por el UUID mínimo entre los dos partidos que alimentan la siguiente llave.

### 2.4 Vistas

#### `public.leaderboard`
Vista agregada para el ranking de participantes.

```sql
SELECT
  p.id AS user_id, p.username, p.team_name,
  SUM(sh.points) AS total_points,
  SUM(CASE WHEN sh.is_exact THEN 1 ELSE 0 END) AS exact_count,
  SUM(CASE WHEN sh.round = 'round_32' THEN sh.points ELSE 0 END) AS r32_points,
  -- ... puntos por ronda
FROM profiles p
LEFT JOIN score_history sh ON sh.user_id = p.id
WHERE p.is_admin = FALSE
GROUP BY p.id
ORDER BY total_points DESC, exact_count DESC;
```

### 2.5 Políticas RLS (Row Level Security)

| Tabla | Política |
|---|---|
| `profiles` | Lectura para todos los autenticados; solo el propietario puede editar |
| `teams` | Lectura para todos; solo admins pueden modificar |
| `matches` | Lectura para todos; solo admins pueden modificar |
| `predictions` | El propietario las ve siempre; el resto las ve solo después del deadline; insert/update solo antes del deadline |
| `bonus_predictions` | Visibles para todos después del 28 Jun; editable antes del 28 Jun |
| `score_history` | Solo lectura; modificación solo vía funciones BD o admins |
| `model_cards` | Lectura para todos; modificación solo por el propietario antes del 17 Jul |

---

## 3. API Interna

Todos los endpoints residen en `/app/api/`. Las rutas de `/api/cron/*` están **excluidas del middleware de autenticación** por diseño: se autentican internamente mediante `CRON_SECRET`.

### `GET /api/cron/sync-matches`

**Descripción:** Sincroniza los partidos de la fase eliminatoria con la API externa del Mundial. Actualiza automáticamente fechas, equipos (al finalizar la fase de grupos) y marcadores finales.

**Autenticación:** Header `Authorization: Bearer <CRON_SECRET>`

**Request:**
```http
GET https://synaptica-mundial-2026.vercel.app/api/cron/sync-matches
Authorization: Bearer mi_clave_secreta_cron_2026
```

**Response exitosa (200):**
```json
{
  "success": true,
  "syncTime": "2026-06-18T15:28:39.950Z",
  "updatedMatches": 29,
  "updatedMatchups": 0,
  "updatedScores": 0,
  "updatedDates": 29
}
```

**Response de error (500):**
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

**Response sin autorización (401):**
```
No Autorizado
```

**Lógica interna:**
1. Valida el `CRON_SECRET` del header `Authorization`.
2. Fetch a `https://worldcup26.ir/get/games`.
3. Para cada partido en el `MATCH_MAPPING` (diccionario estático de 32 UUIDs ↔ API IDs):
   - **Actualiza fechas**: Parsea `local_date` de la API (formato `MM/DD/YYYY HH:mm`) asumiendo EDT (UTC-4). Calcula `deadline = match_datetime - 1h`.
   - **Actualiza equipos** (solo `round_32`): Si la API ya tiene nombres reales de países (no placeholders como "Winner Group A"), los busca en la BD y los asigna.
   - **Actualiza marcadores** (todas las rondas): Si `finished = "TRUE"`, guarda `team1_score`, `team2_score`, `winner_id` y marca `is_finished = true`.
4. Realiza una sola query de UPDATE por partido modificado (eficiencia).

**Tabla de Mapeo MATCH_MAPPING:**

```typescript
const MATCH_MAPPING: Record<string, string> = {
  // Round of 32
  "32323232-3232-3232-3232-323232323201": "73",  // API R32 Match 1
  "32323232-3232-3232-3232-323232323202": "75",  // API R32 Match 2 (mismo bracket)
  // ... 14 partidos más
  // Round of 16
  "16161616-1616-1616-1616-161616161601": "90",
  // ... Quarters, Semis, 3rd, Final
  "f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1": "104", // Gran Final
};
```

---

### `GET /api/cron/update-standings`

**Descripción:** Actualiza los datos de clasificación y equipos desde la API externa `api.worldcup2026.dev`.

**Autenticación:** Header `Authorization: Bearer <CRON_SECRET>`

**Response exitosa (200):**
```json
{
  "success": true,
  "count": 32
}
```

---

## 4. Backend — Server Actions

Definidas en [`lib/actions.ts`](file:///c:/Users/AndresToro/OneDrive - Synaptica/Synaptica_Mundial_2026/lib/actions.ts). Se ejecutan en el servidor sin exponer endpoints HTTP públicos.

### `submitPrediction(matchId, scoreLocal, scoreVisitor, winnerId)`
Guarda o actualiza la predicción de un usuario para un partido.

**Validaciones:**
- Usuario autenticado (no admin).
- Partido existe y su `deadline` no ha vencido.
- Scores ≥ 0.

**Tabla:** `predictions` (upsert por `user_id, match_id`).

---

### `submitBonus(championId, finalist1Id, finalist2Id)`
Registra las predicciones bonus pre-torneo.

**Validaciones:**
- Usuario autenticado (no admin).
- Fecha actual < 28 Jun 2026 00:00 UTC.

**Tabla:** `bonus_predictions` (upsert por `user_id`).

---

### `uploadModelCard(answers, repoUrl)`
Guarda las respuestas del formulario de Model Card.

**Parámetros:**
- `answers`: `{ q1_data, q2_etl, q3_approach, q4_why, q5_recal, q6_assumptions, q7_link }`
- `repoUrl`: URL opcional al repositorio o notebook.

**Validaciones:**
- Usuario autenticado (no admin).
- Fecha actual < 17 Jul 2026 23:59:59 UTC.

**Tabla:** `model_cards` (upsert por `user_id`).

---

### `updateMatchResult(matchId, team1Id, team2Id, team1Score, team2Score, winnerId, isFinished)` _(Admin)_
Actualiza manualmente el resultado de un partido. Requiere `is_admin = true`.

Al establecer `isFinished = true`, el trigger `on_match_finished` dispara el cálculo de puntos y `on_match_winner_propagation` coloca al ganador en el siguiente cruce del bracket.

---

### `saveTeam(teamId, name, flagUrl, groupName, positionInGroup, isQualified, eliminated)` _(Admin)_
Crea o edita un equipo en la tabla `teams`. Requiere `is_admin = true`.

---

### `deleteTeam(teamId)` _(Admin)_
Elimina un equipo. Requiere `is_admin = true`.

---

### `saveTeamsBulk(teams[])` _(Admin)_
Inserta o actualiza múltiples equipos de una vez (usado por scripts de seed). Requiere `is_admin = true`.

---

### `deleteUserAction(userId)` _(Admin)_
Elimina el perfil de un participante de `public.profiles`. No puede eliminar al propio admin. Requiere `is_admin = true`.

---

## 5. Frontend — Páginas y Rutas

### Rutas Públicas

| Ruta | Descripción |
|---|---|
| `/` | Landing page (redirige al dashboard si ya estás autenticado) |
| `/auth/login` | Inicio de sesión |
| `/auth/sign-up` | Registro de nueva cuenta |
| `/auth/forgot-password` | Recuperación de contraseña |
| `/auth/update-password` | Actualización de contraseña (post reset) |
| `/auth/confirm` | Confirmación de email (callback de Supabase) |
| `/auth/error` | Página de error de autenticación |

### Rutas Protegidas (requieren sesión)

| Ruta | Componente Principal | Descripción |
|---|---|---|
| `/dashboard` | `DashboardShell` + `DashboardCharts` | Dashboard principal con posición actual, estadísticas y gráficos de progreso |
| `/dashboard/bracket` | `BracketView` | Vista del árbol de eliminación completo con modales de predicción |
| `/dashboard/predictions/[round]` | `PredictionForm` | Formulario de predicciones para una ronda específica |
| `/dashboard/leaderboard` | Tabla + Recharts | Tabla de posiciones con gráficos de barras por puntaje |
| `/dashboard/model-card` | `UploadCard` | Formulario de 7 preguntas de la ficha metodológica |
| `/dashboard/rules` | Página estática | Reglamento de la polla |

### Rutas de Administración (requieren `is_admin = true`)

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard/admin` | Panel principal | Resumen rápido del estado del torneo |
| `/dashboard/admin/matches` | `AdminMatchesList` | Ver y editar resultados de partidos |
| `/dashboard/admin/teams` | `AdminTeamsManager` | CRUD de los 32 equipos del Mundial |
| `/dashboard/admin/users` | `AdminUsersTable` | Directorio de participantes registrados |
| `/dashboard/admin/model-cards` | `AdminModelCardsCharts` | Visualización analítica de las fichas metodológicas |

---

## 6. Componentes React

### `BracketView` (`components/bracket/BracketView.tsx`)
Vista visual del bracket completo del torneo.

- Renderiza el árbol de eliminación directa de R32 a la Final.
- Al hacer clic en un partido con predicciones habilitadas, abre un modal con `PredictionForm`.
- Muestra: equipos, marcadores finales, estado del partido y predicción del usuario.
- Estado de solo lectura para admins y cuando el deadline ha pasado.

---

### `PredictionForm` (`components/prediction/PredictionForm.tsx`)
Formulario para predecir marcadores y equipo clasificante.

- Agrupa los partidos de la ronda seleccionada ordenados cronológicamente.
- Cada partido muestra inputs para el marcador y un selector visual del equipo que avanza.
- Deshabilita el formulario automáticamente si el `deadline` del partido ya pasó.
- Admins ven los partidos en modo solo lectura.

---

### `DashboardShell` (`components/dashboard/DashboardShell.tsx`)
Shell principal del dashboard de cada usuario.

- Muestra la posición actual en el ranking.
- Estadísticas rápidas: total de puntos, marcadores exactos, predicciones realizadas vs. disponibles.
- Tarjeta de próximos partidos con el tiempo restante para predecir.
- Tarjeta de pareja/compañero de dupla y estado de la invitación.

---

### `DashboardCharts` (`components/dashboard/DashboardCharts.tsx`)
Gráficos de rendimiento del usuario.

- **Progresión por ronda**: Gráfico de barras (Recharts `BarChart`) con los puntos obtenidos en cada fase.
- **Comparativa con el grupo**: Puntuación del usuario vs. promedio del grupo.
- Datos traídos desde la vista `leaderboard` y `score_history`.

---

### `AdminMatchesList` (`components/admin/AdminMatchesList.tsx`)
Panel de administración de partidos para el admin.

- Lista todos los partidos de todas las rondas con sus equipos, fecha y estado.
- Permite al admin: asignar equipos, ingresar marcadores, seleccionar al ganador y marcar el partido como finalizado.
- Al marcar `isFinished = true`, se disparan los triggers de puntuación y propagación en Supabase.

---

### `AdminTeamsManager` (`components/admin/AdminTeamsManager.tsx`)
CRUD de equipos para el admin.

- Tabla con todos los 32 equipos, su bandera, grupo y posición.
- Formulario modal para crear/editar equipos (nombre, URL bandera, grupo, posición, estado clasificado/eliminado).
- Botón de eliminación con confirmación.

---

### `AdminUsersTable` (`components/admin/AdminUsersTable.tsx`)
Directorio de participantes para el admin.

- Muestra todos los usuarios registrados con su nombre, equipo, compañero de dupla y estado.
- Permite al admin eliminar participantes.

---

### `AdminModelCardsCharts` (`components/admin/AdminModelCardsCharts.tsx`)
Dashboard analítico de fichas metodológicas.

- **Gráfico de Metodologías** (`PieChart` de Recharts): Clasifica los enfoques por palabras clave (Poisson, Elo, Machine Learning, Monte Carlo, LLMs, Manual).
- **Gráfico de Fuentes de Datos** (`BarChart`): Frecuencia de fuentes usadas (Ranking FIFA, Históricos, Elo, Fase de grupos).
- **Métricas rápidas**: Total de fichas completadas y % con repositorio de código compartido.
- Listado detallado de todas las fichas con respuestas estructuradas por pregunta.

---

### `UploadCard` (`components/model-card/UploadCard.tsx`)
Formulario estructurado de la Model Card para el usuario.

**7 preguntas del formulario:**

| Campo | Pregunta | Tipo |
|---|---|---|
| `q1_data` | ¿Qué fuentes de datos usaron? | Textarea |
| `q2_etl` | ¿Cómo prepararon los datos? | Input |
| `q3_approach` | ¿Qué enfoque/modelo usaron? | Input |
| `q4_why` | ¿Por qué eligieron ese enfoque? | Input |
| `q5_recal` | ¿Cómo recalibraron cada ronda? | Input |
| `q6_assumptions` | ¿Qué supuestos y limitaciones tienen? | Textarea |
| `q7_link` | Enlace a repositorio/notebook (opcional) | Input |

---

## 7. Middleware de Autenticación

**Archivo:** [`lib/supabase/proxy.ts`](file:///c:/Users/AndresToro/OneDrive - Synaptica/Synaptica_Mundial_2026/lib/supabase/proxy.ts)

El middleware se ejecuta en cada request usando `proxy.ts` en la raíz.

**Lógica de enrutamiento:**

```
Request entrante
     │
     ▼
¿Ruta inicia con /api/?  →  Pasar (sin redirección). Los endpoints manejan su propia auth.
     │ No
     ▼
¿Usuario autenticado?
     │ No → ¿Ruta es / o /auth/*?  →  Pasar
     │           │ No → Redirigir a /auth/login
     │ Sí → ¿Ruta es /?  →  Redirigir a /dashboard
     │          │ No → Pasar
```

> ⚠️ **Importante**: Las rutas `/api/*` están explícitamente excluidas de la redirección de autenticación. Cada endpoint de API valida su propia autenticación internamente (ej. `CRON_SECRET`).

---

## 8. Sistema de Cron Jobs

### Diagrama de Flujo Completo

```
[cron-job.org] ─── cada 15 min ───► GET /api/cron/sync-matches
                                          │
                                    Valida CRON_SECRET
                                          │
                                    GET worldcup26.ir/get/games
                                          │
                                    Para cada partido en MATCH_MAPPING:
                                          │
                              ┌───────────┼───────────┐
                              │           │           │
                         Fecha/Hora    Equipos    Marcador
                         (siempre)    (si no    (si finished
                              │       placeholder)  = TRUE)
                              │           │           │
                              └───────────┴───────────┘
                                          │
                              UPDATE matches SET ... en Supabase
                                          │
                              Si is_finished = TRUE ──────────────────┐
                                          │                           │
                              TRIGGER: after_match_finished     TRIGGER: propagate_winner
                                          │                           │
                              calculate_match_points()      UPDATE next match
                                          │                  SET team1_id / team2_id
                              INSERT score_history
```

### Configuración del Cron en Vercel (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-matches",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/update-standings",
      "schedule": "0 1 * * *"
    }
  ]
}
```

> ℹ️ El cron nativo de Vercel (Hobby/gratuito) solo puede ejecutarse una vez al día. La frecuencia de 15 minutos la aporta **cron-job.org** de forma gratuita.

### Configuración de cron-job.org

| Campo | Valor |
|---|---|
| URL | `https://synaptica-mundial-2026.vercel.app/api/cron/sync-matches` |
| Método | `GET` |
| Frecuencia | Cada 15 minutos (`*/15 * * * *`) |
| Header | `Authorization: Bearer <CRON_SECRET>` |
| Zona Horaria | America/Bogota |

---

## 9. Variables de Entorno

| Variable | Requerida en | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Local + Vercel | URL del proyecto Supabase (`https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Local + Vercel | Clave pública `anon` de Supabase |
| `CRON_SECRET` | Vercel | Token secreto que valida las peticiones al endpoint del cron |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Clave `service_role` de Supabase que bypasea RLS (solo server-side) |

> ⚠️ **Nunca commitear** `SUPABASE_SERVICE_ROLE_KEY` al repositorio. Solo configurarla en el panel de Vercel.

---

## 10. Sistema de Puntuación

### Tabla de Puntos por Predicción

| Condición | Puntos por Marcador | Puntos por Clasificante |
|---|---|---|
| Marcador exacto (ej: 2-1 = 2-1) | **+5 pts** | **+2 pts** si equipo correcto |
| Resultado correcto (ganó, perdió o empató) | **+3 pts** | **+2 pts** si equipo correcto |
| Resultado incorrecto | **0 pts** | **0 pts** |

**Máximo por partido:** 7 puntos (5 exacto + 2 clasificante correcto).

### Tabla de Desempate en el Leaderboard

En caso de empate en `total_points`, el desempate se resuelve en orden:
1. Mayor número de marcadores exactos (`exact_count`).
2. Mayor puntaje acumulado en la ronda Final (`final_points`).

### Puntos por Ronda (columnas en `leaderboard`)

| Columna | Partidos |
|---|---|
| `r32_points` | 16 partidos de la Ronda de 32 |
| `r16_points` | 8 Octavos de Final |
| `quarter_points` | 4 Cuartos de Final |
| `semi_points` | 2 Semifinales |
| `final_points` | Final + Tercer Puesto |
