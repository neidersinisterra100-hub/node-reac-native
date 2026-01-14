import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { create } from 'zustand';

// Estado global para controlar el modal (usando Zustand para simplicidad fuera de React Context)
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
 * Función helper para procesar errores y detectar códigos específicos
 */
interface ApiErrorResponse {
    message?: string;
    code?: string;
    [key: string]: unknown;
}

export const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as ApiErrorResponse;

        // Detectar Error de Plan
        if (status === 403 && data?.code === 'PLAN_UPGRADE_REQUIRED') {
            useErrorStore.getState().openProModal();
            return {
                message: "Esta función requiere actualizar tu plan.",
                isPlanError: true
            };
        }

        // Otros errores comunes
        if (status === 401) {
            // Podríamos redirigir a login aquí si tuviéramos acceso al router
            return { message: "Sesión expirada.", isAuthError: true };
        }

        return {
            message: data?.message || "Ocurrió un error inesperado.",
            originalError: error
        };
    }

    console.error("Non-Axios Error:", error);
    return { message: "Error desconocido del sistema." };
};
