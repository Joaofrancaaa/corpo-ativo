// apps/api/prisma/seed.ts
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { env } from "../src/config/env";

const prisma = new PrismaClient();

async function seedPlans() {
  const existingPlans = await prisma.plan.count();

  if (existingPlans > 0) {
    console.log("Planos já existem, pulando seed de planos.");
    return;
  }

  await prisma.plan.createMany({
    data: [
      {
        name: "Mensal",
        price: 119.9,
        billingCycle: "monthly",
        features: ["Acesso livre", "Musculação", "Aulas coletivas"],
        isPopular: false,
      },
      {
        name: "Anual",
        price: 89.9,
        billingCycle: "yearly",
        features: [
          "Acesso livre",
          "Musculação",
          "Aulas coletivas",
          "Sem taxa de adesão",
          "Convide 1 amigo por mês",
        ],
        isPopular: true,
      },
      {
        name: "Trimestral",
        price: 109.9,
        billingCycle: "quarterly",
        features: ["Acesso livre", "Musculação", "Aulas coletivas"],
        isPopular: false,
      },
    ],
  });

  console.log("Planos inseridos com sucesso!");
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
