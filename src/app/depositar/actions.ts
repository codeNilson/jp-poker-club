"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mpPreference } from "@/lib/mercadopago";

// ---------------------------------------------------------------------------
// Schema de validação do valor do depósito
// ---------------------------------------------------------------------------
const depositSchema = z.object({
  amount: z
    .number()
    .min(10, "O valor mínimo de depósito é R$ 10,00.")
    .max(5000, "O valor máximo de depósito é R$ 5.000,00.")
    .refine(
      (v) => Number.isFinite(v) && Math.round(v * 100) === v * 100,
      "Valor deve ter no máximo 2 casas decimais."
    ),
});

// ---------------------------------------------------------------------------
// Tipos de retorno
// ---------------------------------------------------------------------------
export type CreatePaymentIntentResult =
  | { success: true; preferenceId: string }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Server Action principal
// ---------------------------------------------------------------------------
export async function createPaymentIntentAction(
  amount: number
): Promise<CreatePaymentIntentResult> {
  // 1. Validar dados de entrada
  const parsed = depositSchema.safeParse({ amount });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Valor inválido." };
  }

  // 2. Garantir que o usuário está autenticado
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 3. Gerar o ID único para a transação ANTES de chamar o MP
  const paymentId = crypto.randomUUID();

  // 4. Criar preferência no Mercado Pago
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookUrl = `${appUrl}/api/webhooks/mercadopago`;

  let preference;
  try {
    preference = await mpPreference.create({
      body: {
        items: [
          {
            id: "chip-deposit",
            title: "Depósito de fichas — JP Poker Club",
            unit_price: parsed.data.amount,
            quantity: 1,
            currency_id: "BRL",
          },
        ],
        external_reference: paymentId,
        notification_url: webhookUrl,
        payment_methods: {
          installments: 1,
        },
        back_urls: {
          success: `${appUrl}/depositar?status=success`,
          failure: `${appUrl}/depositar?status=failure`,
          pending: `${appUrl}/depositar?status=pending`,
        },
        auto_return: "approved",
      },
    });
  } catch (err) {
    console.error("[createPaymentIntentAction] MP Preference error:", err);
    return {
      success: false,
      error: "Não foi possível iniciar o pagamento. Tente novamente.",
    };
  }

  if (!preference.id) {
    return { success: false, error: "Resposta inválida do provedor de pagamento." };
  }

  // 5. Registrar o pagamento pendente no banco de dados
  const admin = createSupabaseAdminClient();
  const { error: dbError } = await admin.from("payments").insert({
    id: paymentId,
    user_id: user.id,
    status: "pending",
    amount: parsed.data.amount,
    preference_id: preference.id,
  });

  if (dbError) {
    console.error("[createPaymentIntentAction] DB insert error:", dbError);
    return {
      success: false,
      error: "Erro ao registrar o pagamento. Tente novamente.",
    };
  }

  return { success: true, preferenceId: preference.id };
}