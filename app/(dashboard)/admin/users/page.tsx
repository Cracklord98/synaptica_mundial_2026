import { createClient } from "@/lib/supabase/server";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch all profiles from the database
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Gestión de Usuarios y Pagos</h2>
        <p className="text-xs text-gray-400">Verifica referencias de pago y aprueba participantes para el ranking</p>
      </div>
      <AdminUsersTable profiles={profiles || []} />
    </div>
  );
}
