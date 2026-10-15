// apps/api/prisma/seed.ts
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { env } from "../src/config/env";

const prisma = new PrismaClient();

const OFFICIAL_PLANS = [
  {
    name: "Individual",
    price: 180,
    billingCycle: "monthly",
    features: [
      "Musculação",
      "Aulas coletivas",
      "Spinning incluso por agendamento",
    ],
    isPopular: true,
    active: true,
  },
  {
    name: "Casal",
    price: 145,
    billingCycle: "monthly",
    features: ["Valor por pessoa", "Musculação", "Aulas coletivas"],
    isPopular: false,
    active: true,
  },
  {
    name: "Plano Amigo",
    price: 135,
    billingCycle: "monthly",
    features: [
      "A partir de 3 pessoas",
      "Valor por pessoa",
      "Musculação",
      "Aulas coletivas",
    ],
    isPopular: false,
    active: true,
  },
  {
    name: "Plano Família",
    price: 130,
    billingCycle: "monthly",
    features: ["Valor por pessoa", "Musculação", "Aulas coletivas"],
    isPopular: false,
    active: true,
  },
  {
    name: "Anual com fidelidade",
    price: 140,
    billingCycle: "yearly",
    features: [
      "Valor mensal com fidelidade anual",
      "Musculação",
      "Aulas coletivas",
    ],
    isPopular: false,
    active: true,
  },
  {
    name: "Semanal",
    price: 80,
    billingCycle: "weekly",
    features: ["Acesso por 7 dias", "Musculação", "Aulas coletivas"],
    isPopular: false,
    active: true,
  },
  {
    name: "Diária",
    price: 30,
    billingCycle: "daily",
    features: ["Acesso no dia", "Musculação", "Aulas coletivas"],
    isPopular: false,
    active: true,
  },
  {
    name: "Pilates 2x na semana",
    price: 300,
    billingCycle: "monthly",
    features: ["Duas vezes na semana", "Aulas de Pilates"],
    isPopular: false,
    active: true,
  },
  {
    name: "Pilates 3x na semana",
    price: 350,
    billingCycle: "monthly",
    features: ["Três vezes na semana", "Aulas de Pilates"],
    isPopular: false,
    active: true,
  },
  {
    name: "Aula avulsa de Spinning",
    price: 50,
    billingCycle: "daily",
    features: ["Bike indoor", "Por agendamento"],
    isPopular: false,
    active: true,
  },
] as const;

function toPlanData(plan: (typeof OFFICIAL_PLANS)[number]) {
  return {
    name: plan.name,
    price: plan.price,
    billingCycle: plan.billingCycle,
    features: [...plan.features],
    isPopular: plan.isPopular,
    active: plan.active,
  };
}

async function seedPlans() {
  const officialNames = OFFICIAL_PLANS.map((plan) => plan.name);

  for (const plan of OFFICIAL_PLANS) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: plan.name },
    });
    const data = toPlanData(plan);

    if (existingPlan) {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data,
      });
      continue;
    }

    await prisma.plan.create({ data });
  }

  await prisma.plan.updateMany({
    where: { name: { notIn: [...officialNames] } },
    data: { active: false },
  });

  console.log("Planos oficiais sincronizados com sucesso!");
}

async function seedAdminUser() {
  const adminCpf = env.seed.adminCpf;
  const adminPassword = env.seed.adminPassword;
  const adminName = env.seed.adminName;

  const existingAdmin = await prisma.user.findUnique({
    where: { cpf: adminCpf },
  });

  if (existingAdmin) {
    console.log("Usuário admin já existe, pulando seed de admin.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: adminName,
      cpf: adminCpf,
      password_hash: passwordHash,
      role: UserRole.ADMIN,
      consent_lgpd: true,
      consent_at: new Date(),
    },
  });

  console.log("Usuário admin criado com sucesso!");
}

async function main() {
  await seedPlans();
  await seedAdminUser();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
