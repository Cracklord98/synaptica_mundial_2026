"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Revalidates cache paths to update the Next.js cache and ensure
 * clients receive fresh data on the dashboard pages.
 * 
 * @param paths Array of absolute Next.js routes to revalidate
 */
function revalidateDashboardPaths(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

// Helper type for Supabase clients configured server-side
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Checks whether the currently authenticated user has administrator privileges.
 * Queries the `public.profiles` table to retrieve the user's role status.
 * 
 * @param supabase Authenticated server-side Supabase client
 * @returns Promise resolving to `true` if the user is an admin, `false` otherwise
 */
async function checkAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return !!profile?.is_admin;
}

/**
 * Submits or updates a prediction for a specific tournament match.
 * 
 * Business Logic & Constraints:
 * - The user must be authenticated.
 * - Administrators are forbidden from submitting predictions.
 * - Predictions cannot be submitted after the match deadline (1 hour before match time).
 * - Match scores must be non-negative integers.
 * 
 * @param matchId Unique identifier (UUID) of the match to predict
 * @param scoreLocal Predicted goals for the local (home) team
 * @param scoreVisitor Predicted goals for the visitor (away) team
 * @param winnerId Predicted team identifier to advance to the next round
 * @returns Success response object
 * @throws Error if unauthenticated, if the user is an admin, if the match doesn't exist,
 *         if the deadline has passed, or if inputs are invalid.
 */
export async function submitPrediction(
  matchId: string,
  scoreLocal: number,
  scoreVisitor: number,
  winnerId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Block admins from predicting
  const isAdmin = await checkAdmin(supabase);
  if (isAdmin) throw new Error("Acceso denegado: Los administradores no pueden registrar predicciones.");

  // Get match deadline
  const { data: match } = await supabase
    .from("matches")
    .select("deadline")
    .eq("id", matchId)
    .single();

  if (!match) throw new Error("Partido no encontrado");

  // Check deadline
  if (new Date(match.deadline) < new Date()) {
    throw new Error("El tiempo límite para este partido ha expirado");
  }

  if (scoreLocal < 0 || scoreVisitor < 0) {
    throw new Error("Los goles deben ser mayores o iguales a cero");
  }

  // Save prediction
  const { error } = await supabase
    .from("predictions")
    .upsert({
      user_id: user.id,
      match_id: matchId,
      score_local: scoreLocal,
      score_visitor: scoreVisitor,
      winner_id: winnerId,
      submitted_at: new Date().toISOString(),
    }, { onConflict: "user_id,match_id" });

  if (error) throw error;

  revalidateDashboardPaths(["/dashboard", "/dashboard/predictions", "/dashboard/bracket"]);
  return { success: true };
}

/**
 * Submits or updates the special pre-tournament bonus predictions.
 * 
 * Business Logic & Constraints:
 * - The user must be authenticated.
 * - Administrators are forbidden from predicting bonus questions.
 * - Submissions are only permitted before the tournament starts (June 28, 2026).
 * 
 * @param championId Predicted tournament champion team UUID
 * @param finalist1Id Predicted tournament finalist 1 team UUID
 * @param finalist2Id Predicted tournament finalist 2 team UUID
 * @returns Success response object
 * @throws Error if unauthenticated, if the user is an admin, or if the bonus deadline has passed.
 */
