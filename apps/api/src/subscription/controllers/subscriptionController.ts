import { FastifyReply, FastifyRequest } from "fastify";
import { createSubscription } from "../services/subscriptionService";

export async function createSubscriptionHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = request.body as {
      preRegistrationId?: string;
      planId?: string;
      gatewaySubscriptionId?: string;
    };

    if (
      !body.preRegistrationId ||
      !body.planId ||
      !body.gatewaySubscriptionId
    ) {
      return reply.status(400).send({
        success: false,
        message:
          "preRegistrationId, planId e gatewaySubscriptionId são obrigatórios.",
      });
    }

    const result = await createSubscription({
      preRegistrationId: body.preRegistrationId,
      planId: body.planId,
      gatewaySubscriptionId: body.gatewaySubscriptionId,
    });

    return reply.status(201).send({ success: true, data: result });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Integração de assinatura ainda não implementada"
    ) {
      return reply.status(501).send({
        success: false,
        message: "Assinaturas serão disponibilizadas em breve.",
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno ao criar assinatura.",
    });
  }
}
