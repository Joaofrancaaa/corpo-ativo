/**
 * Cliente HTTP do Asaas (gateway de pagamento).
 * Chaves sempre via variável de ambiente — nunca hardcoded, nunca logadas.
 */

import { env, getAsaasApiKey } from "../../config/env";

export type AsaasConfig = {
  apiKey: string;
  baseUrl: string;
};

export function getAsaasConfig(): AsaasConfig {
  return {
    apiKey: getAsaasApiKey(),
    baseUrl: env.asaas.baseUrl,
  };
}
