"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Lock, 
  Clock, 
  HelpCircle, 
  Check, 
  AlertCircle,
  X
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPrediction } from "@/lib/actions";

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

interface BracketViewProps {
  matches: Match[];
  initialPredictions: Prediction[];
}

const ROUND_NAMES: Record<string, string> = {
  round_32: "Dieciseisavos de Final (R32)",
  round_16: "Octavos de Final (R16)",
  quarter: "Cuartos de Final",
  semi: "Semifinales",
  third_place: "Tercer Lugar",
  final: "Gran Final",
};

export default function BracketView({ matches, initialPredictions }: BracketViewProps) {
  const [predictions, setPredictions] = useState<Record<string, Partial<Prediction>>>(() => {
    const map: Record<string, Partial<Prediction>> = {};
    initialPredictions.forEach((pred) => {
      map[pred.match_id] = pred;
    });
    return map;
  });

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalLocalScore, setModalLocalScore] = useState("");
  const [modalVisitorScore, setModalVisitorScore] = useState("");
  const [modalWinnerId, setModalWinnerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group matches by round
  const r32 = matches.filter((m) => m.round === "round_32");
  const r16 = matches.filter((m) => m.round === "round_16");
  const quarters = matches.filter((m) => m.round === "quarter");
  const semis = matches.filter((m) => m.round === "semi");
  const finals = matches.filter((m) => m.round === "final");
  const thirdPlace = matches.filter((m) => m.round === "third_place")[0];

  const handleOpenPredictionModal = (match: Match) => {
    const pred = predictions[match.id] || {};
    setSelectedMatch(match);
    setModalLocalScore(pred.score_local !== undefined ? String(pred.score_local) : "");
    setModalVisitorScore(pred.score_visitor !== undefined ? String(pred.score_visitor) : "");
    setModalWinnerId(pred.winner_id || "");
    setErrorMsg(null);
  };

  const handleSaveModalPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    const localScoreNum = parseInt(modalLocalScore, 10);
    const visitorScoreNum = parseInt(modalVisitorScore, 10);

    if (isNaN(localScoreNum) || isNaN(visitorScoreNum) || !modalWinnerId) {
      setErrorMsg("Completa los goles y selecciona qué equipo clasifica.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await submitPrediction(selectedMatch.id, localScoreNum, visitorScoreNum, modalWinnerId);
      
      // Update local state
      setPredictions((prev) => ({
        ...prev,
        [selectedMatch.id]: {
          match_id: selectedMatch.id,
          score_local: localScoreNum,
          score_visitor: visitorScoreNum,
          winner_id: modalWinnerId,
        },
      }));

      setSelectedMatch(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al guardar predicción");
    } finally {
      setIsSaving(false);
    }
  };

  const renderMatchNode = (match: Match) => {
    const pred = predictions[match.id];
    const isLocked = new Date() > new Date(match.deadline) || match.is_finished;
    const isPredicted = !!pred;

    return (
      <div
        key={match.id}
        onClick={() => handleOpenPredictionModal(match)}
        className="w-48 bg-[#121212] border border-[#1A2B3C] rounded-lg overflow-hidden cursor-pointer hover:border-[#D4AF37] hover:scale-[1.03] transition-all duration-200 shadow-lg shrink-0"
      >
        {/* Node Header */}
        <div className={`px-2 py-1 text-[9px] font-bold flex items-center justify-between border-b border-[#1A2B3C]/50 ${
          isLocked ? "bg-red-950/20 text-red-400" : "bg-[#00B894]/10 text-[#00B894]"
        }`}>
          <span>{isLocked ? "Cerrado" : "Abierto"}</span>
          {isPredicted && <span className="text-[#D4AF37]">Pronosticado</span>}
        </div>

        {/* Node Content */}
        <div className="p-2.5 space-y-1.5 text-xs">
          {/* Team 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate max-w-[120px]">
              {match.team1?.flag_url ? (
                <img src={match.team1.flag_url} className="w-4.5 h-3 border border-gray-800 rounded-sm" />
              ) : (
                <div className="w-4.5 h-3 bg-white/5 border border-gray-800 rounded-sm" />
              )}
              <span className={`truncate font-semibold ${pred?.winner_id === match.team1_id ? "text-[#D4AF37]" : "text-gray-300"}`}>
                {match.team1?.name || "Por definir"}
              </span>
            </div>
            <span className="font-bold text-gray-300">
              {isPredicted ? pred.score_local : match.team1_score ?? "-"}
            </span>
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate max-w-[120px]">
              {match.team2?.flag_url ? (
                <img src={match.team2.flag_url} className="w-4.5 h-3 border border-gray-800 rounded-sm" />
              ) : (
                <div className="w-4.5 h-3 bg-white/5 border border-gray-800 rounded-sm" />
              )}
              <span className={`truncate font-semibold ${pred?.winner_id === match.team2_id ? "text-[#D4AF37]" : "text-gray-300"}`}>
                {match.team2?.name || "Por definir"}
              </span>
            </div>
            <span className="font-bold text-gray-300">
              {isPredicted ? pred.score_visitor : match.team2_score ?? "-"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#D4AF37]">Bracket del Torneo</h1>
        <p className="text-sm text-gray-400 mt-1">
          Visualiza el bracket interactivo. Haz clic en cualquier partido para ver o realizar tu predicción.
        </p>
      </div>

      {/* Horizontally scrollable bracket viewport */}
      <div className="overflow-x-auto pb-8 pt-4 select-none scrollbar-thin scrollbar-thumb-[#1A2B3C]">
        <div className="flex gap-12 w-max px-4 h-[840px]">
          {/* Column 1: Round of 32 */}
          <div className="flex flex-col justify-around h-full">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-[#D4AF37] mb-2 border-b border-[#1A2B3C] pb-1">
              Dieciseisavos
            </div>
            {r32.length > 0 ? (
              r32.map((m) => renderMatchNode(m))
            ) : (
              Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-48 h-16 bg-[#121212]/30 border border-dashed border-[#1A2B3C]/50 rounded-lg flex items-center justify-center text-gray-600 text-xs">
                  Partido R32
                </div>
              ))
            )}
          </div>

          {/* Column 2: Round of 16 */}
          <div className="flex flex-col justify-around h-full">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-[#D4AF37] mb-2 border-b border-[#1A2B3C] pb-1">
              Octavos de Final
            </div>
            {r16.length > 0 ? (
              r16.map((m) => renderMatchNode(m))
            ) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-48 h-16 bg-[#121212]/30 border border-dashed border-[#1A2B3C]/50 rounded-lg flex items-center justify-center text-gray-600 text-xs">
                  Partido R16
                </div>
              ))
            )}
          </div>

          {/* Column 3: Quarterfinals */}
          <div className="flex flex-col justify-around h-full">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-[#D4AF37] mb-2 border-b border-[#1A2B3C] pb-1">
              Cuartos de Final
            </div>
            {quarters.length > 0 ? (
              quarters.map((m) => renderMatchNode(m))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-48 h-16 bg-[#121212]/30 border border-dashed border-[#1A2B3C]/50 rounded-lg flex items-center justify-center text-gray-600 text-xs">
                  Cuartos
                </div>
              ))
            )}
          </div>

          {/* Column 4: Semifinals */}
          <div className="flex flex-col justify-around h-full">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-[#D4AF37] mb-2 border-b border-[#1A2B3C] pb-1">
              Semifinales
            </div>
            {semis.length > 0 ? (
              semis.map((m) => renderMatchNode(m))
            ) : (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="w-48 h-16 bg-[#121212]/30 border border-dashed border-[#1A2B3C]/50 rounded-lg flex items-center justify-center text-gray-600 text-xs">
                  Semifinal
                </div>
              ))
            )}
          </div>

          {/* Column 5: Gran Final & 3rd Place */}
          <div className="flex flex-col justify-center gap-16 h-full">
            {/* Finals */}
            <div className="space-y-4">
              <div className="text-center font-bold text-xs uppercase tracking-wider text-[#D4AF37] border-b border-[#1A2B3C] pb-1">
                Gran Final
              </div>
              {finals.length > 0 ? (
                finals.map((m) => renderMatchNode(m))
              ) : (
                <div className="w-48 h-16 bg-[#121212]/30 border border-dashed border-[#1A2B3C]/50 rounded-lg flex items-center justify-center text-gray-600 text-xs">
                  Final
                </div>
              )}
            </div>

            {/* Third Place Match */}
            {thirdPlace && (
              <div className="space-y-4">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-[#00B894] border-b border-[#1A2B3C] pb-1">
                  Tercer Puesto
                </div>
                {renderMatchNode(thirdPlace)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Modal Dialog */}
      <Dialog.Root open={selectedMatch !== null} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-all" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0A0A0A] border border-[#1A2B3C] rounded-2xl shadow-2xl p-6 z-50 text-white animate-in fade-in zoom-in-95 duration-200 outline-none">
            {selectedMatch && (
              <form onSubmit={handleSaveModalPrediction} className="space-y-6">
                {/* Modal Title */}
                <div className="flex justify-between items-center pb-3 border-b border-[#1A2B3C]">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-[#D4AF37]">
                      {ROUND_NAMES[selectedMatch.round]}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-gray-400 mt-1">
                      {new Date(selectedMatch.match_datetime).toLocaleString("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button type="button" className="p-1 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Info Deadline Banner */}
                {(() => {
                  const isLocked = new Date() > new Date(selectedMatch.deadline) || selectedMatch.is_finished;
                  return (
                    <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                      isLocked ? "bg-red-950/20 border-red-500/30 text-red-400" : "bg-[#00B894]/10 border-[#00B894]/30 text-[#00B894]"
                    }`}>
                      {isLocked ? <Lock className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
                      <span>
                        {isLocked 
                          ? "Las predicciones para este partido se encuentran cerradas."
                          : `Tienes hasta 1 hora antes del partido para cambiar tu marcador.`
                        }
                      </span>
                    </div>
                  );
                })()}

                {/* Score inputs form */}
                <div className="flex items-center justify-between gap-6 py-2">
                  {/* Team 1 */}
                  <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                    {selectedMatch.team1?.flag_url ? (
                      <img src={selectedMatch.team1.flag_url} className="w-12 h-8 border border-gray-800 rounded shadow" />
                    ) : (
                      <div className="w-12 h-8 bg-[#1A2B3C] border border-gray-800 rounded" />
                    )}
                    <span className="font-bold text-xs block truncate max-w-[100px] text-gray-300">
                      {selectedMatch.team1?.name || "Clasificado"}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      disabled={new Date() > new Date(selectedMatch.deadline) || selectedMatch.is_finished}
                      placeholder="0"
                      className="w-16 h-12 text-center text-xl font-bold bg-[#121212] border-[#1A2B3C] text-white focus:border-[#D4AF37] focus:ring-0 disabled:opacity-85"
                      value={modalLocalScore}
                      onChange={(e) => {
                        setModalLocalScore(e.target.value);
                        // Auto winner selection
                        const otherScore = parseInt(modalVisitorScore, 10);
                        const thisScore = parseInt(e.target.value, 10);
                        if (!isNaN(thisScore) && !isNaN(otherScore)) {
                          if (thisScore > otherScore) setModalWinnerId(selectedMatch.team1_id);
                          if (thisScore < otherScore) setModalWinnerId(selectedMatch.team2_id);
                        }
                      }}
                    />
                  </div>

                  <span className="text-gray-400 font-black text-lg shrink-0 mt-8">vs</span>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                    {selectedMatch.team2?.flag_url ? (
                      <img src={selectedMatch.team2.flag_url} className="w-12 h-8 border border-gray-800 rounded shadow" />
                    ) : (
                      <div className="w-12 h-8 bg-[#1A2B3C] border border-gray-800 rounded" />
                    )}
                    <span className="font-bold text-xs block truncate max-w-[100px] text-gray-300">
                      {selectedMatch.team2?.name || "Clasificado"}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      disabled={new Date() > new Date(selectedMatch.deadline) || selectedMatch.is_finished}
                      placeholder="0"
                      className="w-16 h-12 text-center text-xl font-bold bg-[#121212] border-[#1A2B3C] text-white focus:border-[#D4AF37] focus:ring-0 disabled:opacity-85"
                      value={modalVisitorScore}
                      onChange={(e) => {
                        setModalVisitorScore(e.target.value);
                        // Auto winner selection
                        const otherScore = parseInt(modalLocalScore, 10);
                        const thisScore = parseInt(e.target.value, 10);
                        if (!isNaN(thisScore) && !isNaN(otherScore)) {
                          if (otherScore > thisScore) setModalWinnerId(selectedMatch.team1_id);
                          if (otherScore < thisScore) setModalWinnerId(selectedMatch.team2_id);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Advancing Team Winner selection */}
                <div className="flex flex-col items-center gap-2 pt-4 border-t border-[#1A2B3C]/50">
                  <Label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    ¿Quién clasifica / avanza?
                  </Label>
                  <div className="flex gap-3 mt-1 w-full justify-center">
                    <button
                      type="button"
                      disabled={
                        new Date() > new Date(selectedMatch.deadline) || 
                        selectedMatch.is_finished ||
                        (modalLocalScore !== "" && modalVisitorScore !== "" && parseInt(modalLocalScore, 10) < parseInt(modalVisitorScore, 10))
                      }
                      onClick={() => setModalWinnerId(selectedMatch.team1_id)}
                      className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all w-1/2 ${
                        modalWinnerId === selectedMatch.team1_id
                          ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                          : "bg-[#121212] text-gray-400 border-[#1A2B3C] hover:border-gray-500"
                      }`}
                    >
                      {selectedMatch.team1?.name || "Local"}
                    </button>
                    <button
                      type="button"
                      disabled={
                        new Date() > new Date(selectedMatch.deadline) || 
                        selectedMatch.is_finished ||
                        (modalLocalScore !== "" && modalVisitorScore !== "" && parseInt(modalLocalScore, 10) > parseInt(modalVisitorScore, 10))
                      }
                      onClick={() => setModalWinnerId(selectedMatch.team2_id)}
                      className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all w-1/2 ${
                        modalWinnerId === selectedMatch.team2_id
                          ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                          : "bg-[#121212] text-gray-400 border-[#1A2B3C] hover:border-gray-500"
                      }`}
                    >
                      {selectedMatch.team2?.name || "Visitante"}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-500 bg-red-950/30 p-3 rounded-lg border border-red-500/50">
                    {errorMsg}
                  </p>
                )}

                {/* Save button */}
                <div className="flex gap-3 justify-end pt-3 border-t border-[#1A2B3C]">
                  <Dialog.Close asChild>
                    <Button type="button" variant="outline" className="border-[#1A2B3C] hover:bg-white/5">
                      Cancelar
                    </Button>
                  </Dialog.Close>
                  {!(new Date() > new Date(selectedMatch.deadline) || selectedMatch.is_finished) && (
                    <Button type="submit" disabled={isSaving} className="bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold">
                      {isSaving ? "Guardando..." : "Guardar Predicción"}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
