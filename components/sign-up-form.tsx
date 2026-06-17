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
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
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
            team_name: teamName.trim() || null,
            partner_email: null,
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
                  placeholder="m@example.com"
                  required
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="teamName" className="text-gray-300">Nombre de Polla / Equipo (Opcional)</Label>
                <Input
                  id="teamName"
                  placeholder="ej. Los Galácticos"
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <p className="text-[10px] text-gray-500">
                  Un nombre personalizado para identificar tus predicciones en el ranking.
                </p>
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
                <Label htmlFor="repeatPassword" className="text-gray-300">Repetir Contraseña</Label>
                <Input
                  id="repeatPassword"
                  type="password"
                  required
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-950/30 p-3 rounded-lg border border-red-500/50">{error}</p>}
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#D4AF37] hover:bg-[#C29E30] text-black font-extrabold text-base py-5 mt-2 transition-all duration-300 shadow-lg shadow-[#D4AF37]/10"
              >
                {isLoading ? "Registrando..." : "Crear Cuenta"}
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="underline text-[#D4AF37] hover:text-[#C29E30] transition-colors">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
