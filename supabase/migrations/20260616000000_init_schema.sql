-- ==========================================
-- LA POLLA MUNDIAL 2026 - INITIAL SCHEMA
-- ==========================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  team_name TEXT,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  partner_email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table Teams (Real soccer teams)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  flag_url TEXT,
  group_name TEXT NOT NULL,                -- 'A' to 'L' (12 groups in 2026 World Cup)
  position_in_group INTEGER,      -- 1, 2, 3 or 4
  is_qualified BOOLEAN DEFAULT FALSE,
  eliminated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table Matches (Knockout matches)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round TEXT NOT NULL CHECK (round IN ('round_32', 'round_16', 'quarter', 'semi', 'final', 'third_place')),
  team1_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team2_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team1_score INTEGER DEFAULT NULL,
  team2_score INTEGER DEFAULT NULL,
  winner_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  next_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  match_datetime TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  is_finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table Predictions
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  score_local INTEGER NOT NULL CHECK (score_local >= 0),
  score_visitor INTEGER NOT NULL CHECK (score_visitor >= 0),
  winner_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL, -- The team predicted to advance
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- 5. Table Bonus Predictions
CREATE TABLE IF NOT EXISTS public.bonus_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  champion_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  finalist1_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  finalist2_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. Table Score History
CREATE TABLE IF NOT EXISTS public.score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  round TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  is_exact BOOLEAN DEFAULT FALSE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- 7. Table Model Cards
CREATE TABLE IF NOT EXISTS public.model_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 8. Table Rounds Config
CREATE TABLE IF NOT EXISTS public.rounds_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round TEXT UNIQUE NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  deadline_offset_hours INTEGER DEFAULT 1
);

-- ----------------------------------------------------
-- SECURITY AND FUNCTIONS
-- ----------------------------------------------------

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync auth.users with public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, team_name, partner_email, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    new.raw_user_meta_data->>'team_name',
    new.raw_user_meta_data->>'partner_email',
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, FALSE)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Scoring Logic function
CREATE OR REPLACE FUNCTION public.calculate_match_points(match_uuid UUID)
RETURNS void AS $$
DECLARE
  m_round TEXT;
  m_t1_score INT;
  m_t2_score INT;
  m_winner_id UUID;
  pred RECORD;
  pts INT;
  score_pts INT;
  adv_pts INT;
BEGIN
  -- Get the match results
  SELECT round, team1_score, team2_score, winner_id
  INTO m_round, m_t1_score, m_t2_score, m_winner_id
  FROM public.matches
  WHERE id = match_uuid AND is_finished = TRUE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculate points for each prediction
  FOR pred IN 
    SELECT user_id, score_local, score_visitor, winner_id
    FROM public.predictions
    WHERE match_id = match_uuid
  LOOP
    -- Calculate score points: 5 exact, 3 correct result/outcome, 0 otherwise
    IF pred.score_local = m_t1_score AND pred.score_visitor = m_t2_score THEN
      score_pts := 5;
    ELSIF (pred.score_local > pred.score_visitor AND m_t1_score > m_t2_score) OR
          (pred.score_local < pred.score_visitor AND m_t1_score < m_t2_score) OR
          (pred.score_local = pred.score_visitor AND m_t1_score = m_t2_score) THEN
      score_pts := 3;
    ELSE
      score_pts := 0;
    END IF;

    -- Calculate advancing points: +2 points if user correctly predicted the winner
    IF pred.winner_id = m_winner_id AND m_winner_id IS NOT NULL THEN
      adv_pts := 2;
    ELSE
      adv_pts := 0;
    END IF;

    pts := score_pts + adv_pts;

    -- Upsert points into score_history
    INSERT INTO public.score_history (user_id, match_id, round, points, is_exact)
    VALUES (pred.user_id, match_uuid, m_round, pts, (score_pts = 5))
    ON CONFLICT (user_id, match_id) 
    DO UPDATE SET points = EXCLUDED.points, is_exact = EXCLUDED.is_exact, calculated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to calculate points when a match is marked finished
