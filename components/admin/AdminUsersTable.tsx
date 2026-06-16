"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShieldCheck, 
  Users,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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

  const filtered = profiles.filter((p) => {
    const term = searchQuery.toLowerCase();
    return (
      p.username.toLowerCase().includes(term) ||
      (p.team_name && p.team_name.toLowerCase().includes(term))
    );
  });

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
          Total: {profiles.length} participantes | Duplas: {profiles.filter(p => p.team_name).length / 2} equipos
        </div>
      </div>

      {/* Users table */}
      <Card className="border-[#1A2B3C] bg-[#121212] overflow-hidden premium-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-[#0A0A0A] border-b border-[#1A2B3C] text-gray-400">
              <tr>
                <th className="py-4 px-6">Participante</th>
                <th className="py-4 px-6">Modo / Equipo</th>
                <th className="py-4 px-6 text-center">Rol</th>
                <th className="py-4 px-6 text-center">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2B3C]/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No se encontraron participantes.
                  </td>
                </tr>
              ) : (
                filtered.map((profile) => (
                  <tr key={profile.id} className="hover:bg-[#1A2B3C]/10 transition-colors">
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

                    {/* Team */}
                    <td className="py-4 px-6">
                      {profile.team_name ? (
                        <div className="flex items-center gap-1 text-xs text-[#00B894] font-medium">
                          <Users className="h-3.5 w-3.5" />
                          <span>{profile.team_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3.5 w-3.5" />
                          <span>Individual</span>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
