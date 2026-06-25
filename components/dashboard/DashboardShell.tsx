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
  BookOpen,
  Menu,
  X,
  ChevronRight,
  Users
} from "lucide-react";

interface Profile {
  id: string;
  username: string;
  is_admin: boolean;
}

interface DashboardShellProps {
  children: React.ReactNode;
  profile: Profile;
  email: string | null;
  signOutAction: () => Promise<void>;
}

export default function DashboardShell({
  children,
  profile,
  email,
  signOutAction,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const navItems = [
    { name: "Inicio", href: "/dashboard", icon: Trophy },
    { name: "Pronósticos", href: "/dashboard/predictions/round_32", icon: Calendar },
    { name: "Clasificados", href: "/dashboard/clasificados", icon: Users },
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
        <div className="p-6 border-b border-[#1e293b]/70 bg-gradient-to-b from-[#1A2B3C]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center font-extrabold text-[#D4AF37] text-sm shadow-inner shrink-0">
              {profile.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="font-bold text-sm text-white truncate">@{profile.username}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          </div>
          

        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group font-semibold text-sm border ${
                  isActive
                    ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
                    : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-all ${
                  isActive ? "text-black translate-x-1" : "text-gray-500 translate-x-0 group-hover:translate-x-1"
                }`} />
              </Link>
            );
          })}

          {/* Admin panel navigation link */}
          {profile.is_admin && (
            <div className="pt-4 mt-4 border-t border-[#1e293b]/70 space-y-1.5">
              <span className="px-4 text-[9px] uppercase tracking-wider font-extrabold text-gray-500 block mb-1">Administración</span>
              
              <Link
                href="/dashboard/admin/users"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm border ${
                  pathname.startsWith("/dashboard/admin/users")
                    ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
                    : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                }`}
              >
                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                <span>Usuarios</span>
              </Link>

              <Link
                href="/dashboard/admin/matches"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm border ${
                  pathname.startsWith("/dashboard/admin/matches")
                    ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
                    : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                }`}
              >
                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                <span>Resultados</span>
              </Link>

              <Link
                href="/dashboard/admin/model-cards"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm border ${
                  pathname.startsWith("/dashboard/admin/model-cards")
                    ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
                    : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                }`}
              >
                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                <span>Model Cards</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Sign out section */}
        <div className="p-4 border-t border-[#1e293b]/70">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:text-red-305 hover:bg-red-950/15 border border-transparent text-sm font-semibold transition-all"
            >
              <LogOut className="h-4.5 w-4.5" />
              Salir del Sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header - Mobile */}
        <header className="md:hidden bg-[#080d22]/90 border-b border-[#1e293b]/70 px-4 py-3 flex items-center justify-between z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#D4AF37]" />
            <span className="font-extrabold text-sm tracking-wider text-white">LA POLLA</span>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-[#1e293b] text-gray-300 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-30 md:hidden"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed right-0 top-0 bottom-0 w-72 bg-[#080d22] border-l border-[#1e293b]/80 z-40 flex flex-col md:hidden"
              >
                {/* Close Button Header */}
                <div className="p-4 border-b border-[#1e293b]/70 flex justify-between items-center bg-[#050814]/40">
                  <span className="font-bold text-xs uppercase tracking-widest text-[#D4AF37]">Navegación</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Profile Section */}
                <div className="p-5 border-b border-[#1e293b]/70 bg-gradient-to-b from-[#1A2B3C]/10 to-transparent">
                  <p className="font-bold text-sm text-white">@{profile.username}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>

                </div>

                {/* Nav Links */}
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm border ${
                          isActive
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.15)]"
                            : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                        }`}
                      >
                        <item.icon className="h-4.5 w-4.5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  {/* Admin links on mobile */}
                  {profile.is_admin && (
                    <div className="pt-4 mt-4 border-t border-[#1e293b]/70 space-y-1">
                      <span className="px-4 text-[9px] uppercase tracking-wider font-extrabold text-gray-500 block mb-1">Admin</span>
                      
                      <Link
                        href="/dashboard/admin/users"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm border ${
                          pathname.startsWith("/dashboard/admin/users")
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                        }`}
                      >
                        <ShieldAlert className="h-4.5 w-4.5" />
                        <span>Usuarios</span>
                      </Link>

                      <Link
                        href="/dashboard/admin/matches"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm border ${
                          pathname.startsWith("/dashboard/admin/matches")
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                        }`}
                      >
                        <ShieldAlert className="h-4.5 w-4.5" />
                        <span>Resultados</span>
                      </Link>

                      <Link
                        href="/dashboard/admin/model-cards"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm border ${
                          pathname.startsWith("/dashboard/admin/model-cards")
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                        }`}
                      >
                        <ShieldAlert className="h-4.5 w-4.5" />
                        <span>Model Cards</span>
                      </Link>
                    </div>
                  )}
                </nav>

                {/* Sign Out on mobile */}
                <div className="mt-auto p-4 border-t border-[#1e293b]/70">
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
