// apps/web/src/components/Modalities/ModalitiesSection.tsx

import { useEffect, useRef, useState, memo } from "react";
import styles from "./ModalitiesSection.module.css";

const MODALITIES = [
  {
    id: "musculacao",
    title: "Musculação",
    description:
      "Equipamentos de ponta com foco em hipertrofia e área de peso livre completa.",
    videoSrc: "/video-teste.mp4",
  },
  {
    id: "spinning",
    title: "Spinning",
    description:
      "Estúdio de ciclismo indoor climatizado para treinos intensos.",
    videoSrc: "/spinning.mp4",
  },
  {
    id: "coletivas",
    title: "Aulas Coletivas",
    description: "Danças, ritmos e funcional para manter o corpo em movimento.",
    videoSrc: "/dance.mp4",
  },
] as const;

// Tipagem para as props do card
type ModalityProps = (typeof MODALITIES)[number];

// Componente do Card isolado e memorizado (evita re-renderizações desnecessárias)
const ModalityCard = memo(function ModalityCard({
  title,
  description,
  videoSrc,
}: ModalityProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Intersection Observer vigia se o card está visível na tela
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          // Se entrou na tela: marca como carregado e dá play
          setHasLoaded(true);
          videoElement.play().catch(() => {
            // Ignora erros de autoplay do navegador
          });
        } else {
          // Se saiu da tela: pausa o vídeo para economizar processamento/bateria
          videoElement.pause();
        }
      },
      {
        rootMargin: "100px", // Começa a carregar 100px antes de aparecer na tela
        threshold: 0.1, // Dispara quando 10% do card estiver visível
      },
    );

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <article className={styles.card}>
      <video
        ref={videoRef}
        className={styles.videoBackground}
        loop
        muted
        playsInline
        preload="none" // Diz ao navegador para não baixar nada até mandarmos
        // Retiramos o autoPlay nativo, pois agora o JS controla isso
      >
        {/* Só insere a tag source (e inicia o download) quando hasLoaded for true */}
        {hasLoaded && <source src={videoSrc} type="video/mp4" />}
      </video>

      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  );
});

export default function ModalitiesSection() {
  return (
    <section
      className={styles.section}
      id="estrutura"
      aria-labelledby="modalities-title"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>O que oferecemos</p>
          <h2 className={styles.title} id="modalities-title">
            Nossa Estrutura
          </h2>
        </header>

        <div className={styles.grid}>
          {MODALITIES.map((modality) => (
            <ModalityCard key={modality.id} {...modality} />
          ))}
        </div>
      </div>
    </section>
  );
}
 