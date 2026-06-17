-- ==========================================
-- MIGRATION: Propagación Automática de Ganadores
-- Fecha: 2026-06-17
-- Motivo: Automatizar los cruces de las fases eliminatorias
-- ==========================================

CREATE OR REPLACE FUNCTION public.propagate_winner_to_next_match()
RETURNS trigger AS $$
DECLARE
  v_next_match_id UUID;
  v_winner_id UUID;
  v_is_first BOOLEAN;
BEGIN
  -- 1. Si el partido finalizó y tiene ganador y próximo partido, propagar
  IF NEW.is_finished = TRUE AND NEW.winner_id IS NOT NULL AND NEW.next_match_id IS NOT NULL THEN
    v_next_match_id := NEW.next_match_id;
    v_winner_id := NEW.winner_id;

    -- Identificar si este partido es el "primero" o "segundo" en la llave.
    -- Comparamos los IDs: el menor va como team1_id, el mayor como team2_id.
    SELECT (NEW.id = MIN(id)) INTO v_is_first
    FROM public.matches
    WHERE next_match_id = v_next_match_id;

    IF v_is_first THEN
      UPDATE public.matches
      SET team1_id = v_winner_id
      WHERE id = v_next_match_id;
    ELSE
      UPDATE public.matches
      SET team2_id = v_winner_id
      WHERE id = v_next_match_id;
    END IF;
  END IF;

  -- 2. Si el partido se desmarca como finalizado o se borra el ganador (corrección), limpiar en el siguiente partido
  IF (OLD.is_finished = TRUE AND (NEW.is_finished = FALSE OR NEW.winner_id IS NULL)) AND NEW.next_match_id IS NOT NULL THEN
    v_next_match_id := NEW.next_match_id;
    
    SELECT (NEW.id = MIN(id)) INTO v_is_first
    FROM public.matches
    WHERE next_match_id = v_next_match_id;

    IF v_is_first THEN
      UPDATE public.matches
      SET team1_id = NULL
      WHERE id = v_next_match_id;
    ELSE
      UPDATE public.matches
      SET team2_id = NULL
      WHERE id = v_next_match_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se activa tras actualizar el estado del partido
DROP TRIGGER IF EXISTS on_match_winner_propagation ON public.matches;
CREATE TRIGGER on_match_winner_propagation
  AFTER UPDATE OF is_finished, winner_id ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.propagate_winner_to_next_match();
