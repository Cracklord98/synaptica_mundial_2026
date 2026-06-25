-- 1. Eliminar la vista que depende de team_name
DROP VIEW IF EXISTS public.leaderboard;

-- 2. Eliminar el trigger del usuario temporalmente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Modificar la función trigger para no sincronizar team_name ni partner_email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, FALSE)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recrear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Eliminar columnas de equipo y dupla de profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS team_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS partner_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS partner_email;

-- 6. Recrear la vista de leaderboard con WITH (security_invoker = true) y sin team_name
CREATE OR REPLACE VIEW public.leaderboard WITH (security_invoker = true) AS
SELECT 
  p.id AS user_id,
  p.username,
  COALESCE(SUM(sh.points), 0)::integer AS total_points,
  COALESCE(SUM(CASE WHEN sh.is_exact THEN 1 ELSE 0 END), 0)::integer AS exact_count,
  COALESCE(SUM(CASE WHEN sh.round = 'round_32' THEN sh.points ELSE 0 END), 0)::integer AS r32_points,
  COALESCE(SUM(CASE WHEN sh.round = 'round_16' THEN sh.points ELSE 0 END), 0)::integer AS r16_points,
  COALESCE(SUM(CASE WHEN sh.round = 'quarter' THEN sh.points ELSE 0 END), 0)::integer AS quarter_points,
  COALESCE(SUM(CASE WHEN sh.round = 'semi' THEN sh.points ELSE 0 END), 0)::integer AS semi_points,
  COALESCE(SUM(CASE WHEN sh.round IN ('final', 'third_place') THEN sh.points ELSE 0 END), 0)::integer AS final_points
FROM public.profiles p
LEFT JOIN public.score_history sh ON sh.user_id = p.id
WHERE p.is_admin = FALSE
GROUP BY p.id, p.username
ORDER BY total_points DESC, exact_count DESC;

-- 7. Asignar permisos sobre la vista a usuarios autenticados
GRANT SELECT ON public.leaderboard TO authenticated;
