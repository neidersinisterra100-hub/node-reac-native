import { useState } from "react";
import { View } from "react-native";
import { styled } from "nativewind";
import "./global.css";
import { Provider as PaperProvider } from "react-native-paper";

import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { LocationProvider } from "./src/context/LocationContext";

import AppNavigator from "./src/navigation/AppNavigator";
import SplashScreen from "./src/screens/SplashScreen";

import ProPlanModal from "./src/components/modals/ProPlanModal";
import { useErrorStore } from "./src/utils/errorHandler";

/* =========================================================
   ROOT WRAPPER (ACTIVA DARK MODE NATIVO)
   ========================================================= */

const Root = styled(View);

/**
 * ThemeRoot
 *
 * Este componente:
 * - Vive DENTRO del ThemeProvider
 * - Aplica la clase `dark` cuando isDark === true
 * - Habilita NativeWind dark:*
 */
function ThemeRoot({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <Root className={`flex-1 ${isDark ? "dark" : ""}`}>
      {children}
    </Root>
  );
}

/* =========================================================
   MAIN (CAPA DE UI GLOBAL)
   ========================================================= */

function Main() {
  const { showProModal, closeProModal } = useErrorStore();

  return (
    <>
      <AppNavigator />

      <ProPlanModal
        visible={showProModal}
        onClose={closeProModal}
      />
    </>
  );
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return (
      <SplashScreen onFinish={() => setReady(true)} />
    );
  }

  return (
    <PaperProvider>
      <AuthProvider>
        <LocationProvider>
          <ThemeProvider>
            <ThemeRoot>
              <Main />
            </ThemeRoot>
          </ThemeProvider>
        </LocationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}




// import { useState } from "react";
// import "./global.css";
// import { Provider as PaperProvider } from "react-native-paper";

// import { AuthProvider } from "./src/context/AuthContext";
// import { ThemeProvider } from "./src/context/ThemeContext";

// import AppNavigator from "./src/navigation/AppNavigator";
// import SplashScreen from "./src/screens/SplashScreen";

// import ProPlanModal from "./src/components/modals/ProPlanModal";
// import { useErrorStore } from "./src/utils/errorHandler";

// /* =========================================================
//    MAIN (CAPA DE UI GLOBAL)
//    ========================================================= */

// /**
//  * Main
//  *
//  * Esta capa vive DENTRO de los providers (Auth, Theme, Paper).
//  *
//  * Responsabilidad:
//  * - Renderizar la navegación principal
//  * - Renderizar modales globales (ej: ProPlanModal)
//  *
//  * ⚠️ Regla:
//  * - Aquí NO va lógica de auth
//  * - Aquí NO va lógica de negocio
//  */
// function Main() {
//   /**
//    * Store global de errores / eventos
//    * (por ejemplo: intentar usar feature Pro en plan Free)
//    */
//   const { showProModal, closeProModal } = useErrorStore();

//   return (
//     <>
//       {/* Navegación principal (decide Login vs Dashboard INTERNAMENTE) */}
//       <AppNavigator />

//       {/* Modal global (plan Pro, errores de permiso, etc.) */}
//       <ProPlanModal
//         visible={showProModal}
//         onClose={closeProModal}
//       />
//     </>
//   );
// }

// /* =========================================================
//    ROOT APP
//    ========================================================= */

// /**
//  * App
//  *
//  * Punto de entrada de la aplicación.
//  *
//  * Responsabilidades:
//  * - Mostrar SplashScreen inicial
//  * - Inicializar Providers globales
//  * - NO renderizar navegación hasta estar listos
//  */
// export default function App() {
//   /**
//    * ready:
//    * - false → SplashScreen visible
//    * - true  → App cargada
//    *
//    * ⚠️ Esto evita que la app:
//    * - Renderice navegación
//    * - Evalúe rutas
//    * antes de tiempo (causa raíz del bug)
//    */
//   const [ready, setReady] = useState(false);

//   /* =========================
//      SPLASH
//      ========================= */

//   if (!ready) {
//     return (
//       <SplashScreen
//         onFinish={() => setReady(true)}
//       />
//     );
//   }

