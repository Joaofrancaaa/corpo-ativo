import { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@prisma/client";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({
      success: false,
      message: "Não autorizado.",
    });
  }
}

export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        message: "Acesso negado.",
      });
    }
  };
}
