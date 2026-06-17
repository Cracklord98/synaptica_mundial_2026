"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  BookOpen,
  Menu,
  X,
  Check,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  id: string;
  username: string;
  team_name: string | null;
  partner_email: string | null;
  is_admin: boolean;
}

interface DashboardShellProps {
  children: React.ReactNode;
  profile: Profile;
  email: string | null;
  pendingInvitation: {
    id: string;
    username: string;
    team_name: string | null;
  } | null;
  acceptAction: (id: string) => Promise<void>;
  rejectAction: (id: string) => Promise<void>;
  signOutAction: () => Promise<void>;
}

export default function DashboardShell({
  children,
  profile,
  email,
  pendingInvitation,
  acceptAction,
  rejectAction,
  signOutAction,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const navItems = [
    { name: "Inicio", href: "/dashboard", icon: Trophy },
    { name: "Pronósticos", href: "/dashboard/predictions/round_32", icon: Calendar },
    { name: "Ranking", href: "/dashboard/leaderboard", icon: ListOrdered },
    { name: "Bracket", href: "/dashboard/bracket", icon: Layers },
    { name: "Model Card", href: "/dashboard/model-card", icon: Upload },
    { name: "Reglas", href: "/dashboard/rules", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-[#050814] text-white font-sans relative overflow-hidden">
      
      {/* Premium Background Lights & Neural Network Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00B894]/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#080d22]/90 border-r border-[#1e293b]/70 backdrop-blur-md shrink-0 z-20">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1e293b]/70 flex items-center gap-3">
          <div className="p-2 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
            <Trophy className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider block text-white">LA POLLA</span>
            <span className="text-[10px] text-[#00B894] font-bold tracking-widest block uppercase">MUNDIAL 2026</span>
          </div>
        </div>

        {/* User profile card */}
        <div className="p-5 border-b border-[#1e293b]/70 bg-gradient-to-b from-[#1A2B3C]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0d1535] border border-[#1e293b] text-[#D4AF37]">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="font-bold text-sm text-white truncate">@{profile.username}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          </div>
          
          {profile.team_name ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#00B894] font-semibold bg-[#00B894]/10 border border-[#00B894]/20 py-2 px-3 rounded-lg">
              <UsersIcon className="h-3.5 w-3.5" />
              <span className="truncate">Dupla: {profile.team_name}</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-[#0d1535] border border-[#1e293b]/60 py-2 px-3 rounded-lg">
              <UserIcon className="h-3.5 w-3.5 text-gray-500" />
              <span>Participación Individual</span>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group border ${
                  isActive 
                    ? "bg-[#D4AF37]/10 text-white border-[#D4AF37]/30 shadow-[0_4px_12px_rgba(212,175,55,0.05)]"
                    : "text-gray-400 hover:text-white hover:bg-[#0d1535] border-transparent hover:border-[#1e293b]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? "text-[#D4AF37]" : "text-gray-500 group-hover:text-white"
                  }`} />
                  <span className="text-sm font-semibold">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-[#D4AF37]" />}
              </Link>
            );
          })}

          {/* Admin panel link */}
          {profile.is_admin && (
            <div className="pt-6 mt-6 border-t border-[#1e293b]/70">
              <p className="px-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Administración
              </p>
              <Link
                href="/dashboard/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  pathname.startsWith("/dashboard/admin")
                    ? "bg-red-950/20 text-red-400 border-red-500/30"
                    : "text-[#D4AF37]/80 hover:text-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 border-[#D4AF37]/20"
                }`}
              >
                <ShieldAlert className="h-4.5 w-4.5" />
                <span className="text-sm font-semibold">Panel Admin</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Logout form */}
        <div className="p-4 border-t border-[#1e293b]/70">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/10 border border-transparent hover:border-red-950/30 transition-all duration-200 text-sm font-semibold"
            >
              <LogOut className="h-4.5 w-4.5" />
              Salir
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 z-10">
        
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between p-4 bg-[#080d22] border-b border-[#1e293b]/70 shadow-lg">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
              <Trophy className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <span className="font-extrabold text-sm tracking-wider text-white">POLLA 2026</span>
          </Link>

          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#0d1535] rounded-xl border border-[#1e293b] transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile Drawer Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Dark Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-30 md:hidden"
              />

              {/* Drawer Container */}
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-[#080d22] border-r border-[#1e293b]/80 shadow-2xl z-40 md:hidden flex flex-col justify-between"
              >
                <div>
                  {/* Drawer Header */}
                  <div className="p-5 border-b border-[#1e293b]/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-[#D4AF37]" />
                      <span className="font-extrabold text-sm tracking-wider">MENÚ POLLA</span>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#0d1535] rounded-lg border border-[#1e293b]/50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Profile Section */}
                  <div className="p-5 border-b border-[#1e293b]/70 bg-gradient-to-b from-[#1A2B3C]/10 to-transparent">
                    <p className="font-bold text-sm text-white">@{profile.username}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
                    {profile.team_name ? (
                      <span className="inline-block mt-3 text-[10px] text-[#00B894] font-bold bg-[#00B894]/10 border border-[#00B894]/20 py-1 px-2.5 rounded-full">
                        Dupla: {profile.team_name}
                      </span>
                    ) : (
                      <span className="inline-block mt-3 text-[10px] text-gray-400 bg-white/5 py-1 px-2.5 rounded-full">
                        Individual
                      </span>
                    )}
                  </div>

                  {/* Nav Links */}
                  <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                            isActive 
                              ? "bg-[#D4AF37]/10 text-white border-[#D4AF37]/30"
                              : "text-gray-400 hover:text-white hover:bg-[#0d1535] border-transparent"
                          }`}
                        >
                          <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#D4AF37]" : "text-gray-500"}`} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}

                    {profile.is_admin && (
                      <div className="pt-4 mt-4 border-t border-[#1e293b]/50">
                        <Link
                          href="/dashboard/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#D4AF37] bg-[#D4AF37]/5 border border-[#D4AF37]/10 text-sm font-semibold"
                        >
                          <ShieldAlert className="h-4.5 w-4.5" />
                          <span>Panel Admin</span>
                        </Link>
                      </div>
                    )}
                  </nav>
                </div>

                {/* Sign Out (Mobile) */}
                <div className="p-4 border-t border-[#1e293b]/70">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/10 border border-transparent text-sm font-semibold"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      Salir de la cuenta
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Pending Invitation Alert Banner */}
        {pendingInvitation && (
          <div className="bg-gradient-to-r from-[#0d1535] to-[#050814] border-b border-[#D4AF37] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37]">
                <UsersIcon className="h-5 w-5 shrink-0" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">¡Invitación a Dupla Recibida!</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  El usuario <strong className="text-[#D4AF37]">@{pendingInvitation.username}</strong> te invita a la dupla: <strong className="text-[#00B894]">"{pendingInvitation.team_name}"</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button 
                onClick={async () => {
                  await acceptAction(pendingInvitation!.id);
                }} 
                className="bg-[#00B894] hover:bg-[#00B894]/80 text-white flex items-center gap-1.5 text-xs font-bold px-4 py-2 h-9 rounded-lg"
              >
                <Check className="h-3.5 w-3.5" /> Aceptar
              </Button>
              <Button 
                onClick={async () => {
                  await rejectAction(pendingInvitation!.id);
                }} 
                variant="destructive" 
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 h-9 rounded-lg"
              >
                <X className="h-3.5 w-3.5" /> Rechazar
              </Button>
            </div>
          </div>
        )}

        {/* Main scrollable page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 flex flex-col min-w-0">
          <div className="flex-1">
            {children}
          </div>
          <div className="mt-12 pt-6 border-t border-[#1e293b]/70 text-center text-xs text-gray-500">
            &copy; {currentYear} Synaptica S.A.S. Todos los derechos reservados. Uso corporativo interno.
          </div>
        </main>
      </div>
    </div>
  );
}
