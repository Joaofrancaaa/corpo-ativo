import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  AdminPreRegistrationItem,
  PreRegistrationStatusFilter,
} from "@/features/auth/types";
import type {
  DemoAlert,
  DemoCheckInBar,
  DemoExpiringPlan,
  DemoPayment,
  DemoPaymentStatus,
} from "./dashboardMock";
import styles from "./AdminDashboardSections.module.css";

const billingCycleLabels: Record<string, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  yearly: "Anual",
  weekly: "Semanal",
  daily: "Avulso",
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface PreRegistrationsSectionProps {
  items: AdminPreRegistrationItem[];
  searchQuery: string;
  statusFilter: PreRegistrationStatusFilter;
  isSearching: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: PreRegistrationStatusFilter) => void;
  // Propriedade para a função de conversão
  onConvertLead: (
    id: string,
    paymentMethod: string,
    cpf: string,
    birthDate: string,
  ) => Promise<void>;
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
  const [cpf, setCpf] = useState<string>(""); // <- Novo
  const [birthDate, setBirthDate] = useState<string>(""); // <- Novo

  const handleConfirmConversion = async () => {
    if (!selectedLeadId) return;
    if (!cpf || cpf.replace(/\D/g, "").length !== 11) {
      toast.error("Por favor, digite um CPF válido com 11 números.");
      return;
    }
    if (!birthDate) {
      toast.error("Por favor, selecione a data de nascimento.");
      return;
    }

    setIsConverting(true);
    try {
      // Agora enviamos todos os dados!
      await onConvertLead(selectedLeadId, selectedMethod, cpf, birthDate);
      setSelectedLeadId(null);
      setCpf(""); // Limpa o form após sucesso
      setBirthDate(""); // Limpa o form após sucesso
      toast.success("Matrícula efetivada com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro na conversão.",
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <section className={`${styles.section} ${styles.tableSection}`} data-reveal>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Novos alunos</h2>
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
                <th className={styles.th}>Nome</th>
                <th className={styles.th}>E-mail</th>
                <th className={styles.th}>WhatsApp</th>
                <th className={styles.th}>Plano</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Data</th>
                <th className={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.td} data-label="Nome">
                    <span className={styles.studentCell}>
                      <span className={styles.avatar} aria-hidden="true">
                        {getInitials(item.name)}
                      </span>
                      <span className={styles.studentName}>{item.name}</span>
                    </span>
                  </td>
                  <td className={styles.td} data-label="E-mail">
                    {item.email}
                  </td>
                  <td className={styles.td} data-label="WhatsApp">
                    {formatWhatsapp(item.whatsapp)}
                  </td>
                  <td className={styles.td} data-label="Plano">
                    {item.planName}
                  </td>
                  <td className={styles.td} data-label="Status">
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
                        ? "Ativo"
                        : item.status === "CANCELLED"
                          ? "Cancelado"
                          : "Aguardando"}
                    </span>
                  </td>
                  <td className={styles.td} data-label="Data">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className={styles.td} data-label="Ações">
                    {item.status === "PENDING" && (
                      <button
                        type="button"
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
            <h3>Efetivar Matrícula do Aluno</h3>
            <p>
              Preencha os dados obrigatórios para criar o contrato e liberar o
              acesso.
            </p>

            <div className={styles.formGroup}>
              {/* CAMPO CPF */}
              <label className={styles.inputWrapper}>
                <span className={styles.filterLabel}>
                  CPF (Somente números) *
                </span>
                <input
                  type="text"
                  inputMode="numeric" /* Força o teclado numérico no celular */
                  pattern="\d*"
                  maxLength={11} /* Trava em 11 dígitos */
                  className={styles.searchInput}
                  placeholder="Apenas os 11 números"
                  value={cpf}
                  onChange={(e) => {
                    // Remove qualquer coisa que não seja número (impede letras e pontos)
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    setCpf(onlyNumbers);
                  }}
                />
              </label>

              {/* CAMPO DATA DE NASCIMENTO */}
              <label className={styles.inputWrapper}>
                <span className={styles.filterLabel}>Data de Nascimento *</span>
                {/* 
                  O type="date" garante o calendário no mobile/desktop. 
                  Visualmente ele mostrará DD/MM/AAAA para usuários no Brasil.
                */}
                <input
                  type="date"
                  className={styles.searchInput}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </label>

              {/* CAMPO FORMA DE PAGAMENTO */}
              <label className={styles.inputWrapper}>
                <span className={styles.filterLabel}>
                  Forma de Pagamento Inicial *
                </span>
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
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setSelectedLeadId(null);
                  setCpf("");
                  setBirthDate("");
                }}
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

type QuickActionIconName =
  | "student"
  | "checkin"
  | "sale"
  | "carnet"
  | "message"
  | "reports";

interface QuickActionItem {
  id: string;
  label: string;
  icon: QuickActionIconName;
}

const PAYMENT_STATUS_LABELS: Record<DemoPaymentStatus, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  OVERDUE: "Em atraso",
};

const PAYMENT_STATUS_FILTERS: Array<{
  value: "all" | DemoPaymentStatus;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "PAID", label: "Pagos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "OVERDUE", label: "Em atraso" },
];

function paymentBadgeClass(status: DemoPaymentStatus): string {
  if (status === "PAID") {
    return styles.paymentBadgePaid;
  }

  if (status === "OVERDUE") {
    return styles.paymentBadgeFailed;
  }

  return styles.paymentBadgePending;
}

export function CheckInsChartSection({ bars }: { bars: DemoCheckInBar[] }) {
  const peak = Math.max(...bars.map((bar) => bar.count), 1);

  return (
    <section className={`${styles.section} ${styles.panel}`} data-reveal>
      <div className={styles.panelHeader}>
        <h2 className={styles.sectionTitle}>Check-ins dos últimos 7 dias</h2>
      </div>

      <div
        className={styles.chartPlot}
        role="img"
        aria-label="Gráfico de check-ins dos últimos 7 dias"
      >
        {bars.map((item) => (
          <div key={item.day} className={styles.chartColumn}>
            <span className={styles.chartValue}>{item.count}</span>
            <div className={styles.chartTrack}>
              <div
                className={styles.chartBar}
                style={{ height: `${Math.round((item.count / peak) * 100)}%` }}
              />
            </div>
            <span className={styles.chartLabel}>{item.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

interface PaymentsSectionProps {
  payments: DemoPayment[];
  paidTotal: number;
  pendingTotal: number;
  overdueTotal: number;
}

export function PaymentsSection({
  payments,
  paidTotal,
  pendingTotal,
  overdueTotal,
}: PaymentsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | DemoPaymentStatus>(
    "all",
  );

  const visiblePayments = useMemo(
    () =>
      statusFilter === "all"
        ? payments
        : payments.filter((payment) => payment.status === statusFilter),
    [payments, statusFilter],
  );

  return (
    <section className={`${styles.section} ${styles.tableSection}`} data-reveal>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Pagamentos</h2>
        <p className={styles.sectionSubtitle}>
          Recebimentos da recepção e cobranças do mês, já com o status de cada
          aluno.
        </p>
      </div>

      <div className={styles.paymentSummary}>
        <p className={styles.paymentSummaryItem}>
          <span className={styles.paymentSummaryLabel}>Recebido</span>
          <strong>{formatCurrency(paidTotal)}</strong>
        </p>
        <p className={styles.paymentSummaryItem}>
          <span className={styles.paymentSummaryLabel}>Em aberto</span>
          <strong>{formatCurrency(pendingTotal)}</strong>
        </p>
        <p className={styles.paymentSummaryItem}>
          <span className={styles.paymentSummaryLabel}>Em atraso</span>
          <strong>{formatCurrency(overdueTotal)}</strong>
        </p>
      </div>

      <label className={`${styles.filterField} ${styles.paymentFilter}`}>
        <span className={styles.filterLabel}>Status</span>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | DemoPaymentStatus)
          }
        >
          {PAYMENT_STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {visiblePayments.length === 0 ? (
        <p className={styles.emptyState}>
          Nenhum pagamento encontrado com esse status.
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Aluno</th>
                <th className={styles.th}>Plano</th>
                <th className={styles.th}>Valor</th>
                <th className={styles.th}>Forma</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Data</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment) => (
                <tr key={payment.id}>
                  <td className={styles.td} data-label="Aluno">
                    <span className={styles.studentCell}>
                      <span className={styles.avatar} aria-hidden="true">
                        {getInitials(payment.studentName)}
                      </span>
                      <span className={styles.studentName}>
                        {payment.studentName}
                      </span>
                    </span>
                  </td>
                  <td className={styles.td} data-label="Plano">
                    {payment.planName}
                  </td>
                  <td className={styles.td} data-label="Valor">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className={styles.td} data-label="Forma">
                    {payment.methodLabel}
                  </td>
                  <td className={styles.td} data-label="Status">
                    <span
                      className={`${styles.paymentBadge} ${paymentBadgeClass(payment.status)}`}
                    >
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </td>
                  <td className={styles.td} data-label="Data">
                    {formatDate(payment.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function ExpiringPlansSection({ items }: { items: DemoExpiringPlan[] }) {
  return (
    <section className={`${styles.section} ${styles.panel}`} data-reveal>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Planos a vencer</h2>
      </div>

      <ul className={styles.expiringList}>
        {items.map((item) => (
          <li key={item.name} className={styles.expiringItem}>
            <span className={`${styles.personAvatar} ${styles[item.tone]}`} aria-hidden="true">
              {getInitials(item.name)}
            </span>
            <span className={styles.expiringCopy}>
              <span className={styles.personName}>{item.name}</span>
              <span className={styles.personMeta}>{item.plan}</span>
            </span>
            <span className={styles.dueSoon}>Vence em {item.days} dias</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CheckInsNowSection({
  count,
  items,
}: {
  count: number;
  items: Array<{ name: string; time: string }>;
}) {
  return (
    <section className={`${styles.section} ${styles.panel}`} data-reveal>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Check-ins agora</h2>
      </div>

      <div className={styles.liveCheckins}>
        <div className={styles.donutWrap}>
          <svg className={styles.donut} viewBox="0 0 36 36" aria-hidden="true">
            <circle className={styles.donutTrack} cx="18" cy="18" r="14" />
            <circle className={styles.donutValue} cx="18" cy="18" r="14" />
          </svg>
          <span className={styles.donutNumber}>{count}</span>
        </div>

        <ul className={styles.liveList}>
          {items.map((item) => (
            <li key={item.name} className={styles.liveItem}>
              <span className={styles.liveName}>{item.name}</span>
              <span className={styles.liveTime}>{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AlertsSection({ alerts }: { alerts: DemoAlert[] }) {
  return (
    <section className={`${styles.section} ${styles.panel}`} data-reveal>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Alertas importantes</h2>
      </div>

      <ul className={styles.alertsList}>
        {alerts.map((item) => (
          <li key={item.id} className={styles.alertItem}>
            <span className={`${styles.alertDot} ${styles[item.tone]}`} aria-hidden="true" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const QUICK_ACTIONS: QuickActionItem[] = [
  { id: "new-student", label: "Novo aluno", icon: "student" },
  { id: "manual-checkin", label: "Check-in manual", icon: "checkin" },
  { id: "new-sale", label: "Nova venda", icon: "sale" },
  { id: "carnet", label: "Emitir carnê", icon: "carnet" },
  { id: "message", label: "Enviar mensagem", icon: "message" },
  { id: "reports", label: "Ver relatórios", icon: "reports" },
];

export function QuickActionsSection() {
  return (
    <section className={`${styles.section} ${styles.quickActions}`} data-reveal>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Ações rápidas</h2>
      </div>

      <div className={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={styles.quickActionButton}
            onClick={undefined}
          >
            <QuickActionIcon name={action.icon} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function QuickActionIcon({ name }: { name: QuickActionIconName }) {
  switch (name) {
    case "student":
      return (
        <svg className={styles.quickActionIcon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 19c.7-3.2 3.3-5 6.5-5s5.8 1.8 6.5 5" />
        </svg>
      );
    case "checkin":
      return (
        <svg className={styles.quickActionIcon} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="3.5" width="14" height="17" rx="2" />
          <path d="M8.5 12.2 10.7 14.5 15.5 9.5" />
        </svg>
      );
    case "sale":
      return (
        <svg className={styles.quickActionIcon} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="6" width="17" height="12" rx="2" />
          <path d="M3.5 10h17" />
        </svg>
      );
    case "carnet":
      return (
        <svg className={styles.quickActionIcon} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="3.5" width="14" height="17" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "message":
      return (
        <svg className={styles.quickActionIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5z" />
        </svg>
      );
    case "reports":
      return (
        <svg className={styles.quickActionIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 19.5h15" />
          <path d="M7 16v-4.5M12 16V8M17 16v-7" />
        </svg>
      );
  }
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
