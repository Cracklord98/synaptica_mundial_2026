"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Lock, 
  Clock, 
  HelpCircle, 
  Check, 
  AlertCircle,
  X,
  Calendar,
  ChevronRight,
  Eye
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
  isAdmin?: boolean;
}

const ROUND_KEYS = ["round_32", "round_16", "quarter", "semi", "final"];

const ROUND_NAMES: Record<string, string> = {
  round_32: "Dieciseisavos de Final (R32)",
  round_16: "Octavos de Final (R16)",
  quarter: "Cuartos de Final",
  semi: "Semifinales",
  third_place: "Tercer Lugar",
  final: "Gran Final",
};

const ROUND_LABELS: Record<string, string> = {
  round_32: "Dieciseisavos",
  round_16: "Octavos",
  quarter: "Cuartos",
  semi: "Semifinales",
  final: "Final",
};

interface RoundConnectorProps {
  fromCount: number;
}

function RoundConnector({ fromCount }: RoundConnectorProps) {
  const toCount = fromCount / 2;
  const paths = [];

  for (let j = 0; j < toCount; j++) {
    const yLeftTop = ((2 * j + 0.5) / fromCount) * 100;
    const yLeftBottom = ((2 * j + 1.5) / fromCount) * 100;
    const yRight = ((j + 0.5) / toCount) * 100;

    paths.push(
      <path
        key={j}
        d={`M 0 ${yLeftTop} L 50 ${yLeftTop} L 50 ${yLeftBottom} L 0 ${yLeftBottom} M 50 ${yRight} L 100 ${yRight}`}
        vectorEffect="non-scaling-stroke"
      />
    );
  }

  return (
    <div className="flex flex-col h-full w-10 shrink-0 select-none">
      <div className="h-[28px] mb-4" /> {/* Header spacer */}
      <div className="flex-1 relative">
        <svg
          className="absolute inset-0 w-full h-full stroke-slate-700/50 hover:stroke-[#D4AF37]/40 transition-colors duration-350"
          strokeWidth="1.5"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {paths}
        </svg>
      </div>
    </div>
  );
}

