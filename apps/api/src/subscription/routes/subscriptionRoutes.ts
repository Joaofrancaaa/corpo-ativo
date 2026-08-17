import { FastifyInstance } from "fastify";
import { createSubscriptionHandler } from "../controllers/subscriptionController";

export async function subscriptionRoutes(app: FastifyInstance) {
  app.post("/assinaturas", createSubscriptionHandler);
}
