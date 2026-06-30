"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Search, 
  Lock, 
  Info,
  Calendar,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDisplayName } from "@/lib/utils";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  exact_count: number;
}

interface Team {
  id: string;
  name: string;
  flag_url: string | null;
}

interface Match {
  id: string;
  round: string;
  match_datetime: string;
  deadline: string;
  is_finished: boolean;
  team1_id: string | null;
  team2_id: string | null;
  team1_score: number | null;
  team2_score: number | null;
  winner_id: string | null;
  team1: Team | null;
  team2: Team | null;
}

interface Prediction {
  user_id: string;
  match_id: string;
  score_local: number;
  score_visitor: number;
  winner_id: string;
}

interface ScoreHistoryEntry {
  user_id: string;
  match_id: string;
  points: number;
  is_exact: boolean;
}

interface TruthTableProps {
  standings: LeaderboardEntry[];
  matches: Match[];
  predictions: Prediction[];
  scoreHistory: ScoreHistoryEntry[];
  currentUserId: string;
}

const ROUNDS = [
  { id: "round_32", name: "Ronda de 32" },
  { id: "round_16", name: "Octavos" },
  { id: "quarter", name: "Cuartos" },
  { id: "semi", name: "Semifinales" },
  { id: "final", name: "Finales" }, // Will include final and third_place
];

