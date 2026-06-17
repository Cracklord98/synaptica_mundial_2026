"use client";

import { useEffect, useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from "recharts";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreRecord {
  round: string;
  points: number;
  is_exact: boolean;
  match_id: string;
}

interface DashboardChartsProps {
  scores: ScoreRecord[];
}

const ROUND_ORDER = ["round_32", "round_16", "quarter", "semi", "third_place", "final"];

const ROUND_LABELS: Record<string, string> = {
  round_32: "Dieciseisavos",
  round_16: "Octavos",
  quarter: "Cuartos",
  semi: "Semifinales",
  third_place: "3er Puesto",
  final: "Final",
};

export default function DashboardCharts({ scores }: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!scores || scores.length === 0) {
    return (
      <div className="premium-card p-8 rounded-2xl border border-[#1e293b]/70 bg-[#080d22]/40 text-center space-y-4">
        <div className="h-12 w-12 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/35 flex items-center justify-center mx-auto text-[#D4AF37]">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">Visualizaciones de Rendimiento</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Aún no tienes partidos calculados en tu historial. Los gráficos aparecerán automáticamente cuando se registren marcadores oficiales y se calculen tus puntos.
          </p>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalFinished = scores.length;
  const exactHits = scores.filter(s => s.is_exact).length;
  const partialHits = scores.filter(s => !s.is_exact && s.points > 0).length;
  const misses = scores.filter(s => s.points === 0).length;
  
  const totalPoints = scores.reduce((acc, curr) => acc + curr.points, 0);
  const maxPoints = Math.max(...scores.map(s => s.points), 0);
  const avgPoints = totalPoints / totalFinished;
  
  const hitAccuracy = ((exactHits + partialHits) / totalFinished) * 100;
  const exactAccuracy = (exactHits / totalFinished) * 100;

  // Doughnut Chart Data
  const pieData = [
    { name: "Acierto Exacto (5-7 pts)", value: exactHits, color: "#00B894" },
    { name: "Acierto Parcial (2-3 pts)", value: partialHits, color: "#D4AF37" },
    { name: "Sin Acierto (0 pts)", value: misses, color: "#EF4444" }
  ].filter(item => item.value > 0); // Only render slices with values > 0

  // If all are 0 (shouldn't happen because scores.length > 0, but safety check)
  const defaultPieData = pieData.length > 0 ? pieData : [
    { name: "Sin datos", value: 1, color: "#1e293b" }
  ];

  // Round progression data
  const roundDataMap: Record<string, { points: number; count: number; exact: number }> = {};
  ROUND_ORDER.forEach(r => {
    roundDataMap[r] = { points: 0, count: 0, exact: 0 };
  });

  scores.forEach(s => {
    const roundKey = s.round;
    if (roundDataMap[roundKey]) {
      roundDataMap[roundKey].points += s.points;
      roundDataMap[roundKey].count += 1;
      if (s.is_exact) {
        roundDataMap[roundKey].exact += 1;
      }
    }
  });

  const roundChartData = ROUND_ORDER.map(roundKey => {
    const data = roundDataMap[roundKey];
    return {
      roundName: ROUND_LABELS[roundKey] || roundKey,
      "Puntos Totales": data.points,
      "Aciertos Exactos": data.exact,
      "Partidos Finalizados": data.count,
    };
  }).filter(r => r["Partidos Finalizados"] > 0); // Only show rounds that have finished matches

  // Custom tooltips for premium aesthetics
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = ((data.value / totalFinished) * 100).toFixed(1);
      return (
        <div className="bg-[#0b132b]/95 border border-[#1e293b]/90 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="font-bold text-xs" style={{ color: data.color }}>{data.name}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-white font-extrabold text-sm">{data.value} {data.value === 1 ? 'partido' : 'partidos'}</span>
            <span className="text-gray-400 text-xs">({pct}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b132b]/95 border border-[#1e293b]/90 p-4 rounded-xl shadow-2xl backdrop-blur-md space-y-1.5">
          <p className="font-extrabold text-xs text-white border-b border-[#1e293b] pb-1.5 mb-1.5">{label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-6 text-xs">
              <span className="text-gray-400 font-medium">{item.name}:</span>
              <span className="font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!isMounted) {
    // SSR Placeholder to prevent layout shift
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#121212] border border-[#1e293b]/40 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-[#121212] border border-[#1e293b]/40 rounded-2xl" />
          <div className="h-80 bg-[#121212] border border-[#1e293b]/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Telemetry Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Exact Rate */}
        <div className="bg-[#080d22]/40 border border-[#1e293b]/60 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group hover:border-[#00B894]/30 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#00B894]/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-[#00B894] mb-2">
            <Target className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Tasa Acierto Exacto</span>
          </div>
          <p className="text-2xl font-black text-white">{exactAccuracy.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-500 mt-1">{exactHits} marcadores perfectos</p>
        </div>

        {/* Global Effectiveness */}
        <div className="bg-[#080d22]/40 border border-[#1e293b]/60 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group hover:border-[#D4AF37]/30 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Efectividad General</span>
          </div>
          <p className="text-2xl font-black text-white">{hitAccuracy.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-500 mt-1">{exactHits + partialHits} de {totalFinished} partidos acertados</p>
        </div>

        {/* Avg Points */}
        <div className="bg-[#080d22]/40 border border-[#1e293b]/60 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Award className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Promedio por Partido</span>
          </div>
          <p className="text-2xl font-black text-white">{avgPoints.toFixed(2)}</p>
          <p className="text-[10px] text-gray-500 mt-1">puntos por pronóstico</p>
        </div>

        {/* Max Match Points */}
        <div className="bg-[#080d22]/40 border border-[#1e293b]/60 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Rendimiento Máximo</span>
          </div>
          <p className="text-2xl font-black text-white">{maxPoints} pts</p>
          <p className="text-[10px] text-gray-500 mt-1">máximo en un solo partido</p>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doughnut Chart */}
        <Card className="border-[#1e293b]/70 bg-[#080d22]/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#00B894]" />
              Distribución de Aciertos
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Detalle de exactitud de tus predicciones en partidos finalizados
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[260px] relative">
            <div className="w-full h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defaultPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {defaultPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#050814" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Inner Circle Info */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Efectividad</span>
                <span className="text-3xl font-black text-white">{hitAccuracy.toFixed(0)}%</span>
                <span className="text-[10px] text-[#00B894] font-bold">
                  {exactHits + partialHits} / {totalFinished} pts
                </span>
              </div>
            </div>

            {/* Custom Interactive Legend */}
            <div className="grid grid-cols-3 gap-2 w-full mt-2 text-center">
              <div className="p-2 rounded-lg bg-emerald-950/10 border border-emerald-900/10">
                <div className="text-[10px] text-gray-400 font-medium truncate">Aciertos Exactos</div>
                <div className="text-sm font-extrabold text-[#00B894] mt-0.5">{exactHits}</div>
                <div className="text-[9px] text-gray-500">({((exactHits / totalFinished) * 100).toFixed(0)}%)</div>
              </div>
              <div className="p-2 rounded-lg bg-yellow-950/10 border border-yellow-900/10">
                <div className="text-[10px] text-gray-400 font-medium truncate">Aciertos Parc.</div>
                <div className="text-sm font-extrabold text-[#D4AF37] mt-0.5">{partialHits}</div>
                <div className="text-[9px] text-gray-500">({((partialHits / totalFinished) * 100).toFixed(0)}%)</div>
              </div>
              <div className="p-2 rounded-lg bg-red-950/10 border border-red-900/10">
                <div className="text-[10px] text-gray-400 font-medium truncate">Sin Acierto</div>
                <div className="text-sm font-extrabold text-[#EF4444] mt-0.5">{misses}</div>
                <div className="text-[9px] text-gray-500">({((misses / totalFinished) * 100).toFixed(0)}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points per Round Chart */}
        <Card className="border-[#1e293b]/70 bg-[#080d22]/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
              Desempeño por Ronda
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Historial de puntos y aciertos perfectos por fase del torneo
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[260px] flex items-center justify-center">
            {roundChartData.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <AlertCircle className="h-8 w-8 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">Sin datos de rondas disponibles</p>
              </div>
            ) : (
              <div className="w-full h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={roundChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorExact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B894" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00B894" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/45" vertical={false} />
                    <XAxis 
                      dataKey="roundName" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                    />
                    <Bar 
                      name="Puntos Totales" 
                      dataKey="Puntos Totales" 
                      fill="url(#colorPoints)" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={30}
                    />
                    <Bar 
                      name="Aciertos Exactos" 
                      dataKey="Aciertos Exactos" 
                      fill="url(#colorExact)" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
