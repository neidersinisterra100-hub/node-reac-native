/**
 * navigationRef.ts
 * -----------------
 * Referencia global al NavigationContainer.
 * Permite navegar desde cualquier lugar (incluso fuera del árbol de React),
 * independientemente del ciclo de vida del componente.
 */
import { createNavigationContainerRef, CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "./types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navega a una pantalla de forma global.
 * Seguro de llamar aunque el componente de origen esté desmontado.
 */
export function navigateTo<K extends keyof RootStackParamList>(
    name: K,
    params?: RootStackParamList[K]
) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name as any, params as any);
    }
}

/**
 * Reset global del stack de navegación.
 * Úsalo para salir de modales y navegar a una pantalla del stack principal.
 */
export function resetTo(routes: { name: keyof RootStackParamList; params?: any }[]) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index: routes.length - 1,
                routes,
            })
        );
    }
}
