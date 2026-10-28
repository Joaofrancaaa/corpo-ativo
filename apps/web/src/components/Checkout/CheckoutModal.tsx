// apps/web/src/components/Checkout/CheckoutModal.tsx

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Plan } from "@/interfaces/types";
import { submitPreRegistration } from "@/services/preRegistrationApi";
import { preRegistrationSchema } from "@/schemas/preRegistrationSchema";
import styles from "./CheckoutModal.module.css";

type FormStatus = "idle" | "loading" | "success" | "error";

// Tipagem para os erros de campo, baseada nas chaves do esquema Zod
type FieldErrors = Partial<
  Record<"name" | "email" | "whatsapp" | "selectedPlanId", string>
>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
}

// WhatsApp da recepção (prefixo país + 3DD + número)
const RECEPTION_WHATSAPP = "5599991037975";

function buildWhatsAppUrl(planName: string, userName: string): string {
  const message = encodeURIComponent(
    `Olá! Quero me matricular no plano ${planName}. Meu nome é ${userName}.`,
  );
  return `https://wa.me/${RECEPTION_WHATSAPP}?text=${message}`;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
}: CheckoutModalProps) {
  // Estados do formulário
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // --- AJUSTE TECH LEAD ---
  // Gerencia o reset e o scroll do corpo baseando-se APENAS no isOpen.
  // Não desmontamos mais o componente (removemos o return null).
  useEffect(() => {
    if (isOpen && selectedPlan) {
      // Resetar estados apenas quando o modal ABRIR
      setName("");
      setWhatsapp("");
      setEmail("");
      setStatus("idle");
      setErrorMessage("");
      setFieldErrors({});

      // Bloquear scroll do body
      document.body.style.overflow = "hidden";
    }

    // Função de limpeza ao fechar ou desmontar
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, selectedPlan]);

  const handleOverlayClick = () => {
    // Impede fechar se estiver carregando
    if (status !== "loading") {
      onClose();
    }
  };

  // Limpa o erro de um campo específico quando o usuário começa a digitar novamente
  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Fallback de segurança (selectedPlan nunca deve ser null aqui)
    if (!selectedPlan) return;

    // 1. Validação com Zod usando safeParse
    const parsed = preRegistrationSchema.safeParse({
      name,
      email,
      whatsapp,
      selectedPlanId: selectedPlan.id,
    });

    // 2. Tratar erros de validação Zod
    if (!parsed.success) {
      const nextFieldErrors: FieldErrors = {};

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        // Pega apenas o primeiro erro de cada campo
        if (
          typeof field === "string" &&
          !nextFieldErrors[field as keyof FieldErrors]
        ) {
          nextFieldErrors[field as keyof FieldErrors] = issue.message;
        }
      });

      setFieldErrors(nextFieldErrors);
      return; // Para a execução
    }

    // 3. Se validou, inicia carregamento real
    setFieldErrors({});
    setStatus("loading");
    setErrorMessage("");

    try {
      // Enviar dados normalizados pelo Zod para a API
      const result = await submitPreRegistration({
        name: parsed.data.name,
        email: parsed.data.email,
        whatsapp: parsed.data.whatsapp, // Zod aplicou trim() e toLowerCase()
        selectedPlanId: parsed.data.selectedPlanId,
      });

      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          result.message || "Não foi possível enviar seu pedido.",
        );
      }
    } catch (err) {
      // Captura erros jogados pela API (como duplicidade)
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Erro inesperado. Tente novamente em instantes.",
      );
    }
  };

  return (
    <div
      // --- AJUSTE TECH LEAD ---
      // Usamos apenas styles.isOpen condicionalmente.
      // O componente sempre existe no DOM, o CSS controla a visibilidade.
      className={`${styles.overlay} ${isOpen ? styles.isOpen : ""}`}
      role="presentation"
      onClick={handleOverlayClick}
      // Garante acessibilidade mesmo invisível
      aria-hidden={!isOpen}
    >
      <div
        className={styles.content}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(event) => event.stopPropagation()} // Impede fechar ao clicar dentro
      >
        {/* --- AJUSTE TECH LEAD --- */}
        {/* Usamos renderização condicional APENAS para o conteúdo interno.
            Isso garante que não tentemos ler propiedades de selectedPlan null 
            quando o modal estiver tecnicamente fechado. */}
        {selectedPlan && (
          <>
            <div className={styles.handle} aria-hidden="true" />

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              disabled={status === "loading"}
              aria-label="Fechar modal"
            >
              ×
            </button>

            {status === "success" ? (
              <div className={styles.success}>
                <div className={styles.successIcon} aria-hidden="true">
                  ✓
                </div>
                <h2 className={styles.successTitle}>Pedido enviado!</h2>
                <p className={styles.successMessage}>
                  Recebemos seu interesse no plano{" "}
                  <strong>{selectedPlan.name}</strong>. Nossa equipe entra em
                  contato para concluir a matrícula.
                </p>
                <a
                  className={styles.whatsappButton}
                  href={buildWhatsAppUrl(selectedPlan.name, name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com a Recepção no WhatsApp
                </a>
              </div>
            ) : (
              <>
                <header className={styles.header}>
                  <h2 className={styles.title} id="checkout-title">
                    Quero me matricular
                  </h2>
                  <p className={styles.planName}>Plano {selectedPlan.name}</p>
                </header>

                <form
                  className={styles.form}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {status === "error" && (
                    <div className={styles.errorBanner} role="alert">
                      {errorMessage}
                    </div>
                  )}

                  <label className={styles.field}>
                    <span className={styles.label}>Nome completo</span>
                    <input
                      className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
                      type="text"
                      name="name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        clearFieldError("name");
                      }}
                      placeholder="Seu nome"
                      autoComplete="name"
                      disabled={status === "loading"}
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                    {fieldErrors.name && (
                      <span className={styles.fieldError}>
                        {fieldErrors.name}
                      </span>
                    )}
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>WhatsApp</span>
                    <input
                      className={`${styles.input} ${fieldErrors.whatsapp ? styles.inputError : ""}`}
                      type="tel"
                      name="whatsapp"
                      value={whatsapp}
                      onChange={(event) => {
                        setWhatsapp(event.target.value);
                        clearFieldError("whatsapp");
                      }}
                      placeholder="(99) 99999-9999"
                      autoComplete="tel"
                      disabled={status === "loading"}
                      aria-invalid={Boolean(fieldErrors.whatsapp)}
                    />
                    {fieldErrors.whatsapp && (
                      <span className={styles.fieldError}>
                        {fieldErrors.whatsapp}
                      </span>
                    )}
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>E-mail</span>
                    <input
                      className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
                      type="email"
                      name="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        clearFieldError("email");
                      }}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      disabled={status === "loading"}
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                    {fieldErrors.email && (
                      <span className={styles.fieldError}>
                        {fieldErrors.email}
                      </span>
                    )}
                  </label>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={status === "loading"}
                  >
                    {status === "loading"
                      ? "Processando..."
                      : "Enviar meus dados"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
