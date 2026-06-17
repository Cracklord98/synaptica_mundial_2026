import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { 
  Trophy, 
  Award, 
  ChevronRight,
  TrendingUp,
  FileText,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  // Fetch user stats from score_history
  const { data: scores } = await supabase
    .from("score_history")
    .select("points, match_id, round, is_exact")
    .eq("user_id", user.id);

  const totalPoints = scores?.reduce((acc, curr) => acc + curr.points, 0) || 0;

  // Sum points per user to compute ranking
  const { data: rankings } = await supabase
    .from("score_history")
    .select("user_id, points");

  const userPointsMap: Record<string, number> = {};
  rankings?.forEach(item => {
    userPointsMap[item.user_id] = (userPointsMap[item.user_id] || 0) + item.points;
  });

  // Sort and find current user rank
  const sortedUsers = Object.entries(userPointsMap).sort((a, b) => b[1] - a[1]);
  const userRankIndex = sortedUsers.findIndex(([uid]) => uid === user.id);
  const currentRank = userRankIndex !== -1 ? userRankIndex + 1 : "-";
  const totalCompetitors = sortedUsers.length || 0;

  // Fetch total count of matches to show progress
  const { count: totalMatchesCount } = await supabase
    .from("matches")
    .select("*", { count: 'exact', head: true });

  const { count: userPredictionsCount } = await supabase
    .from("predictions")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id);

  const predictionProgress = totalMatchesCount 
    ? Math.round(((userPredictionsCount || 0) / totalMatchesCount) * 100) 
    : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Hero */}
      <div className="premium-card p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <span className="text-xs uppercase tracking-widest text-[#00B894] font-bold">Resumen de Cuenta</span>
          <h1 className="text-4xl font-extrabold text-white">¡Hola, {profile.username}!</h1>
          <p className="text-gray-300 text-sm max-w-md">
            Bienvenido al panel de predicciones de Synaptica. Prepárate para ganar en la polla más analítica del Mundial 2026.
          </p>
        </div>
        <div className="relative z-10 shrink-0 bg-[#D4AF37]/10 p-5 rounded-2xl border border-[#D4AF37]/30 text-center min-w-[140px]">
          <Trophy className="h-12 w-12 text-[#D4AF37] mx-auto mb-2" />
          <p className="text-3xl font-black text-white">{totalPoints} pts</p>
          <p className="text-xs text-[#D4AF37] uppercase font-bold tracking-wider">Puntaje Total</p>
        </div>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Rank */}
        <Card className="border-[#1A2B3C] bg-[#121212] hover-gold-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-400">Puesto en Ranking</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">#{currentRank}</div>
            <p className="text-xs text-gray-400 mt-1">de {totalCompetitors || 1} participantes activos</p>
          </CardContent>
        </Card>

        {/* Stat Progress */}
        <Card className="border-[#1A2B3C] bg-[#121212] hover-gold-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-400">Progreso Predicciones</CardTitle>
            <Award className="h-4 w-4 text-[#00B894]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-black text-white">{predictionProgress}%</span>
              <span className="text-xs text-gray-400">
                {userPredictionsCount || 0} / {totalMatchesCount || 0} partidos
              </span>
            </div>
            <Progress value={predictionProgress} className="h-2 bg-[#1A2B3C]" />
          </CardContent>
        </Card>

        {/* Stat Exact Hits */}
        <Card className="border-[#1A2B3C] bg-[#121212] hover-gold-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-400">Marcadores Exactos</CardTitle>
            <Target className="h-4 w-4 text-[#00B894]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">
              {scores?.filter(s => s.is_exact).length || 0}
            </div>
            <p className="text-xs text-gray-400 mt-1">predicciones con marcador perfecto</p>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations & Advanced Charts */}
      <DashboardCharts scores={scores || []} />

      {/* Model card info */}
      <Card className="border-[#1A2B3C] bg-[#121212]">
        <CardHeader>
          <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#D4AF37]" />
            Pista Analítica (Model Card)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Documentación técnica de tu modelo predictivo
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-300 max-w-xl">
            Sube un PDF de 1 página que documente los criterios analíticos, bases de datos o algoritmos usados para tus predicciones. El jurado evaluará rigor, creatividad, reproducibilidad y comunicación.
          </p>
          <Link
            href="/dashboard/model-card"
            className="flex items-center gap-2 bg-[#1A2B3C] hover:bg-[#1A2B3C]/80 border border-[#1A2B3C] text-white font-bold px-5 py-3 rounded-lg transition-colors shrink-0 text-center"
          >
            Gestionar Model Card
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