//   /* =========================
//      PROVIDERS
//      ========================= */

//   return (
//     <PaperProvider>
//       <AuthProvider>
//         <ThemeProvider>
//           <Main />
//         </ThemeProvider>
//       </AuthProvider>
//     </PaperProvider>
//   );
// }



// import { useState } from "react";
// import { Provider as PaperProvider } from "react-native-paper";

// import { AuthProvider } from "./src/context/AuthContext";
// import { ThemeProvider } from "./src/context/ThemeContext";

// import AppNavigator from "./src/navigation/AppNavigator";
// import SplashScreen from "./src/screens/SplashScreen";

// import ProPlanModal from "./src/components/modals/ProPlanModal";
// import { useErrorStore } from "./src/utils/errorHandler";

// /* =========================================================
//    MAIN (CAPA DE UI GLOBAL)
//    ========================================================= */

// /**
//  * Main
//  *
//  * Esta capa vive DENTRO de los providers (Auth, Theme, Paper).
//  *
//  * Responsabilidad:
//  * - Renderizar la navegación principal
//  * - Renderizar modales globales (ej: ProPlanModal)
//  *
//  * ⚠️ Regla:
//  * - Aquí NO va lógica de auth
//  * - Aquí NO va lógica de negocio
//  */
// function Main() {
//   /**
//    * Store global de errores / eventos
//    * (por ejemplo: intentar usar feature Pro en plan Free)
//    */
//   const { showProModal, closeProModal } = useErrorStore();

//   return (
//     <>
//       {/* Navegación principal de la app */}
//       <AppNavigator />

//       {/* Modal global (plan Pro, errores de permiso, etc.) */}
//       <ProPlanModal
//         visible={showProModal}
//         onClose={closeProModal}
//       />
//     </>
//   );
// }

// /* =========================================================
//    ROOT APP
//    ========================================================= */

// /**
//  * App
//  *
//  * Punto de entrada de la aplicación.
//  *
//  * Responsabilidades:
//  * - Mostrar SplashScreen inicial
//  * - Inicializar Providers globales
//  */
// export default function App() {
//   /**
//    * ready:
//    * - false → SplashScreen visible
//    * - true  → App cargada
//    *
//    * ⚠️ Esto evita que la app renderice
//    * sin tener contexto / assets listos
//    */
//   const [ready, setReady] = useState(false);

//   /* =========================
//      SPLASH
//      ========================= */

//   if (!ready) {
//     return (
//       <SplashScreen
//         onFinish={() => setReady(true)}
//       />
//     );
//   }

//   /* =========================
//      PROVIDERS
//      ========================= */

//   return (
//     <PaperProvider>
//       <AuthProvider>
//         <ThemeProvider>
//       {/* <AppNavigator /> */}

//           <Main />
//         </ThemeProvider>
//       </AuthProvider>
//     </PaperProvider>
//   );
// }



// import { useState } from "react";
// import { AuthProvider } from "./src/context/AuthContext";
// import { ThemeProvider } from "./src/context/ThemeContext";
// import AppNavigator from "./src/navigation/AppNavigator";
// import SplashScreen from "./src/screens/SplashScreen";
// import { Provider as PaperProvider } from "react-native-paper";
// import ProPlanModal from "./src/components/modals/ProPlanModal"; // 👈 Modal Pro
// import { useErrorStore } from "./src/utils/errorHandler"; // 👈 Store Error

// function Main() {
//   const { showProModal, closeProModal } = useErrorStore();

//   return (
//     <>
//       <AppNavigator />
//       <ProPlanModal visible={showProModal} onClose={closeProModal} />
//     </>
//   );
// }

// export default function App() {
//   const [ready, setReady] = useState(false);

//   if (!ready) {
//     return <SplashScreen onFinish={() => setReady(true)} />;
//   }

//   return (
//     <PaperProvider>
//       <AuthProvider>
//         <ThemeProvider>
//           <Main />
//         </ThemeProvider>
//       </AuthProvider>
//     </PaperProvider>
//   );
// }
