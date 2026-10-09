import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";
import type { AdminStudentFilters, AdminStudentItem } from "@/features/auth/types";
import { fetchAdminStudents } from "@/services/authApi";
import styles from "./AdminStudents.module.css";

type StudentStatusFilter = NonNullable<AdminStudentFilters["status"]>;

const SEARCH_DEBOUNCE_MS = 350;

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 11) {
    return value;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 11) {
    return value;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AL";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getSubscriptionStatusLabel(
  status: AdminStudentItem["subscription"],
): string {
  if (!status) {
    return "Sem plano";
  }

  if (status.status === "ACTIVE") {
    return "Ativo";
  }

  if (status.status === "OVERDUE") {
    return "Em atraso";
  }

  return "Cancelado";
}

export default function AdminStudents() {
  const { token } = useAuth();
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    const authToken = token;

    const timeoutId = window.setTimeout(() => {
      async function loadStudents() {
        setIsLoading(true);

        try {
          const items = await fetchAdminStudents(authToken, {
            search: searchQuery,
            status: statusFilter,
          });

          if (!isCancelled) {
            setStudents(items);
          }
        } catch (error) {
          if (!isCancelled) {
            setStudents([]);
            toast.error(
              error instanceof Error
                ? error.message
                : "Erro ao carregar alunos.",
            );
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      }

      void loadStudents();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [token, searchQuery, statusFilter]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== "all";

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <section className={`${styles.section} ${styles.tableSection}`} data-reveal>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Alunos</h2>
            <p className={styles.sectionSubtitle}>
              Consulte e filtre os alunos matriculados na academia.
            </p>
          </div>

          <div className={styles.toolbar}>
            <label className={styles.searchField}>
              <span className={styles.visuallyHidden}>Pesquisar alunos</span>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Pesquisar por nome, CPF ou WhatsApp..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Status</span>
              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StudentStatusFilter)
                }
              >
                <option value="all">Todos</option>
                <option value="ACTIVE">Ativos</option>
                <option value="OVERDUE">Em atraso</option>
                <option value="CANCELED">Cancelados</option>
              </select>
            </label>
          </div>

          {isLoading && (
            <p className={styles.searchStatus} aria-live="polite">
              Buscando alunos...
            </p>
          )}

          {!isLoading && students.length === 0 ? (
            <p className={styles.emptyState}>
              {hasActiveFilters
                ? "Nenhum aluno encontrado com os filtros aplicados."
                : "Nenhum aluno matriculado ainda."}
            </p>
          ) : null}

          {students.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Nome</th>
                    <th className={styles.th}>CPF</th>
                    <th className={styles.th}>WhatsApp</th>
                    <th className={styles.th}>Plano</th>
                    <th className={styles.th}>Status da Assinatura</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const subscriptionStatus = student.subscription?.status;

                    return (
                      <tr key={student.id}>
                        <td className={styles.td} data-label="Nome">
                          <span className={styles.studentCell}>
                            <span className={styles.avatar} aria-hidden="true">
                              {getInitials(student.name)}
                            </span>
                            <span className={styles.studentName}>
                              {student.name}
                            </span>
                          </span>
                        </td>
                        <td className={styles.td} data-label="CPF">
                          {formatCpf(student.cpf)}
                        </td>
                        <td className={styles.td} data-label="WhatsApp">
                          {student.whatsapp
                            ? formatWhatsapp(student.whatsapp)
                            : "—"}
                        </td>
                        <td className={styles.td} data-label="Plano">
                          {student.subscription?.planName ?? "—"}
                        </td>
                        <td className={styles.td} data-label="Status da Assinatura">
                          <span
                            className={`${styles.paymentBadge} ${
                              subscriptionStatus === "ACTIVE"
                                ? styles.paymentBadgePaid
                                : subscriptionStatus === "OVERDUE"
                                  ? styles.paymentBadgeFailed
                                  : styles.paymentBadgeCanceled
                            }`}
                          >
                            {getSubscriptionStatusLabel(student.subscription)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
