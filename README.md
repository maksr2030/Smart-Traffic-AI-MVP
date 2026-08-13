# Smart AI Traffic Platform — Engineering MVP v1.7

Public engineering proof-of-concept for a city-scale and sovereign traffic intelligence platform.

## Unified registry

The branch currently exposes **123 source records** through a dynamic bilingual registry loaded from `data/features.json`:

- 52 verified Main Legacy historical features: 1-14 and 200-237.
- 23 conversation-recovered capabilities.
- 5 additional project-history capabilities.
- 25 QTOS capabilities.
- 18 directly verified QCS track-local capabilities.

Direct QCS registry records currently include `QCS-80`, `QCS-85`-`QCS-89`, `QCS-92`-`QCS-95`, and `QCS-97`-`QCS-104`.

Main Legacy 15-199 remains reserved pending verified direct recovery.

## Engineering MVP v1.7 — Predictive Risk & Autonomous Orchestration

Version 1.7 extends the v1.6 Dynamic Risk Digital Twin with a deterministic multi-horizon predictive and orchestration layer.

`engine/predictiveOrchestrationEngine.js` adds four capabilities:

1. project the simulated network state at **5, 15, 30 and 60 minutes**;
2. rebuild the Dynamic Risk Digital Twin for each projected horizon;
3. generate multiple candidate intervention plans;
4. rank those candidates across all forecast horizons and autonomously recommend the lowest-scoring robust plan.

The recommendation is autonomous only at the decision-support level. The engine always preserves:

- `simulation: true`;
- `trainedModel: false` for the forecast baseline;
- `autonomousRecommendation: true`;
- `autoApply: false`;
- `humanApprovalRequired: true`;
- `productionControlConnected: false`;
- `safetyCertified: false`.

No field control is executed.

## Predictive risk propagation baseline

`forecastRiskPropagation()` creates deterministic forecasts at 5, 15, 30 and 60 minutes.

The network projection uses transparent simulated inputs:

- current road-edge load;
- current incident severity;
- local congestion momentum;
- pressure from neighboring connected edges;
- current closure state;
- current QCS proxy observations when the future twin is rebuilt.

Each future horizon reports:

- projected Dynamic Risk Twin;
- average risk score;
- maximum risk score;
- high/critical edge count;
- emerging hotspot count;
- hotspot edge identity, projected load and risk delta.

This is a deterministic engineering baseline, not a trained AI traffic prediction model and not a validated production forecast.

## Candidate intervention generation

The current orchestration layer evaluates four transparent candidate strategies:

- `observe_only` — no simulated intervention;
- `balanced_preemptive` — moderate targeted load and incident relief;
- `network_relief` — broader network load relief;
- `safety_priority` — stronger incident-risk relief on the highest predicted-risk edges.

Candidate intervention logic never reopens a closed road and only changes simulated state.

For every future horizon, each candidate receives a new Dynamic Risk Twin and a unified decision bundle containing:

- twin-aware route decision;
- risk-aware signal plan;
- risk-aware virtual emergency dispatch.

## Robust multi-horizon scoring

Every candidate is evaluated at all forecast horizons rather than being optimized for a single instant.

The objective combines:

- average network risk;
- maximum network risk;
- share of high/critical edges;
- average network load;
- average edge travel time;
- an explicit intervention penalty.

The final `robustScore` combines the weighted multi-horizon mean with the worst horizon score and intervention penalty. Lower is better.

The selected plan is therefore the best simulated compromise across near-term and longer short-horizon risk rather than simply the most aggressive intervention.

## Runtime Predictive Orchestration panel

`app.js` creates the v1.7 panel at runtime and updates the page identity to Engineering MVP v1.7.

The panel exposes:

- recommended candidate plan;
- improvement versus `observe_only`;
- worst horizon score;
- 60-minute hotspot count;
- forecast table for 5/15/30/60 minutes;
- ranked candidate table;
- explicit `trainedModel=false` and `autoApply=false` boundaries.

The top-level optimization action now invokes the predictive orchestrator instead of the older single-state scenario selector.

## Dynamic Risk Digital Twin retained from v1.6

`engine/dynamicRiskTwinEngine.js` continues to fuse four deterministic inputs for every road edge:

- network load — weight `0.30`;
- incident severity — weight `0.28`;
- QCS proxy risk — weight `0.32`;
- closure state — weight `0.10`.

Each edge receives a composite risk score, risk level, trend, delta, load, incident state, closure state, QCS proxy risk and current simulated travel time.

