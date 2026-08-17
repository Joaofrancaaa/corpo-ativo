import { FastifyReply, FastifyRequest } from "fastify";
import { createCheckoutLink } from "../services/paymentService";

export async function createCheckout(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = request.body as {
      preRegistrationId?: string;
      planId?: string;
    };

    if (!body.preRegistrationId || !body.planId) {
      return reply.status(400).send({
        success: false,
        message: "preRegistrationId e planId são obrigatórios.",
      });
    }

    const result = await createCheckoutLink({
      preRegistrationId: body.preRegistrationId,
      planId: body.planId,
    });

    return reply.status(201).send({ success: true, data: result });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Integração de pagamento ainda não implementada"
    ) {
      return reply.status(501).send({
        success: false,
        message: "Checkout de pagamento será disponibilizado em breve.",
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno ao gerar link de pagamento.",
    });
  }
}
