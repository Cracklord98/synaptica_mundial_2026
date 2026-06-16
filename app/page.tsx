"use client";

import Link from "next/link";
import { 
  Trophy, 
  Award, 
  Users, 
  FileText, 
  ArrowRight, 
  ChevronRight, 
  Play, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Calendar,
  HelpCircle,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState } from "react";
import Footer from "@/components/ui/Footer";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const steps = [
    {
      date: "Junio 11 - Junio 27",
      title: "Fase de Grupos",
      desc: "Se definen los 32 equipos clasificados para la ronda eliminatoria. ¡Prepara tus modelos predictivos!",
      status: "current"
    },
    {
      date: "Junio 28 - Julio 10",
      title: "Rondas Eliminatorias",
      desc: "Dieciseisavos, Octavos y Cuartos de Final. Cada pronóstico se bloquea 1 hora antes de cada partido.",
      status: "upcoming"
    },
    {
      date: "Hasta Julio 17",
      title: "Model Card (Ficha Técnica)",
      desc: "Sube tu documento de Pista Analítica explicando tu metodología, algoritmos y código de IA.",
      status: "upcoming"
    },
    {
      date: "Julio 19",
      title: "Gran Final y Premios",
      desc: "Se juegan los partidos definitivos y el jurado entrega los premios sorpresas a los ganadores.",
      status: "upcoming"
    }
  ];

  return (
    <main className="min-h-screen bg-[#070708] text-white flex flex-col items-center overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      
      {/* Visual background ambient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#00B894]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[30%] left-[-20%] w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full border-b border-[#1e293b]/70 bg-[#070708]/85 backdrop-blur-xl h-20 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto h-full flex justify-between items-center px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-[#1A2B3C] to-[#0A0A0A] rounded-xl border border-[#1e293b] group-hover:border-[#D4AF37]/50 transition-all shadow-md">
              <Trophy className="h-5 w-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-base block text-white">
                LA POLLA
              </span>
              <span className="text-[10px] text-[#00B894] font-extrabold tracking-widest block uppercase">
                Mundial 2026
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#como-funciona" className="text-gray-400 hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#pistas" className="text-gray-400 hover:text-white transition-colors">Pistas</a>
            <a href="#premios" className="text-gray-400 hover:text-white transition-colors">Premios</a>
            <div className="h-4 w-px bg-[#1e293b]" />
            <Link href="/auth/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/sign-up"
              className="bg-gradient-to-r from-[#D4AF37] to-[#C29E30] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.35)] active:scale-95"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 md:hidden text-gray-400 hover:text-white hover:bg-[#1e293b]/50 rounded-lg border border-[#1e293b] transition-all"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-20 left-0 w-full bg-[#070708]/95 border-b border-[#1e293b] backdrop-blur-xl shadow-2xl overflow-hidden md:hidden z-40"
            >
              <div className="flex flex-col gap-5 p-6 text-sm font-semibold">
                <a 
                  href="#como-funciona" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors py-2 border-b border-[#1e293b]/50"
                >
                  Cómo Funciona
                </a>
                <a 
                  href="#pistas" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors py-2 border-b border-[#1e293b]/50"
                >
                  Pistas
                </a>
                <a 
                  href="#premios" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors py-2 border-b border-[#1e293b]/50"
                >
                  Premios
                </a>
                <div className="flex flex-col gap-3 pt-2">
                  <Link 
                    href="/auth/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center text-gray-300 hover:text-white py-3 border border-[#1e293b] rounded-xl hover:bg-[#121214]"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/auth/sign-up" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-[#D4AF37] text-black font-extrabold py-3 rounded-xl hover:bg-[#C29E30] transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="w-full py-16 md:py-24 px-6 max-w-6xl text-center space-y-6 flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div 
          variants={fadeUp} 
          className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-2 rounded-full text-xs font-extrabold text-[#D4AF37] uppercase tracking-wider mb-2"
        >
          <Sparkles className="h-3.5 w-3.5" /> Innovación y Cultura Analítica en Synaptica
        </motion.div>
        
        <motion.h1 
          variants={fadeUp} 
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl text-center"
        >
          La Polla Mundialista <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#f5d77f] to-[#aa7c11]">
            Mundial 2026
          </span>
        </motion.h1>
        
        <motion.p 
          variants={fadeUp} 
          className="text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed"
        >
          Predice la fase final, compite individualmente o arma tu dupla corporativa y pon a prueba tus modelos predictivos de Inteligencia Artificial para ganar premios sorpresa.
        </motion.p>

        <motion.div 
          variants={fadeUp} 
          className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/auth/sign-up"
            className="w-full sm:w-auto bg-gradient-to-r from-[#D4AF37] to-[#C29E30] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-extrabold px-8 py-4 rounded-xl text-lg flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] shadow-lg shadow-[#D4AF37]/15 active:scale-95"
          >
            Crear mi Cuenta
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto bg-[#121214] hover:bg-[#1A2B3C] text-white border border-[#1e293b]/80 hover:border-gray-500 font-bold px-8 py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all"
          >
            <Play className="h-4 w-4 fill-white" />
            Ingresar al Panel
          </Link>
        </motion.div>
      </motion.section>

      {/* Pistas (Tracks) Sections */}
      <section id="pistas" className="w-full max-w-6xl px-6 py-16">
        <div className="text-center mb-12 space-y-3">
          <span className="text-[#00B894] font-bold text-xs uppercase tracking-widest block">Dos Modalidades de Competencia</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">¿Cuál es tu estrategia analítica?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pista Precision */}
          <div className="premium-card p-8 rounded-2xl border border-[#1e293b]/70 bg-gradient-to-br from-[#1A2B3C]/10 to-[#070708] flex flex-col justify-between space-y-6 shadow-xl hover:border-[#D4AF37]/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37]">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Pista Precisión</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Premia a los analistas con mayor exactitud en sus pronósticos. Tus predicciones de marcadores se traducen en un puntaje acumulativo automático.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 pt-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[#D4AF37]" />
                  <span><strong>5 Puntos:</strong> Marcador exacto</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[#D4AF37]" />
                  <span><strong>3 Puntos:</strong> Resultado exacto de victoria/empate</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[#D4AF37]" />
                  <span><strong>2 Puntos:</strong> Adivinar qué equipo clasifica</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-[#1e293b]/50 flex justify-between items-center">
              <span className="text-xs text-gray-500">Cierre: 1 hora antes de cada partido</span>
              <span className="text-[#D4AF37] text-sm font-bold">100% Automatizado</span>
            </div>
          </div>

          {/* Pista Analitica */}
          <div className="premium-card p-8 rounded-2xl border border-[#1e293b]/70 bg-gradient-to-br from-[#1A2B3C]/10 to-[#070708] flex flex-col justify-between space-y-6 shadow-xl hover:border-[#00B894]/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#00B894]/10 flex items-center justify-center border border-[#00B894]/20 text-[#00B894]">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Pista Analítica</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Premia el rigor metodológico, la innovación científica y el código. Sube tu Ficha Técnica (Model Card) y explica detalladamente tu arquitectura analítica.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 pt-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[#00B894]" />
                  <span><strong>30% Rigor:</strong> Formulación y técnicas matemáticas</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[#00B894]" />
                  <span><strong>30% Creatividad:</strong> Enfoques e ingeniería de datos</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[#00B894]" />
                  <span><strong>40% Storytelling y Replicabilidad</strong></span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-[#1e293b]/50 flex justify-between items-center">
              <span className="text-xs text-gray-500">Entrega: Hasta Julio 17</span>
              <span className="text-[#00B894] text-sm font-bold">Evaluado por Jurados</span>
            </div>
          </div>

        </div>
      </section>

      {/* Timeline / Cómo Funciona */}
      <section id="como-funciona" className="w-full max-w-6xl px-6 py-16 bg-[#070708]/60">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest block">Calendario Oficial</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Cronograma del Torneo</h2>
        </div>

        {/* Responsive Horizontal / Vertical Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-[#1e293b] hidden md:block" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 relative z-10">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                step.status === "current" 
                  ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  : "bg-[#070708] text-gray-400 border-[#1e293b]"
              }`}>
                {idx + 1}
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[#00B894] font-extrabold uppercase flex items-center justify-center md:justify-start gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {step.date}
                </span>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prizes Pool Box */}
      <section id="premios" className="w-full max-w-5xl px-6 py-16">
        <div className="premium-card p-8 md:p-12 rounded-3xl border border-[#1e293b] bg-gradient-to-r from-[#1A2B3C]/10 via-[#070708] to-[#1A2B3C]/10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-30%] left-[-10%] w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <span className="text-[#00B894] font-bold text-xs uppercase tracking-widest block">Reconocimientos Corporativos</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-1">🎁 Premios Sorpresa Especiales</h2>
            <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed">
              Los mejores competidores en ambas pistas (Precisión y Analítica) serán galardonados con increíbles sorpresas en nuestra ceremonia de integración corporativa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 relative z-10">
            <div className="bg-[#070708]/90 p-6 rounded-2xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all flex flex-col justify-center items-center group">
              <Trophy className="h-10 w-10 text-[#D4AF37] mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-500 block font-extrabold uppercase">1er Puesto Absoluto</span>
              <strong className="text-lg font-black text-[#D4AF37] mt-1">Gran Premio Sorpresa</strong>
            </div>
            
            <div className="bg-[#070708]/90 p-6 rounded-2xl border border-[#1e293b] hover:border-[#00B894]/40 transition-all flex flex-col justify-center items-center group">
              <Award className="h-10 w-10 text-gray-300 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-500 block font-extrabold uppercase">2do Puesto Absoluto</span>
              <strong className="text-lg font-black text-white mt-1">Premio de Plata Sorpresa</strong>
            </div>

            <div className="bg-[#070708]/90 p-6 rounded-2xl border border-[#1e293b] hover:border-[#00B894]/40 transition-all flex flex-col justify-center items-center group">
              <Award className="h-10 w-10 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-500 block font-extrabold uppercase">Mejor Model Card</span>
              <strong className="text-lg font-black text-amber-600 mt-1">Reconocimiento Científico</strong>
            </div>
          </div>

          <p className="text-xs text-gray-500 pt-4 relative z-10">
            * Actividad voluntaria de integración. Las decisiones y clasificaciones son definitivas y administradas por el comité analítico.
          </p>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="w-full max-w-4xl px-6 pb-20">
        <div className="text-center mb-12 space-y-3">
          <HelpCircle className="h-8 w-8 text-[#00B894] mx-auto" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Preguntas Frecuentes</h2>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#070708]/40">
            <h4 className="font-bold text-white text-base">¿Puedo participar si no sé de Inteligencia Artificial?</h4>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              ¡Claro que sí! Puedes pronosticar usando tu intuición futbolística, Excel o cualquier técnica. La polla tiene dos pistas independientes: en la Pista Precisión lo único que cuenta es acertar marcadores.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#070708]/40">
            <h4 className="font-bold text-white text-base">¿Cuándo se congelan las predicciones?</h4>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Las predicciones se congelan **exactamente 1 hora antes de que inicie cada partido**. Tendrás la libertad de modificar tus pronósticos a medida que avances en las rondas.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#070708]/40">
            <h4 className="font-bold text-white text-base">¿Cómo funciona la modalidad de Duplas?</h4>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Al registrarte puedes seleccionar la opción de invitar a un compañero. Los dos tendrán el mismo puntaje de equipo y competirán codo a codo en el ranking global.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
