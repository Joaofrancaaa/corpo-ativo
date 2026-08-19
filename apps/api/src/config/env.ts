const DEFAULT_JWT_SECRET = "corpo-ativo-dev-secret";
const DEFAULT_PORT = 3333;
const DEFAULT_ASAAS_BASE_URL = "https://api.asaas.com/v3";

function parsePort(value: string | undefined): number {
  const port = Number(value ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT inválida.");
  }

  return port;
}

function warnIfUsingDevJwtSecret(secret: string): void {
  if (
    process.env.NODE_ENV === "production" &&
    secret === DEFAULT_JWT_SECRET
  ) {
    console.warn(
      "[env] JWT_SECRET não definido em produção. Configure um valor seguro.",
    );
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  jwtSecret: process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET,
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  asaas: {
    apiKey: process.env.ASAAS_API_KEY,
    baseUrl: process.env.ASAAS_BASE_URL ?? DEFAULT_ASAAS_BASE_URL,
    webhookToken: process.env.ASAAS_WEBHOOK_TOKEN,
  },
  seed: {
    adminCpf: process.env.ADMIN_CPF ?? "00000000000",
    adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
    adminName: process.env.ADMIN_NAME ?? "Administrador",
  },
} as const;

warnIfUsingDevJwtSecret(env.jwtSecret);

export function assertDatabaseEnv(): void {
  if (!env.database.url) {
    throw new Error("DATABASE_URL não configurada.");
  }
}

export function getAsaasApiKey(): string {
  if (!env.asaas.apiKey) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }

  return env.asaas.apiKey;
}
