"use client";

import Link from "next/link";
import { Trophy, Award, Users, FileText, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center overflow-x-hidden">
      {/* Navbar */}
      <nav className="w-full border-b border-[#1A2B3C] bg-[#0A0A0A] h-16 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto h-full flex justify-between items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#D4AF37]" />
            <span className="font-bold tracking-wider text-sm">
              LA POLLA <span className="text-[#00B894]">MUNDIAL 2026</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-xs bg-[#D4AF37] hover:bg-[#C29E30] text-black font-extrabold px-4 py-2 rounded-lg transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="w-full py-20 px-6 max-w-5xl text-center space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
          <Award className="h-4 w-4" /> Plataforma Predictiva Oficial Synaptica
        </motion.div>
        
        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
          La Polla Mundialista <br className="hidden md:inline" />
          <span className="text-[#D4AF37]">Mundial 2026</span>
        </motion.h1>
        
        <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Predice marcadores de eliminación directa, compite solo o en dupla, sube tu Ficha Metodológica y llévate increíbles premios sorpresa.
        </motion.p>

        <motion.div variants={fadeUp} className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/auth/sign-up"
            className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C29E30] text-black font-extrabold px-8 py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-[#D4AF37]/20"
          >
            Crear mi Polla
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto bg-[#1A2B3C]/50 hover:bg-[#1A2B3C] text-white border border-[#1A2B3C] font-bold px-8 py-4 rounded-xl text-lg transition-all"
          >
            Ingresar al Panel
          </Link>
        </motion.div>
      </motion.section>

      {/* Prizes Pool Box */}
      <motion.section 
        className="w-full max-w-5xl px-6 pb-12"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="premium-card p-8 rounded-2xl border border-[#1A2B3C] bg-gradient-to-r from-[#1A2B3C]/20 to-[#0A0A0A] text-center space-y-6 shadow-2xl shadow-[#1A2B3C]/20 backdrop-blur-md">
          <div>
            <span className="text-[#00B894] font-bold text-xs uppercase tracking-widest block">Premios</span>
            <h2 className="text-3xl font-black text-white mt-1">🎁 ¡Habrá Premios Sorpresa!</h2>
            <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
              Los mejores analistas serán reconocidos con premios especiales. ¡Mantente atento y da lo mejor de ti!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <motion.div whileHover={{ y: -5 }} className="bg-[#0A0A0A]/80 backdrop-blur p-5 rounded-xl border border-[#D4AF37]/30 transition-all">
              <Trophy className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
              <span className="text-xs text-gray-400 block font-semibold">1er Puesto</span>
              <strong className="text-xl font-black text-[#D4AF37]">🎁 Premio Sorpresa</strong>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-[#0A0A0A]/80 backdrop-blur p-5 rounded-xl border border-[#1A2B3C] transition-all">
              <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <span className="text-xs text-gray-400 block font-semibold">2do Puesto</span>
              <strong className="text-xl font-black text-white">🎁 Premio Sorpresa</strong>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-[#0A0A0A]/80 backdrop-blur p-5 rounded-xl border border-[#1A2B3C] transition-all">
              <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <span className="text-xs text-gray-400 block font-semibold">3er Puesto</span>
              <strong className="text-xl font-black text-amber-600">🎁 Premio Sorpresa</strong>
            </motion.div>
          </div>

          <p className="text-xs text-gray-500">
            * El jurado también evaluará las mejores Fichas Metodológicas (Model Cards). ¡Otra oportunidad de ganar!
          </p>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        className="w-full max-w-5xl px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="space-y-3 p-6 rounded-xl border border-[#1A2B3C]/50 bg-[#121212]/50 hover:bg-[#1A2B3C]/10 transition-colors">
          <Users className="h-8 w-8 text-[#00B894]" />
          <h3 className="text-lg font-bold text-white">Participa solo o en Dupla</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Puedes jugar de forma individual o unirte con un compañero para formar una dupla con un nombre de equipo único y armar estrategias conjuntas.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-3 p-6 rounded-xl border border-[#1A2B3C]/50 bg-[#121212]/50 hover:bg-[#1A2B3C]/10 transition-colors">
          <Trophy className="h-8 w-8 text-[#D4AF37]" />
          <h3 className="text-lg font-bold text-white">Puntuación Multi-Fase</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Obtén 5 puntos por marcador exacto, 3 puntos por resultado y 2 puntos adicionales por acertar qué equipo avanza. Además, bonuses especiales de finalistas y campeón.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-3 p-6 rounded-xl border border-[#1A2B3C]/50 bg-[#121212]/50 hover:bg-[#1A2B3C]/10 transition-colors">
          <FileText className="h-8 w-8 text-[#D4AF37]" />
          <h3 className="text-lg font-bold text-white">Pista Analítica (Model Card)</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Sube un PDF documentando el rigor técnico de tu modelo. Un jurado evaluará originalidad y reproducibilidad para premiar tu enfoque científico.
          </p>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="w-full border-t border-[#1A2B3C] bg-[#0A0A0A] py-12 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 La Polla Mundial 2026 | Synaptica. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-white transition-colors">Iniciar Sesión</Link>
            <Link href="/auth/sign-up" className="hover:text-white transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

