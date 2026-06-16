import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BracketView from "@/components/bracket/BracketView";

export default async function BracketPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch all knockout matches (joining teams)
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!team1_id(id, name, flag_url),
      team2:teams!team2_id(id, name, flag_url)
    `)
    .order("match_datetime", { ascending: true });

  // Fetch user's predictions
  const { data: predictions } = await supabase
    .from("predictions")
    .select("match_id, score_local, score_visitor, winner_id")
    .eq("user_id", user.id);

  return (
    <BracketView
      matches={matches || []}
      initialPredictions={predictions || []}
    />
  );
}
