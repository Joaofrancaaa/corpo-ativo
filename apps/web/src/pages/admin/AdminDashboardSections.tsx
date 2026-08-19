import React, { useState } from "react";
import type {
  AdminPreRegistrationItem,
  PreRegistrationStatusFilter,
} from "@/features/auth/types";
import styles from "./AdminDashboardSections.module.css";

const billingCycleLabels: Record<string, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  yearly: "Anual",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 11) {
    return value;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface PreRegistrationsSectionProps {
  items: AdminPreRegistrationItem[];
  searchQuery: string;
  statusFilter: PreRegistrationStatusFilter;
  isSearching: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: PreRegistrationStatusFilter) => void;
  // Propriedade para a função de conversão
  onConvertLead: (id: string, paymentMethod: string) => Promise<void>;
}

export function PreRegistrationsSection({
  items,
  searchQuery,
  statusFilter,
  isSearching,
  onSearchChange,
  onStatusFilterChange,
  onConvertLead,
}: PreRegistrationsSectionProps) {
  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== "all";

  // Estados do Modal
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("CASH");
  const [isConverting, setIsConverting] = useState(false);

  const handleConfirmConversion = async () => {
    if (!selectedLeadId) return;
    setIsConverting(true);
    try {
      await onConvertLead(selectedLeadId, selectedMethod);
      setSelectedLeadId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro na conversão.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <section className={styles.section} data-reveal>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Pré-matrículas recentes</h2>
        <p className={styles.sectionSubtitle}>
          Leads captados pela landing page aguardando conversão.
        </p>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <span className={styles.visuallyHidden}>
            Pesquisar pré-matrículas
          </span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Pesquisar por nome, e-mail ou WhatsApp..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Status</span>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(
                event.target.value as PreRegistrationStatusFilter,
              )
            }
          >
            <option value="all">Todos</option>
            <option value="converted">Convertidos</option>
            <option value="pending">Aguardando</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </label>
      </div>

      {isSearching && (
        <p className={styles.searchStatus} aria-live="polite">
          Buscando pré-matrículas...
        </p>
      )}

      {items.length === 0 ? (
        <p className={styles.emptyState}>
          {hasActiveFilters
            ? "Nenhuma pré-matrícula encontrada com os filtros aplicados."
            : "Nenhuma pré-matrícula registrada ainda."}
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>WhatsApp</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th> {/* Nova Coluna */}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Nome">{item.name}</td>
                  <td data-label="E-mail">{item.email}</td>
                  <td data-label="WhatsApp">{formatWhatsapp(item.whatsapp)}</td>
                  <td data-label="Plano">{item.planName}</td>
                  <td data-label="Status">
                    <span
                      className={`${styles.paymentBadge} ${
                        item.status === "CONVERTED"
                          ? styles.paymentBadgePaid
                          : item.status === "CANCELLED"
                            ? styles.paymentBadgeFailed
                            : styles.paymentBadgePending
                      }`}
                    >
                      {item.status === "CONVERTED"
                        ? "Convertido"
                        : item.status === "CANCELLED"
                          ? "Cancelado"
                          : "Aguardando"}
                    </span>
                  </td>
                  <td data-label="Data">{formatDate(item.createdAt)}</td>
                  <td data-label="Ações">
                    {item.status === "PENDING" && (
                      <button
                        className={styles.convertButton}
                        onClick={() => setSelectedLeadId(item.id)}
                      >
                        Converter
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE CONVERSÃO */}
      {selectedLeadId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Como o aluno realizou o pagamento?</h3>
            <p>
              Isto registrará o pagamento inicial, criará a conta do aluno e
              ativará a assinatura no sistema.
            </p>

            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="CASH">Dinheiro em Espécie (Recepção)</option>
              <option value="POS_CREDIT_CARD">
                Maquininha - Cartão de Crédito
              </option>
              <option value="POS_DEBIT_CARD">
                Maquininha - Cartão de Débito
              </option>
              <option value="MANUAL_PIX">Pix na Recepção (QR Code)</option>
            </select>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setSelectedLeadId(null)}
                disabled={isConverting}
              >
                Cancelar
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmConversion}
                disabled={isConverting}
              >
                {isConverting ? "Processando..." : "Confirmar Conversão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ... PlansSectionProps e PlansSection permanecem inalterados abaixo
interface PlansSectionProps {
  plans: Array<{
    id: string;
    name: string;
    price: number;
    billingCycle: string;
    features: string[];
    isPopular: boolean;
    active: boolean;
  }>;
  togglingPlanId: string | null;
  onToggleActive: (planId: string) => void;
}

export function PlansSection({
  plans,
  togglingPlanId,
  onToggleActive,
}: PlansSectionProps) {
  return (
    <section className={styles.section} data-reveal>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Gestão de planos</h2>
        <p className={styles.sectionSubtitle}>
          Ative ou desative planos exibidos na landing page.
        </p>
      </div>

      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`${styles.planCard} ${plan.active ? styles.planCardActive : styles.planCardInactive}`}
          >
            <div className={styles.planCardHeader}>
              <div>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planPrice}>
                  {formatCurrency(plan.price)}
                  <span className={styles.planCycle}>
                    /
                    {billingCycleLabels[plan.billingCycle] ?? plan.billingCycle}
                  </span>
                </p>
              </div>

              <span
                className={`${styles.statusBadge} ${plan.active ? styles.statusBadgeActive : styles.statusBadgeInactive}`}
              >
                {plan.active ? "Ativo" : "Inativo"}
              </span>
            </div>

            <ul className={styles.planFeatures}>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <button
              type="button"
              className={styles.toggleButton}
              disabled={togglingPlanId === plan.id}
              onClick={() => onToggleActive(plan.id)}
            >
              {togglingPlanId === plan.id
                ? "Salvando..."
                : plan.active
                  ? "Desativar plano"
                  : "Ativar plano"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
