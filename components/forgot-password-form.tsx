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
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al enviar el correo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-[#1A2B3C] bg-[#0A0A0A] text-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto my-2 p-3 bg-[#00B894]/10 rounded-full border border-[#00B894]/30 w-fit text-[#00B894]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#00B894]">Revisa tu Correo</CardTitle>
            <CardDescription className="text-gray-400">
              Instrucciones de restablecimiento enviadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-sm text-gray-300">
              Si el correo <strong>{email}</strong> está registrado en la plataforma, recibirás un enlace de seguridad para restablecer tu contraseña en los próximos minutos.
            </p>
            <div className="pt-2">
              <Link 
                href="/auth/login" 
                className="text-xs text-[#D4AF37] hover:underline font-semibold"
              >
                Volver al Iniciar Sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#1A2B3C] bg-[#0A0A0A] text-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto my-2 p-3 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30 w-fit text-[#D4AF37]">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#D4AF37]">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa tu correo institucional y te enviaremos un enlace de restauración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-5">
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
                {error && <p className="text-sm text-red-500 bg-red-950/30 p-3 rounded-lg border border-red-500/50">{error}</p>}
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#D4AF37] text-black hover:bg-[#C29E30] transition-all py-6 text-lg font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Enlace"}
                </Button>
              </div>
              
              <div className="mt-6 flex flex-col gap-3 text-center text-sm text-gray-400">
                <div>
                  ¿Recordaste tu contraseña?{" "}
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
      )}
    </div>
  );
}
