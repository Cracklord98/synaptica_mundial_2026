"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Users, 
  CircleCheck, 
  MapPin, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  ShieldAlert,
  ChevronRight,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLiveStandings } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";

interface StandingTeam {
  id: string;
  name: string;
  flag_url: string | null;
  position: number;
  mp: number;
  w: number;
  d: number;
  l: number;
  pts: number;
  gf: number;
  ga: number;
  gd: number;
  isQualified: boolean;
  isEliminated: boolean;
}

interface GroupStanding {
  name: string;
  teams: StandingTeam[];
}

interface ThirdPlaceStanding {
  id: string;
  name: string;
  flag_url: string | null;
  pts: number;
  gd: number;
  gf: number;
  mp: number;
  w: number;
  d: number;
  l: number;
  groupName: string;
  rank: number;
  isQualified: boolean;
}

export default function QualifiedTeamsPage() {
  const [activeTab, setActiveTab] = useState<"groups" | "thirds">("groups");
  const [dbFallbackTeams, setDbFallbackTeams] = useState<any[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(false);

  // Fetch live standings from API using Server Action with SWR (revalidate every 60s)
  const { data, error, isLoading } = useSWR("live-standings", getLiveStandings, {
    refreshInterval: 60000,
    revalidateOnFocus: true
  });

  // Database fallback if API fails
  useEffect(() => {
    async function loadDbFallback() {
      if (data && !data.success) {
        setIsDbLoading(true);
        try {
          const supabase = createClient();
          const { data: dbTeams } = await supabase
            .from("teams")
            .select("*")
            .eq("is_qualified", true)
            .order("group_name", { ascending: true })
            .order("position_in_group", { ascending: true, nullsFirst: false });
          if (dbTeams) {
            setDbFallbackTeams(dbTeams);
          }
        } catch (err) {
          console.error("Database fallback failed:", err);
        } finally {
          setIsDbLoading(false);
        }
      }
    }
    loadDbFallback();
  }, [data]);

  const showFallback = data && !data.success;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-0 pb-12">
      {/* Premium Hero Banner */}
      <section className="premium-card relative overflow-hidden rounded-3xl border border-[#1e293b]/70 bg-gradient-to-br from-[#0c1530] via-[#07070a] to-[#141416] p-6 md:p-10 shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[-15%] h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-15%] h-96 w-96 rounded-full bg-[#00B894]/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1 text-xs uppercase tracking-[0.2em] font-black">
              📊 Clasificación en Tiempo Real
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Camino a los Dieciseisavos (R32)
            </h1>
            <p className="text-sm md:text-base text-gray-300">
              Sigue la clasificación oficial de los grupos del Mundial 2026. Recuerda que avanzan los <strong className="text-white">dos primeros de cada grupo</strong> y los <strong className="text-white">8 mejores terceros</strong> de entre los 12 grupos.
            </p>
            
            {/* Live Indicator Alert */}
            {!showFallback && !isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#00B894] font-bold bg-[#00B894]/10 border border-[#00B894]/20 py-2 px-4 rounded-xl w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B894] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B894]"></span>
                </span>
                Fase de grupos en desarrollo — Datos provistos por la API oficial
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto lg:min-w-[480px]">
            <Card className="border-[#1e293b] bg-[#0c1020]/80 backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37]">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-black tracking-wider">Cupos R32</p>
                  <p className="text-2xl font-black text-white">32</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#1e293b] bg-[#0c1020]/80 backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#00B894]/15 flex items-center justify-center border border-[#00B894]/20 text-[#00B894]">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-black tracking-wider">Grupos</p>
                  <p className="text-2xl font-black text-white">12</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#1e293b] bg-[#0c1020]/80 backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#3b82f6]/15 flex items-center justify-center border border-[#3b82f6]/20 text-[#3b82f6]">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-black tracking-wider">Mejores 3º</p>
                  <p className="text-2xl font-black text-white">8</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      {!showFallback && (
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
          <div className="flex gap-2 p-1 bg-[#0c0d12] border border-[#1e293b] rounded-2xl">
            <Button
              onClick={() => setActiveTab("groups")}
              variant="ghost"
              className={`rounded-xl px-5 py-2.5 font-bold transition-all text-sm ${
                activeTab === "groups"
                  ? "bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Tablas de Grupos
            </Button>
            <Button
              onClick={() => setActiveTab("thirds")}
              variant="ghost"
              className={`rounded-xl px-5 py-2.5 font-bold transition-all text-sm ${
                activeTab === "thirds"
                  ? "bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Ranking de Terceros
            </Button>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-4 w-4 text-[#D4AF37]" />
            Se actualiza automáticamente cada 60s
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Loader2 className="h-10 w-10 text-[#D4AF37] animate-spin" />
          <p className="text-gray-400 font-medium">Obteniendo clasificaciones del Mundial...</p>
        </div>
      ) : showFallback ? (
        // Fallback View (Using Database Data)
        <div className="space-y-6">
          <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400">API Externa no disponible temporalmente</p>
              <p className="text-xs text-amber-500 mt-0.5">Mostrando los equipos marcados como clasificados en nuestra base de datos corporativa.</p>
            </div>
          </div>

          {isDbLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
            </div>
          ) : dbFallbackTeams.length === 0 ? (
            <Card className="border-[#1e293b] bg-[#0c0d12]">
              <CardContent className="p-12 text-center text-gray-400">
                <AlertCircle className="h-10 w-10 text-[#D4AF37] mx-auto mb-3" />
                No hay clasificados consolidados en la base de datos todavía.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dbFallbackTeams.map((team) => (
                <Card key={team.id} className="border-[#1e293b] bg-[#0c0d12]/60 hover:border-[#D4AF37]/50 transition-all duration-300">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {team.flag_url ? (
                        <img src={team.flag_url} alt={team.name} className="h-6 w-8 rounded object-cover shadow-sm border border-gray-800" />
                      ) : (
                        <div className="h-6 w-8 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">?</div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm">{team.name}</p>
                        <p className="text-[10px] text-gray-400">Grupo {team.group_name} · Posición {team.position_in_group}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#00B894]/10 text-[#00B894] border border-[#00B894]/20 text-xs">Clasificado</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Live Standings View
        <AnimatePresence mode="wait">
          {activeTab === "groups" ? (
            // Groups Grid View
            <motion.div
              key="groups-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {data?.groups?.map((group: GroupStanding) => (
                <Card key={group.name} className="border-[#1e293b] bg-[#07070a]/90 shadow-lg overflow-hidden flex flex-col premium-card">
                  <CardHeader className="border-b border-[#1e293b] bg-[#0c1020]/60 p-4">
                    <CardTitle className="text-white text-base font-black flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#D4AF37]" />
                        Grupo {group.name}
                      </span>
                      <span className="text-xs text-[#D4AF37] font-semibold">FIFA 2026</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-gray-300">
                        <thead>
                          <tr className="text-gray-500 border-b border-[#1e293b] uppercase tracking-wider text-[10px] font-bold">
                            <th className="py-2 px-1 text-center">Pos</th>
                            <th className="py-2 px-2">País</th>
                            <th className="py-2 px-1 text-center">PJ</th>
                            <th className="py-2 px-1 text-center">GD</th>
                            <th className="py-2 px-1 text-center">Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e293b]/40">
                          {group.teams.map((team: StandingTeam) => (
                            <tr 
                              key={team.id}
                              className={`hover:bg-white/5 transition-all duration-150 ${
                                team.isQualified 
                                  ? "bg-[#00B894]/5" 
                                  : team.isEliminated
                                    ? "bg-red-500/[0.02]"
                                    : ""
                              }`}
                            >
                              <td className="py-3 px-1 text-center font-bold">
                                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${
                                  team.position <= 2 
                                    ? "bg-[#00B894]/20 text-[#00B894] border border-[#00B894]/30"
                                    : team.position === 3
                                      ? "bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30"
                                      : "bg-gray-800/40 text-gray-500 border border-gray-800"
                                }`}>
                                  {team.position}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-semibold text-white">
                                <div className="flex items-center gap-2 max-w-[140px] truncate">
                                  {team.flag_url ? (
                                    <img src={team.flag_url} alt={team.name} className="h-4 w-6 object-cover rounded shadow-sm shrink-0 border border-gray-800" />
                                  ) : (
                                    <div className="h-4 w-6 bg-gray-800 rounded flex items-center justify-center text-[8px] text-gray-500 shrink-0">?</div>
                                  )}
                                  <span className="truncate">{team.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-1 text-center text-gray-400">{team.mp}</td>
                              <td className={`py-3 px-1 text-center font-medium ${
                                team.gd > 0 ? "text-emerald-400" : team.gd < 0 ? "text-rose-500" : "text-gray-400"
                              }`}>
                                {team.gd > 0 ? `+${team.gd}` : team.gd}
                              </td>
                              <td className="py-3 px-1 text-center font-black text-white">{team.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer badge with status summary */}
                    <div className="mt-4 pt-2 border-t border-[#1e293b]/40 flex items-center justify-between text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Info className="h-3 w-3 text-[#D4AF37]" />
                        {group.teams.filter(t => t.mp === 3).length === 4 
                          ? "Grupo Completado" 
                          : `${group.teams.filter(t => t.mp > 0).length} jugados`
                        }
                      </span>
                      <span className="flex gap-1.5">
                        <Badge className="bg-[#00B894]/10 text-[#00B894] border border-[#00B894]/20 hover:bg-[#00B894]/15 px-1.5 py-0">
                          {group.teams.filter(t => t.isQualified).length} R32
                        </Badge>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : (
            // Third Place Table View
            <motion.div
              key="thirds-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="p-4 bg-[#0c1020] border border-[#1e293b] rounded-2xl text-xs text-gray-400 flex items-start gap-2.5 max-w-3xl">
                <Info className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-0.5">Regla de Clasificación de Terceros</p>
                  <p>Al haber 12 grupos, clasifican los 8 terceros con mayor puntaje. En caso de igualdad de puntos, el desempate se realiza por diferencia de goles (DG), y luego por goles marcados (GF). Los 8 primeros (fila 1-8 en verde) consiguen boleto a Dieciseisavos.</p>
                </div>
              </div>

              <Card className="border-[#1e293b] bg-[#07070a]/90 shadow-xl overflow-hidden premium-card">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead>
                        <tr className="text-gray-500 border-b border-[#1e293b] bg-[#0c1020]/40 uppercase tracking-wider text-[11px] font-black">
                          <th className="py-3.5 px-4 text-center w-16">Rank</th>
                          <th className="py-3.5 px-2 text-center w-16">Grupo</th>
                          <th className="py-3.5 px-4">País</th>
                          <th className="py-3.5 px-4 text-center">Partidos</th>
                          <th className="py-3.5 px-4 text-center">G - E - P</th>
                          <th className="py-3.5 px-4 text-center">GF</th>
                          <th className="py-3.5 px-4 text-center">GD</th>
                          <th className="py-3.5 px-4 text-center">Puntos</th>
                          <th className="py-3.5 px-4 text-right pr-6">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b]/40">
                        {data?.thirds?.map((team: ThirdPlaceStanding) => (
                          <tr 
                            key={team.id}
                            className={`hover:bg-white/5 transition-all duration-150 ${
                              team.isQualified 
                                ? "bg-[#00B894]/5" 
                                : "bg-red-500/[0.02]"
                            }`}
                          >
                            <td className="py-3.5 px-4 text-center font-black">
                              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                                team.isQualified 
                                  ? "bg-[#00B894]/20 text-[#00B894] border border-[#00B894]/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}>
                                {team.rank}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-center font-bold text-gray-400">
                              {team.groupName}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white">
                              <div className="flex items-center gap-3">
                                {team.flag_url ? (
                                  <img src={team.flag_url} alt={team.name} className="h-5 w-7 object-cover rounded shadow-sm border border-gray-800" />
                                ) : (
                                  <div className="h-5 w-7 bg-gray-800 rounded flex items-center justify-center text-[10px] text-gray-500">?</div>
                                )}
                                <span>{team.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center text-gray-400">{team.mp}</td>
                            <td className="py-3.5 px-4 text-center text-gray-400">{team.w} - {team.d} - {team.l}</td>
                            <td className="py-3.5 px-4 text-center text-gray-400">{team.gf}</td>
                            <td className={`py-3.5 px-4 text-center font-bold ${
                              team.gd > 0 ? "text-emerald-400" : team.gd < 0 ? "text-rose-500" : "text-gray-400"
                            }`}>
                              {team.gd > 0 ? `+${team.gd}` : team.gd}
                            </td>
                            <td className="py-3.5 px-4 text-center font-black text-white text-base">{team.pts}</td>
                            <td className="py-3.5 px-4 text-right pr-6">
                              <Badge className={`px-2.5 py-1 text-xs font-bold ${
                                team.isQualified
                                  ? "bg-[#00B894]/10 text-[#00B894] border border-[#00B894]/20"
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}>
                                {team.isQualified ? "Clasifica R32" : "Eliminado"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}