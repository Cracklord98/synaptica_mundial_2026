import Link from "next/link";
import { Trophy, Award, Users, FileText, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full border-b border-[#1A2B3C] bg-[#0A0A0A] h-16 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto h-full flex justify-between items-center px-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#D4AF37]" />
            <span className="font-bold tracking-wider text-sm">
              LA POLLA <span className="text-[#00B894]">MUNDIAL 2026</span>
            </span>
          </div>
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
      <section className="w-full py-20 px-6 max-w-5xl text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
          <Award className="h-4 w-4" /> Plataforma Predictiva Oficial Synaptica
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
          La Polla Mundialista <br className="hidden md:inline" />
          <span className="text-[#D4AF37]">Mundial 2026</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Predice marcadores de eliminación directa, compite solo o en dupla, sube tu Ficha Metodológica y llévate increíbles premios sorpresa.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
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
        </div>
      </section>

      {/* Prizes Pool Box */}
      <section className="w-full max-w-5xl px-6 pb-12">
        <div className="premium-card p-8 rounded-2xl border border-[#1A2B3C] bg-gradient-to-r from-[#1A2B3C]/20 to-[#0A0A0A] text-center space-y-6">
          <div>
            <span className="text-[#00B894] font-bold text-xs uppercase tracking-widest block">Premios</span>
            <h2 className="text-3xl font-black text-white mt-1">🎁 ¡Habrá Premios Sorpresa!</h2>
            <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
              Los mejores analistas serán reconocidos con premios especiales. ¡Mantente atento y da lo mejor de ti!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#D4AF37]/30">
              <Trophy className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
              <span className="text-xs text-gray-400 block font-semibold">1er Puesto</span>
              <strong className="text-xl font-black text-[#D4AF37]">🎁 Premio Sorpresa</strong>
            </div>
            <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#1A2B3C]">
              <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <span className="text-xs text-gray-400 block font-semibold">2do Puesto</span>
              <strong className="text-xl font-black text-white">🎁 Premio Sorpresa</strong>
            </div>
            <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#1A2B3C]">
              <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <span className="text-xs text-gray-400 block font-semibold">3er Puesto</span>
              <strong className="text-xl font-black text-amber-600">🎁 Premio Sorpresa</strong>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            * El jurado también evaluará las mejores Fichas Metodológicas (Model Cards). ¡Otra oportunidad de ganar!
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-5xl px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3 p-6 rounded-xl border border-[#1A2B3C]/50 bg-[#121212]/50">
          <Users className="h-8 w-8 text-[#00B894]" />
          <h3 className="text-lg font-bold text-white">Participa solo o en Dupla</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Puedes jugar de forma individual o unirte con un compañero para formar una dupla con un nombre de equipo único y armar estrategias conjuntas.
          </p>
        </div>

        <div className="space-y-3 p-6 rounded-xl border border-[#1A2B3C]/50 bg-[#121212]/50">
          <Trophy className="h-8 w-8 text-[#D4AF37]" />
          <h3 className="text-lg font-bold text-white">Puntuación Multi-Fase</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Obtén 5 puntos por marcador exacto, 3 puntos por resultado y 2 puntos adicionales por acertar qué equipo avanza. Además, bonuses especiales de finalistas y campeón.
          </p>
        </div>

        <div className="space-y-3 p-6 rounded-xl border border-[#1A2B3C]/50 bg-[#121212]/50">
          <FileText className="h-8 w-8 text-[#D4AF37]" />
          <h3 className="text-lg font-bold text-white">Pista Analítica (Model Card)</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Sube un PDF documentando el rigor técnico de tu modelo. Un jurado evaluará originalidad y reproducibilidad para premiar tu enfoque científico.
          </p>
        </div>
      </section>

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
