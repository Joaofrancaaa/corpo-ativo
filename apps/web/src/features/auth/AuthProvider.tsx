import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, UserRole } from "@/features/auth/types";
import {
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  loginRequest,
  storeToken,
} from "@/services/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (cpf: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  getDashboardPath: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getDashboardPath(role: UserRole): string {
  return role === "ADMIN" ? "/admin" : "/aluno";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      const currentUser = await fetchCurrentUser(storedToken);

      if (!isMounted) {
        return;
      }

      if (!currentUser) {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } else {
        setToken(storedToken);
        setUser(currentUser);
      }

      setIsLoading(false);
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (cpf: string, password: string) => {
    const response = await loginRequest(cpf, password);

    if (!response.token || !response.user) {
      throw new Error("Resposta de autenticação inválida.");
    }

    storeToken(response.token);
    setToken(response.token);
    setUser(response.user);

    return response.user;
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
      getDashboardPath,
    }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
