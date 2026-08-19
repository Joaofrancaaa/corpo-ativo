import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import StudentLoginModal from '@/components/StudentArea/StudentLoginModal';
import styles from './Header.module.css';
import { Logo } from '../common/Logo';

const SCROLL_THRESHOLD = 8;
const DELTA_THRESHOLD = 4;

export default function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= SCROLL_THRESHOLD) {
        setIsHidden(false);
      } else if (delta > DELTA_THRESHOLD) {
        setIsHidden(true);
      } else if (delta < -DELTA_THRESHOLD) {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStudentAreaClick = () => {
    if (user) {
      navigate(getDashboardPath(user.role));
      return;
    }

    setIsLoginOpen(true);
  };

  return (
    <>
      <header
        className={`${styles.header} ${isHidden ? styles.hidden : ''}`}
        aria-hidden={isHidden}
      >
        <div className={styles.inner}>
          <Link to="/" className={styles.logoLink} aria-label="Ir para a página inicial">
            <Logo className={styles.logo} />
          </Link>

          <div className={styles.actions}>
            {user ? (
              <div className={styles.userMenu}>
                <button
                  type="button"
                  className={styles.studentButton}
                  onClick={handleStudentAreaClick}
                >
                  <span className={styles.studentLabel}>{user.name}</span>
                </button>
                <button
                  type="button"
                  className={styles.logoutButton}
                  onClick={logout}
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.studentButton}
                onClick={() => setIsLoginOpen(true)}
                aria-label="Área do Aluno"
              >
                <svg
                  className={styles.userIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className={styles.studentLabel}>Área do Aluno</span>
              </button>
            )}

            <a className={styles.cta} href="#planos">
              Assine Já
            </a>
          </div>
        </div>
      </header>

      <StudentLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(role) => {
          setIsLoginOpen(false);
          navigate(getDashboardPath(role));
        }}
      />
    </>
  );
}
