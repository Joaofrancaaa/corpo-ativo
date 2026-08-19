import { z } from "zod";

export const loginSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(11, "Informe um CPF válido")
    .max(14, "CPF inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}
