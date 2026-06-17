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
import { useState } from "react";
import { KeyRound } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      // Redirect to the authenticated dashboard
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-[#1A2B3C] bg-[#0A0A0A] text-white shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto my-2 p-3 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30 w-fit text-[#D4AF37]">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#D4AF37]">Nueva Contraseña</CardTitle>
          <CardDescription className="text-gray-400">
            Ingresa y confirma tu nueva contraseña de acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="password font-semibold" className="text-gray-300">Contraseña Nueva</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite la contraseña"
                  required
                  className="border-[#1A2B3C] bg-[#121212] text-white focus:border-[#D4AF37] focus:ring-0"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-950/30 p-3 rounded-lg border border-red-500/50">{error}</p>}
              
              <Button 
                type="submit" 
                className="w-full bg-[#D4AF37] text-black hover:bg-[#C29E30] transition-all py-6 text-lg font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Actualizar Contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
