import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Users, Calendar, FileText, ChevronLeft, Flag } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch role
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A2B3C]/10 border border-[#1A2B3C] p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-[#D4AF37]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="text-xs text-gray-400">Control global y gestión de resultados reales</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-3 py-2 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex gap-2 border-b border-[#1A2B3C] pb-2">
        <Link
          href="/dashboard/admin/users"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[#1A2B3C]/40 text-gray-300 hover:text-white"
        >
          <Users className="h-4 w-4" /> Participantes
        </Link>
        <Link
          href="/dashboard/admin/matches"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[#1A2B3C]/40 text-gray-300 hover:text-white"
        >
          <Calendar className="h-4 w-4" /> Resultados de Partidos
        </Link>
        <Link
          href="/dashboard/admin/teams"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[#1A2B3C]/40 text-gray-300 hover:text-white"
        >
          <Flag className="h-4 w-4" /> Equipos
        </Link>
        <Link
          href="/dashboard/admin/model-cards"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[#1A2B3C]/40 text-gray-300 hover:text-white"
        >
          <FileText className="h-4 w-4" /> Model Cards Recibidos
        </Link>
      </div>

      <div className="pt-2">{children}</div>
    </div>
  );
}
