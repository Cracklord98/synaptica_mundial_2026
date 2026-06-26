"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Search, 
  User, 
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatDisplayName } from "@/lib/utils";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  exact_count: number;
  r32_points: number;
  r16_points: number;
  quarter_points: number;
  semi_points: number;
  final_points: number;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  currentUserId: string;
}

export default function LeaderboardTable({ data, currentUserId }: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((entry) => {
    const term = searchQuery.toLowerCase();
    return (
      entry.username.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar participante..."
          className="pl-10 border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0 w-full md:max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Leaderboard Table Card */}
      <Card className="border-[#1A2B3C] bg-[#121212] overflow-hidden premium-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-[#0A0A0A] border-b border-[#1A2B3C] text-gray-400">
              <tr>
                <th className="py-4 px-6 text-center w-16">Pos</th>
                <th className="py-4 px-6">Participante</th>
                <th className="py-4 px-6 text-center">R32</th>
                <th className="py-4 px-6 text-center">R16</th>
                <th className="py-4 px-6 text-center">4tos</th>
                <th className="py-4 px-6 text-center">Semis</th>
                <th className="py-4 px-6 text-center">Final</th>
                <th className="py-4 px-6 text-center">Exactos</th>
                <th className="py-4 px-6 text-center font-bold text-[#D4AF37]">Puntos</th>
              </tr>
            </thead>
            <motion.tbody 
              className="divide-y divide-[#1A2B3C]/50"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No se encontraron participantes.
                  </td>
                </tr>
              ) : (
                filteredData.map((entry, index) => {
                  const isCurrentUser = entry.user_id === currentUserId;
                  const pos = index + 1;

                  return (
                    <motion.tr 
                      key={entry.user_id} 
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`hover:bg-[#1A2B3C]/20 transition-colors ${
                        isCurrentUser ? "bg-[#D4AF37]/5 font-semibold border-l-2 border-[#D4AF37]" : ""
                      }`}
                    >
                      {/* Position */}
                      <td className="py-4 px-6 text-center">
                        {pos === 1 ? (
                          <Trophy className="h-5 w-5 text-[#D4AF37] mx-auto animate-bounce" />
                        ) : pos === 2 ? (
                          <span className="text-gray-400 font-bold text-sm">2º</span>
                        ) : pos === 3 ? (
                          <span className="text-amber-600 font-bold text-sm">3º</span>
                        ) : (
                          <span className="text-gray-500 font-bold">{pos}</span>
                        )}
                      </td>

                      {/* Username & Team */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={isCurrentUser ? "text-[#D4AF37]" : "text-white"}>
                              {formatDisplayName(entry.username)}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-bold">
                                Tú
                              </span>
                            )}
                          </div>

                        </div>
                      </td>


                      {/* Points breakdown by round */}
                      <td className="py-4 px-6 text-center text-gray-400">{entry.r32_points}</td>
                      <td className="py-4 px-6 text-center text-gray-400">{entry.r16_points}</td>
                      <td className="py-4 px-6 text-center text-gray-400">{entry.quarter_points}</td>
                      <td className="py-4 px-6 text-center text-gray-400">{entry.semi_points}</td>
                      <td className="py-4 px-6 text-center text-gray-400">{entry.final_points}</td>

                      {/* Exact score predictions */}
                      <td className="py-4 px-6 text-center text-gray-400 font-medium">
                        {entry.exact_count}
                      </td>

                      {/* Total Points */}
                      <td className="py-4 px-6 text-center font-bold text-base text-white">
                        {entry.total_points}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
