import type { Plan } from '@/interfaces/types';
import styles from './PlanCard.module.css';

interface PlanCardProps {
  plan: Plan;
  revealIndex?: number;
  onSelect: (plan: Plan) => void;
}

const ANNUAL_ANCHOR_PRICE = 180;

const BILLING_LABELS: Record<Plan['billingCycle'], string> = {
  monthly: 'Cobrança mensal',
  quarterly: 'Cobrança trimestral',
  yearly: 'Cobrança anual',
  weekly: 'Cobrança semanal',
  daily: 'Aula ou acesso avulso',
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

  if (billingCycle === 'weekly') {
    return '/semana';
  }

  if (billingCycle === 'daily') {
    return '';
  }

  return '/trimestre';
}

function isFeaturedPlan(plan: Plan): boolean {
  return plan.name.toLowerCase().includes('anual');
}

function isPerPersonPlan(plan: Plan): boolean {
  const normalized = plan.name.toLowerCase();
  return normalized.includes('casal') || normalized.includes('amigo');
}

export default function PlanCard({ plan, revealIndex = 0, onSelect }: PlanCardProps) {
  const handleCtaClick = () => {
    onSelect(plan);
  };

  const featured = isFeaturedPlan(plan);
  const perPerson = isPerPersonPlan(plan);
  const delayClass =
    styles[`revealDelay${Math.min(revealIndex, 8)}` as keyof typeof styles] ?? '';

  return (
    <article
      className={`${styles.card} ${featured ? styles.popular : ''} ${delayClass}`}
      data-reveal
    >
      {featured ? (
        <span className={styles.badge}>Mais Vantajoso</span>
      ) : null}

      <header className={styles.header}>
        <h3 className={styles.name}>{plan.name}</h3>
        <p className={styles.billing}>{BILLING_LABELS[plan.billingCycle]}</p>
      </header>

      <div className={styles.priceBlock}>
        {featured ? (
          <span className={styles.oldPrice}>
            De {formatPrice(ANNUAL_ANCHOR_PRICE)} por
          </span>
        ) : null}
        <span className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(plan.price)}</span>
          <span className={styles.priceSuffix}>
            {getPriceSuffix(plan.billingCycle)}
          </span>
        </span>
        {perPerson ? (
          <span className={styles.perPerson}>(por pessoa)</span>
        ) : null}
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

      <button
        type="button"
        className={`${styles.cta} ${featured ? styles.ctaFeatured : styles.ctaSecondary}`}
        onClick={handleCtaClick}
      >
        Garantir Vaga
      </button>
    </article>
  );
}