CREATE OR REPLACE FUNCTION public.after_match_finished_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_finished = TRUE AND (OLD.is_finished = FALSE OR OLD.is_finished IS NULL) THEN
    PERFORM public.calculate_match_points(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_match_finished
  AFTER UPDATE OF is_finished, team1_score, team2_score, winner_id ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.after_match_finished_trigger();

-- ----------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds_config ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Profiles are readable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can update their own profile fields" 
ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 2. Teams Policies
CREATE POLICY "Teams are readable by all authenticated users" 
ON public.teams FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Only admins can modify teams" 
ON public.teams FOR ALL TO authenticated USING (public.is_admin());

-- 3. Matches Policies
CREATE POLICY "Matches are readable by all authenticated users" 
ON public.matches FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Only admins can modify matches" 
ON public.matches FOR ALL TO authenticated USING (public.is_admin());

-- 4. Predictions Policies
CREATE POLICY "Predictions select policy" 
ON public.predictions FOR SELECT TO authenticated 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR (SELECT deadline FROM public.matches WHERE id = match_id) < NOW()
);

CREATE POLICY "Users can insert their own predictions before deadline" 
ON public.predictions FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = user_id 
  AND (SELECT deadline FROM public.matches WHERE id = match_id) > NOW()
);

CREATE POLICY "Users can update their own predictions before deadline" 
ON public.predictions FOR UPDATE TO authenticated 
USING (
  auth.uid() = user_id 
  AND (SELECT deadline FROM public.matches WHERE id = match_id) > NOW()
)
WITH CHECK (
  auth.uid() = user_id 
  AND (SELECT deadline FROM public.matches WHERE id = match_id) > NOW()
);

-- 5. Bonus Predictions Policies
CREATE POLICY "Bonus predictions are visible to owners or after deadline" 
ON public.bonus_predictions FOR SELECT TO authenticated 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR NOW() > '2026-06-28T00:00:00Z'::timestamptz
);

CREATE POLICY "Users can insert their own bonus predictions before start of tournament" 
ON public.bonus_predictions FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = user_id 
  AND NOW() < '2026-06-28T00:00:00Z'::timestamptz
);

CREATE POLICY "Users can update their own bonus predictions before start of tournament" 
ON public.bonus_predictions FOR UPDATE TO authenticated 
USING (
  auth.uid() = user_id 
  AND NOW() < '2026-06-28T00:00:00Z'::timestamptz
)
WITH CHECK (
  auth.uid() = user_id 
  AND NOW() < '2026-06-28T00:00:00Z'::timestamptz
);

-- 6. Score History Policies
CREATE POLICY "Score history is readable by everyone" 
ON public.score_history FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Only database functions or admins can modify score history" 
ON public.score_history FOR ALL TO authenticated USING (public.is_admin());

-- 7. Model Cards Policies
CREATE POLICY "Model cards are readable by everyone" 
ON public.model_cards FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can upload or update their own model card before deadline" 
ON public.model_cards FOR ALL TO authenticated 
USING (auth.uid() = user_id AND NOW() < '2026-07-17T23:59:59Z'::timestamptz)
WITH CHECK (auth.uid() = user_id AND NOW() < '2026-07-17T23:59:59Z'::timestamptz);

-- 8. Rounds Config Policies
CREATE POLICY "Rounds config is readable by everyone" 
ON public.rounds_config FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Only admins can modify rounds config" 
ON public.rounds_config FOR ALL TO authenticated USING (public.is_admin());

-- 9. Standings and Leaderboard View
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id AS user_id,
  p.username,
  p.team_name,
  p.is_paid,
  p.payment_status,
  COALESCE(SUM(sh.points), 0)::integer AS total_points,
  COALESCE(SUM(CASE WHEN sh.is_exact THEN 1 ELSE 0 END), 0)::integer AS exact_count,
  COALESCE(SUM(CASE WHEN sh.round = 'round_32' THEN sh.points ELSE 0 END), 0)::integer AS r32_points,
  COALESCE(SUM(CASE WHEN sh.round = 'round_16' THEN sh.points ELSE 0 END), 0)::integer AS r16_points,
  COALESCE(SUM(CASE WHEN sh.round = 'quarter' THEN sh.points ELSE 0 END), 0)::integer AS quarter_points,
  COALESCE(SUM(CASE WHEN sh.round = 'semi' THEN sh.points ELSE 0 END), 0)::integer AS semi_points,
  COALESCE(SUM(CASE WHEN sh.round IN ('final', 'third_place') THEN sh.points ELSE 0 END), 0)::integer AS final_points
FROM public.profiles p
LEFT JOIN public.score_history sh ON sh.user_id = p.id
GROUP BY p.id, p.username, p.team_name, p.is_paid, p.payment_status
ORDER BY total_points DESC, exact_count DESC;

GRANT SELECT ON public.leaderboard TO authenticated;
