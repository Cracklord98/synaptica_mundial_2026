# 🚀 Guía de Despliegue — La Polla Mundial 2026 (Synaptica)

Esta guía describe los pasos necesarios para desplegar la plataforma predictiva corporativa en producción, incluyendo la base de datos Supabase, el hosting en Vercel, el almacenamiento y la automatización del Cron Job.

---

## Tabla de Contenidos

1. [Paso 1: Configurar Supabase (Base de Datos)](#1-configurar-supabase-base-de-datos)
2. [Paso 2: Crear el Rol de Administrador](#2-crear-el-rol-de-administrador)
3. [Paso 3: Configurar Supabase Storage (Model Cards)](#3-configurar-supabase-storage-model-cards)
4. [Paso 4: Desplegar en Vercel](#4-desplegar-en-vercel)
5. [Paso 5: Automatizar la Sincronización (Cron Job)](#5-automatizar-la-sincronización-cron-job)

---

## 1. Configurar Supabase (Base de Datos)

### A. Creación del Proyecto
1. Inicia sesión en [Supabase Console](https://supabase.com) y haz clic en **New Project**.
2. Completa los datos requeridos (nombre del proyecto, contraseña de la base de datos y región recomendada más cercana, por ejemplo, *us-east-1* o *sa-east-1*).
3. Espera unos minutos hasta que se aprovisione la base de datos.

### B. Inicializar el Esquema SQL
Abre la sección de **SQL Editor** en la barra lateral izquierda de Supabase y ejecuta los archivos de migración (ubicados en `supabase/migrations/`) **estrictamente en el siguiente orden**:

1. **`20260616000000_init_schema.sql`**: Define el esquema, crea las tablas, configura triggers base y habilita Row Level Security (RLS).
2. **`20260616000001_seed_data.sql`**: Inserta los registros semilla de los 32 seleccionados del Mundial y define las conexiones e identificadores iniciales del bracket.
3. **`20260616000002_remove_payment_columns.sql`**: Ajusta el esquema eliminando columnas obsoletas de pasarelas de pago.
4. **`20260617000000_admin_delete_users.sql`**: Habilita funciones especiales para que los administradores eliminen registros de perfiles.
5. **`20260617000001_winner_propagation.sql`**: Crea el trigger que propaga automáticamente a los ganadores de llaves al partido destino correspondiente.

> [!WARNING]
> **No ejecutes los scripts en paralelo**. Cada migración depende de que las tablas creadas en el script anterior existan y estén configuradas.

---

## 2. Crear el Rol de Administrador

Para gestionar el sistema, al menos un usuario del equipo debe poseer rol de administrador. 

1. Regístrate en la aplicación web mediante el flujo normal de registro con el correo que deseas designar como admin (ejemplo: `admin@synaptica.co`).
2. Una vez registrado, ve al **SQL Editor** de Supabase y ejecuta la siguiente consulta:

```sql
-- Sustituye el correo electrónico por el del administrador real
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@synaptica.co');
```

> [!NOTE]
> Los administradores no aparecen en la tabla de clasificaciones (Leaderboard) y no se les permite realizar predicciones de partidos ni rellenar Model Cards.

---

## 3. Configurar Supabase Storage (Model Cards)

El módulo de **Model Card** permite subir diagramas o archivos adjuntos que expliquen el enfoque analítico del modelo de predicción. Esto requiere un bucket de almacenamiento configurado.

1. Navega a la sección **Storage** en tu panel de control de Supabase.
2. Haz clic en **New Bucket** y nómbralo exactamente: **`model-cards`**.
3. Asegúrate de activar la casilla **Public bucket** (para que otros participantes puedan visualizar las metodologías) y guarda.
4. Para proteger el bucket, ve al **SQL Editor** de Supabase y ejecuta las siguientes políticas de seguridad:

```sql
-- 1. Permitir lectura pública de los archivos adjuntos
CREATE POLICY "Lectura Publica Model Cards" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'model-cards');

-- 2. Permitir subida de archivos solo a usuarios autenticados
CREATE POLICY "Subida Autorizada Model Cards" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'model-cards');

-- 3. Permitir actualización de archivos únicamente a sus propietarios
CREATE POLICY "Modificacion Propietario Model Cards" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'model-cards' AND auth.uid()::text = owner::text)
  WITH CHECK (bucket_id = 'model-cards' AND auth.uid()::text = owner::text);

-- 4. Permitir eliminación de archivos únicamente a sus propietarios
CREATE POLICY "Eliminacion Propietario Model Cards" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'model-cards' AND auth.uid()::text = owner::text);
```

---

## 4. Desplegar en Vercel

1. Empuja el código del proyecto a un repositorio privado de GitHub.
2. Entra a [Vercel](https://vercel.com) e inicia sesión con tu cuenta.
3. Haz clic en **Add New...** → **Project** e importa el repositorio `synaptica_mundial_2026`.
4. En la sección **Environment Variables**, añade las siguientes variables críticas:

| Nombre de la Variable | Tipo | Descripción / Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | URL de la API de tu Supabase (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pública | Clave pública anónima de Supabase (`eyJhbG...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta** | Clave de rol de servicio (bypassea RLS para uso exclusivo del Cron Job) |
| `CRON_SECRET` | **Secreta** | Token de seguridad creado por ti para autorizar los llamados al endpoint de sincronización |

5. Haz clic en **Deploy**. Vercel compilará la aplicación y la dejará en línea en pocos segundos.

---

## 5. Automatizar la Sincronización (Cron Job)

La aplicación requiere que se consulte de forma periódica la API externa para registrar marcadores reales y propagar llaves del bracket eliminatorio.

### Opción A: cron-job.org (Recomendado — Cada 15 Minutos)
Dado que el plan gratuito (Hobby) de Vercel solo permite una ejecución de cron diaria, recomendamos utilizar un servicio externo gratuito como `cron-job.org` para lograr sincronizaciones continuas.

1. Registra una cuenta gratuita en [cron-job.org](https://cron-job.org).
2. Crea un nuevo cron job con los siguientes parámetros:
   - **Título**: `Sync Matches Mundial 2026`
   - **URL**: `https://tu-dominio-vercel.app/api/cron/sync-matches` (reemplaza por tu URL de Vercel)
   - **Método**: `GET`
   - **Frecuencia**: Cada 15 minutos (`*/15 * * * *`)
   - **Zona Horaria**: America/Bogota
3. En la pestaña de **Headers personalizados**, agrega la siguiente cabecera de autenticación:
   - **Clave**: `Authorization`
   - **Valor**: `Bearer tu_secreto_cron_definido_en_vercel` (debe coincidir exactamente con la variable de entorno `CRON_SECRET`).
4. Haz clic en **Crear**. Utiliza la herramienta de **Ejecución de Prueba** de `cron-job.org` para validar que el endpoint responda `200 OK`.

### Opción B: Cron Nativo de Vercel (1 vez al día)
Si prefieres no utilizar servicios externos, la aplicación ya incluye la directiva en `vercel.json` para ejecutarse diariamente de forma nativa a la medianoche:

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

> [!IMPORTANT]
> Los endpoints del cron ignoran el middleware general de redirecciones de autenticación, pero exigen estrictamente el Bearer Token configurado. Si el header `Authorization` no coincide con la variable `CRON_SECRET`, el endpoint responderá `401 Unauthorized` por motivos de seguridad.
