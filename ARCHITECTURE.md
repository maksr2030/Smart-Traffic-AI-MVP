# Architecture and Evidence Boundary — Engineering MVP v1.7

## Objective

The MVP demonstrates a city-scale traffic intelligence and operations layer. Version 1.7 extends the v1.6 Dynamic Risk Digital Twin into a deterministic predictive and orchestration architecture that projects risk across multiple short horizons, evaluates alternative intervention strategies, and autonomously recommends a simulated plan without applying field control.

## Logical layers

### 1. Source and ingestion layer

Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds.

The present MVP uses deterministic fixtures and simulation data only. No live field or government feed is connected.

### 2. Network-state layer

`data/network.json` defines the graph used by `engine/trafficEngine.js` for validation, travel-time calculation, shortest-path routing, incidents, demand, signal allocation and network metrics.

The conventional shortest path remains an auditable time-only baseline.

### 3. Operations layer

`engine/operationsEngine.js` provides concurrent incidents, scenarios, operational metrics, deterministic mitigation baselines, before/after comparison, short-horizon baseline forecasting and operational snapshot export.

### 4. QCS proxy risk layer

`engine/qcsRiskEngine.js` consumes simulated QCS observation fixtures and produces deterministic road-risk assessments.

No QCS output is evidence of connected quantum sensing, quantum communication or production vehicle integration.

### 5. Dynamic Risk Digital Twin layer

`engine/dynamicRiskTwinEngine.js` maintains a shared road-edge risk state from:

- network load: `0.30`;
- incident severity: `0.28`;
- QCS proxy risk: `0.32`;
- road closure: `0.10`.

The twin stores composite risk, risk level, trend, delta, traffic load, incident state, closure state, QCS proxy value, observation-presence state and simulated travel time for each edge.

The same twin snapshot is consumed by twin-aware routing, risk-weighted signal priority and risk-aware virtual emergency dispatch.

### 6. Predictive network projection layer

`engine/predictiveOrchestrationEngine.js` introduces `projectNetworkRiskState()`.

For each requested future horizon, it projects the simulated network from transparent components:

- current load;
- congestion momentum;
- current incident severity;
- neighboring-edge load pressure;
- horizon duration;
- closure persistence.

The standard horizons are:

- 5 minutes;
- 15 minutes;
- 30 minutes;
- 60 minutes.

The projection method is deterministic and explicitly reports that it is not a trained model.

### 7. Predictive risk propagation layer

`forecastRiskPropagation()` rebuilds the Dynamic Risk Digital Twin for every projected network state.

Each horizon records:

- projected network;
- projected twin;
- average network risk;
- maximum network risk;
- high/critical edge count;
- emerging hotspot count;
- per-hotspot risk delta and projected load.

The current twin remains the reference snapshot for calculating future risk deltas.

### 8. Candidate intervention layer

`defaultOrchestrationCandidates()` currently defines four explicit strategies:

1. `observe_only`;
2. `balanced_preemptive`;
3. `network_relief`;
4. `safety_priority`.

`applyPredictiveIntervention()` targets the highest predicted-risk open edges according to each candidate's declared target count, load reduction and incident-relief settings.

Closed edges are never reopened by candidate evaluation.

### 9. Multi-horizon evaluation layer

`evaluateOrchestrationCandidate()` evaluates every candidate against every forecast horizon.

For each candidate/horizon pair the engine:

1. applies the simulated predictive intervention;
2. rebuilds the future Dynamic Risk Twin;
3. calculates operational metrics;
4. generates a twin decision bundle containing route, signal and emergency decisions;
5. calculates a transparent objective score.

The objective uses:

- average risk;
- maximum risk;
- high/critical share;
- average load;
- average edge travel time.

### 10. Robust orchestration layer

`orchestratePredictiveRisk()` ranks candidates across all horizons.

The final robust score combines:

- weighted multi-horizon mean score;
- worst-horizon score;
- explicit intervention penalty.

Later horizons receive larger weights so a plan is not selected solely because it performs well at the first few minutes.

The selected candidate is an autonomous recommendation, not an autonomous field command.

The returned orchestration object always preserves:

