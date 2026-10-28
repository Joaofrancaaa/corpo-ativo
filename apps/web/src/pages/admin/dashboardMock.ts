export type DemoPaymentStatus = "PAID" | "PENDING" | "OVERDUE";

export interface DemoPayment {
  id: string;
  studentName: string;
  planName: string;
  amount: number;
  methodLabel: string;
  status: DemoPaymentStatus;
  date: string;
}

export interface DemoCheckInBar {
  day: string;
  count: number;
}

export interface DemoExpiringPlan {
  name: string;
  plan: string;
  days: number;
  tone: "avatarTone1" | "avatarTone2" | "avatarTone3" | "avatarTone4";
}

export interface DemoAlert {
  id: string;
  text: string;
  tone: "alertDanger" | "alertWarning" | "alertCaution";
}

export interface DashboardDemo {
  activeStudents: number;
  studentsTrend: string;
  checkInsToday: number;
  checkInsTrend: string;
  monthRevenue: number;
  revenueTrend: string;
  classesToday: number;
  checkIns: DemoCheckInBar[];
  liveNowCount: number;
  liveCheckIns: Array<{ name: string; time: string }>;
  expiringPlans: DemoExpiringPlan[];
  alerts: DemoAlert[];
  payments: DemoPayment[];
  paidTotal: number;
  pendingTotal: number;
  overdueTotal: number;
}

interface PlanSlot {
  planName: string;
  amount: number;
  count: number;
}

interface RosterEntry {
  studentName: string;
  planName: string;
  amount: number;
}

const ACTIVE_STUDENTS = 60;
const INAUGURATION_DATE = new Date(2026, 9, 17);

const PLAN_SLOTS: PlanSlot[] = [
  { planName: "Individual", amount: 180, count: 28 },
  { planName: "Anual com fidelidade", amount: 140, count: 12 },
  { planName: "Casal", amount: 145, count: 6 },
  { planName: "Plano Amigo", amount: 135, count: 6 },
  { planName: "Plano Família", amount: 130, count: 4 },
  { planName: "Pilates 2x na semana", amount: 300, count: 2 },
  { planName: "Pilates 3x na semana", amount: 350, count: 2 },
];

const STUDENT_NAMES = [
  "Marina Dias",
  "Lucas Rocha",
  "Camila Ferreira",
  "Rafael Gomes",
  "Juliana Costa",
  "Pedro Nunes",
  "Diego Alves",
  "Carla Mendes",
  "Ana Souza",
  "Bruno Lima",
  "Helena Martins",
  "Thiago Barros",
  "Patrícia Nogueira",
  "Igor Pacheco",
  "Larissa Monteiro",
  "Fernando Cruz",
  "Beatriz Ramos",
  "Gustavo Henrique",
  "Renata Carvalho",
  "André Luiz",
  "Vanessa Prado",
  "Rodrigo Melo",
  "Aline Duarte",
  "Felipe Araújo",
  "Camila Rocha",
  "Eduardo Pinto",
  "Sabrina Lopes",
  "Marcelo Teixeira",
  "Fernanda Reis",
  "Paulo Henrique",
  "Tatiane Borges",
  "Leandro Costa",
  "Juliana Ribeiro",
  "Ricardo Almeida",
  "Natália Souza",
  "Henrique Dias",
  "Priscila Martins",
  "Daniel Ferreira",
  "Amanda Vieira",
  "Bruno Carvalho",
  "Letícia Gomes",
  "Mateus Rocha",
  "Carolina Pinto",
  "Fábio Nunes",
  "Elisa Barros",
  "João Pedro",
  "Mariana Alves",
  "Carlos Eduardo",
  "Bianca Lima",
  "Rafael Souza",
  "Camila Duarte",
  "André Souza",
  "Luana Ferreira",
  "Pedro Henrique",
  "Isabela Martins",
  "Rodrigo Alves",
  "Ana Clara",
  "Gustavo Lima",
  "Fernanda Costa",
  "Lucas Martins",
] as const;

const PENDING_INDEXES = new Set([10, 30, 53]);

const PAID_METHODS = [
  "Pix na recepção",
  "Crédito (maquininha)",
  "Débito (maquininha)",
  "Dinheiro",
  "Pix na recepção",
] as const;

const CHECK_INS_BY_WEEKDAY = [12, 22, 26, 24, 27, 23, 34] as const;

function buildRoster(): RosterEntry[] {
  const roster: RosterEntry[] = [];

  for (const slot of PLAN_SLOTS) {
    for (let index = 0; index < slot.count; index += 1) {
      const studentName = STUDENT_NAMES[roster.length];

      if (!studentName) {
        break;
      }

      roster.push({
        studentName,
        planName: slot.planName,
        amount: slot.amount,
      });
    }
  }

  return roster;
}

function paymentStatus(index: number): DemoPaymentStatus {
  if (PENDING_INDEXES.has(index)) {
    return "PENDING";
  }

  return "PAID";
}

function methodLabel(
  index: number,
  status: DemoPaymentStatus,
  planName: string,
): string {
  if (status === "PENDING") {
    return planName.includes("Anual") ? "Boleto" : "Pix na recepção";
  }

  if (planName.startsWith("Pilates")) {
    return "Cartão online";
  }

  return PAID_METHODS[index % PAID_METHODS.length];
}

