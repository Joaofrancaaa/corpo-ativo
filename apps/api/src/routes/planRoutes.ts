// apps/api/src/routes/planRoutes.ts
import { FastifyInstance } from "fastify";
import { getPlans } from "../controllers/planControllers";

export async function planRoutes(app: FastifyInstance) {
  app.get("/planos", getPlans);
}
