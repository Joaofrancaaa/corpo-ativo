import { useEffect, useState } from "react";
import type { Plan } from "@/interfaces/types";
import { getPlans } from "@/services/preRegistrationApi";
import CheckoutModal from "@/components/Checkout/CheckoutModal";
import PlanCard from "./PlanCard";
import styles from "./PricingSection.module.css";

const GYM_PRIORITY = [
  "individual",
  "anual com fidelidade",
  "casal",
  "plano amigo",
  "plano família",
  "semanal",
  "diária",
];

function normalizePlanName(name: string): string {
  return name.trim().toLowerCase();
}

function isPilatesPlan(plan: Plan): boolean {
  return normalizePlanName(plan.name).includes("pilates");
}

function gymSortRank(name: string): number {
  const normalized = normalizePlanName(name);
  const exactIndex = GYM_PRIORITY.indexOf(normalized);

  if (exactIndex !== -1) {
    return exactIndex;
  }

  const partialIndex = GYM_PRIORITY.findIndex((item) =>
    normalized.includes(item),
  );

  return partialIndex === -1 ? GYM_PRIORITY.length : partialIndex;
}

function sortPlansForDisplay(plans: Plan[]): { gymPlans: Plan[]; pilatesPlans: Plan[] } {
  const gymPlans = plans
    .filter((plan) => !isPilatesPlan(plan))
    .slice()
    .sort((left, right) => gymSortRank(left.name) - gymSortRank(right.name));

  const pilatesPlans = plans
    .filter(isPilatesPlan)
    .slice()
    .sort((left, right) => left.price - right.price);

  return { gymPlans, pilatesPlans };
}

export default function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      setLoading(true);

      try {
        const data = await getPlans();
        if (!cancelled) {
          setPlans(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedPlan(null);
  };

  const { gymPlans, pilatesPlans } = sortPlansForDisplay(plans);

  return (
    <section
      className={styles.section}
      id="planos"
      aria-labelledby="pricing-title"
    >
      <div className={styles.container}>
        <header className={styles.header} data-reveal>
          <p className={styles.eyebrow}>Planos e valores</p>
          <h2 className={styles.title} id="pricing-title">
            Escolha seu Plano
          </h2>
          <p className={styles.urgency}>
            🔥 Lote 1 de Inauguração - Vagas Limitadas
          </p>
          <p className={styles.subtitle}>
            Pré-matrícula com condições especiais de inauguração. Sem
            compromisso até a abertura.
          </p>
        </header>

        {loading ? (
        <div className={styles.loading} data-reveal aria-busy="true" aria-live="polite">
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBarShort} />
            <p className={styles.loadingText}>Carregando planos...</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {gymPlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  revealIndex={index}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>

            {pilatesPlans.length > 0 ? (
              <>
                <div className={styles.groupDivider}>
                  <p className={styles.groupEyebrow}>Modalidade extra</p>
                  <h3 className={styles.groupTitle}>Pilates</h3>
                </div>
                <div className={styles.grid}>
                  {pilatesPlans.map((plan, index) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      revealIndex={gymPlans.length + index}
                      onSelect={handleSelectPlan}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        selectedPlan={selectedPlan}
      />
    </section>
  );
}
