# 📱 Transmilenio/Maritime App Documentation

Este documento detalla la estructura, funcionalidades y flujo de trabajo de la aplicación móvil de gestión de transporte marítimo/fluvial.

## 🛠 Tech Stack (Ecosistema Completo)

El proyecto se compone de tres partes principales:

### 📱 Mobile App (Pasajeros y Capitanes)
*   **Framework:** React Native (Expo SDK 52)
*   **Lenguaje:** TypeScript
*   **Estilos:** NativeWind (TailwindCSS) + React Native Paper
*   **Funcionalidades:** Escáner QR, Generación de Tickets, Geolocalización.

### 💻 Web Dashboard (Administración)
*   **Framework:** React + Vite
*   **Lenguaje:** TypeScript
*   **Estilos:** TailwindCSS + Lucide React (Iconos)
*   **Gráficos:** Recharts / Chart.js (Métricas de ingresos y viajes)
*   **Estado:** Zustand (Gestión global de sesión y datos)

### 🔙 Backend API (Servidor Central)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Base de Datos:** MongoDB (Mongoose ORM)
*   **Seguridad:** JWT (Json Web Tokens) para autenticación.
*   **Arquitectura:** MVC (Model-View-Controller).

---

## 📂 Estructura del Proyecto

El repositorio funciona como un monorepo simplificado donde conviven las tres partes:

### 1. Mobile App (Archivos `temp_mobile_*`)
*   **`temp_mobile_AppNavigator.tsx`**: **(CORE)** Gestiona la navegación móvil.
*   **`temp_mobile_DashboardScreen.tsx`**: Dashboard móvil adaptativo (Owner/User).
*   **`temp_mobile_my_tickets.tsx`**: Historial de tickets y QR.
*   **`temp_mobile_api.ts`**: Cliente HTTP configurado para móvil.

### 2. Web Dashboard (Carpeta `src/`)
Ubicado en la carpeta `src`, es el panel de administración web.
*   **`src/pages/`**: Vistas principales (`Dashboard.tsx`, `Companies.tsx`, `Trips.tsx`).
*   **`src/components/dashboard/`**: Widgets de métricas (`AreaChart.tsx`, `MetricCard.tsx`).
*   **`src/services/`**: Capa de conexión con el backend web (`auth.service.ts`, `company.service.ts`).
*   **`src/store/authStore.ts`**: Manejo de sesión con Zustand.

### 3. Backend (Archivos `temp_backend_*` y Raíz)
Archivos dispersos en la raíz que conforman la lógica del servidor (actualmente en proceso de modularización).
*   **`temp_app.ts`**: Punto de entrada de la aplicación Express.
*   **`temp_backend_ticket_*.ts`**: Controladores y Modelos de Tickets.
*   **`temp_backend_company_*.ts`**: Lógica de empresas.
*   **`stats.controller.ts`**: Controladores para las métricas del dashboard.

---

---

## 🚀 Flujos de Usuario (User Flows)

### 1. Autenticación y Roles
El sistema distingue entre dos tipos de usuarios principales:
*   **Usuario (Pasajero):** Puede ver rutas, comprar tickets y ver su historial QR.
*   **Owner/Admin (Capitán/Dueño):** Puede crear empresas, gestionar rutas, ver métricas financieras y validar tickets.

### 2. Ciclo de Vida del Ticket
1.  **Compra:** El usuario selecciona una ruta y viaje -> Confirma compra -> Se genera un Ticket en Backend.
2.  **Visualización:** El usuario va a "Mis Tickets" -> Ve el detalle del viaje.
3.  **Abordaje (QR):**
    *   El usuario toca el botón **"🔍 TOCAR PARA AMPLIAR QR"**.
    *   Se abre un Modal con el QR en tamaño grande (260px).
4.  **Validación:** El conductor escanea el QR con su App (Módulo Validador) para marcar el ticket como "USADO".

### 3. Gestión de Empresas (Owner)
*   **Crear:** Formulario para registrar nueva naviera/empresa.
*   **Rutas:** Asignar orígenes y destinos a la empresa.
*   **Viajes:** Programar zarpes (Fecha/Hora/Precio) para las rutas.

---

## ⚙️ Configuración y Ejecución

### Requisitos Previos
*   Node.js & npm/yarn
*   Dispositivo físico con Expo Go o Emulador Android/iOS.

### Pasos para correr la App
1.  **Instalar dependencias:**
    ```bash
    npm install
    # Si hay error de dependencias (expo-camera):
    npm install --legacy-peer-deps
    ```

2.  **Configurar IP (Importante para móviles físicos):**
    *   Ir a `temp_mobile_api.ts`.
    *   Cambiar `const LOCAL_IP = "192.168.x.x"` por la IP de tu PC.

3.  **Iniciar Metro Bundler:**
    ```bash
    npx expo start -c
    ```
    *   Usa `-c` para limpiar caché si hiciste cambios grandes.

4.  **Escanear:** Lee el QR de la terminal con tu celular (App Expo Go).

---

## 📝 Notas de Mantenimiento
*   **Estilos:** Se usa Tailwind. Si editas clases y no cargan, verifica `babel.config.js` y el plugin de `nativewind`.
*   **Cámara:** Si la cámara no abre, verifica los permisos en `app.json` (Android/iOS permissions).
*   **Iconos:** Se usa `MaterialCommunityIcons` (@expo/vector-icons) y `Lucide React Native`.

---
*Documentación generada automáticamente por Trae AI - 2025*
