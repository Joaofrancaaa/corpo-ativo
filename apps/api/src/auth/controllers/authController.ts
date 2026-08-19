import { FastifyReply, FastifyRequest } from "fastify";
import { authenticateUser, getUserById } from "../services/authService";
import { loginSchema } from "../schemas/loginSchema";

export async function login(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos",
    });
  }

  try {
    const user = await authenticateUser(parsed.data);

    if (!user) {
      return reply.status(401).send({
        success: false,
        message: "CPF ou senha incorretos.",
      });
    }

    const token = await reply.jwtSign({
      sub: user.id,
      role: user.role,
    });

    return reply.send({
      success: true,
      token,
      user,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno no servidor",
    });
  }
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = await getUserById(request.user.sub);

    if (!user) {
      return reply.status(401).send({
        success: false,
        message: "Sessão inválida.",
      });
    }

    return reply.send({
      success: true,
      user,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno no servidor",
    });
  }
}
