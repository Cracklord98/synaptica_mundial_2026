import { createClient } from "@/lib/supabase/server";
import AdminTeamsManager from "@/components/admin/AdminTeamsManager";

export default async function AdminTeamsPage() {
  const supabase = await createClient();

  // Fetch all teams sorted by group and name
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("group_name", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Gestión de Equipos</h2>
        <p className="text-xs text-gray-400">Agrega, edita o elimina equipos participantes del mundial manualmente en caso de que falle la API.</p>
      </div>
      <AdminTeamsManager teams={teams || []} />
    </div>
  );
}
