import "fastify";
import { UserRole } from "@prisma/client";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      sub: string;
      role: UserRole;
    };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      role: UserRole;
    };
    user: {
      sub: string;
      role: UserRole;
    };
  }
}
