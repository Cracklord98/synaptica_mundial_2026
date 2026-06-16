import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import ScoreChart from "@/components/leaderboard/ScoreChart";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch rankings from the leaderboard database view
  const { data: standings } = await supabase
    .from("leaderboard")
    .select("*");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#D4AF37]">Tabla de Posiciones</h1>
        <p className="text-sm text-gray-400 mt-1">
          Ranking en vivo de la polla mundialista. Los puntos se actualizan automáticamente al finalizar cada partido.
        </p>
      </div>

      {/* Evolution Chart */}
      <ScoreChart 
        standings={standings || []} 
        currentUserId={user.id} 
      />

      {/* Leaderboard Table */}
      <LeaderboardTable 
        data={standings || []} 
        currentUserId={user.id} 
      />
    </div>
  );
}
