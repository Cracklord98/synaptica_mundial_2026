"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  QrCode
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPayment } from "@/lib/actions";

interface PaymentInfo {
  banco: string;
  tipo: string;
  numero: string;
  titular: string;
  valor: string;
  whatsapp: string;
  whatsappRaw: string;
  nota: string;
}

interface PaymentFormProps {
  username: string;
  initialStatus: "pending" | "submitted" | "approved" | "rejected";
  initialReference: string | null;
  paymentInfo: PaymentInfo;
}

export default function PaymentForm({
  username,
  initialStatus,
  initialReference,
  paymentInfo,
}: PaymentFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [reference, setReference] = useState(initialReference || "");
  const [inputReference, setInputReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputReference.trim()) {
      setErrorMsg("Ingresa una referencia válida de transacción.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await submitPayment(inputReference.trim());
      setReference(inputReference.trim());
      setStatus("submitted");
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al registrar pago");
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappText = encodeURIComponent(
    `Hola, acabo de registrar mi pago en La Polla Mundial 2026 para el usuario @${username}. Adjunto el comprobante.`
  );
  const whatsappUrl = `https://wa.me/${paymentInfo.whatsappRaw}?text=${whatsappText}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
      {/* Payment instructions */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-[#1A2B3C] bg-[#121212] text-white premium-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#D4AF37] flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Instrucciones de Pago
            </CardTitle>
            <CardDescription className="text-gray-400">
              Realiza la transferencia por el valor de inscripción para competir en la polla
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A2B3C] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Valor Inscripción</span>
                <span className="text-2xl font-black text-[#D4AF37]">{paymentInfo.valor}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Banco</span>
                <span className="text-base font-bold text-white block">{paymentInfo.banco}</span>
                <span className="text-xs text-gray-400">{paymentInfo.tipo}</span>
              </div>
              <div className="space-y-1 sm:col-span-2 border-t border-[#1A2B3C]/50 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Número de Cuenta</span>
                  <span className="text-base font-mono font-bold text-[#00B894]">{paymentInfo.numero}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#1A2B3C] bg-[#121212] text-xs h-8 text-gray-300 hover:text-white"
                  onClick={() => copyToClipboard(paymentInfo.numero, "numero")}
                >
                  {copiedField === "numero" ? <Check className="h-3 w-3 text-[#00B894]" /> : <Copy className="h-3 w-3" />}
                  {copiedField === "numero" ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <div className="space-y-1 sm:col-span-2 border-t border-[#1A2B3C]/50 pt-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Titular</span>
                <span className="text-sm text-white font-medium">{paymentInfo.titular}</span>
              </div>
            </div>

            {/* Bre-B option */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A2B3C] flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0 bg-white p-2.5 rounded-lg border border-[#1A2B3C] flex items-center justify-center">
                <QrCode className="h-24 w-24 text-black" />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#00B894]"></span>
                  Pago Inteligente Bre-B
                </h4>
                <p className="text-xs text-gray-400 leading-normal max-w-sm">
                  Escanea el código QR de Nequi/Bre-B desde tu app bancaria o transfiere usando el número celular asociado.
                </p>
                <div className="inline-flex items-center gap-3 bg-[#121212] border border-[#1A2B3C] px-3 py-1.5 rounded-lg text-xs font-mono">
                  <span className="text-gray-400">Celular:</span>
                  <strong className="text-white">312 878 8919</strong>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("3128788919", "cel")}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedField === "cel" ? <Check className="h-3 w-3 text-[#00B894]" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Note */}
            {paymentInfo.nota && (
              <p className="text-xs text-gray-400 italic bg-[#0A0A0A] p-3 rounded-lg border border-[#1A2B3C]/50">
                {paymentInfo.nota}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment registration form */}
      <div className="space-y-6">
        {/* Approved state */}
        {status === "approved" && (
          <Card className="border-[#00B894] bg-[#00B894]/5 text-white shadow-2xl">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-[#00B894] mx-auto mb-2" />
              <CardTitle className="text-xl font-bold text-[#00B894]">¡Pago Confirmado!</CardTitle>
              <CardDescription className="text-[#00B894]/85">
                Ya compites en el ranking oficial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center text-sm">
              <p className="text-gray-300">
                Tu pago con referencia <strong className="font-mono text-white">"{reference}"</strong> ha sido verificado y aprobado por el administrador.
              </p>
              <Button
                onClick={() => router.push("/dashboard/leaderboard")}
                className="w-full bg-[#00B894] hover:bg-[#00B894]/80 text-white font-bold py-5"
              >
                Ver Tabla de Posiciones
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Submitted state */}
        {status === "submitted" && (
          <Card className="border-yellow-600/50 bg-yellow-950/10 text-white shadow-2xl">
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-2 animate-pulse" />
              <CardTitle className="text-xl font-bold text-yellow-300">Pago por Verificar</CardTitle>
              <CardDescription className="text-yellow-300/80">
                Estamos validando tu comprobante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center text-sm">
              <p className="text-gray-300 leading-normal">
                Registraste la referencia <strong className="font-mono text-white">"{reference}"</strong>. Tu cupo se activará automáticamente una vez el administrador valide la transferencia.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-[#00B894] hover:bg-[#00B894]/80 text-white font-bold py-3 rounded-lg text-sm transition-colors"
              >
                Enviar Comprobante por WhatsApp
                <ExternalLink className="h-4 w-4" />
              </a>
              <Button
                variant="outline"
                className="w-full border-[#1A2B3C] bg-[#121212] text-gray-300 hover:text-white"
                onClick={() => setStatus("pending")} // Let them edit reference if they made a mistake
              >
                Modificar Referencia
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pending / Rejected state */}
        {(status === "pending" || status === "rejected") && (
          <Card className="border-[#1A2B3C] bg-[#121212] text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Registrar Transferencia</CardTitle>
              <CardDescription className="text-gray-400">
                Registra la referencia de pago de tu banco para activar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReference} className="space-y-4">
                {status === "rejected" && (
                  <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Tu referencia anterior fue rechazada. Valida los datos e intenta de nuevo.</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-gray-300">Referencia de Pago (ID de Transacción)</Label>
                  <Input
                    id="reference"
                    placeholder="ej. NQ123456789 o ref de transferencia"
                    required
                    className="border-[#1A2B3C] bg-[#0A0A0A] text-white focus:border-[#D4AF37] focus:ring-0"
                    value={inputReference}
                    onChange={(e) => setInputReference(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Copia el código único de transacción que aparece en tu comprobante de Nequi o banco.
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 bg-red-950/30 p-2.5 rounded border border-red-500/30">
                    {errorMsg}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#D4AF37] hover:bg-[#C29E30] text-black font-bold py-5"
                >
                  {isLoading ? "Registrando..." : "Registrar Referencia"}
                </Button>

                <div className="text-center pt-2 border-t border-[#1A2B3C]/50 mt-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#00B894] transition-colors"
                  >
                    ¿Necesitas soporte? WhatsApp <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
