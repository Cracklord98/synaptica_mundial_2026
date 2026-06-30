import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TruthTable from "@/components/leaderboard/TruthTable";

export const dynamic = "force-dynamic";

export default async function TruthTablePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // 1. Fetch rankings from the leaderboard view (already sorted and excludes admins)
  const { data: standings, error: standingsError } = await supabase
    .from("leaderboard")
    .select("*");

  if (standingsError) {
    console.error("Error fetching standings:", standingsError);
  }

  // 2. Fetch matches with team flags and names
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      round,
      match_datetime,
      deadline,
      is_finished,
      team1_id,
      team2_id,
      team1_score,
      team2_score,
      winner_id,
      team1:teams!team1_id(id, name, flag_url),
      team2:teams!team2_id(id, name, flag_url)
    `)
    .order("match_datetime", { ascending: true });

  if (matchesError) {
    console.error("Error fetching matches:", matchesError);
  }

  // 3. Fetch all predictions
  // Row Level Security (RLS) automatically ensures that for matches where the deadline
  // has not yet passed, only the current user's predictions are returned.
  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("user_id, match_id, score_local, score_visitor, winner_id");

  if (predictionsError) {
    console.error("Error fetching predictions:", predictionsError);
  }

  // 4. Fetch the score history (points received by user per match)
  const { data: scoreHistory, error: scoreHistoryError } = await supabase
    .from("score_history")
    .select("user_id, match_id, points, is_exact");

  if (scoreHistoryError) {
    console.error("Error fetching score history:", scoreHistoryError);
  }

  // Format matches safely to handle both object or array relation types from Supabase
  const formattedMatches = (matches || []).map((m: any) => ({
    id: m.id,
    round: m.round,
    match_datetime: m.match_datetime,
    deadline: m.deadline,
    is_finished: m.is_finished,
    team1_id: m.team1_id,
    team2_id: m.team2_id,
    team1_score: m.team1_score,
    team2_score: m.team2_score,
    winner_id: m.winner_id,
    team1: Array.isArray(m.team1) ? m.team1[0] || null : m.team1 || null,
    team2: Array.isArray(m.team2) ? m.team2[0] || null : m.team2 || null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#D4AF37]">Tabla de Verdad</h1>
        <p className="text-sm text-gray-400 mt-1">
          Compara en tiempo real los pronósticos y puntos de todos los participantes.
        </p>
      </div>

      <TruthTable
        standings={standings || []}
        matches={formattedMatches}
        predictions={predictions || []}
        scoreHistory={scoreHistory || []}
        currentUserId={user.id}
      />
    </div>
  );
}
