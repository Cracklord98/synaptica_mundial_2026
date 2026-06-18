# 🚀 Guía de Despliegue — La Polla Mundial 2026 (Synaptica)

> Guía completa para configurar Supabase, desplegar en Vercel y activar la sincronización automática de resultados del Mundial.

---

## Índice

1. [Configuración de Supabase](#1-configuración-de-supabase)
2. [Despliegue en Vercel](#2-despliegue-en-vercel)
3. [Sincronización Automática (Cron Job)](#3-sincronización-automática-cron-job)
4. [Flujo de Participación](#4-flujo-de-participación)
5. [Responsabilidades del Administrador](#5-responsabilidades-del-administrador)

---

## 1. Configuración de Supabase

### A. Inicialización de la Base de Datos

1. Ve a tu panel de control de [Supabase](https://supabase.com) y crea un nuevo proyecto.
2. Abre la pestaña de **SQL Editor** en el panel lateral izquierdo.
3. Ejecuta los siguientes scripts **en orden**, uno por uno:

```
supabase/migrations/20260616000000_init_schema.sql          ← Tablas, triggers, RLS
supabase/migrations/20260616000001_seed_data.sql            ← 32 equipos + bracket
supabase/migrations/20260616000002_remove_payment_columns.sql
supabase/migrations/20260617000000_admin_delete_users.sql
supabase/migrations/20260617000001_winner_propagation.sql   ← Trigger de propagación
```

> ⚠️ **Orden crítico**: El script de seed requiere que las tablas ya existan. No los ejecutes en paralelo.

### B. Crear Cuenta Administradora

El administrador debe registrarse primero en la aplicación web y luego ejecutar:

```sql
-- Sustituye el correo por el del admin real
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@synaptica.co');
```

### C. Configurar el Storage Bucket (Model Cards)

1. Ve a la pestaña **Storage** en Supabase.
2. Crea un bucket con el nombre exacto: **`model-cards`**
3. Marca la casilla **Public bucket**.
4. Ejecuta las siguientes políticas en el SQL Editor:

```sql
-- Lectura pública
CREATE POLICY "Lectura Publica Model Cards" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'model-cards');

-- Subida autenticada
CREATE POLICY "Subida Autorizada Model Cards" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'model-cards');

-- Modificación del propio archivo
CREATE POLICY "Modificacion Propietario Model Cards" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'model-cards' AND auth.uid()::text = owner::text)
  WITH CHECK (bucket_id = 'model-cards' AND auth.uid()::text = owner::text);

-- Eliminación del propio archivo
CREATE POLICY "Eliminacion Propietario Model Cards" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'model-cards' AND auth.uid()::text = owner::text);
```

---

## 2. Despliegue en Vercel

### Paso a Paso

1. Sube el proyecto a tu repositorio de GitHub.
2. Ve a [vercel.com](https://vercel.com) → **New Project** → conecta el repositorio.
3. En la sección **Environment Variables**, agrega:

### Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable Key de Supabase | `sb_publishable_...` |
| `CRON_SECRET` | Token secreto para autenticar el cron job | `mi_clave_secreta_cron_2026` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key de Supabase (para operaciones server-side sin RLS) | `eyJhbGciOi...` |

4. Haz clic en **Deploy**.

### Redeploy Manual

Para actualizar la app después de cambios en el código:
1. Ve al proyecto en [vercel.com/dashboard](https://vercel.com/dashboard).
2. Haz clic en **Deployments** → último deployment → **⋯ (tres puntos)** → **Redeploy**.

---

## 3. Sincronización Automática (Cron Job)

La aplicación se sincroniza con la API oficial del Mundial (`worldcup26.ir`) para obtener:
- 📅 Fechas y horarios de los partidos (actualizados con el calendario oficial)
- 🏆 Equipos que avanzan (una vez que conocemos los ganadores de grupos)
- ⚽ Marcadores finales (al terminar cada partido)
- 🔄 Propagación automática de ganadores al siguiente cruce del bracket

### A. Cron Job Nativo de Vercel (1 vez al día)

Ya está configurado en `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-matches",
      "schedule": "0 0 * * *"
    }
  ]
}
```
> En plan gratuito de Vercel, los crons solo se ejecutan una vez al día. Para mayor frecuencia, usa cron-job.org.

### B. cron-job.org (Cada 15 Minutos — Recomendado)

Este servicio gratuito llama al endpoint cada 15 minutos durante el torneo.

**Configuración:**

1. Crea una cuenta gratuita en [cron-job.org](https://cron-job.org).
2. Crea un nuevo cron job con los siguientes ajustes:

| Campo | Valor |
|---|---|
| **URL** | `https://synaptica-mundial-2026.vercel.app/api/cron/sync-matches` |
| **Método** | `GET` |
| **Horario** | Cada 15 minutos (`*/15 * * * *`) |
| **Zona Horaria** | America/Bogota |
| **Estado** | Activo |

3. En la sección **Headers personalizados**, añade:

| Nombre | Valor |
|---|---|
| `Authorization` | `Bearer mi_clave_secreta_cron_2026` |

> ⚠️ El valor del header `Authorization` debe coincidir exactamente con `Bearer ` + el valor de la variable de entorno `CRON_SECRET` en Vercel.

4. Usa la función **"Realizar ejecución de prueba"** para verificar que el endpoint responde `200 OK`.

**Respuesta esperada:**
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

### Monitoreo de la Sincronización

Desde cron-job.org puedes ver:
- El historial de ejecuciones (éxito/fallo).
- El tiempo de respuesta de cada llamada.
- Los logs de respuesta del servidor.

> ℹ️ El cron es tolerante a fallos: si la API del Mundial no responde, simplemente devuelve `success: true` con 0 actualizaciones. No genera errores críticos.

---

## 4. Flujo de Participación

```
Registro ──► Individual / Dupla ──► Predicciones bonus ──► Predicciones por ronda ──► Leaderboard
    │              │                  (antes del torneo)       (R32, R16, Cuartos...)      en vivo
    │              │
    │         (+ Invitar compañero por email)
    │
    └──► Model Card (metodología analítica, opcional)
```

1. Los colaboradores se **registran** con su correo corporativo.
2. Eligen modo **Individual** o **Dupla** (invitan a un compañero por email).
3. Antes del torneo, realizan predicciones **bonus** (campeón y finalistas).
4. A medida que avanza el torneo, predicen marcadores por ronda.
5. El **Leaderboard** se actualiza automáticamente vía triggers de BD cuando el admin carga resultados o el cron job los sincroniza.

---

## 5. Responsabilidades del Administrador

El admin tiene acceso exclusivo a `/dashboard/admin/*`:

| Sección | Ruta | Función |
|---|---|---|
| **Partidos** | `/admin/matches` | Ingresar marcadores reales; el trigger de BD calcula puntos automáticamente |
| **Equipos** | `/admin/teams` | CRUD manual de equipos en caso de fallo de la API |
| **Usuarios** | `/admin/users` | Directorio de participantes registrados |
| **Model Cards** | `/admin/model-cards` | Dashboard analítico de las fichas metodológicas |

> ℹ️ **Nota sobre el cron job**: Con la sincronización automática activa, el admin **no necesita ingresar marcadores manualmente**. El cron los importa directamente desde la API oficial del torneo. El panel de partidos sirve como respaldo manual en caso de problemas con la API.
