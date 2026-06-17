import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, 
  Calendar, 
  Layers, 
  Upload, 
  ListOrdered, 
  ShieldAlert, 
  LogOut, 
  User as UserIcon,
  Users as UsersIcon,
  Check,
  X,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptDuplaInvitation, rejectDuplaInvitation } from "@/lib/actions";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // If auth user exists but profile isn't synced yet, wait or redirect to retry
    return redirect("/auth/login");
  }

  // Fetch pending partner invitations (where partner_email matches this user's email)
  let pendingInvitation = null;
  if (user.email) {
    const { data: invitation } = await supabase
      .from("profiles")
      .select("id, username, team_name")
      .eq("partner_email", user.email.toLowerCase().trim())
      .is("partner_id", null)
      .maybeSingle();
    pendingInvitation = invitation;
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  const navItems = [
    { name: "Inicio", href: "/dashboard", icon: Trophy },
    { name: "Pronósticos", href: "/dashboard/predictions/round_32", icon: Calendar },
    { name: "Ranking", href: "/dashboard/leaderboard", icon: ListOrdered },
    { name: "Bracket", href: "/dashboard/bracket", icon: Layers },
    { name: "Model Card", href: "/dashboard/model-card", icon: Upload },
    { name: "Reglas", href: "/dashboard/rules", icon: BookOpen },
  ];
  
  const acceptAction = async (id: string) => {
    "use server";
    await acceptDuplaInvitation(id);
  };

  const rejectAction = async (id: string) => {
    "use server";
    await rejectDuplaInvitation(id);
  };

  return (
    <DashboardShell
      profile={profile}
      email={user.email || null}
      pendingInvitation={pendingInvitation}
      acceptAction={acceptAction}
      rejectAction={rejectAction}
      signOutAction={handleSignOut}
    >
      {children}
    </DashboardShell>
  );
}
