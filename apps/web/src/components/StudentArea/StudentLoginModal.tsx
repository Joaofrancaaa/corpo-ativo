import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import styles from './StudentLoginModal.module.css';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginStatus = 'idle' | 'loading';

export default function StudentLoginModal({
  isOpen,
  onClose,
}: StudentLoginModalProps) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCpf('');
    setPassword('');
    setStatus('idle');
    setIsAnimatedIn(false);

    const frameId = requestAnimationFrame(() => {
      setIsAnimatedIn(true);
    });

    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    if (status !== 'loading') {
      onClose();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');

    window.setTimeout(() => {
      setStatus('idle');
      onClose();
      window.alert('Funcionalidade de Dashboard disponível na Fase 2');
    }, 1000);
  };

  return (
    <div
      className={`${styles.overlay} ${isAnimatedIn ? styles.overlayOpen : ''}`}
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        className={`${styles.content} ${isAnimatedIn ? styles.contentOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-login-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          disabled={status === 'loading'}
          aria-label="Fechar modal"
        >
          ×
        </button>

        <header className={styles.header}>
          <h2 className={styles.title} id="student-login-title">
            Área do Aluno
          </h2>
          <p className={styles.subtitle}>
            Acesse seu treino e acompanhe sua evolução.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>CPF</span>
            <input
              className={styles.input}
              type="text"
              name="cpf"
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              placeholder="000.000.000-00"
              inputMode="numeric"
              autoComplete="username"
              required
              disabled={status === 'loading'}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Senha</span>
            <input
              className={styles.input}
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={status === 'loading'}
            />
          </label>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Autenticando...' : 'Entrar'}
          </button>

          <button
            type="button"
            className={styles.forgotLink}
            disabled={status === 'loading'}
            onClick={() =>
              window.alert('Recuperação de senha disponível na Fase 2.')
            }
          >
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
}
