# NauticGo – System Architecture

## 1. Vision

NauticGo is designed as a multi-service regional mobility platform
supporting terrestrial, fluvial and future aerial transport,
with built-in analytics and scalability per municipality.

The architecture must support:

- Multi-municipality configuration
- Multi-transport services
- Analytics from day one
- Future predictive modeling
- Enterprise data services
- Modular backend growth

---

## 2. High-Level Architecture

                ┌───────────────────────────┐
                │        Mobile App         │
                │  (React Native + Expo)    │
                └───────────────┬───────────┘
                                │
                                │ REST API
                                ▼
                ┌───────────────────────────┐
                │         Backend API       │
                │   (Node + Express + TS)   │
                └───────────────┬───────────┘
                                │
                                ▼
                ┌───────────────────────────┐
                │      Operational DB       │
                │ (Trips, Users, Vehicles)  │
                └───────────────┬───────────┘
                                │
                                ▼
                ┌───────────────────────────┐
                │     Analytics Layer       │
                │ (Aggregated Metrics)      │
                └───────────────┬───────────┘
                                │
                                ▼
                ┌───────────────────────────┐
                │  Nautic Insights Portal   │
                │  (Future Analytics Web)   │
                └───────────────────────────┘

---

## 3. Backend Structure

/modules
  /users
  /vehicles
  /trips
  /municipalities
  /analytics
  /config
  /auth

Each module must:
- Expose its own routes
- Contain services
- Contain controllers
- Contain validators
- Remain isolated

No cross-module business logic leakage.

---

## 4. Multi-Municipality Design

Every core entity must contain:

- municipalityId

Municipality must define:

- enabledServices
- pricingRules
- operationalRules
- featureFlags

No service logic should exist without municipality context.

---

## 5. Transport Abstraction

All transport types must rely on:

enum VehicleType {
  TERRESTRIAL,
  FLUVIAL,
  AERIAL
}

No duplicated trip structures per transport.

Use shared Trip model.

---

## 6. Scalability Strategy

Phase 1:
- Monolithic backend
- Single database
- Modular code

Phase 2:
- Read replica for analytics
- Background aggregation workers

Phase 3:
- Service separation (analytics microservice)

---

## 7. Security

- No personal movement data exposed externally
- Aggregated data only for analytics clients
- Role-based access for dashboards
- No hardcoded secrets
- .env for configuration
