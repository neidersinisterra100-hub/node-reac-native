# NauticGo – Monorepo Architecture Guide

## Overview

NauticGo is a regional mobility platform focused on multi-transport services in the Pacific region.

The system is designed to support:
- Terrestrial transport
- Fluvial transport
- Aerial transport (planned)
- Analytics & mobility intelligence layer

The project follows a modular and scalable architecture from day one.

---

## Tech Stack

Frontend (Mobile):
- React Native
- Expo
- TypeScript (strict mode)
- React Navigation

Backend:
- Node.js
- Express
- TypeScript
- Modular architecture
- REST API

Analytics:
- Aggregation layer (daily, weekly, monthly metrics)
- No raw personal data exposure
- Aggregated mobility metrics only

---

## Monorepo Structure

/nauticgo
  /mobile        → React Native App
  /backend       → Express API
  /shared        → Shared types & enums
  /docs          → Architecture documentation (optional)

---

## Core Architectural Principles

1. Multi-Municipality First
   - Every entity must support `municipalityId`
   - No hardcoded municipality logic
   - All services must be municipality-aware

2. Service Modularity
   Supported services:
   - terrestrial
   - fluvial
   - aerial (planned)

   Services must be configurable via a dynamic configuration array:
   ```ts
   const services = [
     { id: "terrestrial", enabled: true },
     { id: "fluvial", enabled: true },
     { id: "aerial", enabled: false }
   ]
