import type { Plan, PreRegistrationUser } from "../interfaces/types";
import { env } from "@/config/env";

const API_URL = env.apiUrl;

export const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await fetch(`${API_URL}/planos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar os planos");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro na API de planos:", error);
    return []; // Retorna array vazio em caso de falha de conexão (evita tela branca)
  }
};

function normalizeWhatsapp(whatsapp: string): string {
  return whatsapp.replace(/\D/g, "");
}

export const submitPreRegistration = async (
  user: PreRegistrationUser,
): Promise<{ success: boolean; message: string }> => {
  const normalizedWhatsapp = normalizeWhatsapp(user.whatsapp);
  const normalizedEmail = user.email.trim().toLowerCase();

  try {
    // Fazemos a requisição HTTP POST para o nosso backend Node.js
    const response = await fetch(`${API_URL}/pre-matricula`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.name.trim(),
        email: normalizedEmail,
        whatsapp: normalizedWhatsapp,
        selectedPlanId: user.selectedPlanId,
      }),
    });

    // Converte a resposta do backend de volta para objeto JavaScript
    const data = await response.json();

    // Se o status HTTP não for OK (ex: 400 de erro de duplicidade ou 500 erro interno)
    if (!response.ok) {
      throw new Error(data.message || "Erro ao realizar a pré-matrícula.");
    }

    return {
      success: true,
      message: data.message || "Pré-matrícula realizada com sucesso!",
    };
  } catch (error: any) {
    console.error("Erro na API:", error);
    // Se o erro já veio com mensagem tratada do backend (como a de duplicidade), ele repassa.
    // Caso contrário (ex: servidor offline), exibe uma mensagem amigável.
    throw new Error(
      error.message === "Failed to fetch"
        ? "Não foi possível conectar ao servidor. Verifique sua conexão."
        : error.message,
    );
  }
};
