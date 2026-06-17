import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  // Validate Vercel Cron authorization secret
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("No Autorizado", { status: 401 });
  }

  // Create Supabase client using environment credentials
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {}
      }
    }
  );

  try {
    // 1. Fetch matches from the free worldcup26.ir API
    const response = await fetch("https://worldcup26.ir/get/games", {
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const externalGames = data.games || data;

    if (!Array.isArray(externalGames)) {
      throw new Error("Formato de respuesta de API inválido");
    }

    // 2. Fetch our existing teams to map names to database IDs
    const { data: dbTeams } = await supabase
      .from("teams")
      .select("id, name");
    
    const teamMap = new Map<string, string>();
    dbTeams?.forEach(t => teamMap.set(t.name.toLowerCase().trim(), t.id));

    // Helper to fetch or dynamically insert a team if not present in DB
    async function getOrCreateTeamId(teamName: string): Promise<string> {
      const normalized = teamName.trim();
      const lowerName = normalized.toLowerCase();
      
      if (teamMap.has(lowerName)) {
        return teamMap.get(lowerName)!;
      }

      // Generate a new UUID and flag URL using the country prefix as a fallback
      const newId = crypto.randomUUID();
      const flagCode = normalized.slice(0, 2).toLowerCase();
      
      const { error } = await supabase
        .from("teams")
        .insert({
          id: newId,
          name: normalized,
          flag_url: `https://flagcdn.com/${flagCode}.svg`,
          group_name: "Group Stage",
          position_in_group: null,
          is_qualified: true,
          eliminated: false
        });

      if (error) throw error;
      teamMap.set(lowerName, newId);
      return newId;
    }

    // 3. Fetch all matches in the database ordered chronologically
    const { data: dbMatches } = await supabase
      .from("matches")
      .select("*")
      .order("match_datetime", { ascending: true });

    // Filter round_32 matches (the starting knockout round)
    const r32Matches = dbMatches?.filter(m => m.round === "round_32") || [];

    // Filter and sort API games for Round of 32
    const apiR32Games = externalGames
      .filter((g: any) => g.type === "r32" || g.group === "R32")
      .sort((a: any, b: any) => new Date(a.local_date).getTime() - new Date(b.local_date).getTime());

    let updatedMatchupCount = 0;
    let updatedScoreCount = 0;

    // A. Sync Round of 32 Matchups (once group stage ends)
    for (let i = 0; i < Math.min(r32Matches.length, apiR32Games.length); i++) {
      const dbMatch = r32Matches[i];
      const apiGame = apiR32Games[i];

      const homeTeam = apiGame.home_team_name_en;
      const awayTeam = apiGame.away_team_name_en;

      // Check if team is a resolved country name (and not a placeholder label)
      const isActualTeam = (name: string) => 
        name && 
        !name.includes("Winner") && 
        !name.includes("Runner-up") && 
        !name.includes("3rd") && 
        name !== "TBD" &&
        name !== "0";

      if (isActualTeam(homeTeam) && isActualTeam(awayTeam)) {
        const homeId = await getOrCreateTeamId(homeTeam);
        const awayId = await getOrCreateTeamId(awayTeam);

        if (dbMatch.team1_id !== homeId || dbMatch.team2_id !== awayId) {
          const { error } = await supabase
            .from("matches")
            .update({
              team1_id: homeId,
              team2_id: awayId
            })
            .eq("id", dbMatch.id);

          if (error) throw error;
          updatedMatchupCount++;
        }
      }
    }

    // B. Sync finished match scores for ALL rounds
    const { data: dbMatchesFresh } = await supabase
      .from("matches")
      .select(`
        *,
        team1:teams!team1_id(id, name),
        team2:teams!team2_id(id, name)
      `);

    for (const dbMatch of (dbMatchesFresh || [])) {
      // Skip if match is already marked finished or doesn't have teams assigned yet
      if (dbMatch.is_finished || !dbMatch.team1_id || !dbMatch.team2_id) {
        continue;
      }

      const t1Name = dbMatch.team1?.name.toLowerCase().trim();
      const t2Name = dbMatch.team2?.name.toLowerCase().trim();

      // Find this match in the API games list by matching team names
      const apiGame = externalGames.find((g: any) => {
        const home = (g.home_team_name_en || "").toLowerCase().trim();
        const away = (g.away_team_name_en || "").toLowerCase().trim();
        return (home === t1Name && away === t2Name) || (home === t2Name && away === t1Name);
      });

      if (apiGame && apiGame.finished === "TRUE") {
        const isHomeTeam1 = (apiGame.home_team_name_en || "").toLowerCase().trim() === t1Name;
        const score1 = parseInt(isHomeTeam1 ? apiGame.home_score : apiGame.away_score, 10);
        const score2 = parseInt(isHomeTeam1 ? apiGame.away_score : apiGame.home_score, 10);

        let winnerId = null;
        if (score1 > score2) {
          winnerId = dbMatch.team1_id;
        } else if (score2 > score1) {
          winnerId = dbMatch.team2_id;
        } else {
          // Draw (requires penalty winner name matching)
          const apiWinnerName = (apiGame.winner || apiGame.winner_team_name || apiGame.winner_name || "").toLowerCase().trim();
          if (apiWinnerName) {
            if (apiWinnerName === t1Name) winnerId = dbMatch.team1_id;
            else if (apiWinnerName === t2Name) winnerId = dbMatch.team2_id;
          }
        }

        // Update the match result. If winnerId is resolved, mark is_finished = true.
        // Otherwise, write scores and let the admin choose the shootout winner manually.
        const { error } = await supabase
          .from("matches")
          .update({
            team1_score: score1,
            team2_score: score2,
            winner_id: winnerId,
            is_finished: winnerId !== null
          })
          .eq("id", dbMatch.id);

        if (error) throw error;
        updatedScoreCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      syncTime: new Date().toISOString(),
      updatedMatchups: updatedMatchupCount, 
      updatedScores: updatedScoreCount 
    });

  } catch (err: unknown) {
    console.error("Cron Error (sync-matches):", err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Error de sincronización" 
    }, { status: 500 });
  }
}
