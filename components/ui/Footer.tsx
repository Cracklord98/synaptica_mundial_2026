"use client";

import Link from "next/link";
import { 
  Trophy, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  Building,
  Terminal,
  Clock
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#070708] border-t border-[#1e293b]/70 pt-16 pb-8 text-gray-300 overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#00B894]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Top Segment: Brand and Call to Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-[#1e293b]/50">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl border border-[#334155]/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <Trophy className="h-6 w-6 text-[#D4AF37] animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-wider block text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
                  LA POLLA
                </span>
                <span className="text-xs text-[#00B894] font-bold tracking-widest block uppercase">
                  Mundialista 2026
                </span>
              </div>
            </Link>
            
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              La plataforma interna de Synaptica S.A.S. diseñada para potenciar la cultura de análisis de datos, el trabajo colaborativo y la experimentación en Inteligencia Artificial mediante predicciones deportivas.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1e293b]/80 border border-[#334155]/40 text-[#D4AF37]">
                <Sparkles className="h-3.5 w-3.5" /> Pista Analítica
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1e293b]/80 border border-[#334155]/40 text-[#00B894]">
                <ShieldCheck className="h-3.5 w-3.5" /> Corporativo
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1e293b]/80 border border-[#334155]/40 text-gray-300">
                <Terminal className="h-3.5 w-3.5" /> Sandbox IA
              </span>
            </div>
          </div>

          {/* Quick Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#D4AF37] pl-2">
                Navegación
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Inicio Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/predictions/round_32" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Mis Pronósticos
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/leaderboard" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Ranking General
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/rules" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Reglas del Juego
                  </Link>
                </li>
              </ul>
            </div>

            {/* Synaptica Corporate links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#00B894] pl-2">
                Synaptica
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="https://synaptica.co" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00B894] flex items-center gap-1 group transition-colors">
                    Sitio Web Principal <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#00B894] flex items-center gap-1 group transition-colors">
                    Cultura Analítica <Building className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Cracklord98/synaptica_mundial_2026" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00B894] flex items-center gap-1 group transition-colors">
                    Repositorio Git <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Help & Support */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-purple-500 pl-2">
                Soporte
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 text-gray-400">
                  <Mail className="h-4 w-4 mt-0.5 text-purple-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-gray-500">Soporte Técnico</span>
                    <a href="mailto:soporte.polla@synaptica.co" className="hover:text-white transition-colors break-all">
                      soporte.polla@synaptica.co
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 text-gray-400">
                  <Clock className="h-4 w-4 mt-0.5 text-purple-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-gray-500">Tiempo de Respuesta</span>
                    <span className="text-white">Menos de 24 horas</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-gray-400">
                  <HelpCircle className="h-4 w-4 mt-0.5 text-purple-400 shrink-0" />
                  <div>
                    <span className="block text-xs text-gray-500">Preguntas Frecuentes</span>
                    <Link href="/dashboard/rules" className="hover:text-white transition-colors underline underline-offset-2">
                      Ver Bases Oficiales
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Segment: Social, Stack and Copyright */}
        <div className="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs text-gray-500 text-center md:text-left">
              &copy; {currentYear} Synaptica S.A.S. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-gray-600 text-center md:text-left uppercase tracking-wider">
              Plataforma desarrollada exclusivamente para actividades de integración y formación interna.
            </p>
          </div>

          {/* Social Badges and Tech Stack */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            <span className="text-xs text-gray-600">Built with Next.js, Supabase, Framer Motion</span>
            <div className="h-4 w-px bg-[#1e293b]" />
            <div className="flex gap-3">
              <a 
                href="https://www.linkedin.com/company/synapticacol/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-[#121214] hover:bg-[#1A2B3C] border border-[#1e293b]/70 hover:border-[#D4AF37]/50 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="mailto:contacto@synaptica.co" 
                className="p-2 bg-[#121214] hover:bg-[#1A2B3C] border border-[#1e293b]/70 hover:border-[#D4AF37]/50 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
