import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink, Calendar, User, Code } from "lucide-react";
import AdminModelCardsCharts from "@/components/admin/AdminModelCardsCharts";

export default async function AdminModelCardsPage() {
  const supabase = await createClient();

  // Fetch all model cards joining profile info including structured answers
  const { data: cards } = await supabase
    .from("model_cards")
    .select(`
      id,
      file_url,
      description,
      repo_url,
      uploaded_at,
      answers,
      user:profiles!user_id(username, team_name)
    `)
    .order("uploaded_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Model Cards de los Participantes</h2>
        <p className="text-xs text-gray-400">Inspecciona y analiza las propuestas metodológicas de los participantes para el jurado corporativo</p>
      </div>

      {/* Analytics Visualization Dashboard */}
      <AdminModelCardsCharts cards={cards || []} />

      {/* Participant responses structured cards list */}
      <div>
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Respuestas de Fichas Metodológicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards?.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-[#121212] border border-[#1A2B3C] rounded-2xl text-gray-500 text-sm">
              Ningún participante ha completado su Ficha Metodológica (Model Card) todavía.
            </div>
          ) : (
            cards?.map((card: any) => (
              <Card key={card.id} className="border-[#1A2B3C] bg-[#121212] text-white premium-card overflow-hidden flex flex-col justify-between">
                <div>
                  <CardHeader className="border-b border-[#1A2B3C]/50 pb-3 flex flex-row justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-base font-bold text-[#D4AF37] flex items-center gap-1.5">
                        <User className="h-4.5 w-4.5 text-[#00B894]" />
                        <span>{card.user?.team_name || `@${card.user?.username}`}</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          Enviado: {new Date(card.uploaded_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </CardDescription>
                    </div>
                    {card.repo_url && (
                      <a
                        href={card.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#D4AF37] hover:bg-[#C29E30] text-black text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Enlace
                      </a>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {card.user?.team_name && (
                      <p className="text-[10px] text-gray-400">
                        Usuario: @{card.user.username}
                      </p>
                    )}

                    <div className="space-y-4">
                      {/* Q1 */}
                      <div>
                        <h5 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">1. Datos y Fuentes</h5>
                        <p className="text-xs text-gray-300 bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]/30 leading-relaxed">
                          {card.answers?.q1_sources || card.description || "Sin responder."}
                        </p>
                      </div>

                      {/* Q2 */}
                      <div>
                        <h5 className="text-xs font-bold text-[#00B894] uppercase tracking-wider mb-1">2. Preparación de Datos</h5>
                        <p className="text-xs text-gray-300 bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]/30 leading-relaxed">
                          {card.answers?.q2_prep || "Sin responder."}
                        </p>
                      </div>

                      {/* Q3 */}
                      <div>
                        <h5 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">3. Enfoque del Modelo (Método)</h5>
                        <p className="text-xs text-gray-300 bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]/30 leading-relaxed font-semibold">
                          {card.answers?.q3_approach || "Sin responder."}
                        </p>
                      </div>

                      {/* Q4 */}
                      <div>
                        <h5 className="text-xs font-bold text-[#00B894] uppercase tracking-wider mb-1">4. Razón de Selección</h5>
                        <p className="text-xs text-gray-300 bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]/30 leading-relaxed">
                          {card.answers?.q4_rationale || "Sin responder."}
                        </p>
                      </div>

                      {/* Q5 */}
                      <div>
                        <h5 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">5. Recalibración por Ronda</h5>
                        <p className="text-xs text-gray-300 bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]/30 leading-relaxed">
                          {card.answers?.q5_recal || "Sin responder."}
                        </p>
                      </div>

                      {/* Q6 */}
                      <div>
                        <h5 className="text-xs font-bold text-[#00B894] uppercase tracking-wider mb-1">6. Supuestos y Límites</h5>
                        <p className="text-xs text-gray-300 bg-[#0A0A0A] p-2.5 rounded border border-[#1A2B3C]/30 leading-relaxed">
                          {card.answers?.q6_limits || "Sin responder."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
