# Architecture and Evidence Boundary — Engineering MVP v1.4

## Objective

The MVP demonstrates a city-scale traffic intelligence and operations layer rather than a standalone navigation application. Version 1.4 adds a deterministic QCS risk-response proxy, dynamic feature-manifest loading, expanded coverage evidence and stronger static wiring controls.

## Logical layers

### 1. Source and ingestion layer
Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds. The current MVP substitutes deterministic fixtures and simulation data.

### 2. Network-state layer
`data/network.json` defines the demo graph. `engine/trafficEngine.js` validates the graph, calculates edge travel costs, routes traffic, applies incidents, adjusts demand, calculates signal plans and computes network metrics.

### 3. Operations layer
`engine/operationsEngine.js` adds concurrent incidents, operational scenarios, deterministic short-horizon forecasting, operational KPIs, simulated mitigation baselines, before/after comparison, emergency fleet dispatch planning and exportable operational snapshots.

### 4. QCS risk-response proxy layer
`engine/qcsRiskEngine.js` is a deterministic simulation module designed to exercise the decision logic behind selected recovered QCS capabilities without claiming quantum hardware.

Inputs are simulated observations such as:

- road quality and roughness;
- visibility and weather severity;
- blind-spot and curvature risk;
- friction;
- hidden-hazard confidence;
- vehicle speed.

Outputs include:

- deterministic risk scores and levels;
- suggested preventive speed;
- stability-control and braking readiness recommendations;
- rough-road suspension recommendation;
- blind-spot and curve assistance recommendations;
- weather degraded-mode recommendation;
- reroute recommendation;
- simulated V2X-style hazard broadcast.

Every QCS output preserves the evidence boundary: `simulation=true`, no connected quantum hardware, no connected actuator and no quantum-communications claim.

### 5. Scenario and digital-twin layer
`data/operations_scenarios.json` contains normal, rush-hour, major-event, severe-weather and concurrent multi-incident fixtures. `data/qcs_demo_observations.json` contains six simulated road-risk observations used by the QCS proxy lab.

### 6. Emergency-response simulation layer
`data/emergency_fleet.json` contains a virtual fleet used only for route evaluation and dispatch logic. It is not connected to a real emergency service.

### 7. Dynamic capability evidence layer
`data/features.json` is the registry manifest. The browser loads every dataset listed in `manifest.files` and verifies the resulting count against `manifest.total`.

`coverage/coverageModel.js` generates one coverage row for each unified record. MVP implementation state remains independent from source provenance and production verification.

Current validated coverage is 30 implemented-demo, 20 represented-demo, 73 catalogued-only and 0 production-verified across 123 unified records.

### 8. User and operations interface
`index.html` and `app.js` expose:

- network state and routing;
- incident injection;
- operating scenarios;
- forecast baselines;
- emergency dispatch;
- before/after intervention evidence;
- the QCS risk-response lab;
- operational snapshot export;
- coverage export;
- the dynamic bilingual source registry.

### 9. Governance and assurance layer
The repository preserves historical namespaces, prevents invented Main Legacy features from entering verified ranges, preserves version conflicts and language provenance, and refuses production verification without separate evidence.

## QCS capability boundary

Executable proxy logic meaningfully supports demonstration of QCS-80, QCS-85, QCS-86, QCS-87, QCS-88 and QCS-92.

QCS-93, QCS-94, QCS-95, QCS-101, QCS-103 and QCS-104 are represented by proxy messages, simulated decision logic or integration design boundaries rather than claimed as fully implemented.

The MVP does not demonstrate quantum advantage, quantum sensing precision, quantum encryption, production V2X or autonomous vehicle actuation.

## QTOS boundary

QTOS remains a documented sub-innovation namespace. The current scenario selector uses measurable classical deterministic candidates as an engineering baseline. No quantum computational advantage is claimed unless a separate benchmark demonstrates it against appropriate classical baselines.

## Validation

GitHub Actions executes:

1. Registry and evidence-integrity validation.
2. Traffic, operations, QCS-risk and coverage-model tests.
3. JavaScript syntax checks.
4. Static application wiring checks.
5. Dynamic registry-file existence checks driven by the manifest.
6. QCS observation-fixture validation.

Latest validated suite: 21/21 tests passing; 24 files and 64 DOM bindings checked.

## Production-readiness boundary

Production readiness is outside the present proof-of-concept. It requires authenticated interfaces, approved integration contracts, realistic traffic datasets, calibrated sensing, cyber security and privacy controls, authorization policies, audit logs, operational observability, resilience testing, model and algorithm validation, and controlled deployment or high-fidelity simulation evidence.
