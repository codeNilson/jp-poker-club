"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mpPayment } from "@/lib/mercadopago";
import type { IPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/payment/type.d";
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

// ---------------------------------------------------------------------------
// Processar o Pagamento do Brick (Cartão, Pix, etc)
// ---------------------------------------------------------------------------
export async function processPaymentAction(
  formData: IPaymentFormData,
  preferenceId: string
) {
  try {
    // 1. Garantir que o usuário está autenticado
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const admin = createSupabaseAdminClient();

    // 2. Buscar o registro do pagamento original gerado na preference
    const { data: paymentRecord, error: fetchError } = await admin
      .from("payments")
      .select("id, status, amount")
      .eq("preference_id", preferenceId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !paymentRecord) {
      return { success: false, error: "Registro de pagamento não encontrado." };
    }

    if (paymentRecord.status === "approved") {
      return { success: true, status: "approved" };
    }

    // 3. Enviar a cobrança real para a API do Mercado Pago
    const paymentResponse = await mpPayment.create({
      body: {
        transaction_amount: formData.formData.transaction_amount,
        token: formData.formData.token,
        description: "Depósito de fichas — JP Poker Club",
        installments: formData.formData.installments,
        payment_method_id: formData.formData.payment_method_id,
        issuer_id: Number(formData.formData.issuer_id),
        payer: {
          email: formData.formData.payer.email,
          identification: formData.formData.payer.identification,
        },
        external_reference: paymentRecord.id,
      },
    });

    if (!paymentResponse.id) {
      return { success: false, error: "A API do Mercado Pago não retornou um ID válido." };
    }

    // 4. Atualizar o status do pagamento no Supabase
    // O Webhook continuará sendo a fonte da verdade, mas já adiantamos o status aqui.
    const finalStatus = paymentResponse.status === "approved" ? "approved" : "pending";

    await admin
      .from("payments")
      .update({
        mp_payment_id: String(paymentResponse.id),
      })
      .eq("id", paymentRecord.id);

    // 5. Retornar sucesso para o frontend
    return {
      success: finalStatus === "approved" || finalStatus === "pending",
      status: finalStatus,
      mpPaymentId: paymentResponse.id
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("[processPaymentAction] Erro ao processar pagamento:", err);
    return {
      success: false,
      error: err.message || "Falha de comunicação com o provedor de pagamento."
    };
  }
}