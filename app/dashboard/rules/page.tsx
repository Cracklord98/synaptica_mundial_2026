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
          <BookOpen className="h-8 w-8" />
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
                <Target className="h-5 w-5" />
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
                    <span className="text-xs text-gray-400">En 90 minutos (incluye pts por resultado)</span>
                  </div>
                  <span className="text-xl font-bold text-[#D4AF37]">+5 pts</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A2B3C]/20 border border-[#1A2B3C]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Resultado Correcto</span>
                    <span className="text-xs text-gray-400">Victoria/Empate en 90 min</span>
                  </div>
                  <span className="text-xl font-bold text-[#D4AF37]">+3 pts</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A2B3C]/20 border border-[#1A2B3C]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Equipo Clasificado</span>
                    <span className="text-xs text-gray-400">El que avanza (se suma al anterior)</span>
                  </div>
                  <span className="text-xl font-bold text-[#D4AF37]">+2 pts</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1A2B3C]">
                <h4 className="font-semibold text-sm text-gray-300 mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#D4AF37]" /> Bonus (Única vez)
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Acertar al Campeón</span>
                    <span className="font-bold text-[#00B894]">+10 pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Acertar cada Finalista</span>
                    <span className="font-bold text-[#00B894]">+5 pts c/u</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pista Analítica */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-[#1A2B3C] bg-gradient-to-bl from-[#121212] to-[#0A0A0A] text-white premium-card">
            <CardHeader className="border-b border-[#1A2B3C] bg-[#1A2B3C]/10">
              <CardTitle className="text-xl font-bold text-[#9D4EDD] flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                Pista Analítica
              </CardTitle>
              <CardDescription className="text-gray-400">
                Premio al enfoque más ingenioso y riguroso.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-gray-300">
                El desempeño predictivo <strong>NO</strong> pondera en esta pista. Puede ganar un modelo elegante que no acertó la final. Se premia el pensamiento analítico y la creatividad.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-300">Rúbrica del Jurado (100 pts)</h4>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center shrink-0 text-[#9D4EDD] font-bold text-xs">
                      30%
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Rigor Analítico</p>
                      <p className="text-xs text-gray-400">Metodología sólida y bien justificada.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center shrink-0 text-[#9D4EDD] font-bold text-xs">
                      30%
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Creatividad e Innovación</p>
                      <p className="text-xs text-gray-400">Enfoque original y uso ingenioso de datos.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center shrink-0 text-[#9D4EDD] font-bold text-xs">
                      20%
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Reproducibilidad</p>
                      <p className="text-xs text-gray-400">Otro equipo podría replicarlo fácilmente.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center shrink-0 text-[#9D4EDD] font-bold text-xs">
                      20%
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Storytelling</p>
                      <p className="text-xs text-gray-400">Claridad en el Model Card y visualizaciones.</p>
                    </div>
                  </div>
                </div>
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
                  <strong className="text-white">Entregables:</strong> Las predicciones se hacen ronda a ronda por esta app. El Model Card (máx 1 pág) se sube antes de la final.
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
                  <strong className="text-white">Inapelable:</strong> Las predicciones se congelan al cierre. Las decisiones del jurado en la Pista Analítica son inapelables.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
