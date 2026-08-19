import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  getDashboardSummary,
  listAllPlans,
  listPreRegistrations,
  togglePlanActive,
  convertPreRegistration,
} from "../services/adminService";

import { PaymentMethod } from "@prisma/client";
import { Prisma } from "@prisma/client";

const convertSchema = z.object({
  method: z.nativeEnum(PaymentMethod),
  cpf: z.string().min(11, "CPF inválido").max(14), // Permite com ou sem pontuação
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
});

export async function postConvertPreRegistration(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  console.log("Recebido do Front-end:", request.body);
  const parsedBody = convertSchema.safeParse(request.body);

  if (!parsedBody.success) {
    console.error("Erro do Zod:", parsedBody.error.format());
    return reply.status(400).send({
      success: false,
      message: "Método de pagamento inválido.",
    });
  }

  try {
    // Removemos a pontuação do CPF (se vier) para guardar limpo no banco
    const cleanCpf = parsedBody.data.cpf.replace(/\D/g, "");

    const newUser = await convertPreRegistration(
      id,
      parsedBody.data.method,
      cleanCpf,
      parsedBody.data.birthDate,
    );

    return reply.status(201).send({
      success: true,
      data: {
        userId: newUser.id,
        message:
          "Pré-matrícula convertida! Senha inicial: 6 primeiros dígitos do CPF.",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Lead não encontrado." ||
        error.message === "Lead já foi convertido." ||
        error.message === "Plano não encontrado."
      ) {
        return reply
          .status(404)
          .send({ success: false, message: error.message });
      }

      if (error.message === "Este CPF já está cadastrado no sistema.") {
        return reply
          .status(409)
          .send({ success: false, message: error.message });
      }
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // O código P2002 significa "Unique constraint failed"
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];

        if (target.includes("cpf")) {
          return reply.status(409).send({
            success: false,
            message: "Atenção: Este CPF já está matriculado no sistema!",
          });
        }
        if (target.includes("email")) {
          return reply.status(409).send({
            success: false,
            message:
              "Atenção: Este E-mail já está sendo usado por outro aluno.",
          });
        }
        if (target.includes("whatsapp")) {
          return reply.status(409).send({
            success: false,
            message: "Atenção: Este WhatsApp já está associado a outro aluno.",
          });
        }

        // Fallback genérico para duplicação
        return reply.status(409).send({
          success: false,
          message: "Já existe um registro com esses dados no sistema.",
        });
      }
    }
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno no servidor ao tentar efetivar a matrícula.",
    });
  }
}

const preRegistrationQuerySchema = z.object({
  search: z.string().trim().optional(),
  // O nome mudou de paymentStatus para status, e os valores agora refletem o Lead
  status: z.enum(["all", "pending", "converted", "cancelled"]).optional(),
});

export async function getDashboard(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const summary = await getDashboardSummary();

    return reply.send({
      success: true,
      data: summary,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno no servidor",
    });
  }
}

export async function getPreRegistrations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsedQuery = preRegistrationQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return reply.status(400).send({
      success: false,
      message: "Parâmetros de busca inválidos.",
    });
  }

  try {
    const { search, status } = parsedQuery.data;
    const data = await listPreRegistrations({
      search,
      status: status ?? "all",
    });

    return reply.send({
      success: true,
      data,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro ao buscar pré-matrículas",
    });
  }
}

export async function getAdminPlans(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = await listAllPlans();

    return reply.send({
      success: true,
      data,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro ao buscar planos",
    });
  }
}

export async function patchPlanActive(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { planId } = request.params as { planId: string };

  try {
    const data = await togglePlanActive(planId);

    return reply.send({
      success: true,
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return reply.status(404).send({
        success: false,
        message: "Plano não encontrado.",
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro ao atualizar plano",
    });
  }
}
