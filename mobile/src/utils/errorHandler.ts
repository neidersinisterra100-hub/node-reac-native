import { Alert } from 'react-native';
import { create } from 'zustand';

// Estado global para controlar el modal en Mobile
interface ErrorState {
  showProModal: boolean;
  openProModal: () => void;
  closeProModal: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  showProModal: false,
  openProModal: () => set({ showProModal: true }),
  closeProModal: () => set({ showProModal: false }),
}));

/**
 * Función helper para procesar errores en Mobile
 */
export const handleError = (error: any) => {
    // Axios Error
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // Detectar Error de Plan
        if (status === 403 && data?.code === 'PLAN_UPGRADE_REQUIRED') {
            useErrorStore.getState().openProModal();
            return {
                message: "Requiere Plan Pro",
                handled: true
            };
        }

        // Otros errores
        const message = data?.message || "Ocurrió un error inesperado";
        Alert.alert("Error", message);
        return { message, handled: true };
    }

    // Network Error o similar
    console.log("Unknown Error:", error);
    Alert.alert("Error", "Error de conexión o sistema");
    return { message: "Error desconocido", handled: true };
};