export default function TruthTable({
  standings,
  matches,
  predictions,
  scoreHistory,
  currentUserId,
}: TruthTableProps) {
  const [activeTab, setActiveTab] = useState("round_32");
  const [searchQuery, setSearchQuery] = useState("");

  // Map predictions for fast lookup: user_id + "_" + match_id -> Prediction
  const predictionMap = useMemo(() => {
    const map = new Map<string, Prediction>();
    predictions.forEach((p) => {
      map.set(`${p.user_id}_${p.match_id}`, p);
    });
    return map;
  }, [predictions]);

  // Map score history for fast lookup: user_id + "_" + match_id -> ScoreHistoryEntry
  const scoreHistoryMap = useMemo(() => {
    const map = new Map<string, ScoreHistoryEntry>();
    scoreHistory.forEach((sh) => {
      map.set(`${sh.user_id}_${sh.match_id}`, sh);
    });
    return map;
  }, [scoreHistory]);

  // Filter matches based on selected tab
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (activeTab === "final") {
        return m.round === "final" || m.round === "third_place";
      }
      return m.round === activeTab;
    });
  }, [matches, activeTab]);

  // Filter standings based on search query
  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return standings;
    const query = searchQuery.toLowerCase();
    return standings.filter((s) => 
      s.username.toLowerCase().includes(query)
    );
  }, [standings, searchQuery]);

  // Helper to format date cleanly
  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get team abbreviation or first 3 letters
  const getTeamAbbr = (team: Team | null) => {
    if (!team) return "TBD";
    // If name has 3 letters or less, return name
    if (team.name.length <= 3) return team.name.toUpperCase();
    
    // Custom mapping for popular countries, fallback to first 3 letters
    const customAbbrs: Record<string, string> = {
      "alemania": "GER",
      "argentina": "ARG",
      "brasil": "BRA",
      "colombia": "COL",
      "españa": "ESP",
      "francia": "FRA",
      "italia": "ITA",
      "inglaterra": "ENG",
      "méxico": "MEX",
      "uruguay": "URU",
      "bélgica": "BEL",
      "croacia": "CRO",
      "portuguese": "POR",
      "estados unidos": "USA",
      "canadá": "CAN",
      "países bajos": "NED",
    };
    const key = team.name.toLowerCase();
    return customAbbrs[key] || team.name.substring(0, 3).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Description card */}
      <Card className="border-[#1A2B3C] bg-[#121212] premium-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#D4AF37]" />
                Transparencia Total
              </h2>
              <p className="text-xs text-gray-400 max-w-2xl">
                Compara las predicciones de todos los jugadores de forma segura. Los pronósticos de tus rivales se mantienen ocultos bajo un candado 🔒 hasta que empiece el partido respectivo. Una vez cerrado el plazo, todos los pronósticos se hacen públicos de forma automática.
              </p>
            </div>
            {/* Search Bar */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar participante..."
                className="pl-10 border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-[#1e293b]/70 flex flex-wrap gap-x-6 gap-y-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded bg-amber-500/10 border border-amber-500/30" />
              <span>Exacto (+5 pts)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded bg-emerald-500/10 border border-emerald-500/20" />
              <span>Resultado (+3 pts)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded bg-blue-500/10 border border-blue-500/20" />
              <span>Clasifica (+2 pts)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded bg-gray-500/10 border border-transparent" />
              <span>Fallido (0 pts)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🔒 Oculto: Pendiente de inicio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>-: Sin pronóstico</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs list with framer motion animation */}
      <div className="flex overflow-x-auto border-b border-[#1e293b]/70 pb-px scrollbar-none gap-2">
        {ROUNDS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150 rounded-t-lg ${
                isActive ? "text-[#D4AF37]" : "text-gray-400 hover:text-white"
              }`}
            >
              <span>{tab.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="border-[#1A2B3C] bg-[#121212] overflow-hidden premium-card">
        <CardContent className="p-0 overflow-x-auto relative">
          
          {filteredMatches.length === 0 ? (
            <div className="p-8 text-center text-gray-500 space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-gray-600" />
              <p>No hay partidos disponibles para esta ronda todavía.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              {/* Header */}
              <thead className="bg-[#0A0A0A] border-b border-[#1A2B3C] text-xs text-gray-400 uppercase">
                <tr>
                  {/* Sticky Position column */}
                  <th className="sticky left-0 z-20 bg-[#0A0A0A] px-4 py-5 text-center w-12 border-r border-[#1A2B3C]">
                    Pos
                  </th>
                  {/* Sticky Participant column */}
                  <th className="sticky left-12 z-20 bg-[#0A0A0A] px-4 py-5 w-[160px] min-w-[160px] max-w-[180px] border-r border-[#1A2B3C]">
                    Participante
                  </th>
                  {/* Match columns */}
                  {filteredMatches.map((m) => {
                    const hasTeams = m.team1 && m.team2;
                    return (
                      <th 
                        key={m.id} 
                        className="px-4 py-4 text-center min-w-[150px] border-r border-[#1A2B3C]/50 align-top"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          {/* Round & Date */}
                          <span className="text-[9px] text-[#00B894] font-bold tracking-wider">
                            {m.round === "third_place" ? "3er Puesto" : m.round === "final" ? "Final" : "Eliminación Directa"}
                          </span>
                          
                          {/* Teams row */}
                          <div className="flex items-center justify-center gap-1.5 w-full">
                            {hasTeams ? (
                              <>
                                <div className="flex items-center gap-1">
                                  {m.team1?.flag_url && (
                                    <img 
                                      src={m.team1.flag_url} 
                                      alt={m.team1.name} 
                                      className="h-3 w-4.5 rounded-sm object-cover border border-white/10 shrink-0" 
                                    />
                                  )}
                                  <span className="font-bold text-white text-xs">{getTeamAbbr(m.team1)}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold">vs</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-white text-xs">{getTeamAbbr(m.team2)}</span>
                                  {m.team2?.flag_url && (
                                    <img 
                                      src={m.team2.flag_url} 
                                      alt={m.team2.name} 
                                      className="h-3 w-4.5 rounded-sm object-cover border border-white/10 shrink-0" 
                                    />
                                  )}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-500 text-xs font-semibold">POR DEFINIR</span>
                            )}
                          </div>

                          {/* Actual Score or Date */}
                          {m.is_finished ? (
                            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-0.5 rounded text-[11px] font-extrabold shadow-inner flex items-center gap-1">
                              <span>{m.team1_score} - {m.team2_score}</span>
                              {m.winner_id && (
                                <span className="text-[9px] opacity-75">
                                  ({m.winner_id === m.team1_id ? getTeamAbbr(m.team1) : getTeamAbbr(m.team2)})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-[9px] text-gray-500 font-semibold lowercase">
                              <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" /> {formatMatchTime(m.match_datetime)}</span>
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-[#1A2B3C]/40 text-gray-300">
                {filteredStandings.length === 0 ? (
                  <tr>
                    <td colSpan={2 + filteredMatches.length} className="py-8 text-center text-gray-500">
                      No se encontraron participantes.
                    </td>
                  </tr>
                ) : (
                  filteredStandings.map((s, idx) => {
                    const isCurrentUser = s.user_id === currentUserId;
                    const rank = idx + 1;

                    return (
                      <tr 
                        key={s.user_id} 
                        className={`group transition-colors ${
                          isCurrentUser 
                            ? "bg-[#D4AF37]/5 font-semibold border-l-2 border-[#D4AF37]" 
                            : "hover:bg-[#1A2B3C]/10"
                        }`}
                      >
                        {/* Sticky Position cell */}
                        <td 
                          className={`sticky left-0 z-10 px-4 py-4 text-center border-r border-[#1A2B3C]/40 transition-colors ${
                            isCurrentUser 
                              ? "bg-[#181C26] text-[#D4AF37]" 
                              : "bg-[#121212] text-gray-400 group-hover:bg-[#191D2E]"
                          }`}
                        >
                          {rank === 1 ? (
                            <Trophy className="h-4.5 w-4.5 text-[#D4AF37] mx-auto" />
                          ) : (
                            <span className="font-bold text-xs">{rank}º</span>
                          )}
                        </td>

                        {/* Sticky Participant cell */}
                        <td 
                          className={`sticky left-12 z-10 px-4 py-4 border-r border-[#1A2B3C]/40 truncate transition-colors ${
                            isCurrentUser 
                              ? "bg-[#181C26] text-[#D4AF37]" 
                              : "bg-[#121212] text-white group-hover:bg-[#191D2E]"
                          }`}
                        >
                          <div className="flex flex-col truncate w-full">
                            <span className="font-bold text-xs truncate">
                              {formatDisplayName(s.username)}
                            </span>
                          </div>
                        </td>

                        {/* Predictions cells */}
                        {filteredMatches.map((m) => {
                          const key = `${s.user_id}_${m.id}`;
                          const pred = predictionMap.get(key);
                          const scoreHist = scoreHistoryMap.get(key);
                          
                          // Check if deadline has passed
                          const isDeadlinePassed = new Date(m.deadline) < new Date();
                          
                          // We can show prediction if:
                          // 1. It belongs to the current logged-in user
                          // 2. Or if the deadline for the match has already passed
                          const canShowPrediction = isCurrentUser || isDeadlinePassed;
                          
                          let cellContent = null;

                          if (!canShowPrediction) {
                            // Prediction is locked/hidden
                            cellContent = (
                              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-600 italic font-medium select-none">
                                <Lock className="h-3 w-3 text-gray-700" />
                                <span>Oculto</span>
                              </div>
                            );
                          } else if (!pred) {
                            // No prediction was submitted
                            cellContent = (
                              <span className="text-gray-600 text-xs font-bold">-</span>
                            );
                          } else {
                            // We can show prediction, and it exists
                            const predictedWinner = pred.winner_id;
                            let winnerAbbr = "";
                            if (pred.score_local === pred.score_visitor && predictedWinner) {
                              const winningTeam = m.team1_id === predictedWinner ? m.team1 : m.team2;
                              winnerAbbr = winningTeam ? ` (${getTeamAbbr(winningTeam)})` : "";
                            }
                            
                            cellContent = (
                              <div className="flex flex-col items-center justify-center space-y-1">
                                <span className={`text-xs font-bold text-white ${isCurrentUser ? "text-[#D4AF37]" : ""}`}>
                                  {pred.score_local} - {pred.score_visitor}
                                  <span className="text-[9px] text-gray-500 font-semibold">{winnerAbbr}</span>
                                </span>
                                
                                {/* Points badge if match finished */}
                                {m.is_finished && scoreHist && (
                                  <Badge 
                                    className={`px-1.5 py-0.5 text-[9px] font-extrabold border rounded uppercase shrink-0 ${
                                      scoreHist.points >= 8 // Exact score (8 or 10 points)
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                        : (scoreHist.points === 5 || scoreHist.points === 3) // Outcome + advancing (5 pts) or Outcome only (3 pts)
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : scoreHist.points === 2 // Qualified team only (2 pts)
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        : "bg-gray-500/10 text-gray-500 border-transparent" // 0 points
                                    }`}
                                  >
                                    +{scoreHist.points} pts
                                  </Badge>
                                )}
                              </div>
                            );
                          }

                          return (
                            <td 
                              key={m.id} 
                              className={`px-4 py-3 text-center border-r border-[#1A2B3C]/30 align-middle ${
                                isCurrentUser ? "bg-[#D4AF37]/5" : ""
                              }`}
                            >
                              {cellContent}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
