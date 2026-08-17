import styles from './Footer.module.css';
import { Logo } from '../common/Logo';
const INSTAGRAM_URL = 'https://instagram.com/corpoativo';
const WHATSAPP_URL = 'https://wa.me/5511999999999';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.column}>
          <Logo className={styles.footerLogo} />
            <p className={styles.tagline}>O seu melhor treino começa aqui.</p>
            <a
              className={styles.socialLink}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              @corpoativo
            </a>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Contato</h3>
            <address className={styles.address}>
              Av. Itaipu, 329 — Imperatriz, Maranhão.
              <br /> CEP 65912-340.
            </address>
            <a
              className={styles.contactLink}
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp: (11) 99999-9999
            </a>
          </div>
        </div>

        <p className={styles.copyright}>
          © 2026 Corpo Ativo Academia. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
