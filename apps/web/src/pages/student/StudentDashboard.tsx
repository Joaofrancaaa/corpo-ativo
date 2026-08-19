import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import styles from './StudentDashboard.module.css';

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <p className={styles.eyebrow}>Área do Aluno</p>
            <h1 className={styles.title}>Olá, {user?.name}</h1>
          </div>

          <div className={styles.headerActions}>
            <Link className={styles.homeLink} to="/">
              Voltar ao site
            </Link>
            <button type="button" className={styles.logoutButton} onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Seu treino</h2>
          <p className={styles.cardText}>
            Em breve você poderá acompanhar treinos, evolução e presença por aqui.
          </p>
        </section>
      </main>
    </div>
  );
}
