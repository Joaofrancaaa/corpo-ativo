import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import type { UserRole } from '@/features/auth/types';
import { loginSchema } from '@/schemas/loginSchema';
import styles from './StudentLoginModal.module.css';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

type LoginStatus = 'idle' | 'loading';

export default function StudentLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentLoginModalProps) {
  const { login } = useAuth();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCpf('');
    setPassword('');
    setStatus('idle');
    setErrorMessage(null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = loginSchema.safeParse({ cpf, password });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setStatus('loading');

    try {
      const user = await login(parsed.data.cpf, parsed.data.password);
      setStatus('idle');
      onSuccess(user.role);
    } catch (error) {
      setStatus('idle');
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível entrar.',
      );
    }
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

          {errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}

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
