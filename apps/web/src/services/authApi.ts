import type {
  AdminDashboardResponse,
  AdminPlanItem,
  AdminPreRegistrationFilters,
  AdminPreRegistrationItem,
  AuthUser,
  LoginResponse,
  MeResponse,
  AdminStudentItem, AdminStudentFilters
} from "@/features/auth/types";
import { env } from "@/config/env";

const TOKEN_STORAGE_KEY = "corpo_ativo_token";

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function loginRequest(
  cpf: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${env.apiUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cpf, password }),
  });

  const data = (await response.json()) as LoginResponse;

  if (!response.ok) {
    throw new Error(data.message || "Não foi possível entrar.");
  }

  return data;
}

export async function fetchCurrentUser(
  token: string,
): Promise<AuthUser | null> {
  const response = await fetch(`${env.apiUrl}/auth/me`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as MeResponse;
  return data.user ?? null;
}

export async function fetchAdminDashboard(
  token: string,
): Promise<AdminDashboardResponse> {
  const response = await fetch(`${env.apiUrl}/admin/dashboard`, {
    method: "GET",
    headers: authHeaders(token),
  });

  const data = (await response.json()) as AdminDashboardResponse;

  if (!response.ok) {
    throw new Error(data.message || "Erro ao carregar o dashboard.");
  }

  return data;
}

export async function fetchAdminPreRegistrations(
  token: string,
  filters: AdminPreRegistrationFilters = {},
): Promise<AdminPreRegistrationItem[]> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters?.status && filters.status !== "all") {
    params.append("status", filters.status);
  }

  const queryString = params.toString();
  const url = `${env.apiUrl}/admin/pre-registrations${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: authHeaders(token),
  });

  const data = (await response.json()) as {
    success: boolean;
    data?: AdminPreRegistrationItem[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Erro ao carregar pré-matrículas.");
  }

  return data.data ?? [];
}

export async function fetchAdminPlans(token: string): Promise<AdminPlanItem[]> {
  const response = await fetch(`${env.apiUrl}/admin/plans`, {
    method: "GET",
    headers: authHeaders(token),
  });

  const data = (await response.json()) as {
    success: boolean;
    data?: AdminPlanItem[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Erro ao carregar planos.");
  }

  return data.data ?? [];
}

export async function toggleAdminPlanActive(
  token: string,
  planId: string,
): Promise<AdminPlanItem> {
  const response = await fetch(
    `${env.apiUrl}/admin/plans/${planId}/toggle-active`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    data?: AdminPlanItem;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Erro ao atualizar plano.");
  }

  if (!data.data) {
    throw new Error("Resposta inválida ao atualizar plano.");
  }

  return data.data;
}

export async function convertAdminPreRegistration(
  token: string,
  preRegistrationId: string,
  paymentMethod: "CASH" | "POS_CREDIT_CARD" | "POS_DEBIT_CARD" | "MANUAL_PIX",
  cpf: string,
  birthDate: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${env.apiUrl}/admin/pre-registrations/${preRegistrationId}/convert`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      // Agora enviamos o corpo da requisição completo (exatamente como o Zod espera)
      body: JSON.stringify({
        method: paymentMethod,
        cpf: cpf,
        birthDate: birthDate,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    // Se o Zod falhar, ele manda uma mensagem clara agora
    throw new Error(data.message || "Erro ao converter a pré-matrícula.");
  }

  return data;
}

export async function fetchAdminStudents(
  token: string,
  filters: AdminStudentFilters = {},
): Promise<AdminStudentItem[]> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters?.status && filters.status !== "all") {
    params.append("status", filters.status);
  }

  const queryString = params.toString();
  const url = `${env.apiUrl}/admin/students${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: authHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro ao carregar lista de alunos.");
  }

  return data.data ?? [];
}