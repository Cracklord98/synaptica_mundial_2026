"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Search, 
  ShieldCheck, 
  User,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { deleteUserAction } from "@/lib/actions";

interface Profile {
  id: string;
  username: string;
  team_name: string | null;
  partner_id: string | null;
  is_admin: boolean;
  created_at: string;
}

interface AdminUsersTableProps {
  profiles: Profile[];
}

export default function AdminUsersTable({ profiles }: AdminUsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = profiles.filter((p) => {
    const term = searchQuery.toLowerCase();
    return (
      p.username.toLowerCase().includes(term) ||
      (p.team_name && p.team_name.toLowerCase().includes(term))
    );
  });

  const handleDelete = async (id: string, username: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente al participante @${username}? Esto también borrará todas sus predicciones y su acceso a la plataforma.`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await deleteUserAction(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error al eliminar el participante");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar participante..."
            className="pl-10 border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-400 font-medium">
          Total: {profiles.length} participantes registrados
        </div>
      </div>

      {/* Users table */}
      <Card className="border-[#1A2B3C] bg-[#121212] overflow-hidden premium-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-[#0A0A0A] border-b border-[#1A2B3C] text-gray-400">
              <tr>
                <th className="py-4 px-6">Participante</th>
                <th className="py-4 px-6">Equipo / Nombre de Polla</th>
                <th className="py-4 px-6 text-center">Rol</th>
                <th className="py-4 px-6 text-center">Registro</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <motion.tbody 
              className="divide-y divide-[#1A2B3C]/40"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No se encontraron participantes.
                  </td>
                </tr>
              ) : (
                filtered.map((profile) => (
                  <motion.tr 
                    key={profile.id} 
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="hover:bg-[#1A2B3C]/10 transition-colors"
                  >
                    {/* User */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        @{profile.username}
                        {profile.is_admin && (
                          <span title="Administrador">
                            <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                          </span>
                        )}
                      </p>
                    </td>

                    {/* Team Name */}
                    <td className="py-4 px-6">
                      {profile.team_name ? (
                        <div className="flex items-center gap-1 text-xs text-[#00B894] font-medium">
                          <User className="h-3.5 w-3.5 text-[#00B894]" />
                          <span>{profile.team_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                          <span>Sin nombre de equipo</span>
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        profile.is_admin
                          ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30"
                          : "bg-white/5 text-gray-400 border-white/10"
                      }`}>
                        {profile.is_admin ? "Admin" : "Participante"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-center text-gray-400 text-xs">
                      {new Date(profile.created_at).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      {!profile.is_admin && (
                        <button
                          disabled={deletingId !== null}
                          onClick={() => handleDelete(profile.id, profile.username)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                          title="Eliminar participante"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
