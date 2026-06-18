import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Disable local TLS validation only in development mode to bypass Windows handshake errors
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Fetch with timeout + exponential backoff retry
// Returns null (instead of throwing) if all attempts fail, so the cron gracefully degrades
async function fetchWithRetry(
  url: string,
  timeoutMs = 10000,
  maxRetries = 3
): Promise<Response | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return res;
      // Non-2xx response: log and retry
      console.warn(`[sync-matches] Attempt ${attempt}/${maxRetries} — API status ${res.status}`);
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === "AbortError";
      console.warn(
        `[sync-matches] Attempt ${attempt}/${maxRetries} — ${
          isAbort ? `Timeout after ${timeoutMs}ms` : String(err)
        }`
      );
    }
    if (attempt < maxRetries) {
      // Exponential backoff: 2s, 4s before next attempt
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
  }
  return null; // All attempts exhausted
}

// Explicit mapping between database Match UUIDs (from seed_data.sql) and API Match IDs (from http://worldcup26.ir)
const MATCH_MAPPING: Record<string, string> = {
  // Round of 32 (16 matches)
  "32323232-3232-3232-3232-323232323201": "73",
  "32323232-3232-3232-3232-323232323202": "75",
  "32323232-3232-3232-3232-323232323203": "74",
  "32323232-3232-3232-3232-323232323204": "77",
  "32323232-3232-3232-3232-323232323205": "76",
  "32323232-3232-3232-3232-323232323206": "78",
  "32323232-3232-3232-3232-323232323207": "79",
  "32323232-3232-3232-3232-323232323208": "80",
  "32323232-3232-3232-3232-323232323209": "81",
  "32323232-3232-3232-3232-323232323210": "82",
  "32323232-3232-3232-3232-323232323211": "83",
  "32323232-3232-3232-3232-323232323212": "84",
  "32323232-3232-3232-3232-323232323213": "85",
  "32323232-3232-3232-3232-323232323214": "87",
  "32323232-3232-3232-3232-323232323215": "86",
  "32323232-3232-3232-3232-323232323216": "88",

  // Round of 16 (8 matches)
  "16161616-1616-1616-1616-161616161601": "90",
  "16161616-1616-1616-1616-161616161602": "89",
  "16161616-1616-1616-1616-161616161603": "91",
  "16161616-1616-1616-1616-161616161604": "92",
  "16161616-1616-1616-1616-161616161605": "94",
  "16161616-1616-1616-1616-161616161606": "93",
  "16161616-1616-1616-1616-161616161607": "96",
  "16161616-1616-1616-1616-161616161608": "95",

  // Quarterfinals (4 matches)
  "08080808-0808-0808-0808-080808080801": "97",
  "08080808-0808-0808-0808-080808080802": "98",
  "08080808-0808-0808-0808-080808080803": "99",
  "08080808-0808-0808-0808-080808080804": "100",

  // Semifinals (2 matches)
  "04040404-0404-0404-0404-040404040401": "101",
  "04040404-0404-0404-0404-040404040402": "102",

  // Third Place Match
  "33333333-3333-3333-3333-333333333333": "103",

  // Gran Final
  "f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1": "104",
};

