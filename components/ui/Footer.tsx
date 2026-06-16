"use client";

import Link from "next/link";
import { Trophy, Github, Linkedin, Twitter, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1A2B3C] py-12 text-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-[#D4AF37]" />
              <div>
                <span className="font-bold text-xl tracking-wider block">LA POLLA</span>
                <span className="text-xs text-[#00B894] font-semibold tracking-widest">MUNDIAL 2026</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-xs">
              Plataforma oficial de analítica predictiva y competencia interna impulsada por datos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#D4AF37]">Navegación</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Inicio del Torneo
                </Link>
              </li>
              <li>
                <Link href="/dashboard/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Ranking Oficial
                </Link>
              </li>
              <li>
                <Link href="/dashboard/rules" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Reglas y Puntuación
                </Link>
              </li>
            </ul>
          </div>

          {/* Synaptica Corporate */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#00B894]">Synaptica S.A.S.</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-[#00B894] transition-colors">
                  Cultura Analítica
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-[#00B894] transition-colors">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-[#00B894] transition-colors">
                  Contacto Interno
                </a>
              </li>
            </ul>
          </div>

          {/* Socials / Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Conéctate</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1A2B3C] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            &copy; {currentYear} Synaptica S.A.S. Todos los derechos reservados. Uso exclusivo interno corporativo.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-600">v2.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
