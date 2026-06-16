-- ==========================================
-- MIGRATION: Eliminar columnas de pago y vista dependiente
-- Fecha: 2026-06-16
-- Motivo: La actividad es corporativa y gratuita.
-- ==========================================

-- 1. Eliminar la vista que depende de las columnas
DROP VIEW IF EXISTS public.leaderboard;

-- 2. Eliminar columnas de pago de la tabla profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_paid;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_status;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_reference;

-- 3. Recrear la vista de leaderboard sin las columnas de pago
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id AS user_id,
  p.username,
  p.team_name,
  COALESCE(SUM(sh.points), 0)::integer AS total_points,
  COALESCE(SUM(CASE WHEN sh.is_exact THEN 1 ELSE 0 END), 0)::integer AS exact_count,
  COALESCE(SUM(CASE WHEN sh.round = 'round_32' THEN sh.points ELSE 0 END), 0)::integer AS r32_points,
  COALESCE(SUM(CASE WHEN sh.round = 'round_16' THEN sh.points ELSE 0 END), 0)::integer AS r16_points,
  COALESCE(SUM(CASE WHEN sh.round = 'quarter' THEN sh.points ELSE 0 END), 0)::integer AS quarter_points,
  COALESCE(SUM(CASE WHEN sh.round = 'semi' THEN sh.points ELSE 0 END), 0)::integer AS semi_points,
  COALESCE(SUM(CASE WHEN sh.round IN ('final', 'third_place') THEN sh.points ELSE 0 END), 0)::integer AS final_points
FROM public.profiles p
LEFT JOIN public.score_history sh ON sh.user_id = p.id
GROUP BY p.id, p.username, p.team_name
ORDER BY total_points DESC, exact_count DESC;

GRANT SELECT ON public.leaderboard TO authenticated;
