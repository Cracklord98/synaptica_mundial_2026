import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ExternalLink, Calendar, Users, User } from "lucide-react";

export default async function AdminModelCardsPage() {
  const supabase = await createClient();

  // Fetch all model cards joining profile info
  const { data: cards } = await supabase
    .from("model_cards")
    .select(`
      id,
      file_url,
      description,
      uploaded_at,
      user:profiles!user_id(username, team_name)
    `)
    .order("uploaded_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Model Cards de los Equipos</h2>
        <p className="text-xs text-gray-400">Inspecciona y descarga las propuestas metodológicas de los participantes para el jurado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {cards?.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-[#121212] border border-[#1A2B3C] rounded-2xl text-gray-500 text-sm">
            Ningún equipo ha subido su Ficha Metodológica (Model Card) todavía.
          </div>
        ) : (
          cards?.map((card: any) => (
            <Card key={card.id} className="border-[#1A2B3C] bg-[#121212] text-white premium-card overflow-hidden">
              <CardHeader className="border-b border-[#1A2B3C]/50 pb-3 flex flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-[#D4AF37] flex items-center gap-1.5">
                    {card.user?.team_name ? (
                      <>
                        <Users className="h-4.5 w-4.5 text-[#00B894]" />
                        <span>Dupla: {card.user.team_name}</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4.5 w-4.5 text-gray-400" />
                        <span>Individual: @{card.user?.username}</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Enviado: {new Date(card.uploaded_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </CardDescription>
                </div>
                <a
                  href={card.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#D4AF37] hover:bg-[#C29E30] text-black text-xs font-bold px-3 py-2 rounded flex items-center gap-1 transition-colors shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> PDF
                </a>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {card.user?.team_name && (
                  <p className="text-xs text-gray-400">
                    Líder: @{card.user.username}
                  </p>
                )}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Descripción de Enfoque</h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {card.description || "Sin descripción proporcionada."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
