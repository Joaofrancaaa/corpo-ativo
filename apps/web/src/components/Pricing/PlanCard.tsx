import type { Plan } from '@/interfaces/types';
import styles from './PlanCard.module.css';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}

const BILLING_LABELS: Record<Plan['billingCycle'], string> = {
  monthly: 'Cobrança mensal',
  quarterly: 'Cobrança trimestral',
  yearly: 'Cobrança anual',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

function getPriceSuffix(billingCycle: Plan['billingCycle']): string {
  if (billingCycle === 'yearly' || billingCycle === 'monthly') {
    return '/mês';
  }
  return '/trimestre';
}

export default function PlanCard({ plan, onSelect }: PlanCardProps) {
  const handleCtaClick = () => {
    onSelect(plan);
  };

  return (
    <article
      className={`${styles.card} ${plan.isPopular ? styles.popular : ''}`}
    >
      {plan.isPopular && (
        <span className={styles.badge}>Mais Vantajoso</span>
      )}

      <header className={styles.header}>
        <h3 className={styles.name}>{plan.name}</h3>
        <p className={styles.billing}>{BILLING_LABELS[plan.billingCycle]}</p>
      </header>

      <div className={styles.priceBlock}>
        <span className={styles.price}>{formatPrice(plan.price)}</span>
        <span className={styles.priceSuffix}>
          {getPriceSuffix(plan.billingCycle)}
        </span>
      </div>

      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature} className={styles.feature}>
            <span className={styles.checkIcon} aria-hidden="true">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button type="button" className={styles.cta} onClick={handleCtaClick}>
        Garantir Vaga
      </button>
    </article>
  );
}
