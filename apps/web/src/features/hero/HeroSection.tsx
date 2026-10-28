import { HERO_COPY } from './constants';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero} id="inicio" aria-labelledby="hero-title">
      <div className={styles.content}>
        <span className={styles.eyebrow}>{HERO_COPY.eyebrow}</span>

        <h1 className={styles.title} id="hero-title">
          {HERO_COPY.title}{' '}
          <span className={styles.titleAccent}>{HERO_COPY.titleAccent}</span>
          <span className={styles.highlight}>{HERO_COPY.highlight}</span>
        </h1>

        <p className={styles.subtitle}>{HERO_COPY.subtitle}</p>

        <a className={styles.cta} href={HERO_COPY.ctaHref}>
          {HERO_COPY.ctaLabel}
        </a>
      </div>
    </section>
  );
}
