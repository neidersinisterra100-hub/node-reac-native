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
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al iniciar sesión"
      );
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
      setUser(user);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al registrar usuario"
      );
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


// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { User, UserRole } from "../types/user";
// import {
//   saveSession,
//   loadSession,
//   clearSession,
// } from "../utils/authStorage";
// import { loginRequest } from "../services/auth.service";

// type LoginPayload = {
//   name: string;
//   email: string;
//   password: string;
// };

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   error: string | null;
//   login: (payload: LoginPayload) => Promise<void>;
//   logout: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   /* ================= RESTORE SESSION ================= */
//   useEffect(() => {
//     (async () => {
//       try {
//         const session = await loadSession();
//         if (session?.user) {
//           setUser(session.user);
//         }
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   /* ================= LOGIN ================= */

//   const login = async ({ email, password }: LoginPayload) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const { user, token } = await loginRequest({
//         email,
//         password,
//       });

//       await saveSession(user, token);
//       setUser(user);
//     } catch (error: any) {
//       setError(
//         error?.response?.data?.message ||
//         "Error al iniciar sesión"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
//   // const login = async ({ name, email }: LoginPayload) => {
//   //   try {
//   //     setLoading(true);
//   //     setError(null);

//   //     await new Promise((r) => setTimeout(r, 1000)); // mock backend

//   //     const mockUser: User = {
//   //       id: "1",
//   //       name,
//   //       email,
//   //       role: UserRole.OWNER,
//   //       ownerId: "owner-123",
//   //     };

//   //     await saveSession(mockUser, "mock-token");
//   //     setUser(mockUser);
//   //   } catch {
//   //     setError("Credenciales inválidas");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   /* ================= LOGOUT ================= */
//   const logout = async () => {
//     await clearSession();
//     setUser(null);
//     setError(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, error, login, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth debe usarse dentro de <AuthProvider>");
//   }
//   return context;
// }
