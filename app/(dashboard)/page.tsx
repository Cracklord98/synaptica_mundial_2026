import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { 
  Trophy, 
  Award, 
  Users, 
  CreditCard, 
  Clock, 
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DuplaActions } from "@/components/dashboard/DuplaActions";

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

  // Fetch partner profile if exists
  let partnerProfile = null;
  if (profile.partner_id) {
    const { data: partner } = await supabase
      .from("profiles")
      .select("username, email, payment_status")
      .eq("id", profile.partner_id)
      .single();
    partnerProfile = partner;
  }

  // Fetch user stats from score_history
  const { data: scores } = await supabase
    .from("score_history")
    .select("points, match_id")
    .eq("user_id", user.id);

  const totalPoints = scores?.reduce((acc, curr) => acc + curr.points, 0) || 0;
  const matchesPredicted = scores?.length || 0;

  // Calculate position in standings
  const { data: allStandings } = await supabase
    .rpc("get_user_rankings_position"); // Fallback to inline query if function not defined

  // Let's run a raw query using Supabase to compute user rankings:
  const { data: rankings } = await supabase
    .from("score_history")
    .select("user_id, points");

  // Sum points per user
  const userPointsMap: Record<string, number> = {};
  rankings?.forEach(item => {
    userPointsMap[item.user_id] = (userPointsMap[item.user_id] || 0) + item.points;
  });

  // Sort and find current user rank
  const sortedUsers = Object.entries(userPointsMap).sort((a, b) => b[1] - a[1]);
  const userRankIndex = sortedUsers.findIndex(([uid]) => uid === user.id);
  const currentRank = userRankIndex !== -1 ? userRankIndex + 1 : "-";
  const totalCompetitors = sortedUsers.length || 0;

  // Fetch total count of matches in R32 to show progress
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

  // Fetch bonus prediction
  const { data: bonus } = await supabase
    .from("bonus_predictions")
    .select("*, champion:teams!champion_id(name), finalist1:teams!finalist1_id(name), finalist2:teams!finalist2_id(name)")
    .eq("user_id", user.id)
    .maybeSingle();

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
        <div className="relative z-10 shrink-0 bg-[#D4AF37]/10 p-5 rounded-2xl border border-[#D4AF37]/30 text-center">
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

        {/* Stat Mode */}
        <Card className="border-[#1A2B3C] bg-[#121212] hover-gold-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-400">Modo de Juego</CardTitle>
            <Users className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            {profile.team_name ? (
              <div>
                <div className="text-lg font-bold text-white truncate">{profile.team_name}</div>
                <p className="text-xs text-[#00B894] font-medium mt-1">
                  Pareja: @{partnerProfile?.username || "Compañero"}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-lg font-bold text-white">Individual</div>
                <p className="text-xs text-gray-400 mt-1">Juegas de forma independiente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic Partner & Invitations Card */}
        <Card className="border-[#1A2B3C] bg-[#121212]">
          <CardHeader>
            <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-[#D4AF37]" />
              Tu Equipo / Dupla
            </CardTitle>
            <CardDescription className="text-gray-400">
              Detalles sobre tu participación en dupla
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {profile.partner_id ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-[#0A0A0A] border border-[#1A2B3C] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Nombre del Equipo</span>
                    <strong className="text-[#D4AF37]">{profile.team_name}</strong>
                  </div>
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
                <div className="p-3.5 rounded-lg bg-[#0A0A0A] border border-[#1A2B3C] space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-400 block">Compañero</span>
                      <strong className="text-white">@{partnerProfile?.username}</strong>
                      <span className="text-xs text-gray-400 block">{partnerProfile?.email}</span>
                    </div>
                    {partnerProfile?.payment_status === "approved" ? (
                      <span className="text-xs bg-[#00B894]/10 text-[#00B894] py-1 px-2 rounded-full font-medium">
                        Pago Confirmado
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-950/30 text-yellow-300 py-1 px-2 rounded-full font-medium">
                        Pago Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <DuplaActions 
                partnerEmail={profile.partner_email} 
                teamName={profile.team_name} 
                hasPartner={false} 
              />
            )}
          </CardContent>
        </Card>

        {/* Bonus predictions details */}
        <Card className="border-[#1A2B3C] bg-[#121212]">
          <CardHeader>
            <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#D4AF37]" />
              Predicciones Bonus
            </CardTitle>
            <CardDescription className="text-gray-400">
              Elección de campeón y finalistas del torneo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {bonus ? (
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1A2B3C] flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-400 block">Predicción Campeón (+10 pts)</span>
                    <strong className="text-[#D4AF37]">{bonus.champion?.name || "Sin Seleccionar"}</strong>
                  </div>
                  <Trophy className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1A2B3C] flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-400 block">Predicción Finalista 1 (+5 pts)</span>
                    <strong className="text-white">{bonus.finalist1?.name || "Sin Seleccionar"}</strong>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </div>
                <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1A2B3C] flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-400 block">Predicción Finalista 2 (+5 pts)</span>
                    <strong className="text-white">{bonus.finalist2?.name || "Sin Seleccionar"}</strong>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-950/10 border border-yellow-600/30 text-center space-y-3">
                <p className="text-yellow-200 text-sm">
                  Aún no has configurado tus predicciones de campeón y finalistas.
                </p>
                <Link
                  href="/dashboard/predictions/round_32"
                  className="inline-block text-xs bg-[#D4AF37] text-black font-bold px-4 py-2 rounded hover:bg-[#C29E30] transition-colors"
                >
                  Configurar Predicciones
                </Link>
                <p className="text-[10px] text-gray-400">
                  Límite: 28 de Junio de 2026 (antes del inicio de Dieciseisavos)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
            Subir Model Card
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
