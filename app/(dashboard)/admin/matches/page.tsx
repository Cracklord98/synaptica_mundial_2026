import { createClient } from "@/lib/supabase/server";
import AdminMatchesList from "@/components/admin/AdminMatchesList";

export default async function AdminMatchesPage() {
  const supabase = await createClient();

  // Fetch all matches from the database with team details
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!team1_id(id, name, flag_url),
      team2:teams!team2_id(id, name, flag_url)
    `)
    .order("match_datetime", { ascending: true });

  // Fetch all teams to populate selectors
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, flag_url")
    .order("name", { ascending: true });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Ingreso de Resultados Reales</h2>
        <p className="text-xs text-gray-400">Registra marcadores oficiales. Al finalizar un partido se calcularán automáticamente los puntos.</p>
      </div>
      <AdminMatchesList matches={matches || []} teams={teams || []} />
    </div>
  );
}
