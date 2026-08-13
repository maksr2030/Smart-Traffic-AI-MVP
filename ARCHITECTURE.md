# Architecture and Evidence Boundary — Engineering MVP v1.5

## Objective

The MVP demonstrates a city-scale traffic intelligence and operations layer rather than a standalone navigation application. Version 1.5 extends the deterministic QCS proxy into a testable decision chain: simulated risk observation → risk assessment → conventional/risk-aware route comparison → simulated preventive command plan.

## Logical layers

### 1. Source and ingestion layer

Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds. The current MVP substitutes deterministic fixtures and simulation data.

### 2. Network-state layer

`data/network.json` defines the demo graph. `engine/trafficEngine.js` validates the graph, calculates edge travel costs, routes traffic, applies incidents, adjusts demand, calculates signal plans and computes network metrics.

The conventional shortest-path output remains the reference baseline for the risk-aware layer.

### 3. Operations layer

`engine/operationsEngine.js` adds concurrent incidents, operational scenarios, deterministic short-horizon forecasting, operational KPIs, simulated mitigation baselines, before/after comparison, emergency fleet dispatch planning and exportable operational snapshots.

### 4. QCS proxy risk layer

`engine/qcsRiskEngine.js` consumes six simulated observation fixtures from `data/qcs_demo_observations.json` and produces deterministic segment risk assessments.

Inputs include:

- road quality and roughness;
- visibility and weather severity;
- blind-spot and curvature risk;
- friction;
- hidden-hazard confidence;
- vehicle speed.

Outputs include:

- deterministic risk score and level;
- suggested preventive speed;
- stability, braking, suspension, blind-spot, curve and weather recommendations;
- reroute recommendation;
- simulated V2X-style hazard broadcast.

No QCS proxy output is evidence of connected quantum sensing.

### 5. Risk-aware routing layer

`engine/riskAwareRoutingEngine.js` compares the conventional route with a deterministic time-plus-risk route.

For each traversable edge, the routing cost is based on its normal traffic travel time and a transparent risk multiplier derived from the QCS proxy risk score.

The engine reports:

- conventional route;
- risk-aware route;
- real travel minutes for each route;
- distance difference;
- average and maximum route risk;
- observed versus unknown risk edges;
- risk-adjusted route cost;
- whether a safer route was selected.

`riskWeight` controls the safety-versus-time tradeoff. It is constrained to a deterministic numerical range and is exposed in the UI for comparison.

`avoidRiskScore` provides an optional hard avoidance boundary for directly observed extreme-risk segments. Values below 100 enable the boundary. A value of 100 deliberately disables hard blocking so that `riskWeight=0` reduces to the conventional travel-time objective.

Unknown edges receive an explicit fallback proxy score for route costing and remain identified as unknown; the system does not fabricate an observation for them.

### 6. Preventive command simulation layer

`engine/preventiveCommandEngine.js` converts the QCS proxy response along the selected route into a simulated command plan.

Potential command outputs include target-speed reduction, stability-control readiness, adaptive-suspension preparation, blind-spot guard, curve-speed assistance, degraded-weather mode, brake-assist readiness, V2X proxy warning and risk-aware reroute request.

Every command preserves:

- `simulated=true`;
- `actuatorConnected=false`;
- `safetyCertified=false`.

The V2X proxy warning also preserves `quantumCommunicationClaim=false`.

An unobserved route segment produces a monitor-only command rather than a synthetic sensor reading.

### 7. Scenario and digital-twin layer

`data/operations_scenarios.json` contains normal, rush-hour, major-event, severe-weather and concurrent multi-incident fixtures.

The network state can be modified by scenario execution or incident injection, after which conventional and risk-aware routing are recalculated against the same current network.

### 8. Emergency-response simulation layer

`data/emergency_fleet.json` contains a virtual fleet used only for route evaluation and dispatch logic. It is not connected to a real emergency service.

### 9. Dynamic capability evidence layer

`data/features.json` is the registry manifest. The browser loads every dataset listed in `manifest.files` and verifies the resulting count against `manifest.total`.

`coverage/coverageModel.js` generates exactly one coverage row for each unified registry record. Current validated coverage across 123 records is:

- 31 implemented-demo;
- 19 represented-demo;
- 73 catalogued-only;
- 0 production-verified.

QCS-101 is now `implemented_demo` because v1.5 contains executable deterministic risk-analysis, preemptive route-selection and preventive-command logic that meaningfully represents part of that historical capability. This does not imply production or quantum-hardware implementation.

### 10. User and operations interface

`index.html` and `app.js` expose:

- network state and conventional routing;
- incident injection;
- operating scenarios;
- forecast baselines;
- emergency dispatch;
- before/after intervention evidence;
- QCS corridor risk analysis;
- safety/time `riskWeight` selection;
- conventional versus risk-aware route comparison;
- time and risk deltas;
- preventive command-plan table;
- operational snapshot export;
- coverage export;
- dynamic bilingual source registry.

### 11. Governance and assurance layer

The repository preserves historical namespaces, prevents invented Main Legacy features from entering verified ranges, preserves source-language provenance and historical version conflicts, and keeps production verification separate from demo implementation.

The application and tests also explicitly protect against:

- claiming real quantum hardware;
- claiming quantum V2X communication;
- claiming connected vehicle actuation;
- treating unknown road-risk observations as measured data;
- silently replacing conventional routing with the risk-aware route;
- treating the preventive command plan as safety-certified control.

## QCS capability boundary

Executable proxy logic meaningfully supports demonstration of QCS-80, QCS-85, QCS-86, QCS-87, QCS-88, QCS-92 and QCS-101.

QCS-93, QCS-94, QCS-95, QCS-103 and QCS-104 remain represented by proxy workflows or integration boundaries rather than claimed as fully implemented.

The MVP does not demonstrate quantum advantage, quantum sensing precision, quantum encryption, production V2X or autonomous vehicle actuation.

## QTOS boundary

QTOS remains a documented sub-innovation namespace. The current scenario selector uses measurable classical deterministic candidates as an engineering baseline. No quantum computational advantage is claimed unless a separate benchmark demonstrates it against appropriate classical baselines.

## Validation

GitHub Actions executes:

1. Registry and evidence-integrity validation.
2. Traffic-engine tests.
3. Operations-engine tests.
4. QCS proxy-risk tests.
5. Risk-aware routing tests.
6. Preventive command-plan tests.
7. Coverage-model tests.
8. JavaScript syntax checks for all operational engines.
9. Static application and DOM wiring checks.
10. Dynamic registry-file existence checks driven by the manifest.
11. QCS observation-fixture validation.

Latest validated engineering suite before this documentation-only update:

- 27/27 tests passing;
- 26 required/dynamic files checked;
- 73 DOM bindings checked;
- 12 road nodes;
- 17 road links;
- 5 scenarios;
- 4 virtual emergency units;
- 6 QCS observations.

## Production-readiness boundary

Production readiness is outside the present proof-of-concept. It requires authenticated interfaces, approved integration contracts, calibrated sensing or approved high-fidelity datasets, cyber security and privacy controls, safety engineering and hazard analysis, authorization policies, audit logs, operational observability, resilience testing, algorithm validation and controlled field or high-fidelity deployment evidence.
