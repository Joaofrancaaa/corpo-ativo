/**
 * Regras de negócio de pagamento (Asaas).
 * Armazenamos apenas IDs de referência — nunca dados brutos de cartão/CVV.
 */

export type CreateCheckoutInput = {
  preRegistrationId: string;
  planId: string;
};

export type CreateCheckoutResult = {
  checkoutUrl: string;
  gatewayPaymentId: string;
};

export async function createCheckoutLink(
  _input: CreateCheckoutInput,
): Promise<CreateCheckoutResult> {
  // TODO(Fase 2): integrar com Asaas e persistir gateway_payment_id antes de retornar ao front.
  throw new Error("Integração de pagamento ainda não implementada");
}
