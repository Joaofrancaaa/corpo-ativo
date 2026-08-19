import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { LoginInput, normalizeCpf } from "../schemas/loginSchema";

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
}

export async function authenticateUser(
  input: LoginInput,
): Promise<AuthenticatedUser | null> {
  const cpf = normalizeCpf(input.cpf);

  const user = await prisma.user.findUnique({
    where: { cpf },
    select: {
      id: true,
      name: true,
      role: true,
      password_hash: true,
    },
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.password_hash,
  );

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    role: user.role,
  };
}

export async function getUserById(
  userId: string,
): Promise<AuthenticatedUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  return user;
}
