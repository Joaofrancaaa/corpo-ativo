// apps/api/prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
