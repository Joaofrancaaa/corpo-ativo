# Corpo Ativo

Monorepo do MVP da academia **Corpo Ativo**.

## Estrutura

```
corpo-ativo/
├── apps/
│   ├── web/          # Landing Page (React + TypeScript + CSS Modules) — Fase 1
│   └── api/          # API Node.js/Fastify — Fase 2 (placeholder)
├── packages/
│   └── ui/           # Componentes compartilhados — Fase 2 (placeholder)
├── package.json
├── turbo.json
└── tsconfig.base.json
```

## Pré-requisitos

- Node.js >= 20
- npm >= 10

## Scripts (raiz)

| Comando       | Descrição                          |
|---------------|------------------------------------|
| `npm install` | Instala dependências do monorepo   |
| `npm run dev` | Inicia dev server(s) via Turborepo |
| `npm run dev:web` | Apenas o app web               |
| `npm run build` | Build de produção                |
| `npm run typecheck` | Verificação de tipos         |

## Deploy (Vercel)

O app `apps/web` está configurado para deploy estático na Vercel. Defina o **Root Directory** como `apps/web` no painel da Vercel, ou use o `vercel.json` na raiz do app.

No painel da Vercel, configure `VITE_API_URL` apontando para a URL pública da API.

## Variáveis de ambiente

Veja `apps/api/.env.example` e `apps/web/.env.example`. Resumo:

- **API** — banco, JWT, Asaas (segredos)
- **Web** — apenas `VITE_API_URL` (pública no browser)
