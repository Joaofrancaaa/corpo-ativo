import { FastifyInstance } from "fastify";
import { createCheckout } from "../controllers/paymentController";

export async function paymentRoutes(app: FastifyInstance) {
  app.post("/pagamentos/checkout", createCheckout);
}