// Helper function to convert API date format "MM/DD/YYYY HH:mm" to ISO string assuming Eastern Daylight Time (EDT, UTC-4)
function parseApiDateToISO(dateStr: string): string {
  // Format: "MM/DD/YYYY HH:mm" -> "06/28/2026 12:00"
  const [datePart, timePart] = dateStr.trim().split(/\s+/);
  const [month, day, year] = datePart.split("/");
  const [hours, minutes] = timePart.split(":");
  // Parse assuming EDT (UTC-4) offset, which matches official ET match schedules
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00-04:00`;
}

export async function GET(request: Request) {
  // Validate Vercel Cron authorization secret
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("No Autorizado", { status: 401 });
  }

  // Create Supabase client using Service Role Key to bypass RLS policies if available
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        getAll() { return []; },
        setAll() {}
      }
    }
  );

  try {
    // 1. Fetch matches from the free worldcup26.ir API (with timeout + retry)
    const response = await fetchWithRetry("https://worldcup26.ir/get/games");

    if (!response) {
      // API is temporarily unavailable — return 200 (not our fault) to avoid false-positive alerts
      console.warn("[sync-matches] External API unavailable after 3 retries. Skipping sync.");
      return NextResponse.json({
        success: true,
        warning: "API externa no disponible temporalmente. Sincronización omitida.",
        syncTime: new Date().toISOString(),
        updatedMatches: 0,
        updatedMatchups: 0,
        updatedScores: 0,
        updatedDates: 0,
      });
    }

    const data = await response.json();
    const externalGames = data.games || data;

    if (!Array.isArray(externalGames)) {
      // Unexpected format — degrade gracefully
      console.warn("[sync-matches] Unexpected API response format:", JSON.stringify(data).slice(0, 200));
      return NextResponse.json({
        success: true,
        warning: "Formato de respuesta de API inesperado. Sincronización omitida.",
        syncTime: new Date().toISOString(),
        updatedMatches: 0,
        updatedMatchups: 0,
        updatedScores: 0,
        updatedDates: 0,
      });
    }

    // 2. Fetch our existing teams to map names to database IDs
    const { data: dbTeams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name");

    if (teamsError) throw teamsError;
    
    const teamMap = new Map<string, string>(); // name (lowercase) -> id
    const teamIdToName = new Map<string, string>(); // id -> name (lowercase)
    dbTeams?.forEach(t => {
      const normalized = t.name.toLowerCase().trim();
      teamMap.set(normalized, t.id);
      teamIdToName.set(t.id, normalized);
    });

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
      teamIdToName.set(newId, lowerName);
      return newId;
    }

    // 3. Fetch all matches in the database
    const { data: dbMatches, error: matchesError } = await supabase
      .from("matches")
      .select("*");

    if (matchesError) throw matchesError;

    let updatedMatchupCount = 0;
    let updatedScoreCount = 0;
    let updatedDateCount = 0;
    let updatedMatchCount = 0;

    const isActualTeam = (name: string) => 
      name && 
      !name.includes("Winner") && 
      !name.includes("Runner-up") && 
      !name.includes("3rd") && 
      name !== "TBD" &&
      name !== "0";

    // 4. Sincronizar partidos según mapeo explícito de bracket
    for (const dbMatch of (dbMatches || [])) {
      const apiId = MATCH_MAPPING[dbMatch.id];
      if (!apiId) continue;

      const apiGame = externalGames.find((g: any) => g.id === apiId);
      if (!apiGame) continue;

      const updateData: any = {};
      let needsUpdate = false;

      // A. Sync Date and Time (if changed or missing)
      const apiDateISO = parseApiDateToISO(apiGame.local_date);
      const matchDatetime = new Date(apiDateISO);
      const deadline = new Date(matchDatetime.getTime() - 60 * 60 * 1000); // 1 hour before

      const dbDatetime = dbMatch.match_datetime ? new Date(dbMatch.match_datetime) : null;
      const dbDeadline = dbMatch.deadline ? new Date(dbMatch.deadline) : null;

      if (!dbDatetime || dbDatetime.getTime() !== matchDatetime.getTime() ||
          !dbDeadline || dbDeadline.getTime() !== deadline.getTime()) {
        updateData.match_datetime = matchDatetime.toISOString();
        updateData.deadline = deadline.toISOString();
        needsUpdate = true;
        updatedDateCount++;
      }

      // B. Sync Teams (Ronda de 32 únicamente, ya que las demás rondas se autopropagan en BD al finalizar partidos)
      let team1Id = dbMatch.team1_id;
      let team2Id = dbMatch.team2_id;

      if (dbMatch.round === "round_32") {
        const homeTeamName = apiGame.home_team_name_en;
        const awayTeamName = apiGame.away_team_name_en;

        if (isActualTeam(homeTeamName) && isActualTeam(awayTeamName)) {
          const homeId = await getOrCreateTeamId(homeTeamName);
          const awayId = await getOrCreateTeamId(awayTeamName);

          if (dbMatch.team1_id !== homeId || dbMatch.team2_id !== awayId) {
            team1Id = homeId;
            team2Id = awayId;
            updateData.team1_id = homeId;
            updateData.team2_id = awayId;
            needsUpdate = true;
            updatedMatchupCount++;
          }
        }
      }

      // C. Sync Finished Match Scores (all rounds)
      if (apiGame.finished === "TRUE" && !dbMatch.is_finished && team1Id && team2Id) {
        const t1Name = teamIdToName.get(team1Id);
        const t2Name = teamIdToName.get(team2Id);

        if (t1Name && t2Name) {
          const homeScore = parseInt(apiGame.home_score, 10);
          const awayScore = parseInt(apiGame.away_score, 10);

          const apiHomeName = (apiGame.home_team_name_en || "").toLowerCase().trim();
          const isHomeTeam1 = apiHomeName === t1Name;

          const score1 = isHomeTeam1 ? homeScore : awayScore;
          const score2 = isHomeTeam1 ? awayScore : homeScore;

          let winnerId = null;
          if (score1 > score2) {
            winnerId = team1Id;
          } else if (score2 > score1) {
            winnerId = team2Id;
          } else {
            // Shootout winner matching
            const apiWinnerName = (apiGame.winner || apiGame.winner_team_name || apiGame.winner_name || "").toLowerCase().trim();
            if (apiWinnerName) {
              if (apiWinnerName === t1Name) winnerId = team1Id;
              else if (apiWinnerName === t2Name) winnerId = team2Id;
            }
          }

          updateData.team1_score = score1;
          updateData.team2_score = score2;
          updateData.winner_id = winnerId;
          updateData.is_finished = winnerId !== null;
          needsUpdate = true;
          updatedScoreCount++;
        }
      }

      // Perform single database update query per match if there are changes
      if (needsUpdate) {
        const { error } = await supabase
          .from("matches")
          .update(updateData)
          .eq("id", dbMatch.id);

        if (error) {
          // Log the individual failure but continue syncing the rest of the matches
          console.error(`[sync-matches] Error updating match ${dbMatch.id}:`, error.message);
        } else {
          updatedMatchCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      syncTime: new Date().toISOString(),
      updatedMatches: updatedMatchCount,
      updatedMatchups: updatedMatchupCount, 
      updatedScores: updatedScoreCount,
      updatedDates: updatedDateCount
    });

  } catch (err: unknown) {
    console.error("Cron Error (sync-matches):", err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Error de sincronización" 
    }, { status: 500 });
  }
}
