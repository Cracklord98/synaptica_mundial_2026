"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Calendar, 
  Clock, 
  Award,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPrediction, submitBonus } from "@/lib/actions";
import CountdownTimer from "@/components/ui/CountdownTimer";

interface Team {
  id: string;
  name: string;
  flag_url: string;
}

interface Match {
  id: string;
  round: string;
  team1_id: string;
  team2_id: string;
  team1_score: number | null;
  team2_score: number | null;
  winner_id: string | null;
  match_datetime: string;
  deadline: string;
  is_finished: boolean;
  team1: Team | null;
  team2: Team | null;
}

interface Prediction {
  match_id: string;
  score_local: number;
  score_visitor: number;
  winner_id: string;
}

interface BonusPrediction {
  champion_id: string;
  finalist1_id: string;
  finalist2_id: string;
}

interface PredictionFormProps {
  round: string;
  matches: Match[];
  initialPredictions: Prediction[];
  teams: Team[];
  initialBonus: BonusPrediction | null;
  isAdmin?: boolean;
}

const ROUND_NAMES: Record<string, string> = {
  round_32: "Dieciseisavos de Final (R32)",
  round_16: "Octavos de Final (R16)",
  quarter: "Cuartos de Final",
  semi: "Semifinales",
  third_place: "Tercer Lugar",
  final: "Gran Final",
};

const ROUND_LINKS = [
  { key: "round_32", label: "Dieciseisavos" },
  { key: "round_16", label: "Octavos" },
  { key: "quarter", label: "Cuartos" },
  { key: "semi", label: "Semis" },
  { key: "third_place", label: "3er Puesto" },
  { key: "final", label: "Final" },
];

