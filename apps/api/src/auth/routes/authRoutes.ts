import { FastifyInstance } from "fastify";
import { getMe, login } from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", login);
  app.get("/auth/me", { preHandler: [authenticate] }, getMe);
}