The same twin state remains shared across route, signal and emergency decisions.

## QCS and QTOS demo coverage

Executable QCS proxy logic meaningfully represents:

- `QCS-80` — vehicle stability and skid-prevention risk logic.
- `QCS-85` — rough-terrain response logic.
- `QCS-86` — blind-spot risk logic.
- `QCS-87` — severe-weather response logic.
- `QCS-88` — sharp-turn risk logic.
- `QCS-92` — road-quality and vehicle-response logic.
- `QCS-101` — deterministic risk analysis plus twin-aware route selection and preemptive command-plan logic.

QTOS implementation mapping now includes:

- `QTOS-02` — Dynamic City Traffic Digital Twin;
- `QTOS-03` — predictive congestion/risk baseline;
- `QTOS-05` — network-wide traffic load balancing through predictive candidate orchestration;
- `QTOS-21` — proactive crisis-management recommendation workflow;
- `QTOS-22` — multi-horizon candidate simulation and ranking.

`QTOS-05` moves from `represented_demo` to `implemented_demo` in v1.7 because executable candidate plans now target the highest predicted-risk parts of the network and are evaluated across the city graph. This remains a simulation implementation, not production traffic assignment.

## Validated coverage

Latest successful CI validation reports:

- 123 total registry records.
- **33 `implemented_demo`.**
- **17 `represented_demo`.**
- **73 `catalogued_only`.**
- **0 `production_verified`.**

The current automated suite passes **40/40 tests**.

The static smoke check validates:

- **28 required/dynamic files**;
- **81 static DOM bindings**;
- **9 runtime Predictive Orchestration bindings**;
- 12 simulated road nodes;
- 17 road links;
- 5 operating scenarios;
- 4 virtual emergency units;
- 6 QCS simulated observations;
- Dynamic Risk Digital Twin and Predictive Orchestration wiring.

## Existing operational capabilities

The branch currently demonstrates:

1. Graph traffic engine and network validation.
2. Congestion-weighted conventional routing.
3. Incident-aware rerouting.
4. Concurrent multi-incident scenarios.
5. Deterministic city-operations and mitigation baselines.
6. Short-horizon operational forecast baseline.
7. QCS corridor risk analysis.
8. Dynamic composite road-risk state with trend tracking.
9. Twin-aware routing comparison.
10. Risk-aware signal-priority simulation.
11. Risk-aware virtual emergency dispatch.
12. Shared twin decision bundle.
13. Preventive command-plan simulation.
14. Predictive 5/15/30/60-minute risk propagation.
15. Emerging-hotspot detection.
16. Multi-plan intervention generation.
17. Robust candidate scoring across all horizons.
18. Autonomous recommendation with human-approval boundary.
19. Operational JSON export including predictive orchestration summary.
20. Coverage CSV export.
21. Dynamic bilingual feature and evidence views.

## Complete forensic accounting

`Smart_Traffic_Forensic_Master_Recovery_v0_3.html` remains fingerprinted by SHA-256:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

It preserves 213 recovery-ledger rows across 14 historical tracks. `evidence/FORENSIC_V0_3_TRACK_COVERAGE_INDEX.json` continues to account for exactly 213/213 source rows.

QCS-92 is a direct supplemental recovery absent from v0.3 and therefore increases the unified registry without changing the 213-row forensic source count.

## Coverage semantics

`implemented_demo` means executable MVP logic exists for a meaningful portion of the documented capability.

`represented_demo` means a related simulation, workflow, design boundary or partial mechanism exists, but the full capability is not implemented.

`catalogued_only` means the source capability is preserved in the registry but not implemented in the current MVP.

`production_verified` remains a separate evidence dimension and is false for every capability in the repository.

## Run locally

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Validation

```bash
npm run validate
npm test
npm run check
```

## Evidence boundary

“Predictive” in v1.7 means deterministic simulated projection over 5–60 minutes. It does not mean a trained production AI model.

“Autonomous Orchestration” means autonomous ranking and recommendation inside the simulation. It does not mean automatic field execution.

No quantum sensor, quantum communication link, live road feed, production V2X infrastructure, traffic-signal controller, government feed, emergency dispatch integration, vehicle actuator or safety-certified control loop is connected.

Production readiness requires authenticated data interfaces, calibrated sensing or approved high-fidelity datasets, trained/validated forecasting where appropriate, cyber security and privacy controls, safety engineering, authorization policies, auditability, resilience testing, observability, controller integration validation, emergency-agency integration controls and controlled deployment evidence.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
