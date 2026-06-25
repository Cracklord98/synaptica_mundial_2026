import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Disable local TLS validation only in development mode
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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

  // Create service-role or client-server database connection
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
    // 1. Fetch all teams from external API
    const teamsResponse = await fetch("https://worldcup26.ir/get/teams");
    if (!teamsResponse.ok) {
      throw new Error(`Teams API returned status ${teamsResponse.status}`);
    }
    const teamsData = await teamsResponse.json();
    const externalTeamsList = teamsData.teams || teamsData;

    if (!Array.isArray(externalTeamsList)) {
      throw new Error("Formato de respuesta de API de equipos inválido");
    }

    // 2. Fetch groups to get standings positions, qualified, eliminated status
    const groupsResponse = await fetch("https://worldcup26.ir/get/groups");
    let externalGroups: any[] = [];
    if (groupsResponse.ok) {
      const groupsData = await groupsResponse.json();
      externalGroups = groupsData.groups || groupsData || [];
    }

    // Determine qualified/eliminated status from standings
    // 12 groups. Top 2 of each qualify.
    // Plus top 8 thirds.
    const thirds: any[] = [];
    const top2Ids = new Set<string>();
    const groupMap = new Map<string, string>(); // teamId -> groupName
    const positionMap = new Map<string, number>(); // teamId -> position (1-indexed)

    if (Array.isArray(externalGroups)) {
      externalGroups.forEach((g: any) => {
        const groupTeams = g.teams || [];
        // Teams in g.teams are already sorted by standing position
        groupTeams.forEach((t: any, index: number) => {
          const tId = String(t.team_id);
          const position = index + 1;
          positionMap.set(tId, position);
          groupMap.set(tId, g.name);

          if (position <= 2) {
            top2Ids.add(tId);
          } else if (position === 3) {
            thirds.push({
              team_id: tId,
              pts: parseInt(t.pts || "0", 10),
              gd: parseInt(t.gd || "0", 10),
              gf: parseInt(t.gf || "0", 10),
              groupName: g.name
            });
          }
        });
      });
    }

    // Sort thirds to identify the 8 best
    const sortedThirds = thirds.sort((a, b) => {
      if (a.pts !== b.pts) return b.pts - a.pts;
      if (a.gd !== b.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    const top8ThirdsIds = new Set<string>();
    sortedThirds.slice(0, 8).forEach(t => top8ThirdsIds.add(t.team_id));

    // Format teams for DB upsert
    const formattedTeams = externalTeamsList.map((team: any) => {
      const teamIdStr = String(team.id);
      const isTop2 = top2Ids.has(teamIdStr);
      const isTopThird = top8ThirdsIds.has(teamIdStr);
      
      const groupName = groupMap.get(teamIdStr) || team.groups || "A";
      const position = positionMap.get(teamIdStr) || null;
      
      // A team is qualified if it is top 2 or one of the 8 best thirds
      const isQualified = isTop2 || isTopThird;
      
      // A team is eliminated if it is 4th in group, or one of the bottom 4 thirds
      const isEliminated = position === 4 || (position === 3 && !isQualified);

      return {
        name: team.name_en,
        flag_url: team.flag || `https://flagcdn.com/w80/${team.iso2?.toLowerCase()}.png`,
        group_name: groupName,
        position_in_group: position,
        is_qualified: isQualified,
        eliminated: isEliminated
      };
    });

    // Upsert teams into public.teams matching by name
    const { error } = await supabase
      .from("teams")
      .upsert(formattedTeams, { onConflict: "name" });

    if (error) throw error;

    return NextResponse.json({ success: true, count: formattedTeams.length });
  } catch (err: unknown) {
    console.error("Cron Error (update-standings):", err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Error desconocido" 
    }, { status: 500 });
  }
}

