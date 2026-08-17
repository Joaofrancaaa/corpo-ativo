import { HERO_COPY, INAUGURATION_DATE } from './constants';
import styles from './HeroSection.module.css';
import { padTimeUnit, useCountdown } from './useCountdown';

const COUNTDOWN_UNITS = [
  { key: 'days', label: 'Dias' },
  { key: 'hours', label: 'Horas' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Seg' },
] as const;

export default function HeroSection() {
  const countdown = useCountdown(INAUGURATION_DATE);

  return (
    <section className={styles.hero} id="inicio" aria-labelledby="hero-title">
      <div className={styles.content}>
        <span className={styles.eyebrow}>{HERO_COPY.eyebrow}</span>

        <h1 className={styles.title} id="hero-title">
          {HERO_COPY.title}
          <span className={styles.highlight}>{HERO_COPY.highlight}</span>
        </h1>

        <p className={styles.subtitle}>{HERO_COPY.subtitle}</p>

        <p className={styles.countdownLabel}>
          {countdown.isComplete
            ? 'Inauguração — estamos abertos!'
            : 'Contagem regressiva para a inauguração'}
        </p>

        <div
          className={styles.countdown}
          role="timer"
          aria-live="polite"
          aria-label="Contagem regressiva para inauguração"
        >
          {COUNTDOWN_UNITS.map(({ key, label }) => (
            <div key={key} className={styles.countdownUnit}>
              <span className={styles.countdownValue}>
                {padTimeUnit(countdown[key])}
              </span>
              <span className={styles.countdownName}>{label}</span>
            </div>
          ))}
        </div>

        <a className={styles.cta} href={HERO_COPY.ctaHref}>
          {HERO_COPY.ctaLabel}
        </a>
      </div>
    </section>
  );
}
