import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PaymentForm from "@/components/payment/PaymentForm";

export default async function PagoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch current profile payment status
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, payment_status, payment_reference")
    .eq("id", user.id)
    .single();

  if (!profile) return redirect("/auth/login");

  // Read environment variables with convenient defaults for the payment accounts
  const paymentInfo = {
    banco: process.env.PAYMENT_BANK || "Nequi / Bancolombia",
    tipo: process.env.PAYMENT_ACCOUNT_TYPE || "Cuenta de Ahorros / Depósito Celular",
    numero: process.env.PAYMENT_ACCOUNT_NUMBER || "3128788919",
    titular: process.env.PAYMENT_ACCOUNT_HOLDER || "Juan David Toro",
    valor: process.env.PAYMENT_AMOUNT || "$20.000 COP",
    whatsapp: process.env.PAYMENT_WHATSAPP_LABEL || "Enviar Comprobante",
    whatsappRaw: process.env.PAYMENT_WHATSAPP_RAW || "573128788919",
    nota: process.env.PAYMENT_NOTE || "Una vez realices el pago, por favor copia la referencia única de la transacción (comprobante) en el formulario de la derecha. El administrador habilitará tu cuenta una vez valide la transferencia.",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#D4AF37]">Pago de Participación</h1>
        <p className="text-sm text-gray-400 mt-1">
          Habilita tu acceso al ranking y compite oficialmente por la bolsa de premios.
        </p>
      </div>

      <PaymentForm
        username={profile.username}
        initialStatus={profile.payment_status || "pending"}
        initialReference={profile.payment_reference || ""}
        paymentInfo={paymentInfo}
      />
    </div>
  );
}
