"use client";

import { useState, useEffect } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, PieChartIcon, Code, Database, Award, FileText, GitBranch } from "lucide-react";

interface AdminModelCardsChartsProps {
  cards: any[];
}

const COLORS = [
  "#00B894", // Emerald Green
  "#D4AF37", // Gold
  "#3498db", // Blue
  "#e74c3c", // Red
  "#9b59b6", // Purple
  "#e67e22", // Orange
  "#7f8c8d"  // Gray
];

export default function AdminModelCardsCharts({ cards }: AdminModelCardsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (cards.length === 0) return null;

  // 1. Process Methodologies (Question 3)
  const methodologyCounts: Record<string, number> = {
    "Poisson": 0,
    "Clasificación Elo": 0,
    "Machine Learning / Regresión": 0,
    "Simulación Monte Carlo": 0,
    "LLMs / Inteligencia Artificial": 0,
    "Promedio a Ojo / Manual": 0,
    "Otros / No especificado": 0
  };

  cards.forEach((card) => {
    const approach = (card.answers?.q3_approach || "").toLowerCase();
    if (!approach) {
      methodologyCounts["Otros / No especificado"]++;
      return;
    }

    if (approach.includes("poisson") || approach.includes("pois")) {
      methodologyCounts["Poisson"]++;
    } else if (approach.includes("elo") || approach.includes("rating")) {
      methodologyCounts["Clasificación Elo"]++;
    } else if (
      approach.includes("regresion") || 
      approach.includes("regresión") || 
      approach.includes("logistic") || 
      approach.includes("logistica") || 
      approach.includes("machine learning") || 
      approach.includes("ml") || 
      approach.includes("random forest") || 
      approach.includes("xgboost") || 
      approach.includes("neuronal") || 
      approach.includes("boosting")
    ) {
      methodologyCounts["Machine Learning / Regresión"]++;
    } else if (
      approach.includes("monte carlo") || 
      approach.includes("montecarlo") || 
      approach.includes("simulac") || 
      approach.includes("simulación")
    ) {
      methodologyCounts["Simulación Monte Carlo"]++;
    } else if (
      approach.includes("llm") || 
      approach.includes("gpt") || 
      approach.includes("gemini") || 
      approach.includes("inteligencia artificial") || 
      approach.includes("ia") || 
      approach.includes("claude")
    ) {
      methodologyCounts["LLMs / Inteligencia Artificial"]++;
    } else if (
      approach.includes("ojo") || 
      approach.includes("manual") || 
      approach.includes("intuic") || 
      approach.includes("experto") || 
      approach.includes("criterio")
    ) {
      methodologyCounts["Promedio a Ojo / Manual"]++;
    } else {
      methodologyCounts["Otros / No especificado"]++;
    }
  });

  const pieData = Object.entries(methodologyCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  // 2. Process Data Sources (Question 1)
  const sourceCounts: Record<string, number> = {
    "Resultados Históricos": 0,
    "Ranking FIFA": 0,
    "Calificaciones Elo": 0,
    "Fase de Grupos": 0,
    "Otras Fuentes": 0
  };

  cards.forEach((card) => {
    const sources = (card.answers?.q1_sources || "").toLowerCase();
    let matched = false;

    if (sources.includes("historico") || sources.includes("histórico") || sources.includes("resultados") || sources.includes("partidos")) {
      sourceCounts["Resultados Históricos"]++;
      matched = true;
    }
    if (sources.includes("fifa") || sources.includes("ranking")) {
      sourceCounts["Ranking FIFA"]++;
      matched = true;
    }
    if (sources.includes("elo")) {
      sourceCounts["Calificaciones Elo"]++;
      matched = true;
    }
    if (sources.includes("fase de grupos") || sources.includes("grupos") || sources.includes("fase")) {
      sourceCounts["Fase de Grupos"]++;
      matched = true;
    }

    if (!matched && sources.trim().length > 0) {
      sourceCounts["Otras Fuentes"]++;
    }
  });

  const barData = Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }));

  // 3. Process Code Repos
  const totalSubmissions = cards.length;
  const repoSubmissions = cards.filter((card) => !!card.repo_url).length;
  const repoPercentage = totalSubmissions > 0 
    ? Math.round((repoSubmissions / totalSubmissions) * 100) 
    : 0;

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3 h-40 bg-zinc-950/50 animate-pulse rounded-lg border border-[#1A2B3C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#1A2B3C] bg-[#121212] premium-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Propuestas Completadas</CardDescription>
            <CardTitle className="text-2xl font-black text-[#D4AF37] flex items-center justify-between">
              <span>{totalSubmissions}</span>
              <FileText className="h-5 w-5 text-[#00B894]" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-[#1A2B3C] bg-[#121212] premium-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Código Compartido</CardDescription>
            <CardTitle className="text-2xl font-black text-white flex items-center justify-between">
              <span>{repoSubmissions}</span>
              <Code className="h-5 w-5 text-[#D4AF37]" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-[#1A2B3C] bg-[#121212] premium-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">% Con Repositorio</CardDescription>
            <CardTitle className="text-2xl font-black text-white flex items-center justify-between">
              <span>{repoPercentage}%</span>
              <GitBranch className="h-5 w-5 text-[#00B894]" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Methodologies Pie */}
        <Card className="border-[#1A2B3C] bg-[#121212] premium-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#1A2B3C]/40">
            <div>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                <PieChartIcon className="h-4 w-4 text-[#D4AF37]" />
                Enfoque Metodológico
              </CardTitle>
              <CardDescription className="text-[10px] text-gray-500">¿Qué método matemático o modelo predictivo utilizan?</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {pieData.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-10">Sin datos de métodos.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0A0A0A", borderColor: "#1A2B3C", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff", fontSize: "12px" }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40} 
                      iconSize={10} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: "10px", color: "#9ca3af" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Sources Bar */}
        <Card className="border-[#1A2B3C] bg-[#121212] premium-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#1A2B3C]/40">
            <div>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-[#00B894]" />
                Fuentes de Datos
              </CardTitle>
              <CardDescription className="text-[10px] text-gray-500">Datasets y orígenes de información más comunes</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2B3C" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0A0A0A", borderColor: "#1A2B3C", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                  />
                  <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === "Resultados Históricos" ? "#D4AF37" : "#00B894"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
