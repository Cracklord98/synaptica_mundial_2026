import { createClient } from "@/lib/supabase/server";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch all profiles from the database
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, team_name, partner_id, is_admin, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Gestión de Participantes</h2>
        <p className="text-xs text-gray-400">Directorio de todos los participantes registrados en la actividad</p>
      </div>
      <AdminUsersTable profiles={profiles || []} />
    </div>
  );
}

