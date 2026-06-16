# Guía de Despliegue: La Polla Mundial 2026

Este documento detalla los pasos para configurar la base de datos en **Supabase** y desplegar la aplicación en **Vercel** con integración oficial.

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
6. Haz clic en **Run** para precargar los 32 equipos y conectar la estructura del bracket de partidos.

### B. Crear Cuenta Administradora
Para poder ingresar resultados reales y aprobar pagos, necesitas asignar el rol de administrador a tu cuenta:
1. Regístrate en la aplicación normalmente a través del formulario de Registro.
2. Ve al **SQL Editor** en Supabase y ejecuta el siguiente comando reemplazando con tu correo:
   ```sql
   -- Hacer administrador a un usuario registrado
   UPDATE public.profiles
   SET is_admin = TRUE
   WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-correo@synaptica.com');
   ```

### C. Configurar el Bucket de Storage (Model Cards)
Para permitir que los usuarios suban sus metodologías en formato PDF:
1. Ve a la pestaña **Storage** en el menú de Supabase.
2. Haz clic en **New Bucket** y nómbralo exactamente: `model-cards`.
3. Configura el bucket como **público** (Public bucket).
4. Crea las siguientes políticas de acceso para el bucket `model-cards`:
   - **Select (Read)**: Permitir lectura pública (`anon` y `authenticated`).
   - **Insert (Write)**: Permitir inserción solo a usuarios autenticados (`authenticated`).
   - **Update**: Permitir actualizaciones solo a usuarios autenticados.
   - **Delete**: Permitir eliminación solo a usuarios autenticados.

---

## 2. Despliegue en Vercel

1. Sube este proyecto a tu repositorio de GitHub.
2. Ve al panel de control de [Vercel](https://vercel.com) y crea un nuevo proyecto.
3. Conéctalo al repositorio de GitHub correspondiente.
4. En la configuración de variables de entorno de Vercel, agrega las credenciales de Supabase y los datos de pago:

### Variables de Entorno (Environment Variables)

| Variable | Descripción | Valor de Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu API de Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Llave Anon de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `PAYMENT_BANK` | Nombre del banco para transferencia | `Nequi / Bancolombia` |
| `PAYMENT_ACCOUNT_TYPE` | Tipo de cuenta bancaria | `Depósito Celular` |
| `PAYMENT_ACCOUNT_NUMBER` | Número de cuenta | `3128788919` |
| `PAYMENT_ACCOUNT_HOLDER` | Nombre del titular | `Juan David Toro` |
| `PAYMENT_AMOUNT` | Valor de la inscripción | `$20.000 COP` |
| `PAYMENT_WHATSAPP_RAW` | Teléfono internacional WhatsApp para comprobantes | `573128788919` |
| `PAYMENT_WHATSAPP_LABEL` | Texto del botón de contacto | `Enviar Comprobante` |
| `PAYMENT_NOTE` | Nota adicional para el usuario | `Coloca tu correo en la descripción del pago.` |

5. Haz clic en **Deploy**. ¡Tu polla mundialista estará lista y en producción en segundos!