export async function submitBonus(
  championId: string,
  finalist1Id: string,
  finalist2Id: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Block admins from predicting bonus
  const isAdmin = await checkAdmin(supabase);
  if (isAdmin) throw new Error("Acceso denegado: Los administradores no pueden registrar predicciones bonus.");

  // Check overall deadline: June 28, 2026 (first match of Round of 32)
  const deadline = new Date("2026-06-28T00:00:00Z");
  if (new Date() > deadline) {
    throw new Error("El tiempo límite para predicciones bonus ha expirado");
  }

  const { error } = await supabase
    .from("bonus_predictions")
    .upsert({
      user_id: user.id,
      champion_id: championId,
      finalist1_id: finalist1Id,
      finalist2_id: finalist2Id,
      submitted_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) throw error;

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Submits or updates the prediction methodology card (Model Card) for the analytic track.
 * 
 * Business Logic & Constraints:
 * - The user must be authenticated.
 * - Administrators do not participate in the analytic track.
 * - Submission deadline is July 17, 2026.
 * 
 * @param answers Structured response map containing responses to the 7 analytic questions
 * @param repoUrl Optional URL link to code repository or notebook used for calculations
 * @returns Success response object
 * @throws Error if unauthenticated, if the user is an admin, or if the deadline has passed.
 */
export async function uploadModelCard(answers: Record<string, unknown>, repoUrl: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Block admins from uploading model cards
  const isAdmin = await checkAdmin(supabase);
  if (isAdmin) throw new Error("Acceso denegado: Los administradores no participan de la pista analítica.");

  // Check deadline: July 17, 2026
  const deadline = new Date("2026-07-17T23:59:59Z");
  if (new Date() > deadline) {
    throw new Error("La fecha límite para subir el Model Card ha expirado");
  }

  const { error } = await supabase
    .from("model_cards")
    .upsert({
      user_id: user.id,
      answers: answers,
      description: answers?.q3_approach || null,
      repo_url: repoUrl,
      uploaded_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) throw error;

  revalidateDashboardPaths(["/dashboard", "/dashboard/model-card"]);
  return { success: true };
}


// ==========================================
// ADMIN ACTIONS
// ==========================================

/**
 * Updates a match result (Admin action).
 * 
 * When `isFinished` is set to `true`, the Supabase database triggers `on_match_finished`
 * (calculating points for all predictors) and `on_match_winner_propagation` (populating
 * the next bracket node with the winner).
 * 
 * @param matchId Unique match identifier UUID
 * @param team1Id Team 1 (local) identifier UUID, or null
 * @param team2Id Team 2 (visitor) identifier UUID, or null
 * @param team1Score Real goals scored by team 1, or null
 * @param team2Score Real goals scored by team 2, or null
 * @param winnerId Real winner identifier UUID (required if match finished), or null
 * @param isFinished Whether the match has officially finished
 * @returns Success response object
 * @throws Error if the user does not have administrator privileges.
 */
export async function updateMatchResult(
  matchId: string,
  team1Id: string | null,
  team2Id: string | null,
  team1Score: number | null,
  team2Score: number | null,
  winnerId: string | null,
  isFinished: boolean
) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado: se requieren privilegios de administrador");

  const { error } = await supabase
    .from("matches")
    .update({
      team1_id: team1Id,
      team2_id: team2Id,
      team1_score: team1Score,
      team2_score: team2Score,
      winner_id: winnerId,
      is_finished: isFinished,
    })
    .eq("id", matchId);

  if (error) throw error;

  revalidateDashboardPaths([
    "/dashboard",
    "/dashboard/admin/matches",
    "/dashboard/bracket",
    "/dashboard/leaderboard",
  ]);
  return { success: true };
}

/**
 * Creates or updates a team profile in the database (Admin action).
 * 
 * @param teamId Unique team identifier UUID (null to insert a new team)
 * @param name Spanish team name
 * @param flagUrl Public URL containing flag image
 * @param groupName Group character ('A' through 'L')
 * @param positionInGroup Ranking within the group (1 to 4), or null
 * @param isQualified Whether the team qualified for the knockout stage
 * @param eliminated Whether the team has been eliminated
 * @returns Success response object
 * @throws Error if the user does not have administrator privileges.
 */
export async function saveTeam(
  teamId: string | null,
  name: string,
  flagUrl: string,
  groupName: string,
  positionInGroup: number | null,
  isQualified: boolean,
  eliminated: boolean
) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado");

  const teamData = {
    name,
    flag_url: flagUrl || null,
    group_name: groupName,
    position_in_group: positionInGroup,
    is_qualified: isQualified,
    eliminated: eliminated,
  };

  let error;
  if (teamId) {
    const { error: err } = await supabase
      .from("teams")
      .update(teamData)
      .eq("id", teamId);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("teams")
      .insert(teamData);
    error = err;
  }

  if (error) throw error;

  revalidateDashboardPaths([
    "/dashboard",
    "/dashboard/admin/teams",
    "/dashboard/admin/matches",
    "/dashboard/bracket",
  ]);
  return { success: true };
}

/**
 * Deletes a team from the database (Admin action).
 * 
 * @param teamId Unique team identifier UUID
 * @returns Success response object
 * @throws Error if the user does not have administrator privileges.
 */
export async function deleteTeam(teamId: string) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado");

  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) throw error;

  revalidateDashboardPaths([
    "/dashboard",
    "/dashboard/admin/teams",
    "/dashboard/admin/matches",
    "/dashboard/bracket",
  ]);
  return { success: true };
}

/**
 * Upserts multiple teams in bulk into the database (Admin action).
 * Used mainly by initial database seeding scripts.
 * 
 * @param teams Array of team objects to upsert
 * @returns Success response object
 * @throws Error if the user does not have administrator privileges.
 */
export async function saveTeamsBulk(teams: Array<Record<string, unknown>>) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado");

  const { error } = await supabase
    .from("teams")
    .upsert(teams, { onConflict: "name" });

  if (error) throw error;
  return { success: true };
}

/**
 * Upserts multiple matches in bulk into the database (Admin action).
 * 
 * @param matches Array of match objects to upsert
 * @returns Success response object
 * @throws Error if the user does not have administrator privileges.
 */
