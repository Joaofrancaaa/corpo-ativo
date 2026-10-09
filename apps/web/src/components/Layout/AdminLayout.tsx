import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { Logo } from "@/components/common/Logo";
import styles from "./AdminLayout.module.css";

interface AdminLayoutProps {
  children: ReactNode;
}

type NavIconName =
  | "dashboard"
  | "students"
  | "checkin"
  | "plans"
  | "finance"
  | "classes"
  | "reports"
  | "communications"
  | "settings";

interface AdminNavItem {
  id: string;
  label: string;
  icon: NavIconName;
  to?: string;
  badge?: string;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", to: "/admin" },
  { id: "alunos", label: "Alunos", icon: "students", to: "/admin/alunos" },
  { id: "check-in", label: "Check-in", icon: "checkin" },
  { id: "planos", label: "Planos", icon: "plans" },
  { id: "financeiro", label: "Financeiro", icon: "finance" },
  { id: "aulas", label: "Aulas", icon: "classes", badge: "Novo" },
  { id: "relatorios", label: "Relatórios", icon: "reports" },
  { id: "comunicacoes", label: "Comunicações", icon: "communications" },
  { id: "configuracoes", label: "Configurações", icon: "settings" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "CA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchFieldId = useId();
  const displayName = user?.name ?? "Recepção";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isProfileOpen]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className={styles.layout}>
      {isSidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
        aria-label="Navegação administrativa"
      >
        <div className={styles.brand}>
          <Logo className={styles.brandLogo} aria-label="Corpo Ativo Academia" />
        </div>

        <nav className={styles.nav} aria-label="Menu principal">
          {ADMIN_NAV_ITEMS.map((item) => {
            const content = (
              <>
                <NavIcon name={item.icon} />
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge && (
                  <span className={styles.navBadge}>{item.badge}</span>
                )}
              </>
            );

            if (item.to) {
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navItem} ${styles.navItemActive}`
                      : styles.navItem
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {content}
                </NavLink>
              );
            }

            return (
              <button key={item.id} type="button" className={styles.navItem}>
                {content}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarFooter}>
            <DumbbellsIcon />
            <p className={styles.sidebarFooterTitle}>Corpo Ativo Academia</p>
            <p className={styles.sidebarFooterTagline}>
              Movimento que transforma.
            </p>
          </div>
        </div>
      </aside>

      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((open) => !open)}
          >
            <MenuIcon />
          </button>

          <label className={styles.search} htmlFor={searchFieldId}>
            <SearchIcon />
            <span className={styles.visuallyHidden}>
              Buscar aluno, plano ou pagamento
            </span>
            <input
              id={searchFieldId}
              ref={searchInputRef}
              className={styles.searchInput}
              type="search"
              placeholder="Buscar aluno, plano, pagamento..."
              autoComplete="off"
            />
            <kbd className={styles.searchShortcut}>/</kbd>
          </label>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Notificações, 8 não lidas"
            >
              <BellIcon />
              <span className={styles.iconBadge}>8</span>
            </button>

            <button
              type="button"
              className={styles.iconButton}
              aria-label="Mensagens, 4 não lidas"
            >
              <EnvelopeIcon />
              <span className={styles.iconBadge}>4</span>
            </button>

            <div className={styles.profile} ref={profileMenuRef}>
              <button
                type="button"
                className={styles.profileButton}
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                onClick={() => setIsProfileOpen((open) => !open)}
              >
                <span className={styles.avatar} aria-hidden="true">
                  {getInitials(displayName)}
                </span>
                <span className={styles.profileCopy}>
                  <span className={styles.profileName}>{displayName}</span>
                  <span className={styles.profileRole}>Administrador</span>
                </span>
                <ChevronIcon />
              </button>

              {isProfileOpen && (
                <div className={styles.profileMenu} role="menu">
                  <Link
                    className={styles.profileMenuItem}
                    role="menuitem"
                    to="/"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Voltar ao site
                  </Link>
                  <button
                    type="button"
                    className={styles.profileMenuItem}
                    role="menuitem"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

function NavIcon({ name }: { name: NavIconName }) {
  switch (name) {
    case "dashboard":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "students":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3.25" />
          <path d="M4.5 18.5c.6-2.8 2.7-4.5 4.5-4.5s3.9 1.7 4.5 4.5" />
          <circle cx="16.5" cy="8.5" r="2.5" />
          <path d="M15 14.2c1.8-.2 3.5 1.1 4.2 3.3" />
        </svg>
      );
    case "checkin":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="3.5" width="14" height="17" rx="2" />
          <path d="M8.5 12.2 10.7 14.5 15.5 9.5" />
        </svg>
      );
    case "plans":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="6" width="17" height="12" rx="2" />
          <path d="M3.5 10h17" />
        </svg>
      );
    case "finance":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="7" width="17" height="11" rx="2" />
          <path d="M8 7V6a4 4 0 0 1 8 0v1" />
        </svg>
      );
    case "classes":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3.5v3M16 3.5v3M4 10h16" />
        </svg>
      );
    case "reports":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 19.5h15" />
          <path d="M7 16v-4.5M12 16V8M17 16v-7" />
        </svg>
      );
    case "communications":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10v4h3l5 4V6L7 10H4z" />
          <path d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7.5a6 6 0 0 1 0 9" />
        </svg>
      );
    case "settings":
      return (
        <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a7.7 7.7 0 0 0 .1-1 7.7 7.7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.3 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.7 7.7 0 0 0-.1 1 7.7 7.7 0 0 0 .1 1l-2 1.5 2 3.5 2.4-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.3-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5z" />
        </svg>
      );
  }
}

function SearchIcon() {
  return (
    <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className={styles.actionIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9.5A6 6 0 0 1 18 9.5c0 7 1.5 8 1.5 8H4.5S6 16.5 6 9.5z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className={styles.actionIcon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="m4.5 8 7.5 6 7.5-6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className={styles.actionIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function DumbbellsIcon() {
  return (
    <svg className={styles.dumbbells} viewBox="0 0 64 32" aria-hidden="true">
      <rect x="6" y="8" width="6" height="16" rx="1.5" />
      <rect x="14" y="11" width="4" height="10" rx="1" />
      <rect x="18" y="14.5" width="28" height="3" rx="1.5" />
      <rect x="46" y="11" width="4" height="10" rx="1" />
      <rect x="52" y="8" width="6" height="16" rx="1.5" />
    </svg>
  );
}
