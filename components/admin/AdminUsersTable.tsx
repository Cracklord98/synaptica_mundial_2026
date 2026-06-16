"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  X, 
  Search, 
  ShieldCheck, 
  AlertCircle,
  Users,
  User,
  CreditCard
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { manageUserPayment } from "@/lib/actions";

interface Profile {
  id: string;
  username: string;
  team_name: string | null;
  partner_id: string | null;
  is_admin: boolean;
  is_paid: boolean;
  payment_status: "pending" | "submitted" | "approved" | "rejected";
  payment_reference: string | null;
  created_at: string;
}

interface AdminUsersTableProps {
  profiles: Profile[];
}

export default function AdminUsersTable({ profiles }: AdminUsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdatePayment = async (userId: string, status: "approved" | "rejected") => {
    setUpdatingId(userId);
    try {
      await manageUserPayment(userId, status);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al actualizar pago");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = profiles.filter((p) => {
    const term = searchQuery.toLowerCase();
    return (
      p.username.toLowerCase().includes(term) ||
      (p.team_name && p.team_name.toLowerCase().includes(term)) ||
      (p.payment_reference && p.payment_reference.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search and summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuario..."
            className="pl-10 border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-400 font-medium">
          Total: {profiles.length} usuarios | Pagos Aprobados: {profiles.filter(p => p.is_paid).length}
        </div>
      </div>

      {/* Users table */}
      <Card className="border-[#1A2B3C] bg-[#121212] overflow-hidden premium-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-[#0A0A0A] border-b border-[#1A2B3C] text-gray-400">
              <tr>
                <th className="py-4 px-6">Usuario</th>
                <th className="py-4 px-6">Equipo / Dupla</th>
                <th className="py-4 px-6 text-center">Referencia de Pago</th>
                <th className="py-4 px-6 text-center">Estado Pago</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2B3C]/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filtered.map((profile) => (
                  <tr key={profile.id} className="hover:bg-[#1A2B3C]/10 transition-colors">
                    {/* User */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            @{profile.username}
                            {profile.is_admin && (
                              <span title="Administrador">
                                <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Creado: {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
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

                    {/* Payment Reference */}
                    <td className="py-4 px-6 text-center">
                      {profile.payment_reference ? (
                        <span className="font-mono text-xs bg-[#0A0A0A] border border-[#1A2B3C] px-2.5 py-1 rounded text-gray-300">
                          {profile.payment_reference}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        profile.payment_status === "approved"
                          ? "bg-[#00B894]/10 text-[#00B894] border-[#00B894]/30"
                          : profile.payment_status === "submitted"
                          ? "bg-yellow-950/20 text-yellow-300 border-yellow-600/30"
                          : profile.payment_status === "rejected"
                          ? "bg-red-950/20 text-red-400 border-red-900/30"
                          : "bg-white/5 text-gray-400 border-white/10"
                      }`}>
                        {profile.payment_status === "approved"
                          ? "Aprobado"
                          : profile.payment_status === "submitted"
                          ? "Por Verificar"
                          : profile.payment_status === "rejected"
                          ? "Rechazado"
                          : "Pendiente"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {profile.payment_status !== "approved" && (
                          <Button
                            size="sm"
                            disabled={updatingId === profile.id}
                            className="bg-[#00B894] hover:bg-[#00B894]/80 text-white font-bold h-8 flex items-center gap-1"
                            onClick={() => handleUpdatePayment(profile.id, "approved")}
                          >
                            <Check className="h-3.5 w-3.5" /> Aprobar
                          </Button>
                        )}
                        {profile.payment_status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={updatingId === profile.id}
                            className="h-8 font-bold flex items-center gap-1"
                            onClick={() => handleUpdatePayment(profile.id, "rejected")}
                          >
                            <X className="h-3.5 w-3.5" /> Rechazar
                          </Button>
                        )}
                      </div>
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
