import { FastifyInstance } from "fastify";
import { handleAsaasWebhook } from "../controllers/webhookController";

export async function webhookRoutes(app: FastifyInstance) {
  app.post("/webhooks/asaas", handleAsaasWebhook);
}
