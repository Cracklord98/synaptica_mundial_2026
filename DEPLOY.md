# Guía de Despliegue: La Polla Mundial 2026 – Synaptica

Esta actividad integracional permite a los colaboradores de Synaptica participar en una polla mundialista analítica, con rankings en vivo, predicciones por ronda y evaluación de modelos de IA predictivos (Model Cards).

---

## 1. Configuración de Supabase

### A. Inicialización de la Base de Datos
1. Ve a tu panel de control de [Supabase](https://supabase.com) y crea un nuevo proyecto.
2. Abre la pestaña de **SQL Editor** en el panel lateral izquierdo.
3. Haz clic en **New Query** y pega el contenido del archivo de migración principal:
   👉 [00_init_schema.sql](file:///supabase/migrations/20260616000000_init_schema.sql)
4. Haz clic en **Run** para ejecutar. Esto creará todas las tablas, triggers de puntuación y políticas de RLS.
5. Abre otra consulta de Query y pega las inserciones de semilla:
   👉 [seed_data.sql](file:///supabase/migrations/20260616000001_seed_data.sql)
6. Haz clic en **Run** para precargar los 32 equipos y la estructura del bracket de partidos.

### B. Crear Cuenta Administradora
Para ingresar resultados reales y gestionar participantes, el administrador debe registrarse primero en la aplicación y luego ejecutar:

```sql
-- Hacer administrador a un usuario registrado (reemplaza el correo)
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@synaptica.co');
```

### C. Configurar el Bucket de Storage (Model Cards)
Para permitir que los participantes suban sus fichas analíticas en PDF:
1. Ve a la pestaña **Storage** en el menú de Supabase.
2. Haz clic en **New Bucket** y nómbralo exactamente: `model-cards`
3. Activa la casilla **Public bucket**.
4. Ejecuta las políticas de acceso en el SQL Editor:

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

1. Sube este proyecto a tu repositorio de GitHub.
2. Ve al panel de control de [Vercel](https://vercel.com) y crea un nuevo proyecto.
3. Conéctalo al repositorio de GitHub correspondiente.
4. En la configuración de **Environment Variables**, agrega las siguientes variables:

### Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable Key de Supabase | `sb_publishable_...` |

5. Haz clic en **Deploy**. ¡La polla mundialista corporativa estará activa en segundos!

---

## 3. Flujo de Participación

1. Los colaboradores se **registran** con su correo corporativo en la aplicación.
2. Eligen participar de forma **Individual** o en **Dupla** (con otro compañero).
3. Antes del inicio del torneo, realizan sus predicciones de **campeón y finalistas** (predicciones bonus).
4. A medida que avanza el torneo, el sistema habilita las predicciones por ronda (R32, R16, Cuartos, Semis, Final).
5. Opcionalmente, suben su **Model Card** (PDF de 1 página) documentando su metodología analítica para evaluación del jurado.
6. El **Leaderboard** se actualiza en tiempo real conforme el administrador carga los resultados oficiales.

---

## 4. Responsabilidades del Administrador

Una vez desplegada la aplicación, el admin tiene acceso a:

- **Participantes** (`/admin/users`): Directorio de todos los colaboradores registrados.
- **Resultados de Partidos** (`/admin/matches`): Ingreso manual de marcadores finales que activa el cálculo automático de puntos.
- **Equipos** (`/admin/teams`): CRUD manual de equipos en caso de fallo de la API externa.
- **Model Cards** (`/admin/model-cards`): Visualización de las fichas analíticas subidas por los participantes para evaluación del jurado.