- `simulation=true`;
- `autonomousRecommendation=true`;
- `autoApply=false`;
- `humanApprovalRequired=true`;
- `productionControlConnected=false`;
- `safetyCertified=false`.

### 11. Unified decision layer

Each future candidate state uses `buildTwinDecisionBundle()` from the v1.6 architecture.

Therefore each predicted horizon can coordinate:

- twin-aware route selection;
- risk-aware signal priority;
- risk-aware virtual emergency dispatch.

The three decisions share one projected twin snapshot for that candidate and horizon.

### 12. Preventive command simulation layer

`engine/preventiveCommandEngine.js` remains downstream of the selected current-state twin route and generates simulated preventive recommendations from directly observed QCS proxy information.

Every command remains simulated, actuator-disconnected and non-certified.

### 13. User and operations interface

`app.js` injects a Predictive Risk & Autonomous Orchestration panel at runtime and updates the displayed MVP identity to v1.7.

The panel shows:

- selected candidate;
- improvement versus `observe_only`;
- worst horizon score;
- 60-minute hotspot count;
- 5/15/30/60-minute forecast table;
- ranked candidate table;
- explicit trained-model and auto-apply boundaries.

The existing Dynamic Risk Twin, routes, signals, emergency planning, QCS lab, incidents, scenarios, exports and coverage registry remain available.

### 14. Dynamic capability evidence layer

`coverage/coverageModel.js` maintains one status row per unified registry record.

Current CI-validated coverage across 123 records is:

- **33 implemented-demo**;
- **17 represented-demo**;
- **73 catalogued-only**;
- **0 production-verified**.

`QTOS-05` moves to `implemented_demo` because v1.7 contains executable network-wide predictive candidate targeting and load-balancing recommendation logic across the graph.

`QTOS-02`, `QTOS-03`, `QTOS-21` and `QTOS-22` continue to have meaningful executable demo coverage through the twin, forecasting, proactive orchestration and multi-horizon evaluation layers.

This does not imply production traffic assignment, quantum optimization or field deployment.

### 15. Governance and assurance layer

The repository separates source provenance, demo implementation and production verification.

Tests and static checks explicitly protect against:

- calling QCS fixtures real quantum data;
- claiming a trained prediction model where none exists;
- treating future projections as validated production forecasts;
- routing through closed road edges;
- reopening closed edges through simulated intervention;
- presenting autonomous recommendation as autonomous field execution;
- applying predictive recommendations automatically;
- claiming connected traffic-signal, vehicle or emergency-system control;
- claiming production verification without independent evidence.

## Validation

GitHub Actions executes:

1. Registry and evidence-integrity validation.
2. Traffic-engine tests.
3. Operations-engine tests.
4. QCS proxy-risk tests.
5. Dynamic Risk Digital Twin tests.
6. Twin-aware route, signal and emergency tests.
7. Preventive command tests.
8. Predictive network-projection tests.
9. Multi-horizon risk-propagation tests.
10. Predictive intervention and closed-road preservation tests.
11. Autonomous candidate-ranking tests.
12. Shared future twin-decision tests.
13. Determinism regression tests.
14. Coverage-model tests.
15. JavaScript syntax checks for all engines.
16. Static and runtime UI wiring checks.
17. Manifest-driven registry-file existence checks.
18. QCS fixture validation.

Latest CI-validated engineering suite before this documentation-only update:

- **40/40 tests passing**;
- **28 required/dynamic files checked**;
- **81 static DOM bindings**;
- **9 runtime predictive bindings**;
- 12 road nodes;
- 17 road links;
- 5 scenarios;
- 4 virtual emergency units;
- 6 QCS observations;
- Dynamic Risk Twin and Predictive Orchestration wiring confirmed.

## Production-readiness boundary

Production readiness remains outside the present proof-of-concept.

The forecast layer is deterministic and untrained. The orchestration layer ranks simulated alternatives but never applies them automatically.

Production deployment would require authenticated real-time interfaces, calibrated or approved datasets, validated prediction models where appropriate, traffic-controller and emergency-agency integration, authorization and human-oversight policies, cyber security and privacy controls, safety engineering and hazard analysis, audit logs, observability, resilience testing, performance benchmarking, staged deployment and controlled field validation.
