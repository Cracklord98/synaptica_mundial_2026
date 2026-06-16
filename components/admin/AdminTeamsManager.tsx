"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, CheckCircle, AlertCircle, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveTeam, deleteTeam } from "@/lib/actions";

interface Team {
  id: string;
  name: string;
  flag_url: string | null;
  group_name: string;
  position_in_group: number | null;
  is_qualified: boolean;
  eliminated: boolean;
}

interface AdminTeamsManagerProps {
  teams: Team[];
}

export default function AdminTeamsManager({ teams }: AdminTeamsManagerProps) {
  const router = useRouter();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [flagUrl, setFlagUrl] = useState("");
  const [groupName, setGroupName] = useState("A");
  const [positionInGroup, setPositionInGroup] = useState("1");
  const [isQualified, setIsQualified] = useState(false);
  const [eliminated, setEliminated] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEdit = (team: Team) => {
    setEditingId(team.id);
    setName(team.name);
    setFlagUrl(team.flag_url || "");
    setGroupName(team.group_name);
    setPositionInGroup(team.position_in_group ? String(team.position_in_group) : "1");
    setIsQualified(team.is_qualified);
    setEliminated(team.eliminated);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleReset = () => {
    setEditingId(null);
    setName("");
    setFlagUrl("");
    setGroupName("A");
    setPositionInGroup("1");
    setIsQualified(false);
    setEliminated(false);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const pos = positionInGroup ? parseInt(positionInGroup, 10) : null;
      await saveTeam(editingId, name.trim(), flagUrl.trim(), groupName, pos, isQualified, eliminated);
      setSuccessMsg(editingId ? "Equipo actualizado con éxito" : "Equipo creado con éxito");
      handleReset();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err instanceof Error ? err.message : "Error al guardar el equipo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (teamId: string, teamName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el equipo "${teamName}"?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      await deleteTeam(teamId);
      setSuccessMsg(`Equipo "${teamName}" eliminado con éxito`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err instanceof Error ? err.message : "Error al eliminar el equipo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Card */}
      <div className="lg:col-span-1">
        <Card className="border-[#1A2B3C] bg-[#121212] text-white">
          <CardHeader>
            <CardTitle className="text-lg text-[#D4AF37] font-bold">
              {editingId ? "Editar Equipo" : "Agregar Nuevo Equipo"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {editingId ? "Modifica los datos del equipo seleccionado" : "Crea un nuevo equipo en el sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-xs text-gray-300">Nombre del Equipo</Label>
                <Input
                  id="name"
                  placeholder="ej. Colombia"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="flagUrl" className="text-xs text-gray-300">URL de la Bandera (opcional)</Label>
                <Input
                  id="flagUrl"
                  placeholder="https://example.com/flag.png"
                  value={flagUrl}
                  onChange={(e) => setFlagUrl(e.target.value)}
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="groupName" className="text-xs text-gray-300">Grupo</Label>
                  <select
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#1A2B3C] text-sm font-semibold text-white rounded p-2 focus:border-[#D4AF37] focus:ring-0 outline-none"
                  >
                    {["A","B","C","D","E","F","G","H","I","J","K","L"].map(g => (
                      <option key={g} value={g}>Grupo {g}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="position" className="text-xs text-gray-300">Posición en Grupo</Label>
                  <select
                    id="position"
                    value={positionInGroup}
                    onChange={(e) => setPositionInGroup(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#1A2B3C] text-sm font-semibold text-white rounded p-2 focus:border-[#D4AF37] focus:ring-0 outline-none"
                  >
                    {[1, 2, 3, 4].map(p => (
                      <option key={p} value={p}>Posición {p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="qualified"
                    checked={isQualified}
                    onChange={(e) => setIsQualified(e.target.checked)}
                    className="rounded border-[#1A2B3C] bg-[#0A0A0A] text-[#00B894] focus:ring-0 h-4 w-4 cursor-pointer"
                  />
                  <Label htmlFor="qualified" className="text-xs text-gray-300 font-semibold cursor-pointer">
                    Clasificado a R32
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="eliminated"
                    checked={eliminated}
                    onChange={(e) => setEliminated(e.target.checked)}
                    className="rounded border-[#1A2B3C] bg-[#0A0A0A] text-red-500 focus:ring-0 h-4 w-4 cursor-pointer"
                  />
                  <Label htmlFor="eliminated" className="text-xs text-gray-300 font-semibold cursor-pointer">
                    Eliminado del Torneo
                  </Label>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-950/20 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 bg-[#00B894]/10 border border-[#00B894]/30 rounded text-xs text-[#00B894] flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 border-[#1A2B3C] text-white hover:bg-[#1A2B3C] text-xs font-bold"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold text-xs"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {editingId ? "Guardar" : "Crear"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <div className="lg:col-span-2">
        <Card className="border-[#1A2B3C] bg-[#121212] text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white font-bold flex justify-between items-center">
              <span>Equipos Registrados ({teams.length})</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Listado total de equipos participantes cargados en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1A2B3C] text-gray-400 font-semibold">
                  <th className="py-2.5 px-3">Bandera</th>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Grupo</th>
                  <th className="py-2.5 px-3">Posición</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2B3C]/50">
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No hay equipos registrados todavía.
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => (
                    <tr key={team.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        {team.flag_url ? (
                          <img src={team.flag_url} className="w-6 h-4 border border-gray-800 rounded-sm" alt="" />
                        ) : (
                          <span className="text-gray-500 font-mono text-[9px]">no flag</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{team.name}</td>
                      <td className="py-2.5 px-3">Grupo {team.group_name}</td>
                      <td className="py-2.5 px-3">{team.position_in_group || "-"}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-1">
                          {team.is_qualified && (
                            <span className="text-[10px] bg-[#00B894]/10 text-[#00B894] py-0.5 px-1.5 rounded-full font-medium w-max font-semibold">
                              Clasificado
                            </span>
                          )}
                          {team.eliminated && (
                            <span className="text-[10px] bg-red-950/30 text-red-400 py-0.5 px-1.5 rounded-full font-medium w-max font-semibold">
                              Eliminado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleEdit(team)}
                          className="p-1 hover:bg-[#1A2B3C] text-gray-400 hover:text-white rounded transition-colors inline-flex"
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(team.id, team.name)}
                          className="p-1 hover:bg-red-950/30 text-gray-400 hover:text-red-400 rounded transition-colors inline-flex"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
