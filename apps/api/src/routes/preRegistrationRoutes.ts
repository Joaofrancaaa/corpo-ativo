import { FastifyInstance } from "fastify";
import { createPreRegistration } from "../controllers/preRegistrationController";

// O Fastify exige que os plugins de rotas sejam funções assíncronas
export async function preRegistrationRoutes(app: FastifyInstance) {
  // Quando fizerem um POST em /pre-matricula, executa a função createPreRegistration
  app.post("/pre-matricula", createPreRegistration);
}
