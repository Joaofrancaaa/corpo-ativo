import Fastify from "fastify";
import cors from "@fastify/cors";
import { preRegistrationRoutes } from "./routes/preRegistrationRoutes";
import { planRoutes } from "./routes/planRoutes";
import { paymentRoutes } from "./payment/routes/paymentRoutes";
import { subscriptionRoutes } from "./subscription/routes/subscriptionRoutes";
import { webhookRoutes } from "./webhook/routes/webhookRoutes";

const app = Fastify({ logger: true });

// --- Middlewares Globais ---
app.register(cors, {
  origin: true, // Permite conexões do nosso front-end
});

// --- Rota de Health Check (Verifica se a API está no ar) ---
app.get("/ping", async (request, reply) => {
  return { status: "ok", message: "API Corpo Ativo rodando perfeitamente!" };
});

// --- Registro de Rotas (Plugins) ---
// O prefixo é opcional, mas ajuda a organizar. Ex: /api/pre-matricula
app.register(preRegistrationRoutes, { prefix: "/api" });
app.register(planRoutes, { prefix: "/api" });
app.register(paymentRoutes, { prefix: "/api" });
app.register(subscriptionRoutes, { prefix: "/api" });
app.register(webhookRoutes, { prefix: "/api" });

// --- Inicialização do Servidor ---
const start = async () => {
  try {
    await app.listen({ port: 3333, host: "0.0.0.0" });
    console.log("🚀 API rodando em http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
