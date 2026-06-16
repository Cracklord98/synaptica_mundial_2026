# La Polla Mundial 2026

Plataforma predictiva oficial de **Synaptica** para la Copa Mundial de la FIFA 2026, desarrollada sobre un stack moderno y robusto: **Next.js 15 (App Router)**, **Supabase** (Base de Datos + Auth + Storage), **Tailwind CSS** y **Vercel**.

---

## Características Principales

*   **Autenticación Segura**: Registro e inicio de sesión integrados con Supabase Auth.
*   **Modo de Juego Flexible**: Opción de participar de forma **individual** o en **dupla (pareja)** con un nombre de equipo único.
*   **Gestión de Invitaciones**: Sistema interactivo para invitar a un compañero mediante correo electrónico y confirmación mutua en tiempo real.
*   **Pronósticos Ronda por Ronda**: Interfaz intuitiva para predecir marcadores en tiempo de juego reglamentario (90 mins) y el equipo que clasifica a la siguiente fase.
*   **Control de Deadlines**: Cierre automático de pronósticos 1 hora antes de que inicie cada partido o fase.
*   **Bracket del Torneo**: Vista visual del árbol de eliminación directa (Dieciseisavos a Final) con modales para pronosticar directamente al hacer clic.
*   **Pista Analítica (Model Card)**: Los equipos pueden subir una Ficha Metodológica en PDF de 1 página documentando sus modelos estadísticos o de Machine Learning, evaluada por un jurado.
*   **Leaderboard en Vivo**: Tabla de posiciones acumulada con desempates automáticos (mayor marcador exacto y mayor puntaje en la final) y gráficos de progresión histórica por ronda con Recharts.
*   **Panel de Administración**: Gestión integrada de pagos de usuarios, ingreso de marcadores reales y triggers en base de datos para recalcular puntos instantáneamente a todos los participantes.

---

## Tecnologías Utilizadas

*   **Framework**: Next.js 15 (App Router con Server Actions)
*   **Backend & DB**: Supabase (PostgreSQL, Triggers, RLS, Storage Bucket)
*   **Estilos & UI**: Tailwind CSS, shadcn/ui (Radix UI), Lucide Icons
*   **Animaciones**: Framer Motion
*   **Gráficos**: Recharts
*   **Lenguaje**: TypeScript (Strict Mode)

---

## Configuración y Ejecución Local

1.  **Clona el repositorio** e ingresa a la carpeta del proyecto.
2.  **Instala las dependencias**:
    ```bash
    npm install
    ```
3.  **Configura las variables de entorno**:
    Crea un archivo `.env.local` en la raíz del proyecto basándote en `.env.example`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-de-supabase
    ```
4.  **Base de Datos (Supabase)**:
    Sigue las instrucciones detalladas en el archivo [DEPLOY.md](file:///DEPLOY.md) para ejecutar las migraciones SQL (`/supabase/migrations`) y configurar el Storage bucket para los PDF de los Model Cards.
5.  **Ejecuta el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

---

## Estructura del Código

*   `/app`: Páginas y layouts protegidos bajo el App Router de Next.js.
*   `/components`: Componentes reutilizables de React (Auth, Bracket, Leaderboard, etc.).
*   `/lib`: Clientes de base de datos de Supabase (cliente y servidor) y Server Actions de negocio (`/lib/actions.ts`).
*   `/supabase/migrations`: Scripts de base de datos y semilla de datos (equipos y partidos conectados).
