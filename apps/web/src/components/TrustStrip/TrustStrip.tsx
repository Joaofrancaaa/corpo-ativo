import { getRevealDelayStyle } from '@/features/scrollReveal/useScrollReveal';
import styles from './TrustStrip.module.css';

const TRUST_ITEMS = [
  { value: '1.500m²', label: 'Estrutura planejada' },
  { value: '100+', label: 'Equipamentos' },
  { value: '3+', label: 'Modalidades' },
  { value: '1', label: 'Objetivo: sua evolução' },
] as const;

export default function TrustStrip() {
  return (
    <section className={styles.strip} aria-label="Números da academia">
      <div className={styles.grid}>
        {TRUST_ITEMS.map((item, index) => (
          <div
            key={item.label}
            className={styles.item}
            data-reveal
            style={getRevealDelayStyle(index)}
          >
            <strong className={styles.value}>{item.value}</strong>
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
