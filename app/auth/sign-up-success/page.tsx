import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#0A0A0A]">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="border-[#1A2B3C] bg-[#0A0A0A] text-white shadow-2xl text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#D4AF37]">
                ¡Registro Completado!
              </CardTitle>
              <CardDescription className="text-gray-400">
                Revisa tu correo electrónico para confirmar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                Hemos enviado un correo de verificación a tu dirección. Por favor, confírmalo antes de iniciar sesión para activar tu perfil en <strong>La Polla Mundial 2026</strong>.
              </p>
              <div className="mt-2">
                <Link
                  href="/auth/login"
                  className="inline-block px-6 py-3 rounded-lg bg-[#D4AF37] text-black font-bold hover:bg-[#C29E30] transition-colors"
                >
                  Ir al Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
