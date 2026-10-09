import {
  PreRegistrationStatus,
  Prisma,
  PaymentMethod,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

export async function convertPreRegistration(
  preRegistrationId: string, 
  method: PaymentMethod,
  cpf: string,
  birthDate: string // Formato YYYY-MM-DD
) {
  // 1. Busca os dados originais do Lead
  const preRegistration = await prisma.preRegistration.findUnique({
    where: { id: preRegistrationId },
  });

  if (!preRegistration) throw new Error("Lead não encontrado.");
  if (preRegistration.status === "CONVERTED") throw new Error("Lead já foi convertido.");

  const plan = await prisma.plan.findUnique({
    where: { id: preRegistration.plan_id },
  });

  if (!plan) throw new Error("Plano não encontrado.");

  // Verifica se o CPF já existe no banco (para evitar alunos duplicados)
  const existingUser = await prisma.user.findUnique({ where: { cpf } });
  if (existingUser) throw new Error("Este CPF já está cadastrado no sistema.");

  const result = await prisma.$transaction(async (tx) => {
    // 2. Senha temporária: Os 6 primeiros dígitos do CPF
    const rawPassword = cpf.substring(0, 6);
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    
    // Converte a string de data (YYYY-MM-DD) para um objeto Date do Prisma
    const dob = new Date(birthDate);

    // 3. Cria o Usuário Oficial
    const newUser = await tx.user.create({
      data: {
        name: preRegistration.name,
        email: preRegistration.email,
        whatsapp: preRegistration.whatsapp,
        cpf: cpf, 
        birth_date: dob,
        password_hash: passwordHash,
        role: UserRole.STUDENT,
        pre_registration_id: preRegistration.id,
      },
    });

    // 4. Cria a Assinatura vinculada ao Plano
    const newSubscription = await tx.subscription.create({
      data: {
        user_id: newUser.id,
        plan_id: plan.id,
        status: SubscriptionStatus.ACTIVE,
      }
    });

    // 5. Registra o Pagamento Inicial (O Asaas vai se plugar no futuro aqui)
    await tx.payment.create({
      data: {
        subscription_id: newSubscription.id,
        amount: plan.price,
        method: method, 
        status: "PAID",
        paid_at: new Date(),
        due_date: new Date(),
      }
    });

    // 6. Altera o Status do Lead para "Convertido" para sumir dos pendentes
    await tx.preRegistration.update({
      where: { id: preRegistration.id },
      data: { status: "CONVERTED" },
    });

    return newUser;
  });

  return result;
}
// 1. Atualizamos os filtros para refletir o status do Lead (e não mais pagamento)
export type PreRegistrationStatusFilter =
  | "all"
  | "pending"
  | "converted"
  | "cancelled";

export interface ListPreRegistrationsFilters {
  search?: string;
  status?: PreRegistrationStatusFilter;
}

export async function getDashboardSummary() {
  const [preRegistrationsCount, activePlansCount] = await Promise.all([
    prisma.preRegistration.count(),
    prisma.plan.count({ where: { active: true } }),
  ]);

  return {
    preRegistrationsCount,
    activePlansCount,
  };
}

export interface AdminPreRegistrationItem {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  planName: string;
  // 2. O front-end agora vai receber o status correto do Prisma
  status: "PENDING" | "CONVERTED" | "CANCELLED";
  createdAt: string;
}

function buildPreRegistrationWhere(
  filters?: ListPreRegistrationsFilters,
): Prisma.PreRegistrationWhereInput {
  const where: Prisma.PreRegistrationWhereInput = {};

  console.log("Filtro recebido na API:", filters?.status);

  // 3. Atualizamos a montagem do filtro para usar a nova coluna "status"
  if (filters?.status && filters.status !== "all") {
    // Nós mapeamos a string minúscula para o Enum maiúsculo do Prisma
    if (filters.status === "pending") where.status = "PENDING";
    if (filters.status === "converted") where.status = "CONVERTED";
    if (filters.status === "cancelled") where.status = "CANCELLED";
  }

  const searchTerm = filters?.search?.trim();
  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
      { whatsapp: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listPreRegistrations(
  filters?: ListPreRegistrationsFilters,
): Promise<AdminPreRegistrationItem[]> {
  const where = buildPreRegistrationWhere(filters);

  const [preRegistrations, plans] = await Promise.all([
    prisma.preRegistration.findMany({
      where,
      orderBy: { created_at: "desc" },
    }),
    prisma.plan.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const planNameById = new Map(plans.map((plan) => [plan.id, plan.name]));

  return preRegistrations.map((registration) => ({
    id: registration.id,
    name: registration.name,
    email: registration.email,
    whatsapp: registration.whatsapp,
    planName: planNameById.get(registration.plan_id) ?? "Plano removido",
    // 4. Mapeamos a coluna status em vez da antiga payment_status
    status: registration.status,
    createdAt: registration.created_at.toISOString(),
  }));
}

export interface AdminPlanItem {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  isPopular: boolean;
  active: boolean;
}

export async function listAllPlans(): Promise<AdminPlanItem[]> {
  const plans = await prisma.plan.findMany({
    orderBy: [{ active: "desc" }, { price: "desc" }],
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    billingCycle: plan.billingCycle,
    features: plan.features,
    isPopular: plan.isPopular,
    active: plan.active,
  }));
}

export async function togglePlanActive(planId: string): Promise<AdminPlanItem> {
  const existingPlan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!existingPlan) {
    throw new Error("PLAN_NOT_FOUND");
  }

  const updatedPlan = await prisma.plan.update({
    where: { id: planId },
    data: { active: !existingPlan.active },
  });

  return {
    id: updatedPlan.id,
    name: updatedPlan.name,
    price: updatedPlan.price,
    billingCycle: updatedPlan.billingCycle,
    features: updatedPlan.features,
    isPopular: updatedPlan.isPopular,
    active: updatedPlan.active,
  };
}

export async function listStudents(filters?: { search?: string; status?: string }) {
  const where: Prisma.UserWhereInput = {
    role: "STUDENT", // Garante que não vamos listar os Admins na tabela de alunos
  };

  // Filtro de busca por texto
  if (filters?.search) {
    const search = filters.search.trim();
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { cpf: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filtro por status da assinatura (ACTIVE, OVERDUE, CANCELED)
  if (filters?.status && filters.status !== "all") {
    where.subscriptions = {
      some: {
        status: filters.status as SubscriptionStatus,
      },
    };
  }

  const students = await prisma.user.findMany({
    where,
    include: {
      subscriptions: {
        include: {
          plan: true,
        },
        // Removemos o 'orderBy' com created_at que estava dando erro
        // e o 'take: 1' temporariamente para garantir a tipagem correta.
      },
    },
    orderBy: { created_at: "desc" }, // Ordena os alunos pelos mais recentes
  });

  // Mapeia os dados para entregar um objeto limpo para o Front-end
  return students.map((student) => {
    // Como os alunos da Corpo Ativo costumam ter apenas 1 assinatura ativa,
    // nós pegamos a primeira (ou a última que entrou na lista).
    const latestSub = student.subscriptions.length > 0 
      ? student.subscriptions[student.subscriptions.length - 1] 
      : null;
    
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      cpf: student.cpf,
      whatsapp: student.whatsapp,
      birthDate: student.birth_date,
      createdAt: student.created_at,
      subscription: latestSub ? {
        id: latestSub.id,
        status: latestSub.status,
        planName: latestSub.plan.name,
      } : null, 
    };
  });
}