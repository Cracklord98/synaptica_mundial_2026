"use client";

import { motion } from "framer-motion";
import { 
  BookOpen, 
  Target, 
  BrainCircuit, 
  Trophy, 
  CheckCircle2, 
  AlertTriangle,
  Scale
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RulesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#D4AF37] flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-[#D4AF37]" />
          Bases y Reglas del Torneo
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          DataPolla Mundialista 2026: Una actividad de integración y cultura analítica exclusiva para Synaptica S.A.S.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Pista Precisión */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-[#1A2B3C] bg-gradient-to-br from-[#121212] to-[#0A0A0A] text-white premium-card">
            <CardHeader className="border-b border-[#1A2B3C] bg-[#1A2B3C]/10">
              <CardTitle className="text-xl font-bold text-[#00B894] flex items-center gap-2">
                <Target className="h-5 w-5 text-[#00B894]" />
                Pista Precisión
              </CardTitle>
              <CardDescription className="text-gray-400">
                ¿Qué tan certero es tu modelo prediciendo los resultados?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A2B3C]/20 border border-[#1A2B3C]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Marcador Exacto</span>
                    <span className="text-xs text-gray-400">Acierto del marcador exacto de goles (se suma al resultado)</span>
                  </div>
                  <span className="text-xl font-bold text-[#D4AF37]">+5 pts</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A2B3C]/20 border border-[#1A2B3C]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Resultado Correcto</span>
                    <span className="text-xs text-gray-400">Acierto de victoria o empate en tiempo regular</span>
                  </div>
                  <span className="text-xl font-bold text-[#D4AF37]">+3 pts</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A2B3C]/20 border border-[#1A2B3C]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Equipo Clasificado</span>
                    <span className="text-xs text-gray-400">Acierto del equipo que avanza (se suma a los anteriores)</span>
                  </div>
                  <span className="text-xl font-bold text-[#D4AF37]">+2 pts</span>
                </div>
              </div>

              <div className="p-3.5 bg-yellow-950/10 border border-yellow-900/20 rounded-lg text-xs text-yellow-400 leading-normal">
                Nota: Todos los aciertos se suman de forma acumulativa, dando un <strong>máximo de 10 puntos</strong> por partido (5 por marcador exacto + 3 por resultado correcto + 2 por clasificado). Las predicciones se calculan estrictamente partido a partido.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pista Analítica */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-[#1A2B3C] bg-gradient-to-bl from-[#121212] to-[#0A0A0A] text-white premium-card">
            <CardHeader className="border-b border-[#1A2B3C] bg-[#1A2B3C]/10">
              <CardTitle className="text-xl font-bold text-[#9D4EDD] flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-[#9D4EDD]" />
                Pista Analítica
              </CardTitle>
              <CardDescription className="text-gray-400">
                Premio al enfoque más ingenioso y riguroso.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-gray-300">
                El desempeño predictivo <strong>NO</strong> pondera en esta pista. Puede ganar un modelo elegante que no acertó ningún marcador. Se premia el rigor técnico y la creatividad del enfoque.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-300">Rúbrica del Jurado (100 pts)</h4>
                
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center shrink-0 text-[#9D4EDD] font-bold text-xs">
                      30%
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Rigor Analítico</p>
                      <p className="text-xs text-gray-400">Metodología sólida, tratamiento de datos y modelado matemático justificado.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center shrink-0 text-[#9D4EDD] font-bold text-xs">
                      30%
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Creatividad e Innovación</p>
                      <p className="text-xs text-gray-400">Enfoque original en la obtención o ingeniería de variables y modelos.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center shrink-0 text-[#9D4EDD] font-bold text-xs">
                      20%
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Reproducibilidad</p>
                      <p className="text-xs text-gray-400">Documentación clara para que otro analista pueda replicar el modelo.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center shrink-0 text-[#9D4EDD] font-bold text-xs">
                      20%
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Comunicación (Storytelling)</p>
                      <p className="text-xs text-gray-400">Claridad al explicar el enfoque en la Ficha Metodológica (Model Card).</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Premios del Torneo */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-[#1A2B3C] bg-[#121212] text-white premium-card border-l-4 border-l-[#D4AF37]">
            <CardHeader className="border-b border-[#1A2B3C] bg-[#1A2B3C]/10">
              <CardTitle className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#D4AF37]" />
                Premios de la Actividad
              </CardTitle>
              <CardDescription className="text-gray-400">
                Los premios son incentivos corporativos de Synaptica y no producto de apuestas entre los participantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Premios Precision */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-[#00B894] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-[#00B894] rounded-sm" />
                    Pista Precisión
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-slate-800">
                      <span className="text-gray-400">1er Lugar</span>
                      <strong className="text-white font-bold">1.000 COP por punto (máx. 150.000 COP)</strong>
                    </li>
                    <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-slate-800">
                      <span className="text-gray-400">2do Lugar</span>
                      <strong className="text-white font-bold">500 COP por punto (máx. 75.000 COP)</strong>
                    </li>
                    <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-slate-800">
                      <span className="text-gray-400">3er Lugar</span>
                      <strong className="text-white font-bold">350 COP por punto (máx. 52.500 COP)</strong>
                    </li>
                    <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-slate-800">
                      <span className="text-gray-400">Mención "Cisne Negro" (Acierto improbable)</span>
                      <strong className="text-[#D4AF37] font-bold">Bono Regalo de Rappi</strong>
                    </li>
                  </ul>
                </div>

                {/* Premios Analiticos */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-[#9D4EDD] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-[#9D4EDD] rounded-sm" />
                    Pista Analítica
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-slate-800">
                      <span className="text-gray-400">1er Lugar</span>
                      <strong className="text-white font-bold">Bono de 150.000 COP</strong>
                    </li>
                    <li className="flex justify-between items-center bg-[#0A0A0A] p-2.5 rounded border border-slate-800">
                      <span className="text-gray-400">2do Lugar</span>
                      <strong className="text-white font-bold">Bono de 75.000 COP</strong>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-gray-450 space-y-1.5 leading-relaxed">
                <p>⚠️ <strong>NOTA IMPORTANTE:</strong> Los premios <strong>no son acumulables</strong>. Cada participante solo podrá ganar uno de los premios en disputa.</p>
                <p>🤝 Todos los premios son un incentivo para promover la adopción de herramientas de ciencia de datos, y están sujetos a validación por la organización.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reglas de Juego Limpio */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-[#1A2B3C] bg-[#121212] text-white premium-card">
            <CardHeader className="border-b border-[#1A2B3C] bg-[#1A2B3C]/10">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#D4AF37]" />
                Reglas de Juego Limpio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-[#00B894] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Vale todo enfoque:</strong> Desde Excel hasta Modelos de ML o LLMs. Usa datos públicos (Kaggle, StatsBomb, APIs).
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-[#00B894] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Entregables:</strong> Las predicciones se hacen ronda a ronda por esta app. El Model Card (Ficha Metodológica) se sube antes de la final.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Tiempo Acotado:</strong> Es voluntario. Máximo 2 a 3 horas por semana, sin interferir con proyectos de clientes.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Cierres por Partido:</strong> Puedes modificar tu predicción para cualquier partido hasta <strong>exactamente 1 hora antes</strong> de que comience. ¡El sistema bloqueará el partido automáticamente!
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Inapelable:</strong> Las decisiones del jurado en la Pista Analítica son definitivas e inapelables.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