export default function PredictionForm({
  round,
  matches,
  initialPredictions,
  teams,
  initialBonus,
  isAdmin = false,
}: PredictionFormProps) {
  const router = useRouter();
  
  // Track currently saved predictions in state to compare with inputs
  const [savedPredictions, setSavedPredictions] = useState<Record<string, Prediction>>(() => {
    const map: Record<string, Prediction> = {};
    initialPredictions.forEach((pred) => {
      map[pred.match_id] = pred;
    });
    return map;
  });

  // Track current form input states, defaulting empty predictions to 0 - 0
  const [predictions, setPredictions] = useState<Record<string, Partial<Prediction>>>(() => {
    const map: Record<string, Partial<Prediction>> = {};
    // Load existing predictions
    initialPredictions.forEach((pred) => {
      map[pred.match_id] = { ...pred };
    });
    // Default empty ones to 0 - 0
    matches.forEach((match) => {
      if (!map[match.id]) {
        map[match.id] = {
          match_id: match.id,
          score_local: 0,
          score_visitor: 0,
          winner_id: undefined,
        };
      }
    });
    return map;
  });

  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [successMatchId, setSuccessMatchId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to determine if a match prediction is currently saved and unmodified
  const isPredictionSaved = (matchId: string) => {
    const current = predictions[matchId];
    const saved = savedPredictions[matchId];
    if (!current || !saved) return false;
    return (
      current.score_local === saved.score_local &&
      current.score_visitor === saved.score_visitor &&
      current.winner_id === saved.winner_id
    );
  };

  // Bonus form state
  const [bonusChampion, setBonusChampion] = useState(initialBonus?.champion_id || "");
  const [bonusFinalist1, setBonusFinalist1] = useState(initialBonus?.finalist1_id || "");
  const [bonusFinalist2, setBonusFinalist2] = useState(initialBonus?.finalist2_id || "");
  const [savingBonus, setSavingBonus] = useState(false);
  const [successBonus, setSuccessBonus] = useState(false);

  const isBeforeBonusDeadline = new Date() < new Date("2026-06-28T00:00:00Z");

  const handleScoreChange = (matchId: string, team: "local" | "visitor", val: string) => {
    const intVal = val === "" ? undefined : parseInt(val, 10);
    setPredictions((prev) => {
      const existing = prev[matchId] || {};
      const updated = {
        ...existing,
        [team === "local" ? "score_local" : "score_visitor"]: intVal,
      };

      // Auto-set winner_id if not a draw
      if (updated.score_local !== undefined && updated.score_visitor !== undefined) {
        const match = matches.find((m) => m.id === matchId);
        if (match) {
          if (updated.score_local > updated.score_visitor) {
            updated.winner_id = match.team1_id;
          } else if (updated.score_local < updated.score_visitor) {
            updated.winner_id = match.team2_id;
          }
        }
      }

      return {
        ...prev,
        [matchId]: updated,
      };
    });
  };

  const handleWinnerSelect = (matchId: string, winnerId: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        winner_id: winnerId,
      },
    }));
  };

  const savePredictionForMatch = async (matchId: string) => {
    const pred = predictions[matchId];
    if (
      pred?.score_local === undefined ||
      pred?.score_visitor === undefined ||
      !pred?.winner_id
    ) {
      setErrorMsg("Debes ingresar el marcador completo y elegir el equipo que clasifica.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setSavingMatchId(matchId);
    setErrorMsg(null);
    setSuccessMatchId(null);

    try {
      await submitPrediction(
        matchId,
        pred.score_local,
        pred.score_visitor,
        pred.winner_id
      );
      
      // Update saved state reference to mark as saved
      setSavedPredictions((prev) => ({
        ...prev,
        [matchId]: {
          match_id: matchId,
          score_local: pred.score_local!,
          score_visitor: pred.score_visitor!,
          winner_id: pred.winner_id!,
        },
      }));

      setSuccessMatchId(matchId);
      setTimeout(() => setSuccessMatchId(null), 2500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al guardar predicción");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setSavingMatchId(null);
    }
  };

  const saveBonusPredictions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusChampion || !bonusFinalist1 || !bonusFinalist2) {
      setErrorMsg("Completa las 3 elecciones de la predicción bonus.");
      return;
    }
    setSavingBonus(true);
    setSuccessBonus(false);
    setErrorMsg(null);

    try {
      await submitBonus(bonusChampion, bonusFinalist1, bonusFinalist2);
      setSuccessBonus(true);
      setTimeout(() => setSuccessBonus(false), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al guardar bonus");
    } finally {
      setSavingBonus(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {isAdmin && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-indigo-100">Modo Administrador:</span> Vista de solo lectura. Los administradores no pueden registrar predicciones ni participar del juego.
          </div>
        </div>
      )}

      {/* Round Header & Tab Links */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-[#D4AF37]">{ROUND_NAMES[round]}</h1>
        <div className="flex flex-wrap gap-2 border-b border-[#1A2B3C] pb-2">
          {ROUND_LINKS.map((link) => (
            <button
              key={link.key}
              onClick={() => router.push(`/dashboard/predictions/${link.key}`)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${
                round === link.key
                  ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                  : "bg-[#121212] text-gray-400 border-[#1A2B3C] hover:border-gray-500 hover:text-white"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Countdown Timer for Round of 32 Teams Definition */}
      {round === "round_32" && (
        <CountdownTimer 
          targetDate="2026-06-28T00:00:00Z" 
          title="Definición de Cruces en" 
        />
      )}

      {/* Matches predictions list grouped by day */}
      <div className="space-y-10">
        {matches.length === 0 ? (
          <div className="p-8 text-center bg-[#121212] border border-[#1A2B3C] rounded-2xl">
            <AlertCircle className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-gray-400">Aún no se han generado los partidos para esta fase.</p>
            <p className="text-xs text-gray-500 mt-1">Los partidos se generarán al finalizar la fase anterior.</p>
          </div>
        ) : (
          (() => {
            // Sort matches chronologically
            const sortedMatches = [...matches].sort(
              (a, b) => new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime()
            );

            // Group sorted matches by day
            const groupedMatches: Record<string, Match[]> = {};
            sortedMatches.forEach((match) => {
              const date = new Date(match.match_datetime);
              const dayLabel = date.toLocaleDateString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              });
              const capitalizedDay = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
              if (!groupedMatches[capitalizedDay]) {
                groupedMatches[capitalizedDay] = [];
              }
              groupedMatches[capitalizedDay].push(match);
            });

            return Object.entries(groupedMatches).map(([day, dayMatches]) => (
              <div key={day} className="space-y-4">
                {/* Day Header */}
                <div className="flex items-center gap-2 border-b border-[#1A2B3C]/60 pb-2 pt-2">
                  <Calendar className="h-4 w-4 text-[#D4AF37]" />
                  <h3 className="font-extrabold text-sm md:text-base text-gray-200 tracking-wider uppercase">
                    {day}
                  </h3>
                </div>

                {/* Day Matches */}
                <div className="space-y-5">
                  {dayMatches.map((match) => {
                    const pred = predictions[match.id] || {};
                    const isLocked = new Date() > new Date(match.deadline) || match.is_finished || isAdmin;
                    const isDraw = pred.score_local !== undefined && pred.score_visitor !== undefined && pred.score_local === pred.score_visitor;

                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="border-[#1A2B3C] bg-[#121212]/50 backdrop-blur-sm text-white overflow-hidden premium-card">
                          {/* Card Header Status Banner */}
                          <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-[#1A2B3C]/50 ${
                            isLocked ? "bg-red-950/10 text-red-400" : "bg-[#00B894]/10 text-[#00B894]"
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {isLocked ? (
                                <>
                                  <Lock className="h-3.5 w-3.5" />
                                  <span>Predicciones Cerradas</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>Abierto para Predicciones</span>
                                </>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Cierre: {new Date(match.deadline).toLocaleString("es-CO", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>

                          <CardContent className="p-5 md:p-6 space-y-6">
                            {/* The Match Row - Centered and Balanced */}
                            <div className="flex items-center justify-center gap-4 max-w-xl mx-auto">
                              
                              {/* Team 1 (Local) - Flex End Alignment */}
                              <div className="flex items-center gap-3 justify-end flex-1 text-right min-w-0">
                                <span className="font-bold text-sm md:text-base text-white truncate">{match.team1?.name || "Clasificado"}</span>
                                {match.team1?.flag_url && !match.team1.name.includes("Clasificado") ? (
                                  <div className="relative w-10 h-7 shrink-0 border border-[#1A2B3C] rounded-lg overflow-hidden shadow-sm">
                                    <img
                                      src={match.team1.flag_url}
                                      alt={match.team1.name}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-10 h-7 bg-[#1A2B3C]/50 shrink-0 border border-[#1A2B3C] rounded-lg text-gray-500 font-bold text-xs">
                                    ?
                                  </div>
                                )}
                              </div>

                              {/* Score Container (Inputs or Real Results) */}
                              <div className="flex items-center gap-3 justify-center shrink-0">
                                {match.is_finished ? (
                                  /* Match Finished: Show Real Score Comparison */
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-14 bg-gradient-to-br from-[#00B894]/20 to-[#0A0A0A] border border-[#00B894]/50 rounded-xl flex items-center justify-center text-2xl font-black text-[#00B894]">
                                      {match.team1_score}
                                    </div>
                                    <span className="text-gray-500 font-extrabold text-xs uppercase tracking-widest px-1">FT</span>
                                    <div className="w-16 h-14 bg-gradient-to-br from-[#00B894]/20 to-[#0A0A0A] border border-[#00B894]/50 rounded-xl flex items-center justify-center text-2xl font-black text-[#00B894]">
                                      {match.team2_score}
                                    </div>
                                  </div>
                                ) : (
                                  /* Active or Locked match: Show Input boxes with better size and padding */
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      disabled={isLocked}
                                      placeholder="0"
                                      className="w-16 h-14 text-center text-2xl font-extrabold bg-[#0A0A0A] border-[#1A2B3C] text-white focus:border-[#D4AF37] focus:ring-0 disabled:opacity-90 rounded-xl shadow-inner"
                                      value={pred.score_local ?? ""}
                                      onChange={(e) => handleScoreChange(match.id, "local", e.target.value)}
                                      onBlur={(e) => {
                                        if (pred.score_local !== undefined) {
                                          handleScoreChange(match.id, "local", String(pred.score_local));
                                        }
                                      }}
                                    />
                                    <span className="text-gray-600 font-bold px-1 text-xs uppercase tracking-wider">vs</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      disabled={isLocked}
                                      placeholder="0"
                                      className="w-16 h-14 text-center text-2xl font-extrabold bg-[#0A0A0A] border-[#1A2B3C] text-white focus:border-[#D4AF37] focus:ring-0 disabled:opacity-90 rounded-xl shadow-inner"
                                      value={pred.score_visitor ?? ""}
                                      onChange={(e) => handleScoreChange(match.id, "visitor", e.target.value)}
                                      onBlur={(e) => {
                                        if (pred.score_visitor !== undefined) {
                                          handleScoreChange(match.id, "visitor", String(pred.score_visitor));
                                        }
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Team 2 (Visitor) - Flex Start Alignment */}
                              <div className="flex items-center gap-3 justify-start flex-1 min-w-0">
                                {match.team2?.flag_url && !match.team2.name.includes("Clasificado") ? (
                                  <div className="relative w-10 h-7 shrink-0 border border-[#1A2B3C] rounded-lg overflow-hidden shadow-sm">
                                    <img
                                      src={match.team2.flag_url}
                                      alt={match.team2.name}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-10 h-7 bg-[#1A2B3C]/50 shrink-0 border border-[#1A2B3C] rounded-lg text-gray-500 font-bold text-xs">
                                    ?
                                  </div>
                                )}
                                <span className="font-bold text-sm md:text-base text-white truncate">{match.team2?.name || "Clasificado"}</span>
                              </div>
                            </div>

                            {/* Finished Match Stats (User prediction & points display) */}
                            {match.is_finished && (
                              <div className="max-w-md mx-auto p-4 bg-[#0A0A0A]/50 border border-[#1A2B3C]/30 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="text-center sm:text-left">
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Tu Pronóstico</span>
                                  <span className="text-sm font-extrabold text-white">
                                    {pred.score_local !== undefined && pred.score_visitor !== undefined 
                                      ? `${pred.score_local} - ${pred.score_visitor}` 
                                      : "No pronosticado"}
                                  </span>
                                </div>
                                
                                {(() => {
                                  if (pred.score_local === undefined || pred.score_visitor === undefined) return null;
                                  
                                  // Points calc
                                  const isExact = pred.score_local === match.team1_score && pred.score_visitor === match.team2_score;
                                  const realWinner = match.team1_score! > match.team2_score! ? "local" : match.team1_score! < match.team2_score! ? "visitor" : "draw";
                                  const predWinner = pred.score_local > pred.score_visitor ? "local" : pred.score_local < pred.score_visitor ? "visitor" : "draw";
                                  const isCorrectResult = realWinner === predWinner;
                                  const isCorrectWinner = pred.winner_id === match.winner_id;
                                  
                                  let points = 0;
                                  let label = "Resultado Incorrecto";
                                  let labelColor = "text-red-400 bg-red-950/20 border-red-900/30";
                                  
                                  if (isExact) {
                                    points = 5;
                                    label = "Marcador Exacto";
                                    labelColor = "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30";
                                  } else {
                                    if (isCorrectResult) points += 3;
                                    if (isCorrectWinner && match.winner_id) points += 2;
                                    
                                    if (points > 0) {
                                      label = isCorrectResult && isCorrectWinner ? "Resultado + Clasificado" : isCorrectResult ? "Resultado Ganador" : "Solo Clasificado";
                                      labelColor = "text-[#00B894] bg-[#00B894]/10 border-[#00B894]/30";
                                    }
                                  }

                                  return (
                                    <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs font-bold ${labelColor}`}>
                                      <span>{label}</span>
                                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                      <span>+{points} Puntos</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Winner Selection (Advancing Team) with improved vertical padding */}
                            <div className="flex flex-col items-center gap-3 pt-5 mt-2 border-t border-[#1A2B3C]/30">
                              <Label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">
                                {isDraw ? "Definición (Equipo que Avanza)" : "Clasificado Predicho"}
                              </Label>
                              <div className="flex gap-3 mt-1">
                                <button
                                  type="button"
                                  disabled={isLocked || (pred.score_local !== undefined && pred.score_visitor !== undefined && pred.score_local < pred.score_visitor)}
                                  onClick={() => handleWinnerSelect(match.id, match.team1_id)}
                                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                                    pred.winner_id === match.team1_id
                                      ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.15)]"
                                      : "bg-[#0A0A0A] text-gray-400 border-[#1A2B3C] hover:border-gray-500"
                                  } disabled:opacity-50`}
                                >
                                  {match.team1?.name || "Local"} avanza
                                </button>
                                <button
                                  type="button"
                                  disabled={isLocked || (pred.score_local !== undefined && pred.score_visitor !== undefined && pred.score_local > pred.score_visitor)}
                                  onClick={() => handleWinnerSelect(match.id, match.team2_id)}
                                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                                    pred.winner_id === match.team2_id
                                      ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.15)]"
                                      : "bg-[#0A0A0A] text-gray-400 border-[#1A2B3C] hover:border-gray-500"
                                  } disabled:opacity-50`}
                                >
                                  {match.team2?.name || "Visitante"} avanza
                                </button>
                              </div>
                            </div>

                            {/* Action Panel */}
                            {!isLocked && (
                              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A2B3C]/30">
                                {successMatchId === match.id && (
                                  <div className="flex items-center gap-1.5 text-xs text-[#00B894] font-medium bg-[#00B894]/10 py-1.5 px-3 rounded-lg border border-[#00B894]/30 animate-in fade-in duration-300">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Predicción guardada</span>
                                  </div>
                                )}
                                {isPredictionSaved(match.id) ? (
                                  <Button
                                    type="button"
                                    onClick={() => savePredictionForMatch(match.id)}
                                    className="bg-[#00B894] hover:bg-[#00B894]/90 text-white font-bold flex items-center gap-1.5 px-4 rounded-xl py-5 shadow-lg shadow-[#00B894]/10 transition-colors"
                                    disabled={savingMatchId === match.id}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    {savingMatchId === match.id ? "Guardando..." : "Guardado"}
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    onClick={() => savePredictionForMatch(match.id)}
                                    className="bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold flex items-center gap-1.5 px-4 rounded-xl py-5 shadow-lg shadow-[#D4AF37]/10 transition-colors"
                                    disabled={savingMatchId === match.id}
                                  >
                                    <Save className="h-4 w-4" />
                                    {savingMatchId === match.id ? "Guardando..." : "Guardar Pronóstico"}
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ));
          })()
        )}
      </div>

      {/* Bonus predictions section (Only on Round of 32 predictions page) */}
      {round === "round_32" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-[#1A2B3C] bg-[#121212] text-white premium-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#D4AF37] flex items-center gap-2">
                <Award className="h-5 w-5" />
                Predicciones Especiales: Campeón y Finalistas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Elige al Campeón y los Finalistas antes de que empiece la ronda de dieciseisavos (28 de Junio) para ganar bonificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isBeforeBonusDeadline ? (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-sm text-red-400">
                  Las predicciones bonus ya se encuentran cerradas.
                </div>
              ) : (
                <form onSubmit={saveBonusPredictions} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Champion selection */}
                    <div className="space-y-2">
                      <Label htmlFor="champion" className="text-gray-300">Campeón del Mundo (+10 pts)</Label>
                      <select
                        id="champion"
                        value={bonusChampion}
                        onChange={(e) => setBonusChampion(e.target.value)}
                        disabled={isAdmin}
                        className="w-full p-3 rounded-lg border border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 outline-none text-sm disabled:opacity-60"
                      >
                        <option value="">Selecciona Campeón...</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Finalist 1 selection */}
                    <div className="space-y-2">
                      <Label htmlFor="finalist1" className="text-gray-300">Finalista 1 (+5 pts)</Label>
                      <select
                        id="finalist1"
                        value={bonusFinalist1}
                        onChange={(e) => setBonusFinalist1(e.target.value)}
                        disabled={isAdmin}
                        className="w-full p-3 rounded-lg border border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 outline-none text-sm disabled:opacity-60"
                      >
                        <option value="">Selecciona Finalista 1...</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Finalist 2 selection */}
                    <div className="space-y-2">
                      <Label htmlFor="finalist2" className="text-gray-300">Finalista 2 (+5 pts)</Label>
                      <select
                        id="finalist2"
                        value={bonusFinalist2}
                        onChange={(e) => setBonusFinalist2(e.target.value)}
                        disabled={isAdmin}
                        className="w-full p-3 rounded-lg border border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 outline-none text-sm disabled:opacity-60"
                      >
                        <option value="">Selecciona Finalista 2...</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A2B3C]/40">
                    {successBonus && (
                      <div className="flex items-center gap-1.5 text-xs text-[#00B894] font-medium bg-[#00B894]/10 py-1.5 px-3 rounded-lg border border-[#00B894]/30 animate-in fade-in duration-300">
                        <CheckCircle className="h-4 w-4" />
                        <span>Predicciones bonus guardadas</span>
                      </div>
                    )}
                    {!isAdmin && (
                      <Button
                        type="submit"
                        className="bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold flex items-center gap-1.5 px-4"
                        disabled={savingBonus}
                      >
                        <Save className="h-4 w-4" />
                        {savingBonus ? "Guardando..." : "Guardar Predicciones Bonus"}
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {errorMsg && (
        <div className="fixed bottom-6 right-6 p-4 bg-red-950/90 border border-red-500 rounded-lg text-sm text-red-200 flex items-center gap-2 shadow-2xl z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
