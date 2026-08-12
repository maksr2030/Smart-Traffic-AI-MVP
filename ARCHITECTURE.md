# Architecture and Evidence Boundary — Engineering MVP v1.3

## Objective

The MVP demonstrates a city-scale traffic intelligence and operations layer rather than a standalone navigation application. Version 1.3 adds explicit operational orchestration, forecast baselines, emergency dispatch simulation, before/after evidence and a capability-coverage layer.

## Logical layers

### 1. Source and ingestion layer
Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds. The current MVP substitutes deterministic fixtures and simulation data.

### 2. Network-state layer
`data/network.json` defines the demo graph. `engine/trafficEngine.js` validates the graph, calculates edge travel costs, routes traffic, applies single incidents, adjusts demand, calculates signal plans and computes network metrics.

### 3. Operations layer
`engine/operationsEngine.js` adds:

- concurrent incidents,
- operational scenarios,
- deterministic short-horizon forecasting,
- operational KPIs,
- simulated mitigation baselines,
- before/after comparison,
- emergency fleet dispatch planning,
- exportable operational snapshots.

### 4. Scenario and digital-twin layer
`data/operations_scenarios.json` contains normal, rush-hour, major-event, severe-weather and concurrent multi-incident fixtures. These are simulation scenarios, not field events.

### 5. Emergency-response simulation layer
`data/emergency_fleet.json` contains a virtual fleet used only for route evaluation and dispatch logic. It is not connected to a real emergency service.

### 6. Capability evidence layer
`coverage/coverageModel.js` generates exactly one coverage row for each recovered source record. MVP implementation state is intentionally independent from source provenance and production verification.

### 7. User and operations interface
`index.html` and `app.js` expose network state, routing, incident injection, scenarios, forecast baselines, emergency dispatch, before/after comparison, evidence export, feature coverage and the full bilingual source registry.

### 8. Governance and assurance layer
The repository preserves historical identifiers, prevents invented legacy features from entering the verified group, and refuses to mark capabilities as production verified without separate evidence.

## QTOS boundary

QTOS remains a documented sub-innovation namespace. The current scenario selector uses measurable classical deterministic candidates as an engineering baseline. No quantum computational advantage is claimed or implemented unless a separate benchmark demonstrates it against appropriate classical baselines.

## Validation

GitHub Actions executes three classes of controls:

1. Registry and evidence integrity.
2. Traffic-engine, operations-engine and coverage-model tests.
3. Static application wiring and syntax checks.

## Production-readiness boundary

Production readiness is outside the present proof-of-concept and should be established through authenticated data interfaces, integration contracts, realistic traffic datasets, scenario benchmarks, security and privacy controls, audit logs, authorization policies, resilience testing, operational observability and controlled deployment validation.