function atDay(now: Date, dayOffset: number, hours: number, minutes: number): Date {
  const date = new Date(now);
  date.setDate(now.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function startOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function isBeforeInauguration(date: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(INAUGURATION_DATE).getTime();
}

function paidDate(now: Date, index: number): Date {
  const opening = startOfDay(INAUGURATION_DATE);
  const today = startOfDay(now);
  const daySpan = Math.max(
    Math.round((today.getTime() - opening.getTime()) / 86_400_000) + 1,
    1,
  );
  const morning = index % 2 === 0;
  const date = new Date(opening);
  date.setDate(opening.getDate() + (index % daySpan));
  date.setHours(morning ? 8 : 18, (index * 11) % 60, 0, 0);

  if (date.getTime() > now.getTime()) {
    return atDay(now, 0, Math.min(now.getHours(), 18), (index * 11) % 60);
  }

  return date;
}

function paymentDate(now: Date, index: number, status: DemoPaymentStatus): Date {
  if (status === "PENDING") {
    const daysAhead = 2 + (index % 3);
    return atDay(now, daysAhead, 23, 59);
  }

  return paidDate(now, index);
}

function weekdayLabel(date: Date): string {
  const label = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date);
  const cleaned = label.replace(".", "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSignedPercent(current: number, previous: number): string {
  if (previous <= 0) {
    return "Sem comparação com ontem";
  }

  const delta = Math.round(((current - previous) / previous) * 100);
  const sign = delta > 0 ? "+" : "";
  return `${sign} ${delta}% vs ontem`;
}

function sumByStatus(payments: DemoPayment[], status: DemoPaymentStatus): number {
  return payments
    .filter((payment) => payment.status === status)
    .reduce((total, payment) => total + payment.amount, 0);
}

function peopleInsideNow(now: Date, todayCheckIns: number): number {
  const hour = now.getHours();

  if (hour < 6 || hour >= 22) {
    return 0;
  }

  let ratio = 0.12;

  if (hour < 9) {
    ratio = 0.35;
  } else if (hour >= 17 && hour < 21) {
    ratio = 0.4;
  } else if (hour >= 21) {
    ratio = 0.12;
  }

  return Math.min(todayCheckIns, Math.max(1, Math.round(todayCheckIns * ratio)));
}

function buildPayments(now: Date, roster: RosterEntry[]): DemoPayment[] {
  return roster
    .map((entry, index) => {
      const status = paymentStatus(index);

      return {
        id: `demo-payment-${index + 1}`,
        studentName: entry.studentName,
        planName: entry.planName,
        amount: entry.amount,
        methodLabel: methodLabel(index, status, entry.planName),
        status,
        date: paymentDate(now, index, status).toISOString(),
      };
    })
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function getDashboardDemo(now = new Date()): DashboardDemo {
  const roster = buildRoster();
  const payments = buildPayments(now, roster);
  const paidCount = payments.filter((payment) => payment.status === "PAID").length;
  const pendingCount = payments.filter((payment) => payment.status === "PENDING").length;

  const checkIns: DemoCheckInBar[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    return {
      day: weekdayLabel(date),
      count: isBeforeInauguration(date) ? 0 : CHECK_INS_BY_WEEKDAY[date.getDay()],
    };
  });

  const checkInsToday = checkIns[checkIns.length - 1]?.count ?? 0;
  const checkInsYesterday = checkIns[checkIns.length - 2]?.count ?? 0;
  const liveNowCount = peopleInsideNow(now, checkInsToday);
  const presentNames = roster
    .filter((_, index) => paymentStatus(index) === "PAID")
    .slice(0, liveNowCount === 0 ? 0 : 4);

  const expiringPlans: DemoExpiringPlan[] = [
    { name: "Ana Souza", plan: "Individual", days: 20, tone: "avatarTone1" },
    { name: "Bruno Carvalho", plan: "Casal", days: 22, tone: "avatarTone2" },
    { name: "André Souza", plan: "Plano Família", days: 25, tone: "avatarTone3" },
    { name: "Carla Mendes", plan: "Individual", days: 28, tone: "avatarTone4" },
  ];

  return {
    activeStudents: ACTIVE_STUDENTS,
    studentsTrend: "+ 4 novas matrículas na semana",
    checkInsToday,
    checkInsTrend: formatSignedPercent(checkInsToday, checkInsYesterday),
    monthRevenue: sumByStatus(payments, "PAID"),
    revenueTrend: `${paidCount} de ${ACTIVE_STUDENTS} mensalidades confirmadas`,
    classesToday: 6,
    checkIns,
    liveNowCount,
    liveCheckIns: presentNames.map((entry, index) => {
      const enteredAt = new Date(now);
      enteredAt.setMinutes(now.getMinutes() - (8 + index * 11));
      return {
        name: entry.studentName,
        time: formatClock(enteredAt),
      };
    }),
    expiringPlans,
    alerts: [
      {
        id: "opening",
        text: "Nenhuma mensalidade em atraso desde a inauguração",
        tone: "alertWarning",
      },
      {
        id: "expiring",
        text: "Primeiros vencimentos a partir de 16/11",
        tone: "alertCaution",
      },
      {
        id: "pending",
        text: `${pendingCount} pagamentos aguardando confirmação`,
        tone: "alertCaution",
      },
    ],
    payments,
    paidTotal: sumByStatus(payments, "PAID"),
    pendingTotal: sumByStatus(payments, "PENDING"),
    overdueTotal: sumByStatus(payments, "OVERDUE"),
  };
}
