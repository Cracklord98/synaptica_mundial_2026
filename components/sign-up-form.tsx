"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [participationMode, setParticipationMode] = useState<"individual" | "dupla" | null>(null);
  const [teamName, setTeamName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (!participationMode) {
      setError("Por favor selecciona si vas a jugar de forma Individual o en Dupla");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (participationMode === "dupla" && (!teamName || !partnerEmail)) {
      setError("Por favor completa los campos del equipo en pareja");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            username,
            team_name: participationMode === "dupla" ? teamName : null,
            partner_email: participationMode === "dupla" ? partnerEmail.toLowerCase().trim() : null,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-[#1A2B3C] bg-[#0A0A0A] text-white shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#D4AF37]">Regístrate</CardTitle>
          <CardDescription className="text-gray-400">
            Crea tu cuenta en La Polla Mundial 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-gray-300">Nombre de Usuario</Label>
                <Input
                  id="username"
                  placeholder="ej. cracklord98"
                  required
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="text-gray-300">Repetir Contraseña</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-gray-300 mb-1">Modo de Participación</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setParticipationMode("individual")}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-sm font-medium transition-colors",
                      participationMode === "individual"
                        ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                        : "bg-[#121212] text-gray-300 border-[#1A2B3C] hover:border-gray-500"
                    )}
                  >
                    Individual (1 Persona)
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipationMode("dupla")}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-sm font-medium transition-colors",
                      participationMode === "dupla"
                        ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                        : "bg-[#121212] text-gray-300 border-[#1A2B3C] hover:border-gray-500"
                    )}
                  >
                    Dupla (Pareja)
                  </button>
                </div>
              </div>

              {participationMode === "dupla" && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#121212] border border-[#1A2B3C] animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="grid gap-2">
                    <Label htmlFor="teamName" className="text-[#D4AF37]">Nombre de la Dupla (Equipo)</Label>
                    <Input
                      id="teamName"
                      placeholder="ej. Los Galácticos"
                      required={participationMode === "dupla"}
                      className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="partnerEmail" className="text-[#D4AF37]">Correo del Compañero</Label>
                    <Input
                      id="partnerEmail"
                      type="email"
                      placeholder="correo@companero.com"
                      required={participationMode === "dupla"}
                      className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Le enviaremos una invitación a este correo al crear la cuenta.
                    </p>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500 bg-red-950/30 p-3 rounded-lg border border-red-500/50">{error}</p>}
              
              <Button 
                type="submit" 
                className="w-full bg-[#D4AF37] text-black hover:bg-[#C29E30] transition-all py-6 text-lg font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Creando Cuenta..." : "Registrarse"}
              </Button>
            </div>
            <div className="mt-6 flex flex-col gap-3 text-center text-sm text-gray-400">
              <div>
                ¿Ya tienes una cuenta?{" "}
                <Link href="/auth/login" className="text-[#D4AF37] hover:underline underline-offset-4 font-semibold">
                  Inicia Sesión
                </Link>
              </div>
              <Link href="/" className="text-gray-500 hover:text-white transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