export default function BracketView({ matches, initialPredictions, isAdmin = false }: BracketViewProps) {
  const [predictions, setPredictions] = useState<Record<string, Partial<Prediction>>>(() => {
    const map: Record<string, Partial<Prediction>> = {};
    initialPredictions.forEach((pred) => {
      map[pred.match_id] = pred;
    });
    return map;
  });

  const [activeMobileTab, setActiveMobileTab] = useState<string>("round_32");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalLocalScore, setModalLocalScore] = useState("");
  const [modalVisitorScore, setModalVisitorScore] = useState("");
  const [modalWinnerId, setModalWinnerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"bracket" | "grid">("bracket");

  const isModalMatchLocked = selectedMatch ? (new Date() > new Date(selectedMatch.deadline) || selectedMatch.is_finished || isAdmin) : false;

  // Group matches by round
  const r32 = matches.filter((m) => m.round === "round_32");
  const r16 = matches.filter((m) => m.round === "round_16");
  const quarters = matches.filter((m) => m.round === "quarter");
  const semis = matches.filter((m) => m.round === "semi");
  const finals = matches.filter((m) => m.round === "final");
  const thirdPlace = matches.filter((m) => m.round === "third_place")[0];

  const getProgress = (roundKey: string) => {
    const roundMatches = matches.filter((m) => m.round === roundKey);
    const predicted = roundMatches.filter((m) => !!predictions[m.id]).length;
    return { predicted, total: roundMatches.length };
  };

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

    // Standardize leading zeros
    const cleanLocal = modalLocalScore === "" ? "" : parseInt(modalLocalScore, 10).toString();
    const cleanVisitor = modalVisitorScore === "" ? "" : parseInt(modalVisitorScore, 10).toString();

    const localScoreNum = parseInt(cleanLocal, 10);
    const visitorScoreNum = parseInt(cleanVisitor, 10);

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
  };  // Render a match card
  const renderMatchCard = (match: Match, mode: "full" | "compact" | "node" = "full") => {
    const pred = predictions[match.id];
    const isLocked = new Date() > new Date(match.deadline) || match.is_finished || isAdmin;
    const isPredicted = !!pred;

    // Mode 1: node (Ultra-compact Bracket Node Card for desktop tree)
    if (mode === "node") {
      return (
        <motion.div
          key={match.id}
          whileHover={{ scale: isLocked ? 1 : 1.02 }}
          onClick={() => handleOpenPredictionModal(match)}
          className={`relative w-52 bg-[#0c102b]/95 border ${
            isPredicted 
              ? "border-[#D4AF37]/50 shadow-[0_2px_8px_rgba(212,175,55,0.05)]" 
              : "border-slate-800"
          } rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37] transition-all duration-200 select-none z-10 flex flex-col justify-center h-[68px]`}
        >
          {/* Left indicator bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            isLocked ? "bg-red-500/50" : isPredicted ? "bg-[#D4AF37]" : "bg-[#00B894]/70"
          }`} />

          {/* Body */}
          <div className="pl-3.5 pr-2.5 py-2 space-y-1">
            {/* Team 1 */}
            <div className="flex items-center justify-between gap-2.5 text-[10px]">
              <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                {match.team1?.flag_url && !match.team1.name.includes("Clasificado") ? (
                  <img src={match.team1.flag_url} className="w-5 h-3.5 border border-slate-950/60 rounded-sm object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-3.5 bg-slate-900/50 border border-slate-850 rounded-sm flex items-center justify-center text-[7px] text-gray-500 font-bold shrink-0">?</div>
                )}
                <span className={`truncate font-semibold ${pred?.winner_id === match.team1_id ? "text-[#D4AF37]" : "text-slate-300"}`}>
                  {match.team1?.name || "Por definir"}
                </span>
              </div>
              <div className="font-bold shrink-0">
                {match.is_finished ? (
                  <span className="text-[#00B894] bg-[#00B894]/10 px-1 rounded">{match.team1_score}</span>
                ) : isPredicted ? (
                  <span className="text-white bg-slate-800/80 px-1 rounded">{pred.score_local}</span>
                ) : (
                  <span className="text-slate-600 px-0.5">-</span>
                )}
              </div>
            </div>

            {/* Team 2 */}
            <div className="flex items-center justify-between gap-2.5 text-[10px]">
              <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                {match.team2?.flag_url && !match.team2.name.includes("Clasificado") ? (
                  <img src={match.team2.flag_url} className="w-5 h-3.5 border border-slate-950/60 rounded-sm object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-3.5 bg-slate-900/50 border border-slate-850 rounded-sm flex items-center justify-center text-[7px] text-gray-500 font-bold shrink-0">?</div>
                )}
                <span className={`truncate font-semibold ${pred?.winner_id === match.team2_id ? "text-[#D4AF37]" : "text-slate-300"}`}>
                  {match.team2?.name || "Por definir"}
                </span>
              </div>
              <div className="font-bold shrink-0">
                {match.is_finished ? (
                  <span className="text-[#00B894] bg-[#00B894]/10 px-1 rounded">{match.team2_score}</span>
                ) : isPredicted ? (
                  <span className="text-white bg-slate-800/80 px-1 rounded">{pred.score_visitor}</span>
                ) : (
                  <span className="text-slate-600 px-0.5">-</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Mode 2: compact (Mobile Compact Card)
    if (mode === "compact") {
      return (
        <motion.div
          key={match.id}
          whileTap={{ scale: isLocked ? 1 : 0.98 }}
          onClick={() => handleOpenPredictionModal(match)}
          className={`w-full max-w-[280px] bg-[#0c102b]/95 border ${
            isPredicted 
              ? "border-[#D4AF37]/50 shadow-[0_2px_10px_rgba(212,175,55,0.05)]" 
              : "border-slate-800/80"
          } rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37]/60 transition-all duration-200 select-none`}
        >
          {/* Compact Header */}
          <div className={`px-2.5 py-1 text-[9px] font-extrabold flex items-center justify-between border-b border-slate-900/60 ${
            isLocked ? "bg-red-950/5 text-red-400" : "bg-[#00B894]/5 text-[#00B894]"
          }`}>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? "bg-red-500" : "bg-[#00B894] animate-pulse"}`} />
              <span className="uppercase tracking-wider text-[8px] font-bold">
                {isLocked ? "Cerrado" : "Abierto"}
              </span>
            </div>
            {isPredicted && (
              <span className="text-[#D4AF37] text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5">
                <Check className="h-2.5 w-2.5" /> Prono
              </span>
            )}
          </div>

          {/* Compact Content */}
          <div className="p-2.5 space-y-1.5 text-xs">
            {/* Team 1 */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                {match.team1?.flag_url && !match.team1.name.includes("Clasificado") ? (
                  <img src={match.team1.flag_url} className="w-5 h-3.5 border border-slate-950 rounded-sm object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-3.5 bg-slate-900/50 border border-slate-800 rounded-sm flex items-center justify-center text-[7px] text-gray-500 font-bold shrink-0">?</div>
                )}
                <span className={`truncate font-medium text-[11px] ${pred?.winner_id === match.team1_id ? "text-[#D4AF37] font-semibold" : "text-slate-300"}`}>
                  {match.team1?.name || "Por definir"}
                </span>
              </div>
              <div className="flex items-center text-[11px]">
                {match.is_finished ? (
                  <span className="font-extrabold text-[#00B894] bg-[#00B894]/10 px-1.5 rounded">{match.team1_score}</span>
                ) : isPredicted ? (
                  <span className="font-bold text-white bg-slate-800/80 px-1.5 rounded">{pred.score_local}</span>
                ) : (
                  <span className="text-slate-650 px-1">-</span>
                )}
              </div>
            </div>

            {/* Team 2 */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                {match.team2?.flag_url && !match.team2.name.includes("Clasificado") ? (
                  <img src={match.team2.flag_url} className="w-5 h-3.5 border border-slate-950 rounded-sm object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-3.5 bg-slate-900/50 border border-slate-800 rounded-sm flex items-center justify-center text-[7px] text-gray-500 font-bold shrink-0">?</div>
                )}
                <span className={`truncate font-medium text-[11px] ${pred?.winner_id === match.team2_id ? "text-[#D4AF37] font-semibold" : "text-slate-300"}`}>
                  {match.team2?.name || "Por definir"}
                </span>
              </div>
              <div className="flex items-center text-[11px]">
                {match.is_finished ? (
                  <span className="font-extrabold text-[#00B894] bg-[#00B894]/10 px-1.5 rounded">{match.team2_score}</span>
                ) : isPredicted ? (
                  <span className="font-bold text-white bg-slate-800/80 px-1.5 rounded">{pred.score_visitor}</span>
                ) : (
                  <span className="text-slate-650 px-1">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Finished real vs pred indicator */}
          {match.is_finished && isPredicted && (
            <div className="px-2.5 py-1 bg-slate-950/40 border-t border-slate-900/40 text-[8px] text-slate-500 flex justify-between font-semibold">
              <span>Tu pronóstico:</span>
              <span className="text-slate-400">{pred.score_local} - {pred.score_visitor}</span>
            </div>
          )}
        </motion.div>
      );
    }

    // Mode 3: full (Desktop Full Card View)
    return (
      <motion.div
        key={match.id}
        whileHover={{ scale: isLocked ? 1 : 1.03, y: isLocked ? 0 : -3 }}
        onClick={() => handleOpenPredictionModal(match)}
        className={`w-full max-w-[220px] bg-[#0c102b] border ${
          isPredicted 
            ? "border-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.06)]" 
            : "border-slate-800"
        } rounded-2xl overflow-hidden cursor-pointer hover:border-[#D4AF37] transition-all duration-300 shadow-xl shrink-0 select-none z-10`}
      >
        {/* Card Header */}
        <div className={`px-3.5 py-2 text-[10px] font-extrabold flex items-center justify-between border-b border-slate-900/50 ${
          isLocked ? "bg-red-950/10 text-red-400" : "bg-[#00B894]/10 text-[#00B894]"
         }`}>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLocked ? "bg-red-500" : "bg-[#00B894] animate-pulse"}`} />
            <span className="uppercase tracking-wider font-bold">
              {isLocked ? "Cerrado" : "Abierto"}
            </span>
          </div>
          {isPredicted && (
            <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded text-[9px] font-extrabold border border-[#D4AF37]/20 uppercase tracking-wider">
              Pronosticado
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3.5 space-y-3 text-xs">
          {/* Team 1 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate max-w-[130px]">
              {match.team1?.flag_url && !match.team1.name.includes("Clasificado") ? (
                <img src={match.team1.flag_url} className="w-6.5 h-4.5 border border-slate-950 rounded shadow object-cover shrink-0" />
              ) : (
                <div className="w-6.5 h-4.5 bg-slate-900/50 border border-slate-800 rounded flex items-center justify-center text-[8px] text-gray-500 font-bold shrink-0">?</div>
              )}
              <span className={`truncate font-semibold ${pred?.winner_id === match.team1_id ? "text-[#D4AF37]" : "text-slate-300"}`}>
                {match.team1?.name || "Por definir"}
              </span>
            </div>
            
            <div className="flex items-center">
              {match.is_finished ? (
                <span className="font-extrabold text-[#00B894] bg-[#00B894]/10 px-1.5 py-0.5 rounded">{match.team1_score}</span>
              ) : isPredicted ? (
                <span className="font-bold text-white bg-slate-800/80 px-1.5 py-0.5 rounded">{pred.score_local}</span>
              ) : (
                <span className="text-slate-600 px-1">-</span>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate max-w-[130px]">
              {match.team2?.flag_url && !match.team2.name.includes("Clasificado") ? (
                <img src={match.team2.flag_url} className="w-6.5 h-4.5 border border-slate-950 rounded shadow object-cover shrink-0" />
              ) : (
                <div className="w-6.5 h-4.5 bg-slate-900/50 border border-slate-800 rounded flex items-center justify-center text-[8px] text-gray-500 font-bold shrink-0">?</div>
              )}
              <span className={`truncate font-semibold ${pred?.winner_id === match.team2_id ? "text-[#D4AF37]" : "text-slate-300"}`}>
                {match.team2?.name || "Por definir"}
              </span>
            </div>
            
            <div className="flex items-center">
              {match.is_finished ? (
                <span className="font-extrabold text-[#00B894] bg-[#00B894]/10 px-1.5 py-0.5 rounded">{match.team2_score}</span>
              ) : isPredicted ? (
                <span className="font-bold text-white bg-slate-800/80 px-1.5 py-0.5 rounded">{pred.score_visitor}</span>
              ) : (
                <span className="text-slate-650 px-1">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Score footer */}
        {match.is_finished && isPredicted && (
          <div className="px-3.5 py-1.5 bg-slate-950/60 border-t border-slate-900/50 text-[9px] text-slate-500 flex justify-between font-bold">
            <span>Tu predicción:</span>
            <span className="text-slate-300">{pred.score_local} - {pred.score_visitor}</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#D4AF37] flex items-center gap-2">
            <Trophy className="h-8 w-8 text-[#D4AF37] animate-bounce" />
            Bracket del Torneo
          </h1>
          <p className="text-sm text-gray-400 mt-1.5 max-w-2xl leading-relaxed">
            Sigue el camino hacia la gran final. Haz clic sobre cualquier partido para ingresar tus predicciones o consultar resultados y puntajes obtenidos.
          </p>
        </div>

        {/* View Toggle Mode - Only on Desktop */}
        <div className="hidden md:flex bg-[#0c102b] p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode("bracket")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === "bracket"
                ? "bg-[#D4AF37] text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vista de Llaves (Árbol)
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-[#D4AF37] text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vista por Rondas (Grid)
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Tabs + Vertical list */}
      <div className="block md:hidden space-y-6">
        {/* Scrollable Tabs Row */}
        <div className="flex gap-2 overflow-x-auto pb-2.5 border-b border-slate-800/60 no-scrollbar">
          {ROUND_KEYS.map((key) => {
            const progress = getProgress(key);
            const isCompleted = progress.predicted === progress.total && progress.total > 0;
            return (
              <button
                key={key}
                onClick={() => setActiveMobileTab(key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeMobileTab === key
                    ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
                    : "bg-[#0c102b]/80 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <span>{ROUND_LABELS[key]}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  activeMobileTab === key
                    ? "bg-black/15 text-black"
                    : isCompleted
                      ? "bg-[#00B894]/20 text-[#00B894]"
                      : "bg-slate-800 text-slate-450"
                }`}>
                  {progress.predicted}/{progress.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* List of active tab matches */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-extrabold text-sm text-[#D4AF37] uppercase tracking-wider self-start pl-1 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-[#D4AF37] rounded-sm" />
            {ROUND_NAMES[activeMobileTab]}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            {(() => {
              const currentMatches = matches.filter((m) => m.round === activeMobileTab);
              if (currentMatches.length === 0) {
                return (
                  <div className="col-span-full py-12 text-center bg-[#0c102b]/30 border border-dashed border-slate-800 rounded-2xl">
                    <AlertCircle className="h-6 w-6 text-slate-650 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Aún no se han definido los cruces para esta ronda.</p>
                  </div>
                );
              }
              return currentMatches.map((m) => (
                <div key={m.id} className="flex justify-center">
                  {renderMatchCard(m, "compact")}
                </div>
              ));
            })()}
          </div>

          {/* Third Place Match (Special render in final mobile tab) */}
          {activeMobileTab === "final" && thirdPlace && (
            <div className="w-full pt-6 border-t border-slate-800/60 space-y-4">
              <h3 className="font-extrabold text-sm text-[#00B894] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3 bg-[#00B894] rounded-sm" />
                Partido por el Tercer Lugar
              </h3>
              <div className="flex justify-center">
                {renderMatchCard(thirdPlace, "compact")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP VIEW 1: Panoramic Bracket Scroll View with Connecting SVGs */}
      {viewMode === "bracket" && (
        <div className="hidden md:block relative bg-[#050814]/90 border border-slate-800/80 rounded-3xl p-6 overflow-hidden shadow-2xl backdrop-blur-sm">
          
          {/* Soft edge gradients indicating horizontal scroll */}
          <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-[#050814] to-transparent pointer-events-none z-20" />
          <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-[#050814] to-transparent pointer-events-none z-20" />

          <div className="overflow-x-auto pb-4 pt-2 select-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <div className="flex gap-0 w-max px-6 h-[1420px] relative">
              
              {/* Column 1: Round of 32 */}
              <div className="flex flex-col justify-between h-full w-56 shrink-0 relative">
                <div className="text-center font-extrabold text-[10px] uppercase tracking-widest text-[#D4AF37] border-b border-slate-800/70 pb-2 mb-4 bg-slate-950/40 py-1 rounded-md h-[28px] flex items-center justify-center">
                  Dieciseisavos (R32)
                </div>
                <div className="flex-1 flex flex-col justify-around py-2">
                  {r32.length > 0 ? (
                    r32.map((m) => renderMatchCard(m, "node"))
                  ) : (
                    Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="w-52 h-[68px] mx-auto bg-slate-900/10 border border-dashed border-slate-850 rounded-xl flex items-center justify-center text-slate-600 text-[10px] font-semibold">
                        Partido R32
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Connector 1 */}
              <RoundConnector fromCount={16} />

              {/* Column 2: Round of 16 */}
              <div className="flex flex-col justify-between h-full w-56 shrink-0 relative">
                <div className="text-center font-extrabold text-[10px] uppercase tracking-widest text-[#D4AF37] border-b border-slate-800/70 pb-2 mb-4 bg-slate-950/40 py-1 rounded-md h-[28px] flex items-center justify-center">
                  Octavos de Final
                </div>
                <div className="flex-1 flex flex-col justify-around py-2">
                  {r16.length > 0 ? (
                    r16.map((m) => renderMatchCard(m, "node"))
                  ) : (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-52 h-[68px] mx-auto bg-slate-900/10 border border-dashed border-slate-855 rounded-xl flex items-center justify-center text-slate-655 text-[10px] font-semibold">
                        Partido R16
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Connector 2 */}
              <RoundConnector fromCount={8} />

              {/* Column 3: Quarterfinals */}
              <div className="flex flex-col justify-between h-full w-56 shrink-0 relative">
                <div className="text-center font-extrabold text-[10px] uppercase tracking-widest text-[#D4AF37] border-b border-slate-800/70 pb-2 mb-4 bg-slate-950/40 py-1 rounded-md h-[28px] flex items-center justify-center">
                  Cuartos de Final
                </div>
                <div className="flex-1 flex flex-col justify-around py-2">
                  {quarters.length > 0 ? (
                    quarters.map((m) => renderMatchCard(m, "node"))
                  ) : (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="w-52 h-[68px] mx-auto bg-slate-900/10 border border-dashed border-slate-855 rounded-xl flex items-center justify-center text-slate-655 text-[10px] font-semibold">
                        Cuartos
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Connector 3 */}
              <RoundConnector fromCount={4} />

              {/* Column 4: Semifinals */}
              <div className="flex flex-col justify-between h-full w-56 shrink-0 relative">
                <div className="text-center font-extrabold text-[10px] uppercase tracking-widest text-[#D4AF37] border-b border-slate-800/70 pb-2 mb-4 bg-slate-950/40 py-1 rounded-md h-[28px] flex items-center justify-center">
                  Semifinales
                </div>
                <div className="flex-1 flex flex-col justify-around py-2">
                  {semis.length > 0 ? (
                    semis.map((m) => renderMatchCard(m, "node"))
                  ) : (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="w-52 h-[68px] mx-auto bg-slate-900/10 border border-dashed border-slate-855 rounded-xl flex items-center justify-center text-slate-655 text-[10px] font-semibold">
                        Semifinal
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Connector 4 */}
              <RoundConnector fromCount={2} />

              {/* Column 5: Gran Final & 3rd Place */}
              <div className="flex flex-col justify-between h-full w-56 shrink-0 relative">
                <div className="text-center font-extrabold text-[10px] uppercase tracking-widest text-[#D4AF37] border-b border-slate-800/70 pb-2 mb-4 bg-slate-950/40 py-1 rounded-md h-[28px] flex items-center justify-center">
                  Gran Final
                </div>
                
                {/* Centered Area for Gran Final Card */}
                <div className="flex-1 flex flex-col justify-center relative">
                  <div className="flex justify-center">
                    {finals.length > 0 ? (
                      finals.map((m) => renderMatchCard(m, "node"))
                    ) : (
                      <div className="w-52 h-[68px] bg-slate-900/10 border border-dashed border-slate-855 rounded-xl flex items-center justify-center text-slate-655 text-[10px] font-semibold">
                        Final
                      </div>
                    )}
                  </div>

                  {/* Asymmetric Third Place Match at the bottom */}
                  {thirdPlace && (
                    <div className="absolute bottom-10 left-0 right-0 space-y-2">
                      <div className="text-center font-extrabold text-[9px] uppercase tracking-widest text-[#00B894] border-b border-slate-800/60 pb-1.5 bg-[#00B894]/5 py-0.5 rounded">
                        Tercer Lugar
                      </div>
                      <div className="flex justify-center">
                        {renderMatchCard(thirdPlace, "node")}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DESKTOP VIEW 2: Spacious Grid View By Round */}
      {viewMode === "grid" && (
        <div className="hidden md:block space-y-6">
          {/* Round Selectors Row */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800/60">
            {ROUND_KEYS.map((key) => {
              const progress = getProgress(key);
              const isCompleted = progress.predicted === progress.total && progress.total > 0;
              return (
                <button
                  key={key}
                  onClick={() => setActiveMobileTab(key)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    activeMobileTab === key
                      ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
                      : "bg-[#0c102b]/80 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <span>{ROUND_LABELS[key]}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    activeMobileTab === key
                      ? "bg-black/15 text-black"
                      : isCompleted
                        ? "bg-[#00B894]/20 text-[#00B894]"
                        : "bg-slate-800 text-slate-450"
                  }`}>
                    {progress.predicted}/{progress.total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List of active tab matches in 4-column Grid */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3 bg-[#D4AF37] rounded-sm" />
              {ROUND_NAMES[activeMobileTab]}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {(() => {
                const currentMatches = matches.filter((m) => m.round === activeMobileTab);
                if (currentMatches.length === 0) {
                  return (
                    <div className="col-span-full py-16 text-center bg-[#0c102b]/30 border border-dashed border-slate-800 rounded-2xl">
                      <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-450">Aún no se han definido los cruces para esta ronda.</p>
                    </div>
                  );
                }
                return currentMatches.map((m) => (
                  <div key={m.id} className="flex justify-center">
                    {renderMatchCard(m, "full")}
                  </div>
                ));
              })()}
            </div>

            {/* Third Place Match for Final tab */}
            {activeMobileTab === "final" && thirdPlace && (
              <div className="pt-8 border-t border-slate-800/60 space-y-4">
                <h3 className="font-extrabold text-sm text-[#00B894] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-[#00B894] rounded-sm" />
                  Partido por el Tercer Lugar
                </h3>
                <div className="flex justify-start">
                  {renderMatchCard(thirdPlace, "full")}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prediction Modal Dialog */}
      <Dialog.Root open={selectedMatch !== null} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-all" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#070708] border border-slate-800 rounded-2xl shadow-2xl p-6 z-50 text-white animate-in fade-in zoom-in-95 duration-200 outline-none">
            {selectedMatch && (
              <form onSubmit={handleSaveModalPrediction} className="space-y-6">
                
                {/* Modal Title */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
                  <div>
                    <Dialog.Title className="text-xl font-extrabold text-[#D4AF37]">
                      {ROUND_NAMES[selectedMatch.round]}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-gray-500 mt-1 flex items-center gap-1" suppressHydrationWarning>
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {new Date(selectedMatch.match_datetime).toLocaleString("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button type="button" className="p-2 rounded-xl hover:bg-[#121214] text-gray-400 hover:text-white border border-slate-800/60 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Info Deadline Banner */}
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  isModalMatchLocked ? "bg-red-950/15 border-red-500/20 text-red-400" : "bg-[#00B894]/10 border-[#00B894]/20 text-[#00B894]"
                }`}>
                  {isModalMatchLocked ? <Lock className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
                  <span>
                    {isAdmin ? "Modo Administrador: Tienes permisos de solo lectura." : isModalMatchLocked 
                      ? "Las predicciones para este partido se encuentran cerradas."
                      : `Se permite modificar predicciones hasta 1 hora antes de que inicie el encuentro.`
                    }
                  </span>
                </div>

                {/* Score inputs form */}
                <div className="flex items-center justify-center gap-6 py-4">
                  
                  {/* Team 1 */}
                  <div className="flex flex-col items-center gap-2.5 flex-1 text-center min-w-0">
                    {selectedMatch.team1?.flag_url && !selectedMatch.team1.name.includes("Clasificado") ? (
                      <img src={selectedMatch.team1.flag_url} className="w-14 h-9 border border-slate-900 rounded-lg shadow-lg object-cover" />
                    ) : (
                      <div className="w-14 h-9 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-center font-bold text-gray-450">?</div>
                    )}
                    <span className="font-bold text-xs truncate max-w-[110px] text-slate-305">
                      {selectedMatch.team1?.name || "Clasificado"}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      disabled={isModalMatchLocked}
                      placeholder="0"
                      className="w-16 h-14 text-center text-2xl font-black bg-[#0a0a0a] border-slate-800 text-white focus:border-[#D4AF37] focus:ring-0 disabled:opacity-85 rounded-xl shadow-inner mt-1"
                      value={modalLocalScore}
                      onChange={(e) => {
                        setModalLocalScore(e.target.value);
                        const otherScore = parseInt(modalVisitorScore, 10);
                        const thisScore = parseInt(e.target.value, 10);
                        if (!isNaN(thisScore) && !isNaN(otherScore)) {
                           if (thisScore > otherScore) setModalWinnerId(selectedMatch.team1_id);
                           if (thisScore < otherScore) setModalWinnerId(selectedMatch.team2_id);
                        }
                      }}
                      onBlur={() => {
                        if (modalLocalScore !== "") {
                          setModalLocalScore(String(parseInt(modalLocalScore, 10)));
                        }
                      }}
                    />
                  </div>

                  <span className="text-slate-500 font-extrabold text-sm uppercase tracking-wider shrink-0 mt-10">vs</span>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center gap-2.5 flex-1 text-center min-w-0">
                    {selectedMatch.team2?.flag_url && !selectedMatch.team2.name.includes("Clasificado") ? (
                      <img src={selectedMatch.team2.flag_url} className="w-14 h-9 border border-slate-900 rounded-lg shadow-lg object-cover" />
                    ) : (
                      <div className="w-14 h-9 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-center font-bold text-gray-455">?</div>
                    )}
                    <span className="font-bold text-xs truncate max-w-[110px] text-slate-310">
                      {selectedMatch.team2?.name || "Clasificado"}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      disabled={isModalMatchLocked}
                      placeholder="0"
                      className="w-16 h-14 text-center text-2xl font-black bg-[#0a0a0a] border-slate-800 text-white focus:border-[#D4AF37] focus:ring-0 disabled:opacity-85 rounded-xl shadow-inner mt-1"
                      value={modalVisitorScore}
                      onChange={(e) => {
                        setModalVisitorScore(e.target.value);
                        const otherScore = parseInt(modalLocalScore, 10);
                        const thisScore = parseInt(e.target.value, 10);
                        if (!isNaN(thisScore) && !isNaN(otherScore)) {
                           if (otherScore > thisScore) setModalWinnerId(selectedMatch.team1_id);
                           if (otherScore < thisScore) setModalWinnerId(selectedMatch.team2_id);
                        }
                      }}
                      onBlur={() => {
                        if (modalVisitorScore !== "") {
                          setModalVisitorScore(String(parseInt(modalVisitorScore, 10)));
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Advancing Team Winner selection */}
                <div className="flex flex-col items-center gap-2 pt-5 border-t border-slate-800/60">
                  <Label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                    ¿Quién clasifica / avanza?
                  </Label>
                  <div className="flex gap-3 mt-1.5 w-full justify-center">
                    <button
                      type="button"
                      disabled={
                        isModalMatchLocked ||
                        (modalLocalScore !== "" && modalVisitorScore !== "" && parseInt(modalLocalScore, 10) < parseInt(modalVisitorScore, 10))
                      }
                      onClick={() => setModalWinnerId(selectedMatch.team1_id)}
                      className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all w-1/2 ${
                        modalWinnerId === selectedMatch.team1_id
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.15)]"
                          : "bg-[#121212] text-slate-400 border-slate-800 hover:border-slate-500"
                      }`}
                    >
                      {selectedMatch.team1?.name || "Local"} avanza
                    </button>
                    <button
                      type="button"
                      disabled={
                        isModalMatchLocked ||
                        (modalLocalScore !== "" && modalVisitorScore !== "" && parseInt(modalLocalScore, 10) > parseInt(modalVisitorScore, 10))
                      }
                      onClick={() => setModalWinnerId(selectedMatch.team2_id)}
                      className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all w-1/2 ${
                        modalWinnerId === selectedMatch.team2_id
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.15)]"
                          : "bg-[#121212] text-slate-400 border-slate-800 hover:border-slate-500"
                      }`}
                    >
                      {selectedMatch.team2?.name || "Visitante"} avanza
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-500 bg-red-950/30 p-3 rounded-lg border border-red-500/50">
                    {errorMsg}
                  </p>
                )}

                {/* Save button */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/60">
                  <Dialog.Close asChild>
                    <Button type="button" variant="outline" className="border-slate-800 hover:bg-white/5 rounded-xl">
                      Cancelar
                    </Button>
                  </Dialog.Close>
                  {!isModalMatchLocked && (
                    <Button type="submit" disabled={isSaving} className="bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold rounded-xl shadow-lg shadow-[#D4AF37]/10 px-6">
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
