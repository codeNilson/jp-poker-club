import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mpPayment } from "@/lib/mercadopago";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseXSignature(header: string | null): { ts: string; v1: string } | null {
  if (!header) return null;
  const parts = header.split(",");
  const tsEntry = parts.find((p) => p.startsWith("ts="));
  const v1Entry = parts.find((p) => p.startsWith("v1="));
  if (!tsEntry || !v1Entry) return null;
  return { ts: tsEntry.split("=")[1], v1: v1Entry.split("=")[1] };
}

function verifySignature(opts: {
  paymentId: string;
  requestId: string;
  ts: string;
  v1: string;
  secret: string;
}): boolean {
  const manifest = `id:${opts.paymentId};request-id:${opts.requestId};ts:${opts.ts};`;
  const hmac = crypto.createHmac("sha256", opts.secret);
  hmac.update(manifest);
  const computed = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(opts.v1), Buffer.from(computed));
  } catch {
    // Buffers de comprimento diferente — assinatura inválida
    return false;
  }
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/mercadopago
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // 1. Responde 200 imediatamente (requisito do Mercado Pago: responder em < 22 s)
  //    O processamento real ocorre em background (same serverless invocation).
  //    Se o runtime suportar, poderíamos usar `waitUntil` — mas mantemos síncrono
  //    por simplicidade e compatibilidade com Edge/Node.

  const webhookSecret = process.env.MP_WEBHOOK_SECRET ?? "";

  // 2. Captura body como texto para validação da assinatura
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // 3. Validar assinatura (x-signature)
  if (webhookSecret) {
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id") ?? "";
    const paymentId = String((body.data as Record<string, unknown>)?.id ?? "");
    const parsed = parseXSignature(xSignature);

    if (!parsed) {
      console.warn("[MP Webhook] Assinatura ausente ou malformada");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const valid = verifySignature({
      paymentId,
      requestId: xRequestId,
      ts: parsed.ts,
      v1: parsed.v1,
      secret: webhookSecret,
    });

    if (!valid) {
      console.warn("[MP Webhook] Assinatura inválida");
      return NextResponse.json({ ok: false }, { status: 400 });
    }
  }

  // 4. Só processar notificações do tipo "payment"
  const topic = body.type ?? body.topic;
  if (topic !== "payment") {
    return NextResponse.json({ ok: true });
  }

  const mpPaymentId = String((body.data as Record<string, unknown>)?.id ?? "");
  if (!mpPaymentId) {
    return NextResponse.json({ ok: true });
  }

  // 5. Consultar status real via SDK (Zero Trust — nunca confiar apenas no payload)
  let paymentData;
  try {
    paymentData = await mpPayment.get({ id: mpPaymentId });
  } catch (err) {
    console.error("[MP Webhook] Falha ao consultar pagamento:", err);
    // Responde 200 para evitar re-envio do MP; o MP vai retentar automaticamente
    return NextResponse.json({ ok: true });
  }

  if (paymentData.status !== "approved") {
    // Nada a fazer para pagamentos não aprovados neste fluxo
    return NextResponse.json({ ok: true });
  }

  // 6. Processar pagamento aprovado
  const admin = createSupabaseAdminClient();

  const dbPaymentId = String(paymentData.external_reference ?? "");
  const amount = Number(paymentData.transaction_amount ?? 0);
  const mpPaymentIdStr = String(paymentData.id ?? mpPaymentId);

  if (!dbPaymentId || amount <= 0) {
    console.error("[MP Webhook] external_reference (payment ID) ou transaction_amount ausentes", {
      dbPaymentId,
      amount,
    });
    return NextResponse.json({ ok: true });
  }

  // 6a. Buscar o registro EXATO do pagamento no banco de dados
  const { data: payment, error: fetchError } = await admin
    .from("payments")
    .select("id, status, amount, user_id") // Precisamos do user_id aqui
    .eq("id", dbPaymentId)
    .maybeSingle();

  if (fetchError || !payment) {
    console.error("[MP Webhook] Registro de pagamento não encontrado:", fetchError);
    return NextResponse.json({ ok: true });
  }

  const userId = payment.user_id;

  // 6b. Idempotência — já processado?
  if (payment.status === "approved") {
    console.info("[MP Webhook] Pagamento já processado e aprovado:", payment.id);
    return NextResponse.json({ ok: true });
  }

  // 6c. UPDATE payments → approved
  const { error: updatePaymentError } = await admin
    .from("payments")
    .update({ status: "approved", mp_payment_id: mpPaymentIdStr })
    .eq("id", payment.id);

  if (updatePaymentError) {
    console.error("[MP Webhook] Falha ao atualizar payments:", updatePaymentError);
    return NextResponse.json({ ok: true });
  }

  // 6d. Buscar saldo atual (Apenas para registrar no extrato, NÃO vamos atualizar a wallets aqui)
  const { data: wallet, error: walletFetchError } = await admin
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (walletFetchError || !wallet) {
    console.error("[MP Webhook] Carteira não encontrada para extrato:", walletFetchError);
    return NextResponse.json({ ok: true });
  }

  const balanceBefore = Number(wallet.balance);
  const balanceAfter = balanceBefore + amount;

  // 6e. INSERT wallet_transactions (ledger)
  // CORREÇÃO 2: Apenas inserimos a transação. O Trigger 'handle_wallet_transaction' no Supabase fará o UPDATE na tabela wallets automaticamente.
  const { error: txError } = await admin.from("wallet_transactions").insert({
    user_id: userId,
    type: "deposit",
    amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    reference_type: "mp_payment",
    reference_id: payment.id,
    description: `Depósito via Mercado Pago — ID ${mpPaymentIdStr}`,
  });

  if (txError) {
    console.error("[MP Webhook] Falha ao inserir wallet_transactions:", txError);
    return NextResponse.json({ ok: true });
  }

  console.info(`[MP Webhook] Depósito processado com sucesso: user=${userId} amount=${amount}`);
  return NextResponse.json({ ok: true });
}