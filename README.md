# 🏋️ Corpo Ativo — Plataforma de Gestão e Captação para Academias

Aplicação full-stack desenvolvida para a **Corpo Ativo Academia**, unindo uma landing page focada em conversão de pré-matrículas a um painel administrativo completo para gestão de leads, planos, matrículas oficiais e assinaturas.

> **Status do Projeto:** Em produção (MVP funcional) — Arquitetura preparada para integração de cobrança recorrente e webhooks com o gateway Asaas.

🔗 **Site no ar:** [corpoativoacademia.vercel.app](https://corpoativoacademia.vercel.app/)

## ✨ Funcionalidades

### 🌐 Landing Page Pública
- **Catálogo Dinâmico de Planos:** Exibição de planos (Musculação, Anual com Fidelidade, Casal, Plano Amigo e Pilates) carregados diretamente da API, com hierarquia visual voltada à conversão.
- **Captura de Pré-Matrícula (Leads):** Formulário integrado ao banco de dados para reserva de vaga com condições de inauguração.

### 🔐 Painel Administrativo (Dark Mode)
- **Autenticação e Controle de Acesso (RBAC):** Login seguro via JWT com proteção de rotas por perfil (`ADMIN` e `STUDENT`).
- **Dashboard Gerencial:** Resumo de métricas da academia e visão centralizada de pré-matrículas recentes.
- **Funil de Conversão de Leads:** Fluxo completo na recepção para converter uma `PreRegistration` (`PENDING`) em aluno oficial (`User`), registrando CPF, data de nascimento, método de pagamento inicial, assinatura ativa (`Subscription`) e registro financeiro (`Payment`), com geração automática de senha provisória.
- **Gestão de Alunos Oficiais:** Listagem dedicada de alunos matriculados com busca por nome, e-mail ou CPF e filtro por status da assinatura (`ACTIVE`, `OVERDUE`, `CANCELED`).
- **Gestão de Planos:** Ativação e desativação dinâmica de planos pelo painel.
- **Experiência e Resiliência:** Validação de dados com Zod, tratamento amigável de conflitos de unicidade no banco (ex.: CPF duplicado retornando HTTP `409`) e feedbacks visuais com notificações toast.

---

## 🛠️ Tecnologias Utilizadas

### Front-end (`apps/web`)
- **React** + **TypeScript** + **Vite**
- **CSS Modules** (estilização isolada sem frameworks utilitários)
- **Sonner** (sistema de notificações toast)
- **Hospedagem:** Vercel (com regra de rewrite SPA em `apps/web/vercel.json`)

### Back-end (`apps/api`)
- **Node.js** + **TypeScript**
- **Fastify** (`@fastify/cors`, `@fastify/jwt`)
- **Prisma ORM** + **PostgreSQL**
- **Zod** (validação de schemas e parâmetros)
- **Hospedagem:** Render (API) + Supabase (PostgreSQL com Pooler e conexão direta)

---

## 🗂️ Arquitetura do Monorepo

```text
corpoAtivo/
├── apps/
│   ├── api/                    # API REST em Fastify + Prisma
│   │   ├── prisma/             # Schema do banco e migrations
│   │   └── src/
│   │       ├── admin/          # Controllers, services e rotas do painel admin
│   │       ├── auth/           # Autenticação JWT e middlewares RBAC
│   │       ├── config/         # Variáveis de ambiente
│   │       ├── payment/        # Módulo de pagamentos
│   │       ├── subscription/   # Módulo de assinaturas
│   │       ├── webhook/        # Estrutura preparada para webhooks (Asaas)
│   │       ├── routes/         # Rotas públicas (planos e pré-matrícula)
│   │       └── server.ts       # Entrypoint do servidor Fastify
│   └── web/                    # Aplicação React + Vite
│       ├── src/
│       │   ├── features/       # Tipagens e módulos de domínio
│       │   ├── pages/          # Landing Page e páginas do Dashboard Admin
│       │   └── services/       # Cliente HTTP para consumo da API
│       └── vercel.json         # Configuração de rewrite para SPA na Vercel
└── package.json
```

---

## 🗄️ Modelagem Principal de Dados

| Entidade | Responsabilidade |
| :--- | :--- |
| **`PreRegistration`** | Leads captados pela landing page (`PENDING`, `CONVERTED`, `CANCELLED`). |
| **`User`** | Usuários autenticáveis (Administradores e Alunos oficiais com CPF único). |
| **`Plan`** | Planos e modalidades ofertados pela academia com controle de ativação. |
| **`Subscription`** | Contrato ativo que vincula o aluno ao plano e controla o status de acesso (`ACTIVE`, `OVERDUE`, `CANCELED`). |
| **`Payment`** | Histórico financeiro e registros de pagamentos vinculados às assinaturas. |



## ☁️ Arquitetura de Deploy

| Serviço | Diretório Raiz | Plataforma | Observações |
| :--- | :--- | :--- | :--- |
| **Front-end** | `apps/web` | Vercel | Definir `VITE_API_URL` apontando para a URL da API com `/api` no final. |
| **Back-end** | `apps/api` | Render | Build: `npm install && npm run build` (`npx prisma generate && tsc`) \| Start: `node dist/server.js`. |
| **Banco de Dados** | — | Supabase | Configurar `DATABASE_URL` (Transaction Pooler) e `DIRECT_URL` (Direct/Session). |

---

## 🗺️ Roadmap

- [x] Landing Page responsiva com planos dinâmicos e formulário de pré-matrícula
- [x] Autenticação JWT e proteção de rotas administrativas
- [x] Dashboard administrativo em Dark Mode com conversão de leads em alunos
- [x] Listagem e filtragem de alunos oficiais e status de assinatura
- [x] Deploy completo em produção (Vercel + Render + Supabase)
- [ ] Integração de cobranças recorrentes e webhooks com o **Asaas**
- [ ] Controle de check-in diário e métricas reais de frequência no gráfico
- [ ] Área do Aluno (consulta de plano, faturas e treinos)

---

## 👤 Autor

Desenvolvido por **João França**.
