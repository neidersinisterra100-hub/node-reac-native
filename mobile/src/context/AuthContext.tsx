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

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
};

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
     RESTORE SESSION (BOOTSTRAP)
     ===================================================== */

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const session = await loadSession();

        if (session?.user && isMounted) {
          setUser(session.user);
        }
      } catch (err) {
        console.log("❌ Error restaurando sesión", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =====================================================
     LOGIN
     ===================================================== */

  const login = async ({
    email,
    password,
  }: LoginPayload): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { user, token } = await loginRequest({
        email,
        password,
      });

      await saveSession(user, token);

      /**
       * 🔑 Punto CLAVE:
       * seteamos user ANTES de quitar loading
       * para que AppNavigator cambie de stack sin rebote
       */
      setUser(user);

      return true;
    } catch (err: unknown) {
      const message =
        typeof (err as any)?.response?.data?.message === "string"
          ? (err as any).response.data.message
          : err instanceof Error
          ? err.message
          : "Error al iniciar sesión";

      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     REGISTER
     ===================================================== */

  const register = async ({
    name,
    email,
    password,
  }: RegisterPayload): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      /**
       * Backend:
       * POST /api/auth/register
       *
       * ✔️ NO devuelve token
       * ✔️ NO inicia sesión
       * ✔️ Envía email de verificación
       */
      await registerRequest({
        name,
        email,
        password,
      });

      return true;
    } catch (err: unknown) {
      const message =
        typeof (err as any)?.response?.data?.message === "string"
          ? (err as any).response.data.message
          : err instanceof Error
          ? err.message
          : "Error al registrar usuario";

      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOGOUT
     ===================================================== */

  const logout = async () => {
    setLoading(true);

    try {
      await clearSession();
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     PROVIDER
     ===================================================== */

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
   HOOK
   ========================================================= */

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

// /* =========================================================
//    TIPOS DEL CONTEXTO DE AUTENTICACIÓN
//    ========================================================= */

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   error: string | null;

//   login: (payload: LoginPayload) => Promise<void>;
//   register: (payload: RegisterPayload) => Promise<boolean>;
//   logout: () => Promise<void>;
// };

// const AuthContext =
//   createContext<AuthContextType | undefined>(undefined);

// /* =========================================================
//    AUTH PROVIDER
//    ========================================================= */

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
//     } catch (err: unknown) {
//       const message =
//         typeof (err as any)?.response?.data?.message === "string"
//           ? (err as any).response.data.message
//           : err instanceof Error
//           ? err.message
//           : "Error al iniciar sesión";

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
//   }: RegisterPayload): Promise<boolean> => {
//     try {
//       setLoading(true);
//       setError(null);

//       /**
//        * Backend:
//        * POST /api/auth/register
//        *
//        * ✔️ NO devuelve token
//        * ✔️ NO inicia sesión
//        * ✔️ Envía email de verificación
//        */
//       await registerRequest({
//         name,
//         email,
//         password,
//       });

//       return true;
//     } catch (err: unknown) {
//       const message =
//         typeof (err as any)?.response?.data?.message === "string"
//           ? (err as any).response.data.message
//           : err instanceof Error
//           ? err.message
//           : "Error al registrar usuario";

//       setError(message);
//       return false;
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

//   /* ================= PROVIDER ================= */

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

// /* =========================================================
//    HOOK
//    ========================================================= */

// export function useAuth() {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error(
//       "useAuth debe usarse dentro de <AuthProvider>"
//     );
//   }

//   return context;
// }
