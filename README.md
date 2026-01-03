# 🚢 Transmilenio – Plataforma de Transporte Marítimo

Aplicación fullstack para gestión y compra de tiquetes de transporte marítimo.
Permite consultar horarios de embarcaciones, rutas, precios y realizar pagos
a través de **Mercado Pago (LATAM)**.

El proyecto está dividido en **backend (API REST)** y **mobile (app nativa)**,
siguiendo principios de **Clean Architecture**.

---

## 📁 Estructura del proyecto

---

## ⚙️ Tecnologías usadas

### Backend

- Node.js
- TypeScript
- Express
- MongoDB + Mongoose
- Zod (validaciones)
- Mercado Pago SDK
- Clean Architecture

### Mobile

- React Native
- Expo SDK 54
- React Navigation
- Axios
- TypeScript

---

## 🚀 Backend – Instalación y uso

```bash
cd backend
npm install
npm run dev

PORT=3001
MONGO_URI=tu_uri_de_mongodb_atlas
MP_ACCESS_TOKEN=tu_access_token_de_mercado_pago

cd mobile
npm install
npx expo start --tunnel

Abre Expo Go en tu teléfono

Escanea el QR

Fast Refresh activado (cambios en tiempo real)

Pagos con Mercado Pago

La creación de pagos se realiza solo en el backend

El frontend recibe el init_point y redirige al usuario

Compatible con pagos LATAM

Arquitectura

El proyecto sigue Clean Architecture:

controllers → reciben requests

services → lógica de negocio

repositories → acceso a datos

models → esquemas de base de datos

config → MongoDB, Mercado Pago, variables de entorno

🔐 Seguridad

Variables sensibles en .env

Sin claves en el frontend

Validaciones con Zod

Separación backend / frontend

📌 Estado del proyecto

🛠 En desarrollo
📦 Backend funcional
📱 Mobile en progreso

progreso

👤 Autor

Neider Sinisterra
Desarrollador Fullstack

📄 Licencia

Este proyecto es privado. Todos los derechos reservados.
