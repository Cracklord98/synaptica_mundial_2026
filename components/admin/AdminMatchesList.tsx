"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Check 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateMatchResult } from "@/lib/actions";

interface Team {
  id: string;
  name: string;
  flag_url: string | null;
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
  is_finished: boolean;
  team1: Team | null;
  team2: Team | null;
}

interface AdminMatchesListProps {
  matches: Match[];
  teams: Team[];
}

const ROUND_NAMES: Record<string, string> = {
  round_32: "Dieciseisavos de Final (R32)",
  round_16: "Octavos de Final (R16)",
  quarter: "Cuartos de Final",
  semi: "Semifinales",
  third_place: "Tercer Lugar",
  final: "Gran Final",
};

export default function AdminMatchesList({ matches, teams }: AdminMatchesListProps) {
  const router = useRouter();
  const [selectedRound, setSelectedRound] = useState("round_32");
  
  // Local editable state for scores, winner and teams per match
  const [matchesState, setMatchesState] = useState<Record<string, {
    t1_score: string;
    t2_score: string;
    winner_id: string;
    is_finished: boolean;
    t1_id: string;
    t2_id: string;
  }>>(() => {
    const map: Record<string, any> = {};
    matches.forEach((m) => {
      map[m.id] = {
        t1_score: m.team1_score !== null ? String(m.team1_score) : "",
        t2_score: m.team2_score !== null ? String(m.team2_score) : "",
        winner_id: m.winner_id || "",
        is_finished: m.is_finished,
        t1_id: m.team1_id || "",
        t2_id: m.team2_id || "",
      };
    });
    return map;
  });

  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (
    matchId: string,
    field: "t1_score" | "t2_score" | "winner_id" | "is_finished" | "t1_id" | "t2_id",
    value: any
  ) => {
    setMatchesState((prev) => {
      const existing = prev[matchId] || { t1_score: "", t2_score: "", winner_id: "", is_finished: false, t1_id: "", t2_id: "" };
      const updated = { ...existing, [field]: value };
      
      // Auto-set winner_id if not a draw
      if (field === "t1_score" || field === "t2_score") {
        const t1 = parseInt(field === "t1_score" ? value : updated.t1_score, 10);
        const t2 = parseInt(field === "t2_score" ? value : updated.t2_score, 10);
        if (!isNaN(t1) && !isNaN(t2)) {
          if (t1 > t2) updated.winner_id = updated.t1_id;
          else if (t1 < t2) updated.winner_id = updated.t2_id;
        }
      }
      
      return { ...prev, [matchId]: updated };
    });
  };

  const handleSaveMatch = async (matchId: string) => {
    const state = matchesState[matchId];
    if (!state) return;

    setSavingId(matchId);
    setErrorMsg(null);
    setSuccessId(null);

    const score1 = state.t1_score === "" ? null : parseInt(state.t1_score, 10);
    const score2 = state.t2_score === "" ? null : parseInt(state.t2_score, 10);
    const winnerId = state.winner_id === "" ? null : state.winner_id;
    const t1Id = state.t1_id === "" ? null : state.t1_id;
    const t2Id = state.t2_id === "" ? null : state.t2_id;

    if (state.is_finished && (score1 === null || score2 === null || !winnerId)) {
      setErrorMsg("Para finalizar un partido, debes ingresar marcadores válidos y elegir al ganador.");
      setSavingId(null);
      return;
    }

    try {
      await updateMatchResult(matchId, t1Id, t2Id, score1, score2, winnerId, state.is_finished);
      setSuccessId(matchId);
      router.refresh();
      setTimeout(() => setSuccessId(null), 2500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al guardar el partido");
    } finally {
      setSavingId(null);
    }
  };

  const filteredMatches = matches.filter((m) => m.round === selectedRound);

  return (
    <div className="space-y-6">
      {/* Round filter tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1A2B3C] pb-2">
        {Object.entries(ROUND_NAMES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedRound(key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              selectedRound === key
                ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                : "bg-[#121212] text-gray-400 border-[#1A2B3C] hover:border-gray-500 hover:text-white"
            }`}
          >
            {label.split(" (")[0]}
          </button>
        ))}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-sm text-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Matches editable list */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center bg-[#121212] border border-[#1A2B3C] rounded-xl text-gray-500 text-sm">
            No hay partidos creados en esta ronda.
          </div>
        ) : (
          filteredMatches.map((match) => {
            const state = matchesState[match.id] || { t1_score: "", t2_score: "", winner_id: "", is_finished: false, t1_id: "", t2_id: "" };
            const isDraw = state.t1_score !== "" && state.t2_score !== "" && parseInt(state.t1_score, 10) === parseInt(state.t2_score, 10);

            const getTeamName = (id: string) => {
              if (!id) return "TBD";
              const team = teams.find((t) => t.id === id);
              return team ? team.name : "TBD";
            };

            return (
              <Card key={match.id} className="border-[#1A2B3C] bg-[#121212] text-white premium-card overflow-hidden">
                <CardContent className="p-5 flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Teams & Scores Inputs */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full lg:w-auto">
                    {/* Team 1 Selector */}
                    <div className="flex items-center gap-2">
                      {state.t1_id && (
                        <img 
                          src={teams.find((t) => t.id === state.t1_id)?.flag_url || ""} 
                          className="w-6 h-4 border border-gray-800 rounded-sm shrink-0" 
                          alt=""
                        />
                      )}
                      <select
                        value={state.t1_id}
                        onChange={(e) => handleInputChange(match.id, "t1_id", e.target.value)}
                        className="bg-[#0A0A0A] border border-[#1A2B3C] text-xs font-bold text-white rounded p-1.5 w-36 focus:border-[#D4AF37] focus:ring-0 outline-none"
                      >
                        <option value="">-- Seleccionar Equipo 1 (TBD) --</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Inputs */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        min="0"
                        placeholder="-"
                        className="w-12 h-10 text-center font-bold bg-[#0A0A0A] border-[#1A2B3C]"
                        value={state.t1_score}
                        onChange={(e) => handleInputChange(match.id, "t1_score", e.target.value)}
                      />
                      <span className="text-gray-500 text-xs">vs</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="-"
                        className="w-12 h-10 text-center font-bold bg-[#0A0A0A] border-[#1A2B3C]"
                        value={state.t2_score}
                        onChange={(e) => handleInputChange(match.id, "t2_score", e.target.value)}
                      />
                    </div>

                    {/* Team 2 Selector */}
                    <div className="flex items-center gap-2">
                      <select
                        value={state.t2_id}
                        onChange={(e) => handleInputChange(match.id, "t2_id", e.target.value)}
                        className="bg-[#0A0A0A] border border-[#1A2B3C] text-xs font-bold text-white rounded p-1.5 w-36 focus:border-[#D4AF37] focus:ring-0 outline-none"
                      >
                        <option value="">-- Seleccionar Equipo 2 (TBD) --</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      {state.t2_id && (
                        <img 
                          src={teams.find((t) => t.id === state.t2_id)?.flag_url || ""} 
                          className="w-6 h-4 border border-gray-800 rounded-sm shrink-0" 
                          alt=""
                        />
                      )}
                    </div>
                  </div>

                  {/* Winner Selector */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Avanza</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleInputChange(match.id, "winner_id", state.t1_id)}
                        disabled={!state.t1_id}
                        className={`px-3 py-1 rounded text-xs font-bold border truncate max-w-[100px] ${
                          state.winner_id === state.t1_id && state.t1_id
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "bg-[#0A0A0A] text-gray-400 border-[#1A2B3C] disabled:opacity-50"
                        }`}
                      >
                        {getTeamName(state.t1_id)}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange(match.id, "winner_id", state.t2_id)}
                        disabled={!state.t2_id}
                        className={`px-3 py-1 rounded text-xs font-bold border truncate max-w-[100px] ${
                          state.winner_id === state.t2_id && state.t2_id
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "bg-[#0A0A0A] text-gray-400 border-[#1A2B3C] disabled:opacity-50"
                        }`}
                      >
                        {getTeamName(state.t2_id)}
                      </button>
                    </div>
                  </div>

                  {/* Finished Checkbox */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      id={`finished-${match.id}`}
                      checked={state.is_finished}
                      onChange={(e) => handleInputChange(match.id, "is_finished", e.target.checked)}
                      className="rounded border-[#1A2B3C] bg-[#0A0A0A] text-[#D4AF37] focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                    <Label htmlFor={`finished-${match.id}`} className="text-xs text-gray-300 font-semibold cursor-pointer">
                      Finalizado
                    </Label>
                  </div>

                  {/* Save button */}
                  <div className="flex items-center gap-2 shrink-0 justify-end w-full md:w-auto border-t md:border-t-0 border-[#1A2B3C]/30 pt-3 md:pt-0">
                    {successId === match.id && (
                      <span className="text-xs text-[#00B894] flex items-center gap-1 font-medium bg-[#00B894]/10 py-1 px-2.5 rounded">
                        <Check className="h-3.5 w-3.5" /> Guardado
                      </span>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleSaveMatch(match.id)}
                      disabled={savingId === match.id}
                      className="bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold h-9 flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      {savingId === match.id ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
