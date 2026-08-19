# @corpo-ativo/api (Fase 2)

Placeholder para a API Node.js com **Fastify**.

## Escopo previsto

- Autenticação de usuários
- Gestão de matrículas e assinaturas
- Integração com gateway de pagamentos recorrentes
- Painel administrativo (endpoints REST)

## Variáveis de ambiente

Cada app do monorepo tem seu próprio `.env` (nunca versionado) e um `.env.example` (versionado como referência).

| App | Arquivo | O que configurar |
|-----|---------|------------------|
| `apps/api` | `.env` | Banco, JWT, Asaas, seed do admin |
| `apps/web` | `.env` | URL da API (`VITE_API_URL`) |

### Setup rápido

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env
```

Depois preencha `DATABASE_URL`, `DIRECT_URL` e `JWT_SECRET` em `apps/api/.env`.

> **Regra:** segredos ficam só no back-end. No front-end, use apenas variáveis com prefixo `VITE_`.

## Próximos passos

1. Inicializar `package.json` com Fastify + TypeScript
2. Configurar banco de dados e migrations
3. Expor endpoints consumidos por `apps/web` (substituindo `mockApi.ts`)
