import "server-only";

import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error("Missing MP_ACCESS_TOKEN environment variable");
}

/**
 * Instância singleton do cliente Mercado Pago (backend only).
 * Importar a partir daqui garante que o Access Token não vaze para o client bundle.
 */
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

/** Helper pré-configurado para criar/consultar preferências */
export const mpPreference = new Preference(mpClient);

/** Helper pré-configurado para consultar pagamentos (usado no webhook) */
export const mpPayment = new Payment(mpClient);
