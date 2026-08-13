# Architecture and Evidence Boundary — Engineering MVP v1.6

## Objective

The MVP demonstrates a city-scale traffic intelligence and operations layer rather than a standalone navigation application. Version 1.6 introduces a deterministic **Dynamic Risk Digital Twin** that maintains one shared edge-level risk state and exposes that state to routing, signal-priority, emergency-dispatch and preventive-response logic.

## Logical layers

### 1. Source and ingestion layer

Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds. The current MVP substitutes deterministic fixtures and simulation data.

No live field or government feed is connected.

### 2. Network-state layer

`data/network.json` defines the demo graph. `engine/trafficEngine.js` validates the graph, calculates edge travel costs, routes traffic, applies incidents, adjusts demand, calculates signal plans and computes network metrics.

The conventional shortest-path output remains an auditable time-only baseline.

### 3. Operations layer

`engine/operationsEngine.js` adds concurrent incidents, operational scenarios, deterministic short-horizon forecasting, operational KPIs, simulated mitigation baselines, before/after comparison and exportable operational snapshots.

### 4. QCS proxy risk layer

`engine/qcsRiskEngine.js` consumes six simulated observation fixtures from `data/qcs_demo_observations.json` and produces deterministic QCS proxy risk assessments.

Inputs include road quality, roughness, visibility, weather severity, blind-spot risk, curvature risk, friction, hidden-hazard confidence and vehicle speed.

No QCS output is evidence of connected quantum sensing, quantum communication or production vehicle integration.

### 5. Dynamic Risk Digital Twin layer

`engine/dynamicRiskTwinEngine.js` constructs one edge-level composite risk state from four transparent inputs:

- network load: `0.30`;
- incident severity: `0.28`;
- QCS proxy risk: `0.32`;
- road-closure state: `0.10`.

For each road edge the twin stores:

- edge identity and topology;
- composite risk score;
- risk level;
- risk trend (`new`, `rising`, `stable`, `falling`);
- risk delta versus the previous twin state;
- network load;
- incident severity;
- closure state;
- QCS proxy risk;
- whether a direct QCS observation exists;
- current simulated travel minutes;
- source-presence flags.

A declared fallback QCS risk is used only when an edge has no direct QCS fixture. Such edges remain explicitly marked `qcsObserved=false`; the fallback is never represented as a sensor measurement.

The twin summary includes network-wide average and maximum risk, highest-risk edge, critical/high counts, rising-risk count, QCS coverage, incident-edge count and closed-edge count.

The twin is recomputed as simulated load evolves and after scenario execution, incident injection, mitigation application, QCS refresh and network reset.

“Dynamic” therefore means stateful recomputation inside the deterministic simulation, not live production streaming.

### 6. Unified twin decision layer

The core architectural change in v1.6 is that several decisions consume the **same twin snapshot**.

#### Twin-aware routing

`routeWithDynamicRiskTwin()` combines normal traffic travel time with composite twin risk. Closed edges remain unavailable. The conventional shortest route remains visible for comparison.

`compareConventionalAndTwinRoutes()` reports time, distance and composite-risk differences between the baseline and twin-aware alternatives.

#### Risk-aware signal priority

`recommendTwinSignalPlan()` ranks open edges using risk-weighted traffic load and sends the selected candidate set to the deterministic signal allocator.

This output is a simulated timing plan only. No field controller is connected.

#### Risk-aware emergency dispatch

`planTwinEmergencyDispatch()` evaluates available virtual emergency units using twin-aware risk-adjusted route cost.

This is planning against a simulated fleet only. No emergency agency dispatch integration exists.

#### Shared decision bundle

`buildTwinDecisionBundle()` generates route, signal and emergency decisions from one twin instance. This is the explicit guard against silently using different risk states across those three decision paths within one simulation step.

### 7. Preventive command simulation layer

`engine/preventiveCommandEngine.js` remains downstream of the selected route and uses directly observed QCS proxy information to generate simulated preventive recommendations.

Potential outputs include target-speed reduction, stability-control readiness, suspension preparation, blind-spot guard, curve assistance, degraded-weather mode, brake-assist readiness, V2X proxy warning and reroute request.

Every command preserves:

- `simulated=true`;
- `actuatorConnected=false`;
- `safetyCertified=false`.

The V2X proxy warning preserves `quantumCommunicationClaim=false`.

An unobserved QCS route segment produces a monitor-only command rather than a fabricated observation.

