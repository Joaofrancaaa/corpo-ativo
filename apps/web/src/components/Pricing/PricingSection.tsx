import { useEffect, useState } from "react";
import type { Plan } from "@/interfaces/types";
import { getPlans } from "@/services/preRegistrationApi";
import CheckoutModal from "@/components/Checkout/CheckoutModal";
import PlanCard from "./PlanCard";
import styles from "./PricingSection.module.css";

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
          <div className={styles.grid}>
            {/* O sort() foi removido. Agora ele respeita a API. */}
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                revealIndex={index}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
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
