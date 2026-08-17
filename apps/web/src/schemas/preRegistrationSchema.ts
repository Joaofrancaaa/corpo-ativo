import { z } from "zod";

export const preRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo")
    .max(100, "Nome muito longo"),
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido"),
  whatsapp: z
    .string()
    .trim()
    .regex(
      /^\(?\d{2}\)?\s?9\d{4}-?\d{4}$/,
      "Digite um WhatsApp válido, ex: 99 99999-9999",
    ),
  selectedPlanId: z.string().min(1, "Selecione um plano"),
});

// Inferimos o tipo TypeScript diretamente do esquema Zod
export type PreRegistrationFormData = z.infer<typeof preRegistrationSchema>;
