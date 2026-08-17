import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";

export async function getPlans(request: FastifyRequest, reply: FastifyReply) {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { price: "desc" },
    });

    const popularIndex = plans.findIndex((plan) => plan.isPopular);

    if (popularIndex !== -1 && plans.length > 2) {
      const [popularPlan] = plans.splice(popularIndex, 1);
      const middleIndex = Math.floor(plans.length / 2);
      plans.splice(middleIndex, 0, popularPlan);
    }

    return reply.status(200).send(plans);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Erro ao buscar planos" });
  }
}
