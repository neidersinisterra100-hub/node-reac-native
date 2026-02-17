# NauticGo – Analytics & Mobility Intelligence Layer

## 1. Philosophy

NauticGo does NOT sell raw personal data.

NauticGo produces aggregated mobility intelligence.

The analytics system must:

- Aggregate data
- Anonymize sensitive information
- Provide trend insights
- Enable predictive modeling
- Support enterprise export

---

## 2. Data Flow

Trips (raw operational data)
        ↓
Aggregation Service (hourly/daily job)
        ↓
DailyMetrics
        ↓
WeeklyMetrics
        ↓
MonthlyMetrics
        ↓
Dashboard & Reports

Raw data must not be directly exposed.

---

## 3. Core Metrics

DailyMetrics:

- municipalityId
- vehicleType
- date
- totalTrips
- avgWaitTime
- avgTripDuration
- activeDrivers
- peakHour
- cancellationRate
- repeatUserRate

WeeklyMetrics:

- weekNumber
- growthRate
- trendIndex

MonthlyMetrics:

- totalTrips
- monthOverMonthGrowth
- utilizationRate
- seasonalIndex

---

## 4. Zones & Anonymization

Never store exact coordinates permanently for analytics.

Use:
- Geohash (medium precision)
OR
- Predefined municipality zones

Analytics must operate at zone level, not street level.

---

## 5. Predictive Layer (Phase 2)

After 3–6 months of historical data:

Implement:

- Moving average forecast
- Trend-based projection
- Seasonal comparison

After 6–12 months:

- Time-series modeling
- Demand forecasting

---

## 6. Public vs Enterprise Data

Public Reports:
- Aggregated totals
- Trend graphs
- Quarterly reports

Enterprise:
- Zone-level breakdown
- Historical exports (CSV)
- Predictive indicators
- API access

---

## 7. Enterprise Export Rules

Allowed:
- Aggregated metrics
- Historical summaries
- Zone-based demand

Never allowed:
- Individual trip history
- Identifiable patterns
- Real-time tracking

---

## 8. Future: Mobility Index

When historical data stabilizes:

Create Nautic Mobility Index (NMI):

NMI =
  Weighted trip volume *
  demand stability *
  active fleet ratio

Used as strategic planning indicator.
