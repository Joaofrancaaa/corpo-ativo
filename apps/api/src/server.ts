import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./config/env";
import { preRegistrationRoutes } from "./routes/preRegistrationRoutes";
import { planRoutes } from "./routes/planRoutes";
import { paymentRoutes } from "./payment/routes/paymentRoutes";
import { subscriptionRoutes } from "./subscription/routes/subscriptionRoutes";
import { webhookRoutes } from "./webhook/routes/webhookRoutes";
import { authRoutes } from "./auth/routes/authRoutes";
import { adminRoutes } from "./admin/routes/adminRoutes";

const app = Fastify({ logger: true });

// --- Middlewares Globais ---
app.register(cors, {
  origin: true, // Permite conexões do nosso front-end
});

// --- Middlewares Globais ---
// app.register(cors, {
// Se for produção, aceita só do seu domínio real. Se for dev, aceita do localhost (Vite).
//  origin: env.nodeEnv === 'production' 
//   ? ['https://sua-academia.com.br', 'https://www.sua-academia.com.br'] 
//   : true,
//});

app.register(jwt, {
  secret: env.jwtSecret,
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
app.register(authRoutes, { prefix: "/api" });
app.register(adminRoutes, { prefix: "/api" });

// --- Inicialização do Servidor ---
const start = async () => {
  try {
    await app.listen({ port: env.port, host: "0.0.0.0" });
    console.log(`🚀 API rodando em http://localhost:${env.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
