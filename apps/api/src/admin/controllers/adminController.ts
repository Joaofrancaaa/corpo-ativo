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

const convertSchema = z.object({
  method: z.nativeEnum(PaymentMethod),
});

export async function postConvertPreRegistration(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const parsedBody = convertSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      success: false,
      message: "Método de pagamento inválido.",
    });
  }

  try {
    const newUser = await convertPreRegistration(id, parsedBody.data.method);

    return reply.status(201).send({
      success: true,
      data: {
        userId: newUser.id,
        message: "Pré-matrícula convertida em Aluno Oficial com sucesso!",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Lead não encontrado.") {
      return reply.status(404).send({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Lead já foi convertido.") {
      return reply.status(400).send({
        success: false,
        message: error.message,
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno ao converter pré-matrícula.",
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
