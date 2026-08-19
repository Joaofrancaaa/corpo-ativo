export type UserRole = "STUDENT" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export interface MeResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
}

export interface AdminDashboardSummary {
  preRegistrationsCount: number;
  activePlansCount: number;
}

export interface AdminPreRegistrationItem {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  planName: string;
  status: "PENDING" | "CONVERTED" | "CANCELLED";
  createdAt: string;
}

export type PreRegistrationStatusFilter =
  | "all"
  | "pending"
  | "converted"
  | "cancelled";

export interface AdminPreRegistrationFilters {
  search?: string;
  status?: PreRegistrationStatusFilter;
}

export interface AdminPlanItem {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  isPopular: boolean;
  active: boolean;
}

export interface AdminDashboardResponse {
  success: boolean;
  data?: AdminDashboardSummary;
  message?: string;
}
