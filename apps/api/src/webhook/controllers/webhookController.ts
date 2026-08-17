import { FastifyReply, FastifyRequest } from "fastify";
import {
  processAsaasWebhook,
  validateAsaasWebhookOrigin,
  type AsaasWebhookPayload,
} from "../services/webhookService";

export async function handleAsaasWebhook(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!validateAsaasWebhookOrigin(request.headers)) {
    return reply.status(401).send({
      success: false,
      message: "Origem do webhook não autorizada.",
    });
  }

  try {
    const payload = request.body as AsaasWebhookPayload;
    const eventId =
      (request.headers["asaas-access-token"] as string | undefined) ??
      payload.payment?.id ??
      "unknown";

    await processAsaasWebhook(payload, eventId);

    return reply.status(200).send({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Webhook Asaas ainda não implementado"
    ) {
      return reply.status(501).send({
        success: false,
        message: "Webhook de pagamento será disponibilizado em breve.",
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno ao processar webhook.",
    });
  }
}
