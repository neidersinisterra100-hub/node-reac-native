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

/* =========================================================
   TIPOS DEL CONTEXTO DE AUTENTICACIÓN
   ========================================================= */

/**
 * AuthContextType
 *
 * Define TODO lo que el resto de la app puede usar
 * relacionado con autenticación.
 *
 * ⚠️ Nota:
 * - El token NO se expone aquí
 * - El token vive en storage y en el cliente HTTP
 */
type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

/**
 * Contexto base.
 * Empieza como undefined para forzar el uso del Provider.
 */
const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

/* =========================================================
   AUTH PROVIDER
   ========================================================= */

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  /* =========================
     ESTADOS GLOBALES
     ========================= */

  /**
   * user:
   * - null → no autenticado
   * - User → sesión activa
   */
  const [user, setUser] = useState<User | null>(null);

  /**
   * loading:
   * - true  → inicializando / login / register
   * - false → listo
   */
  const [loading, setLoading] = useState(true);

  /**
   * error:
   * - mensajes legibles para UI
   */
  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     RESTAURAR SESIÓN (AL ABRIR LA APP)
     ======================================================= */

  useEffect(() => {
    /**
     * restoreSession
     *
     * Se ejecuta UNA sola vez al montar la app.
     *
     * Responsabilidad:
     * - Leer storage (AsyncStorage / SecureStore)
     * - Restaurar usuario si existe sesión
     */
    const restoreSession = async () => {
      try {
        const session = await loadSession();

        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.log("❌ Error restaurando sesión", err);
      } finally {
        // ⚠️ MUY IMPORTANTE:
        // loading pasa a false SOLO cuando termina restore
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* =======================================================
     LOGIN
     ======================================================= */

  const login = async ({
    email,
    password,
  }: LoginPayload) => {
    try {
      setLoading(true);
      setError(null);

      /**
       * Llamada al backend:
       * POST /api/auth/login
       */
      const { user, token } = await loginRequest({
        email,
        password,
      });

      /**
       * Guardamos sesión:
       * - user
       * - token
       *
       * El token NO se guarda en estado React
       */
      await saveSession(user, token);
      setUser(user);
    } catch (err: unknown) {
      /**
       * Normalización del error
       * (evita reventar la UI)
       */
      const message =
        typeof (err as any)?.response?.data?.message === "string"
          ? (err as any).response.data.message
          : err instanceof Error
          ? err.message
          : "Error al iniciar sesión";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     REGISTER
     ======================================================= */

  const register = async ({
    name,
    email,
    password,
  }: RegisterPayload) => {
    try {
      setLoading(true);
      setError(null);

      /**
       * POST /api/auth/register
       */
      const { user, token } =
        await registerRequest({
          name,
          email,
          password,
        });

      /**
       * ⚠️ CORRECCIÓN IMPORTANTE:
       * - El backend YA envía role correcto
       * - NO debemos transformarlo aquí
       */
      await saveSession(user, token);
      setUser(user);
    } catch (err: unknown) {
      const message =
        typeof (err as any)?.response?.data?.message === "string"
          ? (err as any).response.data.message
          : err instanceof Error
          ? err.message
          : "Error al registrar usuario";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOGOUT
     ======================================================= */

  const logout = async () => {
    /**
     * Limpia TODO rastro de sesión
     */
    await clearSession();
    setUser(null);
    setError(null);
  };

  /* =======================================================
     PROVIDER
     ======================================================= */

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

/* =========================================================
   HOOK DE CONSUMO
   ========================================================= */

/**
 * useAuth
 *
 * Garantiza que el hook solo se use
 * dentro de <AuthProvider>
 */
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
// import { User } from "../types/user";
// import {
//   saveSession,
//   loadSession,
//   clearSession,
// } from "../utils/authStorage";
// import {
//   registerRequest,
//   RegisterPayload,
//   loginRequest,
//   LoginPayload,
// } from "../services/auth.service";

// /* ================= TYPES ================= */

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   // token: string | null;
//   error: string | null;
//   login: (payload: LoginPayload) => Promise<void>;
//   register: (payload: RegisterPayload) => Promise<void>;
//   logout: () => Promise<void>;
// };

// const AuthContext =
//   createContext<AuthContextType | undefined>(undefined);

// /* ================= PROVIDER ================= */

// export function AuthProvider({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   /* ================= RESTORE SESSION ================= */
//   useEffect(() => {
//     const restoreSession = async () => {
//       try {
//         const session = await loadSession();
//         if (session?.user) {
//           setUser(session.user);
//         }
//       } catch (err) {
//         console.log("❌ Error restaurando sesión", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     restoreSession();
//   }, []);

//   /* ================= LOGIN ================= */

//   const login = async ({
//     email,
//     password,
//   }: LoginPayload) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const { user, token } = await loginRequest({
//         email,
//         password,
//       });

//       await saveSession(user, token);
//       setUser(user);
//     } catch (err: any) {
//       const message =
//         typeof err?.response?.data?.message === "string"
//           ? err.response.data.message
//           : typeof err?.message === "string"
//             ? err.message
//             : "Error al iniciar sesión";

//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= REGISTER ================= */

//   const register = async ({
//     name,
//     email,
//     password,
//   }: RegisterPayload) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const { user, token } =
//         await registerRequest({
//           name,
//           email,
//           password,
//         });

//       await saveSession(user, token);
//       setUser({
//         ...user,
//         role: user.role.toLowerCase(),
//       });

//       // setUser(user);
//     } catch (err: any) {
//       const message =
//         typeof err?.response?.data?.message === "string"
//           ? err.response.data.message
//           : typeof err?.message === "string"
//             ? err.message
//             : "Error al registrar usuario";

//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= LOGOUT ================= */

//   const logout = async () => {
//     await clearSession();
//     setUser(null);
//     setError(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         error,
//         login,
//         register,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// /* ================= HOOK ================= */

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error(
//       "useAuth debe usarse dentro de <AuthProvider>"
//     );
//   }
//   return context;
// }
