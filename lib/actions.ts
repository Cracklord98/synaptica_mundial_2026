"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Helper to check if current user is admin
async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return !!profile?.is_admin;
}

// 1. Accept Dupla Invitation
export async function acceptDuplaInvitation(inviterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Get inviter profile
  const { data: inviter } = await supabase
    .from("profiles")
    .select("team_name, username")
    .eq("id", inviterId)
    .single();

  if (!inviter) throw new Error("Invitador no encontrado");

  // Get current user's profile
  const { data: currentUser } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Update current user's profile to link partner and team
  const { error: error1 } = await supabase
    .from("profiles")
    .update({
      partner_id: inviterId,
      team_name: inviter.team_name,
    })
    .eq("id", user.id);

  if (error1) throw error1;

  // Update inviter's profile to link partner (mutual)
  const { error: error2 } = await supabase
    .from("profiles")
    .update({
      partner_id: user.id,
      partner_email: null, // Clear pending email
    })
    .eq("id", inviterId);

  if (error2) throw error2;

  revalidatePath("/dashboard");
  return { success: true };
}

// 2. Reject/Cancel Dupla Invitation
export async function rejectDuplaInvitation(inviterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Just clear the partner_email field from the inviter's profile
  const { error } = await supabase
    .from("profiles")
    .update({ partner_email: null })
    .eq("id", inviterId);

  if (error) throw error;

  revalidatePath("/dashboard");
  return { success: true };
}

// 2.5. Send Dupla Invitation
export async function sendDuplaInvitation(partnerEmail: string, teamName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const cleanedEmail = partnerEmail.toLowerCase().trim();
  if (!cleanedEmail) throw new Error("El correo del compañero es requerido");
  if (!teamName.trim()) throw new Error("El nombre de la dupla es requerido");

  const { error } = await supabase
    .from("profiles")
    .update({
      partner_email: cleanedEmail,
      team_name: teamName.trim(),
    })
    .eq("id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard");
  return { success: true };
}

// 2.7. Cancel Sent Dupla Invitation (by sender)
export async function cancelSentInvitation() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("profiles")
    .update({ partner_email: null, team_name: null })
    .eq("id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard");
  return { success: true };
}

// 3. Submit Prediction
export async function submitPrediction(
  matchId: string,
  scoreLocal: number,
  scoreVisitor: number,
  winnerId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

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

  revalidatePath("/predictions");
  return { success: true };
}

// 4. Submit Bonus Predictions
export async function submitBonus(
  championId: string,
  finalist1Id: string,
  finalist2Id: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

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

// 5. Upload Model Card reference
export async function uploadModelCard(fileUrl: string, description: string, repoUrl: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Check deadline: July 17, 2026
  const deadline = new Date("2026-07-17T23:59:59Z");
  if (new Date() > deadline) {
    throw new Error("La fecha límite para subir el Model Card ha expirado");
  }

  const { error } = await supabase
    .from("model_cards")
    .upsert({
      user_id: user.id,
      file_url: fileUrl,
      description: description,
      repo_url: repoUrl,
      uploaded_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) throw error;

  revalidatePath("/model-card");
  revalidatePath("/dashboard/model-card");
  return { success: true };
}


// ==========================================
// ADMIN ACTIONS
// ==========================================

// 7. Update Match Result (Admin)
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

  revalidatePath("/admin/matches");
  revalidatePath("/bracket");
  revalidatePath("/leaderboard");
  return { success: true };
}

// 7.5. Save Team (Admin)
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

  revalidatePath("/admin/teams");
  revalidatePath("/admin/matches");
  return { success: true };
}

// 7.7. Delete Team (Admin)
export async function deleteTeam(teamId: string) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado");

  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) throw error;

  revalidatePath("/admin/teams");
  revalidatePath("/admin/matches");
  return { success: true };
}


// 9. Save Teams Bulk (Scraper / Seed)
export async function saveTeamsBulk(teams: any[]) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado");

  const { error } = await supabase
    .from("teams")
    .upsert(teams, { onConflict: "name" });

  if (error) throw error;
  return { success: true };
}

// 10. Save Matches Bulk (Seeding)
export async function saveMatchesBulk(matches: any[]) {
  const supabase = await createClient();
  const isAdmin = await checkAdmin(supabase);
  if (!isAdmin) throw new Error("Acceso denegado");

  const { error } = await supabase
    .from("matches")
    .upsert(matches);

  if (error) throw error;
  return { success: true };
}

// 11. Delete Participant (Admin tool)
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
