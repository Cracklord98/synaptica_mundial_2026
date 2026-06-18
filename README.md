# 🌍 La Polla Mundial 2026 — Synaptica

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**Plataforma predictiva corporativa de la Copa Mundial FIFA 2026** para los colaboradores de Synaptica. Predicciones ronda a ronda, bracket visual interactivo, leaderboard en tiempo real y sincronización automática de resultados vía API oficial del torneo.

[🌐 App en Producción](https://synaptica-mundial-2026.vercel.app) · [📖 Documentación Técnica](./DOCS.md) · [🚀 Guía de Despliegue](./DEPLOY.md)

</div>

---

## ✨ Características Principales

| Característica | Descripción |
|---|---|
| 🔐 **Autenticación** | Registro e inicio de sesión seguros via Supabase Auth |
| 👥 **Modo Individual / Dupla** | Participa solo o en pareja con nombre de equipo único |
| 🔮 **Predicciones por Ronda** | Predice marcadores y equipo clasificado por cada partido |
| ⏱️ **Control de Deadlines** | Cierre automático de predicciones 1 hora antes de cada partido |
| 🏆 **Bracket Visual** | Árbol de eliminación directa interactivo de R32 a la Final |
| 📊 **Leaderboard en Vivo** | Tabla de posiciones con progresión histórica por ronda (Recharts) |
| 🤖 **Sincronización Automática** | Cron job cada 15 min actualiza equipos, marcadores y cruces desde la API oficial |
| 🃏 **Model Card (Pista Analítica)** | Formulario de 7 preguntas para documentar metodologías predictivas con dashboard analítico para el admin |
| ⚙️ **Panel de Administración** | Gestión de usuarios, equipos, partidos y model cards |

---

## 🛠️ Stack Tecnológico

```
Frontend:  Next.js 15 (App Router) · TypeScript 5 · Tailwind CSS · Framer Motion · Recharts
Backend:   Next.js Server Actions · Supabase Edge Functions (triggers) · Vercel Serverless
Base datos: Supabase (PostgreSQL + RLS + Triggers + Storage)
Auth:      Supabase Auth (Email/Password)
Hosting:   Vercel (Frontend + Cron Jobs nativos)
Cron:      cron-job.org (sincronización cada 15 min, gratuito)
API:       worldcup26.ir (resultados y calendario oficial del Mundial)
UI Lib:    shadcn/ui (Radix UI) · Lucide Icons
```

---

## 📂 Estructura del Proyecto

```
synaptica_mundial_2026/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── cron/
│   │       ├── sync-matches/     # 🤖 Sincronización automática (Cron principal)
│   │       └── update-standings/ # 📊 Actualización de clasificaciones
│   ├── auth/                     # Páginas de autenticación
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── confirm/
│   │   └── ...
│   └── dashboard/                # Aplicación principal (requiere auth)
│       ├── page.tsx              # Dashboard principal con stats
│       ├── bracket/              # Vista del árbol de eliminación
│       ├── predictions/[round]/  # Predicciones por ronda
│       ├── leaderboard/          # Tabla de posiciones
│       ├── model-card/           # Ficha metodológica del usuario
│       ├── rules/                # Reglamento de la polla
│       └── admin/                # Panel de administración
│           ├── matches/          # Gestión de partidos y marcadores
│           ├── teams/            # Gestión de equipos
│           ├── users/            # Gestión de participantes
│           └── model-cards/      # Visualización analítica de fichas
│
├── components/                   # Componentes React reutilizables
│   ├── admin/                    # Componentes del panel admin
│   ├── bracket/                  # Bracket visual interactivo
│   ├── dashboard/                # Shell y gráficos del dashboard
│   ├── leaderboard/              # Tabla de posiciones
│   ├── model-card/               # Formulario de ficha metodológica
│   └── prediction/               # Formularios de predicción
│
├── lib/
│   ├── actions.ts                # Server Actions (lógica de negocio)
│   ├── utils.ts                  # Utilidades compartidas
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (browser)
│       ├── server.ts             # Cliente Supabase (server-side)
│       └── proxy.ts              # Middleware de sesión y auth routing
│
├── supabase/
│   └── migrations/
│       ├── 20260616000000_init_schema.sql        # Esquema de tablas, RLS y funciones
│       ├── 20260616000001_seed_data.sql           # Equipos y bracket inicial
│       ├── 20260616000002_remove_payment_columns.sql
│       ├── 20260617000000_admin_delete_users.sql
│       └── 20260617000001_winner_propagation.sql  # Trigger de propagación de ganadores
│
├── vercel.json                   # Configuración de Cron Jobs nativos de Vercel
├── .env.local                    # Variables de entorno (NO commitear)
├── DEPLOY.md                     # Guía completa de despliegue
└── DOCS.md                       # Documentación técnica completa
```

---

## ⚡ Inicio Rápido (Desarrollo Local)

### Pre-requisitos
- Node.js ≥ 18
- Cuenta en [Supabase](https://supabase.com) con proyecto activo
- Variables de entorno configuradas

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Cracklord98/synaptica_mundial_2026.git
cd synaptica_mundial_2026

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase
```

### Variables de Entorno

```env
# .env.local

# Supabase (requeridas)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Seguridad del Cron Job (requerida en producción)
CRON_SECRET=tu_clave_secreta_cron_2026

# Supabase Admin (requerida para que el cron job bypasee RLS)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### Inicialización de la Base de Datos

Ejecuta los scripts en Supabase SQL Editor en orden:

```bash
# 1. Esquema de tablas, triggers y políticas RLS
supabase/migrations/20260616000000_init_schema.sql

# 2. Datos semilla: 32 equipos + bracket completo
supabase/migrations/20260616000001_seed_data.sql

# 3. Ajustes adicionales
supabase/migrations/20260616000002_remove_payment_columns.sql
supabase/migrations/20260617000000_admin_delete_users.sql
supabase/migrations/20260617000001_winner_propagation.sql
```

### Ejecutar en Modo Desarrollo

```bash
npm run dev
# App disponible en http://localhost:3000
```

---

## 🤖 Sistema de Sincronización Automática

La aplicación se sincroniza con la API oficial del Mundial cada 15 minutos a través de `cron-job.org`:

```
cron-job.org  →  (GET + Bearer Token)  →  Vercel  →  worldcup26.ir API
                                              ↓
                                         Supabase DB
                                      (matches, teams)
                                              ↓
                               Triggers automáticos en PostgreSQL
                                  (propagación + puntuación)
```

**Endpoint:** `GET /api/cron/sync-matches`  
**Seguridad:** Header `Authorization: Bearer <CRON_SECRET>`  
**Frecuencia:** Cada 15 minutos via cron-job.org + 1 vez/día via Vercel native cron

Ver documentación completa en [DOCS.md → Sección 3: API](./DOCS.md).

---

## 📊 Sistema de Puntuación

| Evento | Puntos |
|---|---|
| Marcador exacto (ej: 2-1 predicho y 2-1 real) | **5 pts** |
| Resultado correcto (ganador o empate acertado) | **3 pts** |
| Equipo clasificante correcto | **+2 pts** adicionales |
| Predicción incorrecta | **0 pts** |

El desempate en el Leaderboard se resuelve por: mayor número de marcadores exactos → mayor puntaje acumulado en la Final.

---

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas de Supabase.
- Las predicciones son **privadas** hasta que vence el deadline del partido.
- Solo usuarios con `is_admin = true` pueden modificar equipos, partidos y ver todas las predicciones.
- Los administradores **no pueden** realizar predicciones ni aparecer en el Leaderboard.
- El endpoint de cron está protegido por `CRON_SECRET` enviado como Bearer Token.

---

## 👥 Contribución y Contacto

Proyecto interno de **Synaptica**. Para reportar errores o sugerir mejoras, abre un Issue en el repositorio de GitHub.

