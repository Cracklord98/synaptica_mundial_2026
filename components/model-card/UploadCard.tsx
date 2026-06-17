"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Save,
  HelpCircle,
  Database,
  Cpu,
  RefreshCw,
  GitBranch,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadModelCard } from "@/lib/actions";

interface ModelCard {
  file_url: string | null;
  description: string | null;
  repo_url?: string | null;
  uploaded_at: string;
  answers?: any;
}

interface UploadCardProps {
  userId: string;
  initialCard: ModelCard | null;
  isAdmin?: boolean;
}

export default function UploadCard({ userId, initialCard, isAdmin = false }: UploadCardProps) {
  // Answers state mapping questions 1 to 6
  const [q1Sources, setQ1Sources] = useState((initialCard?.answers as any)?.q1_sources || "");
  const [q2Prep, setQ2Prep] = useState((initialCard?.answers as any)?.q2_prep || "");
  const [q3Approach, setQ3Approach] = useState((initialCard?.answers as any)?.q3_approach || "");
  const [q4Rationale, setQ4Rationale] = useState((initialCard?.answers as any)?.q4_rationale || "");
  const [q5Recal, setQ5Recal] = useState((initialCard?.answers as any)?.q5_recal || "");
  const [q6Limits, setQ6Limits] = useState((initialCard?.answers as any)?.q6_limits || "");
  const [repoUrl, setRepoUrl] = useState(initialCard?.repo_url || "");
  const [uploadedAt, setUploadedAt] = useState(initialCard?.uploaded_at || "");
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBeforeDeadline = new Date() < new Date("2026-07-17T23:59:59Z");
  const isEditable = isBeforeDeadline && !isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q1Sources || !q2Prep || !q3Approach || !q4Rationale || !q5Recal || !q6Limits) {
      setErrorMsg("Por favor, completa todas las preguntas obligatorias.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      const answersObj = {
        q1_sources: q1Sources,
        q2_prep: q2Prep,
        q3_approach: q3Approach,
        q4_rationale: q4Rationale,
        q5_recal: q5Recal,
        q6_limits: q6Limits
      };

      // Save reference to DB using Server Action
      await uploadModelCard(answersObj, repoUrl || null);

      setUploadedAt(new Date().toISOString());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al procesar el guardado de la Ficha Metodológica.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
      {/* Rubric Details & Rules */}
      <div className="lg:col-span-1 space-y-6">
        <div className="premium-card p-6 rounded-2xl border border-[#1A2B3C] bg-[#121212] space-y-4">
          <h2 className="text-xl font-bold text-[#D4AF37] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pista Analítica
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Para participar en la pista analítica, los participantes deben documentar su modelo en esta <strong>Ficha Metodológica (Model Card)</strong>.
          </p>
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Rúbrica de Evaluación</h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]">
                <span className="text-gray-300">Rigor Analítico</span>
                <strong className="text-[#D4AF37]">30%</strong>
              </li>
              <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]">
                <span className="text-gray-300">Creatividad</span>
                <strong className="text-[#D4AF37]">30%</strong>
              </li>
              <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]">
                <span className="text-gray-300">Reproducibilidad</span>
                <strong className="text-[#D4AF37]">20%</strong>
              </li>
              <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]">
                <span className="text-gray-300">Comunicación</span>
                <strong className="text-[#D4AF37]">20%</strong>
              </li>
            </ul>
          </div>
          <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg text-[11px] text-blue-300 leading-normal">
            Nota: El rendimiento predictivo de tu polla NO influye en la calificación de la pista analítica. Es evaluada puramente de forma técnica por el jurado corporativo.
          </div>
        </div>
      </div>

      {/* Upload Form Box */}
      <div className="lg:col-span-2">
        <Card className="border-[#1A2B3C] bg-[#121212] text-white premium-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#D4AF37]">Ficha Metodológica - Model Card</CardTitle>
            <CardDescription className="text-gray-400">
              DataPolla Mundialista 2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isAdmin && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-indigo-100">Modo Administrador:</span> Vista de solo lectura. Los administradores no participan de la pista analítica y no pueden editar fichas.
                  </div>
                </div>
              )}

              {!isEditable && !isAdmin && (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>El tiempo límite para guardar o editar el Model Card ha expirado (17 de Julio, 2026).</span>
                </div>
              )}

              {/* Q1: Datos que usamos */}
              <div className="space-y-2">
                <Label htmlFor="q1Sources" className="text-gray-200 font-bold flex items-center gap-1.5 text-sm">
                  <Database className="h-4 w-4 text-[#D4AF37]" />
                  1. Datos que usamos: ¿Qué fuentes?
                </Label>
                <p className="text-[11px] text-gray-400">Ej: ranking FIFA, resultados históricos, Elo, datos de la fase de grupos</p>
                <Textarea
                  id="q1Sources"
                  disabled={!isEditable}
                  placeholder="Especifica los datasets y fuentes de información empleados para entrenar u orientar tu modelo..."
                  rows={3}
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 resize-none text-sm disabled:opacity-60"
                  value={q1Sources}
                  onChange={(e) => setQ1Sources(e.target.value)}
                  required
                />
              </div>

              {/* Q2: Cómo los preparamos */}
              <div className="space-y-2">
                <Label htmlFor="q2Prep" className="text-gray-200 font-bold flex items-center gap-1.5 text-sm">
                  <Cpu className="h-4 w-4 text-[#D4AF37]" />
                  2. Cómo los preparamos: En una frase
                </Label>
                <p className="text-[11px] text-gray-400">Ej: &quot;limpiamos y unificamos resultados desde 1990 en un CSV&quot;</p>
                <Input
                  id="q2Prep"
                  disabled={!isEditable}
                  placeholder="Resume brevemente el procesamiento o ETL..."
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm disabled:opacity-60"
                  value={q2Prep}
                  onChange={(e) => setQ2Prep(e.target.value)}
                  required
                />
              </div>

              {/* Q3: Enfoque del modelo */}
              <div className="space-y-2">
                <Label htmlFor="q3Approach" className="text-gray-200 font-bold flex items-center gap-1.5 text-sm">
                  <HelpCircle className="h-4 w-4 text-[#D4AF37]" />
                  3. Enfoque del modelo: ¿Qué método?
                </Label>
                <p className="text-[11px] text-gray-400">Ej: Poisson, Elo, regresión logística, Monte Carlo, LLM, o &quot;promedio a ojo justificado&quot;</p>
                <Input
                  id="q3Approach"
                  disabled={!isEditable}
                  placeholder="Algoritmo, técnica o método de simulación principal..."
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm disabled:opacity-60"
                  value={q3Approach}
                  onChange={(e) => setQ3Approach(e.target.value)}
                  required
                />
              </div>

              {/* Q4: Por qué lo elegimos */}
              <div className="space-y-2">
                <Label htmlFor="q4Rationale" className="text-gray-200 font-bold flex items-center gap-1.5 text-sm">
                  <FileText className="h-4 w-4 text-[#D4AF37]" />
                  4. Por qué lo elegimos: Una frase
                </Label>
                <p className="text-[11px] text-gray-400">Argumento o justificación rápida de tu selección técnica</p>
                <Input
                  id="q4Rationale"
                  disabled={!isEditable}
                  placeholder="Justificación de la elección metodológica..."
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm disabled:opacity-60"
                  value={q4Rationale}
                  onChange={(e) => setQ4Rationale(e.target.value)}
                  required
                />
              </div>

              {/* Q5: Cómo recalibramos */}
              <div className="space-y-2">
                <Label htmlFor="q5Recal" className="text-gray-200 font-bold flex items-center gap-1.5 text-sm">
                  <RefreshCw className="h-4 w-4 text-[#D4AF37]" />
                  5. Cómo recalibramos cada ronda: Una frase
                </Label>
                <p className="text-[11px] text-gray-400">¿Qué cambia con los nuevos resultados en las llaves?</p>
                <Input
                  id="q5Recal"
                  disabled={!isEditable}
                  placeholder="Estrategia de recalibración (ej. ajuste dinámico de variables, actualización Bayesiana, etc.)..."
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm disabled:opacity-60"
                  value={q5Recal}
                  onChange={(e) => setQ5Recal(e.target.value)}
                  required
                />
              </div>

              {/* Q6: Supuestos y límites */}
              <div className="space-y-2">
                <Label htmlFor="q6Limits" className="text-gray-200 font-bold flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="h-4 w-4 text-[#D4AF37]" />
                  6. Supuestos y límites
                </Label>
                <p className="text-[11px] text-gray-400">Ej: &quot;no modelamos lesiones ni clima, asumimos consistencia de plantillas&quot;</p>
                <Textarea
                  id="q6Limits"
                  disabled={!isEditable}
                  placeholder="Declara las asunciones o restricciones conocidas de tu planteamiento analítico..."
                  rows={3}
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 resize-none text-sm disabled:opacity-60"
                  value={q6Limits}
                  onChange={(e) => setQ6Limits(e.target.value)}
                  required
                />
              </div>

              {/* Q7: Repo/Link (Opcional) */}
              <div className="space-y-2 border-t border-[#1A2B3C]/40 pt-4">
                <Label htmlFor="repoUrl" className="text-gray-200 font-bold flex items-center gap-1.5 text-sm">
                  <GitBranch className="h-4 w-4 text-[#D4AF37]" />
                  7. Enlace (Opcional): Repositorio / Notebook / Dashboard
                </Label>
                <p className="text-[11px] text-gray-400">Enlace externo para compartir con el jurado predictivo (ej. GitHub, Kaggle, Colab, etc.)</p>
                <Input
                  id="repoUrl"
                  type="url"
                  disabled={!isEditable}
                  placeholder="https://github.com/mi-usuario/polla-mundial-2026"
                  className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm disabled:opacity-60"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>

              {/* Upload Status & Actions */}
              {uploadedAt && (
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A2B3C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#D4AF37] shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-white">Ficha Metodológica Registrada</p>
                      <p className="text-xs text-gray-400">
                        Última edición: {new Date(uploadedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      {repoUrl && (
                        <a 
                          href={repoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#00B894] hover:underline flex items-center gap-1 mt-1 font-semibold"
                        >
                          <ExternalLink className="h-3 w-3" /> Ver Enlace Externo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message Feedbacks */}
              {success && (
                <div className="p-3 bg-[#00B894]/10 border border-[#00B894]/30 rounded-lg text-sm text-[#00B894] flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>¡Ficha Metodológica guardada e indexada con éxito!</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-sm text-red-200 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isEditable && (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#D4AF37] hover:bg-[#C29E30] text-black font-extrabold px-6 py-5 text-sm flex items-center gap-1.5 rounded-lg"
                  >
                    <Save className="h-4.5 w-4.5" />
                    {isLoading ? "Guardando..." : "Guardar Respuestas"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