### 8. Scenario layer

`data/operations_scenarios.json` contains normal, rush-hour, major-event, severe-weather and concurrent multi-incident fixtures.

Scenario state changes are propagated into the Dynamic Risk Digital Twin before twin-dependent decisions are recalculated.

### 9. Dynamic capability evidence layer

`data/features.json` is the registry manifest. The browser loads every dataset listed in `manifest.files` and verifies the resulting count against `manifest.total`.

`coverage/coverageModel.js` generates exactly one coverage row for every unified registry record.

Current CI-validated coverage across 123 records is:

- **32 implemented-demo**;
- **18 represented-demo**;
- **73 catalogued-only**;
- **0 production-verified**.

`QTOS-02` is now `implemented_demo` because v1.6 includes executable dynamic-twin state construction, risk-trend tracking and shared-state decision consumption. This does not imply a production digital twin or a quantum implementation.

`QCS-101` remains `implemented_demo` because the current MVP includes deterministic risk analysis, twin-aware route selection and preventive decision logic. It does not imply quantum-hardware implementation.

### 10. User and operations interface

`index.html` and `app.js` expose:

- current network state;
- Dynamic Risk Twin KPIs;
- top-risk edge table;
- risk trends and deltas;
- QCS coverage indication;
- time-only routing baseline;
- twin-aware route comparison;
- risk-aware signal planning;
- twin-aware virtual emergency dispatch;
- one-click shared twin decision bundle;
- QCS proxy analysis;
- preventive command recommendations;
- scenarios and incident injection;
- short-horizon forecast baseline;
- before/after intervention evidence;
- operational snapshot export;
- coverage export;
- dynamic bilingual source registry.

### 11. Governance and assurance layer

The repository preserves historical namespaces, prevents invented Main Legacy records from entering verified ranges, preserves source-language provenance and historical version conflicts, and separates implementation status from production verification.

The code and tests explicitly protect against:

- calling QCS fixtures real quantum-sensor data;
- claiming quantum V2X communication;
- claiming connected vehicle actuation;
- presenting fallback QCS risk as measured data;
- routing through a closed road edge;
- treating simulated signal plans as field commands;
- treating virtual emergency selection as real dispatch;
- treating preventive recommendations as safety-certified control;
- claiming production verification without separate evidence.

## Capability boundaries

Executable proxy logic meaningfully supports demonstration of `QCS-80`, `QCS-85`, `QCS-86`, `QCS-87`, `QCS-88`, `QCS-92` and `QCS-101`.

`QTOS-02` now has meaningful executable dynamic-twin demo logic.

`QCS-93`, `QCS-94`, `QCS-95`, `QCS-103` and `QCS-104` remain represented by proxy workflows or integration boundaries rather than claimed as fully implemented.

QTOS quantum or hybrid optimization remains a documented innovation namespace. No quantum computational advantage is claimed without a separate benchmark against appropriate classical baselines.

## Validation

GitHub Actions executes:

1. Registry and evidence-integrity validation.
2. Traffic-engine tests.
3. Operations-engine tests.
4. QCS proxy-risk tests.
5. Dynamic Risk Digital Twin fusion and trend tests.
6. Twin-aware route tests.
7. Risk-weighted signal-plan tests.
8. Twin-aware emergency-dispatch tests.
9. Shared twin decision-bundle tests.
10. Preventive command-plan tests.
11. Legacy risk-aware routing regression tests.
12. Coverage-model tests.
13. JavaScript syntax checks for all operational engines.
14. Static application and DOM wiring checks.
15. Dynamic registry-file existence checks driven by the manifest.
16. QCS observation-fixture validation.

Latest CI-validated engineering suite before this documentation-only update:

- **34/34 tests passing**;
- **27 required/dynamic files checked**;
- **81 DOM bindings checked**;
- 12 road nodes;
- 17 road links;
- 5 scenarios;
- 4 virtual emergency units;
- 6 QCS observations;
- Dynamic Risk Digital Twin wiring confirmed.

## Production-readiness boundary

Production readiness is outside the present proof-of-concept. It requires authenticated interfaces, approved integration contracts, calibrated real sensing or approved high-fidelity datasets, cyber security and privacy controls, safety engineering and hazard analysis, authorization policies, audit logs, operational observability, resilience testing, algorithm validation, traffic-controller integration validation, emergency-agency integration controls and controlled field or high-fidelity deployment evidence.
