import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PredictionForm from "@/components/prediction/PredictionForm";

interface PageProps {
  params: Promise<{
    round: string;
  }>;
}

export default async function PredictionsRoundPage({ params }: PageProps) {
  const { round } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch matches for the specific round
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!team1_id(id, name, flag_url),
      team2:teams!team2_id(id, name, flag_url)
    `)
    .eq("round", round)
    .order("match_datetime", { ascending: true });

  // Fetch user's predictions
  const { data: initialPredictions } = await supabase
    .from("predictions")
    .select("match_id, score_local, score_visitor, winner_id")
    .eq("user_id", user.id);

  // Fetch all teams (needed for bonus selection in round_32)
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, flag_url")
    .order("name", { ascending: true });

  // Fetch initial bonus predictions
  const { data: initialBonus } = await supabase
    .from("bonus_predictions")
    .select("champion_id, finalist1_id, finalist2_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch user profile to check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = !!profile?.is_admin;

  return (
    <PredictionForm
      round={round}
      matches={matches || []}
      initialPredictions={initialPredictions || []}
      teams={teams || []}
      initialBonus={initialBonus || null}
      isAdmin={isAdmin}
    />
  );
}
