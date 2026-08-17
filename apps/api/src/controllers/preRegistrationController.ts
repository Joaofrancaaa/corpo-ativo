import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";

export async function createPreRegistration(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = request.body as any;

  try {
    const newRegistration = await prisma.preRegistration.create({
      data: {
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        plan_id: data.selectedPlanId,
      },
    });

    return reply.status(201).send({ success: true, data: newRegistration });
  } catch (error: any) {
    // Verifica se é o erro de violação de restrição UNIQUE do Prisma
    if (error.code === "P2002") {
      // O Prisma guarda o nome do campo duplicado em error.meta.target
      const target = error.meta?.target as string[] | undefined;

      if (target?.includes("email")) {
        return reply.status(400).send({
          success: false,
          message:
            "Este e-mail já está cadastrado. Se precisar de ajuda, fale com a recepção.",
        });
      }

      if (target?.includes("whatsapp")) {
        return reply.status(400).send({
          success: false,
          message:
            "Este WhatsApp já está cadastrado. Se precisar de ajuda, fale com a recepção.",
        });
      }

      // Fallback genérico caso não consiga identificar o campo
      return reply.status(400).send({
        success: false,
        message: "Você já realizou sua pré-matrícula.",
      });
    }

    request.log.error(error); // Loga o erro real no terminal
    return reply
      .status(500)
      .send({ success: false, message: "Erro interno no servidor" });
  }
}
