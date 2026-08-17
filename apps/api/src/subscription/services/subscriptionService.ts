/**
 * Regras de negócio de assinaturas.
 * gateway_subscription_id deve ser persistido antes de retornar sucesso ao front-end.
 */

export type CreateSubscriptionInput = {
  preRegistrationId: string;
  planId: string;
  gatewaySubscriptionId: string;
};

export type CreateSubscriptionResult = {
  subscriptionId: string;
  gatewaySubscriptionId: string;
  status: "pending" | "active" | "cancelled";
};

export async function createSubscription(
  _input: CreateSubscriptionInput,
): Promise<CreateSubscriptionResult> {
  // TODO(Fase 2): persistir na tabela subscriptions após retorno do Asaas.
  throw new Error("Integração de assinatura ainda não implementada");
}
