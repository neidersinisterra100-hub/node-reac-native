import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "../types/user";
import {
  saveSession,
  loadSession,
  clearSession,
} from "../utils/authStorage";
import {
  registerRequest,
  RegisterPayload,
  loginRequest,
  LoginPayload,
} from "../services/auth.service";

/* ================= TYPES ================= */

type AuthContextType = {
  user: User | null;
  loading: boolean;
  // token: string | null;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= RESTORE SESSION ================= */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await loadSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.log("❌ Error restaurando sesión", err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* ================= LOGIN ================= */

  const login = async ({
    email,
    password,
  }: LoginPayload) => {
    try {
      setLoading(true);
      setError(null);

      const { user, token } = await loginRequest({
        email,
        password,
      });

      await saveSession(user, token);
      setUser(user);
    } catch (err: any) {
      const message =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : typeof err?.message === "string"
            ? err.message
            : "Error al iniciar sesión";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */

  const register = async ({
    name,
    email,
    password,
  }: RegisterPayload) => {
    try {
      setLoading(true);
      setError(null);

      const { user, token } =
        await registerRequest({
          name,
          email,
          password,
        });

      await saveSession(user, token);
      setUser({
        ...user,
        role: user.role.toLowerCase(),
      });

      // setUser(user);
    } catch (err: any) {
      const message =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : typeof err?.message === "string"
            ? err.message
            : "Error al registrar usuario";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */

  const logout = async () => {
    await clearSession();
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth debe usarse dentro de <AuthProvider>"
    );
  }
  return context;
}
