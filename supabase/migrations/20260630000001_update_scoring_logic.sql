-- Recreate calculate_match_points with cumulative scoring logic
-- Exact Score: 5 points
-- Correct Outcome (Win/Draw): 3 points
-- Correct Advancing Team: 2 points
-- Summed up for a maximum of 10 points per match.
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
  is_exact_match BOOLEAN;
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
    score_pts := 0;
    is_exact_match := FALSE;
    
    -- 1. Marcador exacto: 5 puntos
    IF pred.score_local = m_t1_score AND pred.score_visitor = m_t2_score THEN
      score_pts := score_pts + 5;
      is_exact_match := TRUE;
    END IF;
    
    -- 2. Resultado (victoria, empate): 3 puntos
    IF (pred.score_local > pred.score_visitor AND m_t1_score > m_t2_score) OR
       (pred.score_local < pred.score_visitor AND m_t1_score < m_t2_score) OR
       (pred.score_local = pred.score_visitor AND m_t1_score = m_t2_score) THEN
      score_pts := score_pts + 3;
    END IF;

    -- 3. Equipo que avanza: 2 puntos
    IF pred.winner_id = m_winner_id AND m_winner_id IS NOT NULL THEN
      adv_pts := 2;
    ELSE
      adv_pts := 0;
    END IF;

    pts := score_pts + adv_pts;

    -- Upsert points into score_history
    INSERT INTO public.score_history (user_id, match_id, round, points, is_exact)
    VALUES (pred.user_id, match_uuid, m_round, pts, is_exact_match)
    ON CONFLICT (user_id, match_id) 
    DO UPDATE SET points = EXCLUDED.points, is_exact = EXCLUDED.is_exact, calculated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
