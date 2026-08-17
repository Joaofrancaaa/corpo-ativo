/**
 * Processamento de webhooks do Asaas.
 * Deve ser idempotente: o mesmo evento pode chegar mais de uma vez.
 */

export type AsaasWebhookPayload = {
  event: string;
  payment?: {
    id: string;
    status: string;
  };
};

export async function processAsaasWebhook(
  _payload: AsaasWebhookPayload,
  _eventId: string,
): Promise<void> {
  // TODO(Fase 2):
  // 1. Validar assinatura/origem da requisição
  // 2. Verificar idempotência por eventId
  // 3. Registrar alteração de status com timestamp e evento de origem (auditoria)
  throw new Error("Webhook Asaas ainda não implementado");
}

export function validateAsaasWebhookOrigin(
  _headers: Record<string, string | string[] | undefined>,
): boolean {
  // TODO(Fase 2): validar token/assinatura conforme documentação Asaas.
  return false;
}
