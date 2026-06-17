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

  // Partner invitations are disabled since duplas are no longer allowed
  const pendingInvitation = null;

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
  
  return (
    <DashboardShell
      profile={profile}
      email={user.email || null}
      signOutAction={handleSignOut}
    >
      {children}
    </DashboardShell>
  );
}
