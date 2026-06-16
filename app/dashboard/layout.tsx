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
    redirect("/auth/login");
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
    <div className="flex min-h-screen bg-[#0A0A0A] text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A0A0A] border-r border-[#1A2B3C] shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-[#1A2B3C] flex items-center gap-3">
          <Trophy className="h-8 w-8 text-[#D4AF37]" />
          <div>
            <span className="font-bold text-lg tracking-wider block">LA POLLA</span>
            <span className="text-xs text-[#00B894] font-semibold">MUNDIAL 2026</span>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="p-6 border-b border-[#1A2B3C] bg-gradient-to-b from-[#1A2B3C]/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-[#1A2B3C] text-[#D4AF37]">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="truncate">
              <p className="font-semibold truncate">{profile.username}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          {profile.team_name ? (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#00B894] font-medium bg-[#00B894]/10 py-1.5 px-2.5 rounded-md">
              <UsersIcon className="h-3.5 w-3.5" />
              <span className="truncate">Dupla: {profile.team_name}</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 py-1.5 px-2.5 rounded-md">
              <UserIcon className="h-3.5 w-3.5" />
              <span>Participación Individual</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-[#1A2B3C]/50 border border-transparent hover:border-[#1A2B3C] transition-all duration-200"
              >
                <Icon className="h-5 w-5 text-gray-400 group-hover:text-[#D4AF37]" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Admin Panel Link */}
          {profile.is_admin && (
            <div className="pt-6 mt-6 border-t border-[#1A2B3C]">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Administración
              </p>
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 transition-all duration-200"
              >
                <ShieldAlert className="h-5 w-5" />
                <span className="text-sm font-medium">Panel Admin</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-[#1A2B3C]">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all duration-200 text-sm font-medium"
            >
              <LogOut className="h-5 w-5" />
              Salir
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Header / Mobile Nav */}
        <header className="flex md:hidden items-center justify-between p-4 bg-[#0A0A0A] border-b border-[#1A2B3C]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#D4AF37]" />
            <span className="font-bold text-sm tracking-wider">POLLA 2026</span>
          </Link>

          <div className="flex items-center gap-3">
            {profile.is_admin && (
              <Link href="/dashboard/admin" className="p-2 text-[#D4AF37] hover:bg-white/5 rounded-md">
                <ShieldAlert className="h-5 w-5" />
              </Link>
            )}
            <form action={handleSignOut}>
              <button type="submit" className="p-2 text-red-400 hover:bg-white/5 rounded-md">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        {/* Mobile Nav Links Bar */}
        <nav className="flex md:hidden items-center justify-around bg-[#0A0A0A] border-b border-[#1A2B3C] text-xs py-2 overflow-x-auto shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-white px-2 py-1"
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Pending Invitation Alert Banner */}
        {pendingInvitation && (
          <div className="bg-gradient-to-r from-[#1A2B3C] to-[#0A0A0A] border-b border-[#D4AF37] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <UsersIcon className="h-6 w-6 text-[#D4AF37] shrink-0" />
              <div>
                <p className="font-bold text-white">¡Invitación a Dupla Recibida!</p>
                <p className="text-sm text-gray-300">
                  El usuario <strong className="text-[#D4AF37]">@{pendingInvitation.username}</strong> te ha invitado a unirte a su dupla: <strong className="text-[#00B894]">"{pendingInvitation.team_name}"</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <form action={async () => {
                "use server";
                await acceptDuplaInvitation(pendingInvitation.id);
              }}>
                <Button type="submit" className="bg-[#00B894] hover:bg-[#00B894]/80 text-white flex items-center gap-1">
                  <Check className="h-4 w-4" /> Aceptar
                </Button>
              </form>
              <form action={async () => {
                "use server";
                await rejectDuplaInvitation(pendingInvitation.id);
              }}>
                <Button type="submit" variant="destructive" className="flex items-center gap-1">
                  <X className="h-4 w-4" /> Rechazar
                </Button>
              </form>
            </div>
          </div>
        )}



        {/* Main scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <div className="mt-12 pt-6 border-t border-[#1A2B3C] text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Synaptica S.A.S. Todos los derechos reservados. Uso corporativo interno.
          </div>
        </main>
      </div>
    </div>
  );
}
