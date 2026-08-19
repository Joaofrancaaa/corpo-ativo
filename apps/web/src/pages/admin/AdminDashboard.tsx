import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  PlansSection,
  PreRegistrationsSection,
} from "./AdminDashboardSections";
import styles from "./AdminDashboard.module.css";

const SEARCH_DEBOUNCE_MS = 350;

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
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

  const handleConvertLead = async (leadId: string, paymentMethod: string) => {
    if (!token) return;

    // Chama a API para converter
    await convertAdminPreRegistration(token, leadId, paymentMethod as any);

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
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar plano.",
      );
    } finally {
      setTogglingPlanId(null);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <p className={styles.eyebrow}>Painel Administrativo</p>
            <h1 className={styles.title}>Olá, {user?.name}</h1>
          </div>

          <div className={styles.headerActions}>
            <Link className={styles.homeLink} to="/">
              Voltar ao site
            </Link>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={logout}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
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
              <article className={styles.card}>
                <p className={styles.cardLabel}>Pré-matrículas</p>
                <p className={styles.cardValue}>
                  {summary.preRegistrationsCount}
                </p>
              </article>

              <article className={styles.card}>
                <p className={styles.cardLabel}>Planos ativos</p>
                <p className={styles.cardValue}>{summary.activePlansCount}</p>
              </article>
            </section>

            <div className={styles.sections}>
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
              <PlansSection
                plans={plans}
                togglingPlanId={togglingPlanId}
                onToggleActive={handleTogglePlan}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