export async function saveMatchesBulk(matches: Array<Record<string, unknown>>) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado");

  const { error } = await supabase
    .from("matches")
    .upsert(matches);

  if (error) throw error;

  revalidateDashboardPaths([
    "/dashboard",
    "/dashboard/admin/matches",
    "/dashboard/bracket",
    "/dashboard/leaderboard",
  ]);
  return { success: true };
}

/**
 * Deletes a participant's profile from the database (Admin action).
 * Admins cannot delete their own profile.
 * 
 * @param userId Unique user/profile identifier UUID to delete
 * @returns Success response object
 * @throws Error if the user is unauthenticated, not an admin, or attempts self-deletion.
 */
export async function deleteUserAction(userId: string) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado");

  // Check if trying to delete own admin profile
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.id === userId) {
    throw new Error("No puedes eliminar tu propio usuario administrador");
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

/**
 * Fetches and processes live tournament group standings from the external World Cup API.
 * 
 * It sorts teams by points, goal difference, and goals scored, identifies the top 2
 * qualifiers from each group, and calculates the top 8 best third-place teams that
 * qualify for the Round of 32. If the API fails, it falls back to database error info.
 * 
 * @returns Standings data object containing groups with qualification status and ranked third-place list
 */
export async function getLiveStandings() {
  try {
    const teamsRes = await fetch("https://worldcup26.ir/get/teams", { next: { revalidate: 60 } });
    const groupsRes = await fetch("https://worldcup26.ir/get/groups", { next: { revalidate: 60 } });

    if (!teamsRes.ok || !groupsRes.ok) {
      throw new Error("Error fetching standings from API");
    }

    const teamsData = await teamsRes.json();
    const groupsData = await groupsRes.json();

    const teamsList = teamsData.teams || teamsData;
    const groupsList = groupsData.groups || groupsData;

    // Map team ID to team info
    const teamMap = new Map<string, any>();
    teamsList.forEach((t: any) => {
      teamMap.set(String(t.id), t);
    });

    const thirds: any[] = [];
    const top2Ids = new Set<string>();
    
    const formattedGroups = groupsList.map((g: any) => {
      const sortedTeams = (g.teams || []).map((t: any, index: number) => {
        const teamInfo = teamMap.get(String(t.team_id)) || {};
        return {
          id: String(t.team_id),
          name: teamInfo.name_en || "TBD",
          flag_url: teamInfo.flag || null,
          position: index + 1,
          mp: parseInt(t.mp || "0", 10),
          w: parseInt(t.w || "0", 10),
          d: parseInt(t.d || "0", 10),
          l: parseInt(t.l || "0", 10),
          pts: parseInt(t.pts || "0", 10),
          gf: parseInt(t.gf || "0", 10),
          ga: parseInt(t.ga || "0", 10),
          gd: parseInt(t.gd || "0", 10),
        };
      });

      // Sort explicitly just in case
      sortedTeams.sort((a: any, b: any) => {
        if (a.pts !== b.pts) return b.pts - a.pts;
        if (a.gd !== b.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

      // Update positions after sort
      sortedTeams.forEach((t: any, idx: number) => {
        t.position = idx + 1;
        if (t.position <= 2) {
          top2Ids.add(t.id);
        } else if (t.position === 3) {
          thirds.push({
            id: t.id,
            name: t.name,
            flag_url: t.flag_url,
            pts: t.pts,
            gd: t.gd,
            gf: t.gf,
            mp: t.mp,
            w: t.w,
            d: t.d,
            l: t.l,
            groupName: g.name
          });
        }
      });

      return {
        name: g.name,
        teams: sortedTeams
      };
    });

    // Sort thirds
    const sortedThirds = thirds.sort((a, b) => {
      if (a.pts !== b.pts) return b.pts - a.pts;
      if (a.gd !== b.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    // Add rank and check if they qualify
    const top8ThirdsIds = new Set<string>();
    const thirdsWithRank = sortedThirds.map((t, index) => {
      const rank = index + 1;
      const isQualified = rank <= 8;
      if (isQualified) {
        top8ThirdsIds.add(t.id);
      }
      return {
        ...t,
        rank,
        isQualified
      };
    });

    // We can also flag the teams inside groups as qualified or not
    const groupsWithStatus = formattedGroups.map((g: any) => {
      return {
        ...g,
        teams: g.teams.map((t: any) => {
          const isQualified = t.position <= 2 || top8ThirdsIds.has(t.id);
          const isEliminated = t.position === 4 || (t.position === 3 && !isQualified);
          return {
            ...t,
            isQualified,
            isEliminated
          };
        })
      };
    });

    return {
      success: true,
      groups: groupsWithStatus,
      thirds: thirdsWithRank,
      live: true
    };
  } catch (err: any) {
    console.error("Error fetching live standings:", err);
    // Fallback to database
    return {
      success: false,
      error: err.message,
      live: false
    };
  }
}


