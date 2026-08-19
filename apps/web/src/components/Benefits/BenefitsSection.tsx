import { getRevealDelayStyle } from '@/features/scrollReveal/useScrollReveal';
import styles from './BenefitsSection.module.css';

const BENEFITS = [
  {
    id: 'structure',
    title: 'Estrutura de alto nível',
    description:
      'Ambientes amplos, equipamentos selecionados e espaços organizados para diferentes objetivos.',
  },
  {
    id: 'training',
    title: 'Treino do seu jeito',
    description:
      'Musculação, aulas coletivas e opções para quem quer força, condicionamento ou mais disposição.',
  },
  {
    id: 'environment',
    title: 'Ambiente que motiva',
    description:
      'Uma experiência pensada para fazer você querer voltar no dia seguinte.',
  },
] as const;

function BenefitIcon({ id }: { id: (typeof BENEFITS)[number]['id'] }) {
  if (id === 'structure') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 20V10l8-6 8 6v10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 20v-6h6v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === 'training') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.8 5.4H19l-4.4 3.2 1.7 5.4L12 14.8 7.7 17l1.7-5.4L5 8.4h5.2L12 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BenefitsSection() {
  return (
    <section
      className={styles.section}
      id="academia"
      aria-labelledby="benefits-title"
    >
      <div className={styles.container}>
        <header className={styles.header} data-reveal>
          <p className={styles.eyebrow}>Por que Corpo Ativo?</p>
          <h2 className={styles.title} id="benefits-title">
            Mais que uma academia.
          </h2>
          <p className={styles.subtitle}>
            Tudo foi desenhado para reduzir atrito, aumentar sua constância e
            transformar treino em parte natural da sua rotina.
          </p>
        </header>

        <div className={styles.grid}>
          {BENEFITS.map((benefit, index) => (
            <article
              key={benefit.id}
              className={styles.card}
              data-reveal
              style={getRevealDelayStyle(index)}
            >
              <span className={styles.icon}>
                <BenefitIcon id={benefit.id} />
              </span>
              <h3 className={styles.cardTitle}>{benefit.title}</h3>
              <p className={styles.description}>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
