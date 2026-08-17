/**
 * Cliente HTTP do Asaas (gateway de pagamento).
 * Chaves sempre via variável de ambiente — nunca hardcoded, nunca logadas.
 */

export type AsaasConfig = {
  apiKey: string;
  baseUrl: string;
};

export function getAsaasConfig(): AsaasConfig {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada");
  }

  return {
    apiKey,
    baseUrl: process.env.ASAAS_BASE_URL ?? "https://api.asaas.com/v3",
  };
}
