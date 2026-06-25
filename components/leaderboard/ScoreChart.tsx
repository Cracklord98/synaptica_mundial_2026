"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  r32_points: number;
  r16_points: number;
  quarter_points: number;
  semi_points: number;
  final_points: number;
}

interface ScoreChartProps {
  standings: LeaderboardEntry[];
  currentUserId: string;
}

const LINE_COLORS = [
  "#D4AF37", // Gold
  "#00B894", // Emerald Green
  "#3498db", // Blue
  "#e74c3c", // Red
  "#9b59b6", // Purple
  "#f1c40f", // Yellow
];

export default function ScoreChart({ standings, currentUserId }: ScoreChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If there are no participants, show placeholder
  if (standings.length === 0) return null;

  if (!mounted) {
    return (
      <Card className="border-[#1A2B3C] bg-[#121212] premium-card">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
          <CardTitle className="text-lg text-white font-bold">Evolución de Puntajes</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="w-full h-80 bg-zinc-950/50 animate-pulse rounded-lg border border-[#1A2B3C]" />
        </CardContent>
      </Card>
    );
  }

  // 1. Identify which users to plot: Top 5 + current user (if not already in top 5)
  const topUsers = standings.slice(0, 5);
  const currentUserEntry = standings.find((u) => u.user_id === currentUserId);
  const isCurrentUserInTop5 = topUsers.some((u) => u.user_id === currentUserId);

  const usersToPlot = [...topUsers];
  if (currentUserEntry && !isCurrentUserInTop5) {
    usersToPlot.push(currentUserEntry);
  }

  // 2. Format data for Recharts (cumulative rounds progression)
  const rounds = [
    { key: "start", label: "Inicio" },
    { key: "r32", label: "R32" },
    { key: "r16", label: "R16" },
    { key: "quarter", label: "4tos" },
    { key: "semi", label: "Semis" },
    { key: "final", label: "Final" },
  ];

  const chartData = rounds.map((round) => {
    const dataPoint: Record<string, any> = { name: round.label };

    usersToPlot.forEach((user) => {
      const name = `@${user.username}`;
      let cumulativePoints = 0;

      if (round.key === "start") {
        cumulativePoints = 0;
      } else if (round.key === "r32") {
        cumulativePoints = user.r32_points;
      } else if (round.key === "r16") {
        cumulativePoints = user.r32_points + user.r16_points;
      } else if (round.key === "quarter") {
        cumulativePoints = user.r32_points + user.r16_points + user.quarter_points;
      } else if (round.key === "semi") {
        cumulativePoints = user.r32_points + user.r16_points + user.quarter_points + user.semi_points;
      } else if (round.key === "final") {
        cumulativePoints = user.r32_points + user.r16_points + user.quarter_points + user.semi_points + user.final_points;
      }

      dataPoint[name] = cumulativePoints;
    });

    return dataPoint;
  });

  return (
    <Card className="border-[#1A2B3C] bg-[#121212] premium-card">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
        <CardTitle className="text-lg text-white font-bold">Evolución de Puntajes</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2B3C" opacity={0.4} />
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                tick={{ fill: "#888888", fontSize: 11 }}
                axisLine={{ stroke: "#1A2B3C" }}
              />
              <YAxis 
                stroke="#888888" 
                tick={{ fill: "#888888", fontSize: 11 }}
                axisLine={{ stroke: "#1A2B3C" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#0A0A0A", 
                  borderColor: "#1A2B3C",
                  borderRadius: "8px",
                  color: "#ffffff"
                }} 
              />
              <Legend 
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }} 
                iconType="circle"
              />
              {usersToPlot.map((user, idx) => {
                const name = `@${user.username}`;
                const isSelf = user.user_id === currentUserId;

                return (
                  <Line
                    key={user.user_id}
                    type="monotone"
                    dataKey={name}
                    stroke={isSelf ? "#D4AF37" : LINE_COLORS[idx % LINE_COLORS.length]}
                    strokeWidth={isSelf ? 3.5 : 2}
                    activeDot={{ r: 6 }}
                    dot={{ strokeWidth: 1, r: 3 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
