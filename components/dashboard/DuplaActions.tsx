"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendDuplaInvitation, cancelSentInvitation } from "@/lib/actions";
import { Users, Clock, Trash2 } from "lucide-react";

interface DuplaActionsProps {
  partnerEmail: string | null;
  teamName: string | null;
  hasPartner: boolean;
}

export function DuplaActions({ partnerEmail, teamName, hasPartner }: DuplaActionsProps) {
  const [emailInput, setEmailInput] = useState("");
  const [teamInput, setTeamInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendDuplaInvitation(emailInput, teamInput);
      setEmailInput("");
      setTeamInput("");
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al enviar la invitación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de que deseas cancelar la invitación enviada?")) return;
    setError(null);
    setIsLoading(true);

    try {
      await cancelSentInvitation();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al cancelar la invitación");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasPartner) {
    return null;
  }

  if (partnerEmail) {
    return (
      <div className="p-4 rounded-lg bg-[#1A2B3C]/20 border border-[#1A2B3C] space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <p className="text-gray-300 text-sm">
              Invitación enviada para la dupla <strong className="text-[#D4AF37]">"{teamName}"</strong> a:
            </p>
            <strong className="text-white block truncate">{partnerEmail}</strong>
          </div>
          <span className="text-xs bg-yellow-950/40 text-yellow-300 py-1 px-2.5 rounded-full font-medium flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3 animate-pulse" />
            Pendiente
          </span>
        </div>
        
        <p className="text-xs text-gray-400">
          Tu compañero debe registrarse o iniciar sesión con este correo para aceptar la invitación en su panel.
        </p>

        {error && <p className="text-xs text-red-500 bg-red-950/20 p-2.5 rounded border border-red-500/30">{error}</p>}

        <Button
          onClick={handleCancel}
          disabled={isLoading}
          variant="destructive"
          className="w-full flex items-center justify-center gap-2 text-xs py-2"
        >
          <Trash2 className="h-4 w-4" /> Cancelar Invitación
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleInvite} className="space-y-4">
      <div className="p-3.5 rounded-lg bg-[#0A0A0A] border border-[#1A2B3C] space-y-1">
        <p className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
          <Users className="h-4 w-4 text-[#D4AF37]" />
          ¿Quieres jugar en Pareja (Dupla)?
        </p>
        <p className="text-[11px] text-gray-400">
          Las duplas permiten combinar estrategias predictivas. Si cambiaste de parecer, ingresa el correo de tu compañero y el nombre de tu dupla.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="teamInput" className="text-xs text-gray-300">Nombre de la Dupla</Label>
        <Input
          id="teamInput"
          placeholder="ej. Los Galácticos Analíticos"
          required
          value={teamInput}
          onChange={(e) => setTeamInput(e.target.value)}
          className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="emailInput" className="text-xs text-gray-300">Correo del Compañero</Label>
        <Input
          id="emailInput"
          type="email"
          placeholder="correo@companero.com"
          required
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0 text-sm"
        />
      </div>

      {error && <p className="text-xs text-red-500 bg-red-950/20 p-2.5 rounded border border-red-500/30">{error}</p>}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold text-xs py-2"
      >
        {isLoading ? "Enviando..." : "Invitar a Compañero"}
      </Button>
    </form>
  );
}
