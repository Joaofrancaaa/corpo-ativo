import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";
import type { PreRegistrationStatusFilter } from "@/features/auth/types";
import {
  fetchAdminDashboard,
  fetchAdminPlans,
  fetchAdminPreRegistrations,
  toggleAdminPlanActive,
  convertAdminPreRegistration,
} from "@/services/authApi";
import type {
  AdminDashboardSummary,
  AdminPlanItem,
  AdminPreRegistrationItem,
} from "@/features/auth/types";
import {
  AlertsSection,
  CheckInsChartSection,
  CheckInsNowSection,
  ExpiringPlansSection,
  PlansSection,
  PreRegistrationsSection,
  QuickActionsSection,
} from "./AdminDashboardSections";
import styles from "./AdminDashboard.module.css";

const SEARCH_DEBOUNCE_MS = 350;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatLongDate(value: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [preRegistrations, setPreRegistrations] = useState<
    AdminPreRegistrationItem[]
  >([]);
  const [plans, setPlans] = useState<AdminPlanItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingPreRegistrations, setIsSearchingPreRegistrations] =
    useState(false);
  const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  // Corrigido: renomeado para statusFilter e usando o tipo correto
  const [statusFilter, setStatusFilter] =
    useState<PreRegistrationStatusFilter>("all");

  const loadDashboard = useCallback(async (authToken: string) => {
    const [dashboardResponse, planItems] = await Promise.all([
      fetchAdminDashboard(authToken),
      fetchAdminPlans(authToken),
    ]);

    setSummary(dashboardResponse.data ?? null);
    setPlans(planItems);
  }, []);

  const handleConvertLead = async (
    leadId: string,
    paymentMethod: string,
    cpf: string,
    birthDate: string,
  ) => {
    if (!token) return;

    // Chama a API para converter
    await convertAdminPreRegistration(
      token,
      leadId,
      paymentMethod as any,
      cpf,
      birthDate,
    );

    // Se deu certo, recarrega a tabela e os indicadores (Dashboard Summary)
    await loadPreRegistrations(token);
    await loadDashboard(token);
  };

  const loadPreRegistrations = useCallback(
    async (authToken: string) => {
      setIsSearchingPreRegistrations(true);

      try {
        const preRegistrationItems = await fetchAdminPreRegistrations(
          authToken,
          {
            search: debouncedSearchQuery,
            // Corrigido: usando a chave status que a API espera
            status: statusFilter,
          },
        );

        setPreRegistrations(preRegistrationItems);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar pré-matrículas.",
        );
      } finally {
        setIsSearchingPreRegistrations(false);
      }
    },
    // Corrigido: dependência atualizada para statusFilter
    [debouncedSearchQuery, statusFilter],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const authToken = token;

    async function initializeDashboard() {
      try {
        await loadDashboard(authToken);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Erro ao carregar o dashboard.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [token, loadDashboard]);

  useEffect(() => {
    if (!token || isLoading) {
      return;
    }

    void loadPreRegistrations(token);
  }, [token, isLoading, loadPreRegistrations]);

  const handleTogglePlan = async (planId: string) => {
    if (!token) {
      return;
    }

    setTogglingPlanId(planId);
    setErrorMessage(null);

    try {
      const updatedPlan = await toggleAdminPlanActive(token, planId);

      setPlans((currentPlans) =>
        currentPlans.map((plan) =>
          plan.id === updatedPlan.id ? updatedPlan : plan,
        ),
      );

      const dashboardResponse = await fetchAdminDashboard(token);
      setSummary(dashboardResponse.data ?? null);
      toast.success(
        updatedPlan.active
          ? "Plano ativado com sucesso."
          : "Plano desativado com sucesso.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar plano.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setTogglingPlanId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <section className={styles.welcome} data-reveal>
          <div>
            <h1 className={styles.welcomeTitle}>Olá, Recepção! 👋</h1>
            <p className={styles.welcomeSubtitle}>
              Confira o resumo geral da academia hoje.
            </p>
          </div>

          <div className={styles.welcomeActions}>
            <button type="button" className={styles.dateButton}>
              <CalendarIcon />
              <span>{formatLongDate(new Date())}</span>
            </button>
            <button type="button" className={styles.newStudentButton}>
              + Novo aluno
            </button>
          </div>
        </section>

        {isLoading && (
          <p className={styles.status}>Carregando indicadores...</p>
        )}

        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}

        {!isLoading && summary && (
          <>
            <section
              className={styles.grid}
              aria-label="Indicadores do dashboard"
            >
              <article className={styles.card} data-reveal>
                <span className={`${styles.cardIcon} ${styles.cardIconAccent}`}>
                  <UsersIcon />
                </span>
                <p className={styles.cardValue}>
                  {summary.preRegistrationsCount}
                </p>
                <p className={styles.cardLabel}>Alunos ativos</p>
                <p className={styles.cardTrend}>+ 12% vs mês anterior</p>
              </article>

              <article
                className={`${styles.card} ${styles.revealDelay1}`}
                data-reveal
              >
                <span className={styles.cardIcon}>
                  <CheckInIcon />
                </span>
                <p className={styles.cardValue}>0</p>
                <p className={styles.cardLabel}>Check-ins hoje</p>
                <p className={styles.cardTrend}>+ 8% vs ontem</p>
              </article>

              <article
                className={`${styles.card} ${styles.revealDelay2}`}
                data-reveal
              >
                <span className={styles.cardIcon}>
                  <RevenueIcon />
                </span>
                <p className={styles.cardValue}>{formatCurrency(0)}</p>
                <p className={styles.cardLabel}>Faturamento (mês)</p>
                <p className={styles.cardTrend}>+ 15% vs mês anterior</p>
              </article>

              <article
                className={`${styles.card} ${styles.revealDelay3}`}
                data-reveal
              >
                <span className={styles.cardIcon}>
                  <ClassesIcon />
                </span>
                <p className={styles.cardValue}>{summary.activePlansCount}</p>
                <p className={styles.cardLabel}>Aulas hoje</p>
                <button type="button" className={styles.cardLink}>
                  Ver agenda
                </button>
              </article>
            </section>

            <div className={styles.sections}>
              <div className={styles.dashboardBody}>
                <div className={styles.mainColumn}>
                  <CheckInsChartSection />
                  <PreRegistrationsSection
                    items={preRegistrations}
                    searchQuery={searchQuery}
                    // Corrigido: passando a prop correta com o estado correto
                    statusFilter={statusFilter}
                    isSearching={isSearchingPreRegistrations}
                    onSearchChange={setSearchQuery}
                    // Corrigido: passando a função correta
                    onStatusFilterChange={setStatusFilter}
                    onConvertLead={handleConvertLead}
                  />
                </div>

                <aside className={styles.sideColumn} aria-label="Painéis laterais">
                  <CheckInsNowSection />
                  <ExpiringPlansSection />
                  <AlertsSection />
                  <QuickActionsSection />
                </aside>
              </div>
              <PlansSection
                plans={plans}
                togglingPlanId={togglingPlanId}
                onToggleActive={handleTogglePlan}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className={styles.actionIcon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className={styles.metricIcon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.25" />
      <path d="M4.5 18.5c.6-2.8 2.7-4.5 4.5-4.5s3.9 1.7 4.5 4.5" />
      <circle cx="16.5" cy="8.5" r="2.5" />
      <path d="M15 14.2c1.8-.2 3.5 1.1 4.2 3.3" />
    </svg>
  );
}

function CheckInIcon() {
  return (
    <svg className={styles.metricIcon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M8.5 12.2 10.7 14.5 15.5 9.5" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg className={styles.metricIcon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v9M9.5 9.5c.6-1 1.5-1.5 2.5-1.5 1.6 0 2.5.9 2.5 2s-1 2-2.5 2.2c-1.6.2-2.8.8-2.8 2.2s1.2 2.1 2.8 2.1c1.2 0 2.1-.5 2.6-1.4" />
    </svg>
  );
}

function ClassesIcon() {
  return (
    <svg className={styles.metricIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 19.5h15" />
      <path d="M7 16v-4.5M12 16V8M17 16v-7" />
    </svg>
  );
}
