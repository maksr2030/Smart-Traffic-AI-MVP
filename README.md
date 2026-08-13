# Smart AI Traffic Platform — Engineering MVP v1.6

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

## Engineering MVP v1.6 — Dynamic Risk Digital Twin

Version 1.6 adds an executable **Dynamic Risk Digital Twin** that converts the current simulated road network into one shared edge-level risk state and uses that same state across multiple decision engines.

`engine/dynamicRiskTwinEngine.js` fuses four transparent deterministic inputs for every road edge:

- network load — weight `0.30`;
- incident severity — weight `0.28`;
- QCS proxy risk — weight `0.32`;
- closure state — weight `0.10`.

Each edge receives:

- composite risk score;
- `low`, `moderate`, `high`, or `critical` risk level;
- `new`, `rising`, `stable`, or `falling` risk trend;
- risk delta versus the previous twin state;
- traffic load;
- incident severity;
- closure state;
- QCS risk and whether it is directly observed;
- current simulated travel time.

Edges without a direct QCS observation use the disclosed simulation fallback value and remain explicitly marked as unobserved. The UI never presents a fallback value as a measured QCS reading.

## Shared twin decision loop

The Dynamic Risk Digital Twin is not only a dashboard. The same twin instance drives three executable decision paths:

1. **Twin-aware routing** — compares the conventional time-only route with a route whose cost combines travel time and composite twin risk.
2. **Risk-aware signal priority** — ranks candidate approaches using traffic load weighted by current twin risk before calculating a deterministic green-time plan.
3. **Risk-aware emergency dispatch** — evaluates available virtual emergency units using risk-adjusted route cost rather than travel time alone.

`buildTwinDecisionBundle()` packages these three decisions from one shared twin state so the route, signal and emergency outputs cannot silently use different risk snapshots within the same simulation step.

The twin is rebuilt when simulated network load changes and after scenario execution, incident injection, intervention application, QCS refresh, or network reset.

## Twin-aware routing

The conventional shortest path remains visible as an auditable baseline. The twin-aware route reports:

- conventional route and travel time;
- twin-aware route and travel time;
- time delta;
- average composite-risk delta;
- maximum route risk;
- risk-adjusted route cost;
- configured `riskWeight`.

Closed road edges remain unavailable regardless of their calculated risk score. This is deterministic proof-of-concept routing and is not represented as safety-certified navigation.

## Risk-aware signal simulation

`recommendTwinSignalPlan()` uses the current shared twin state to prioritize open road edges with a transparent risk-weighted load score. It then uses the existing deterministic signal optimizer to produce green-time allocations.

No physical signal controller is connected. The result is a simulation plan only.

## Risk-aware emergency simulation

`planTwinEmergencyDispatch()` evaluates the virtual emergency fleet using the same twin risk state. It compares reachable units by risk-adjusted route cost and reports the selected virtual unit, route, travel time and route risk.

No emergency agency or real dispatch system is connected.

## Preventive command simulator

`engine/preventiveCommandEngine.js` remains downstream of the selected twin-aware route. It translates directly observed QCS proxy conditions on route segments into simulated preventive recommendations such as target-speed reduction, stability readiness, degraded-weather mode, brake-assist readiness and reroute requests.

The command layer enforces:

- `simulation: true`;
- `actuatorConnected: false`;
- `safetyCertified: false`;
- `quantumCommunicationClaim: false` for the V2X proxy broadcast.

Unobserved QCS route segments remain monitor-only rather than receiving fabricated sensor measurements.

## QCS and QTOS demo coverage

Executable QCS proxy logic meaningfully represents:

- `QCS-80` — vehicle stability and skid-prevention risk logic.
- `QCS-85` — rough-terrain response logic.
- `QCS-86` — blind-spot risk logic.
- `QCS-87` — severe-weather response logic.
- `QCS-88` — sharp-turn risk logic.
- `QCS-92` — road-quality and vehicle-response logic.
- `QCS-101` — deterministic risk analysis plus twin-aware route selection and preemptive command-plan logic.

`QTOS-02` is now `implemented_demo` because v1.6 contains an executable dynamic traffic risk twin that maintains a shared edge-level state and feeds multiple decision engines. This does not imply a production digital twin or quantum implementation.

Related QCS capabilities such as `QCS-93`, `QCS-94`, `QCS-95`, `QCS-103` and `QCS-104` remain represented by proxy workflows or integration boundaries rather than overstated as fully implemented.

## Validated coverage

Latest successful CI validation reports:

- 123 total registry records.
- **32 `implemented_demo`.**
- **18 `represented_demo`.**
- **73 `catalogued_only`.**
- **0 `production_verified`.**

The current automated suite passes **34/34 tests** and covers registry provenance, traffic routing, city operations, QCS proxy risk, Dynamic Risk Digital Twin fusion and trends, twin-aware routing, risk-weighted signals, risk-aware emergency dispatch, shared decision bundles, preventive commands, coverage semantics and static application wiring.

The static smoke check validates:

- **27 required/dynamic files**;
- **81 DOM bindings**;
- 12 simulated road nodes;
- 17 road links;
- 5 operating scenarios;
- 4 virtual emergency units;
- 6 QCS simulated observations;
- Dynamic Risk Digital Twin wiring.

## Existing operational capabilities

The branch currently demonstrates:

1. Graph traffic engine and network validation.
2. Congestion-weighted conventional routing.
3. Incident-aware rerouting.
4. Concurrent multi-incident scenarios.
5. Deterministic city-operations and mitigation baselines.
6. Transparent short-horizon forecast baselines.
7. QCS corridor risk analysis.
8. Dynamic composite road-risk state with trend tracking.
9. Twin-aware routing comparison.
10. Risk-aware signal-priority simulation.
11. Risk-aware virtual emergency dispatch.
12. Shared twin decision bundle for route, signals and emergency response.
13. Preventive command-plan simulation.
14. Before/after intervention comparison.
15. Operational JSON export containing the current twin state, top-risk edges, decision bundle, QCS summary and preventive-command summary.
16. Coverage CSV export.
17. Dynamic bilingual feature and evidence views.

## Complete forensic accounting

`Smart_Traffic_Forensic_Master_Recovery_v0_3.html` remains fingerprinted by SHA-256:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

It preserves 213 recovery-ledger rows across 14 historical tracks. `evidence/FORENSIC_V0_3_TRACK_COVERAGE_INDEX.json` continues to account for exactly 213/213 source rows.

QCS-92 is a direct supplemental recovery absent from v0.3 and therefore increases the unified registry without changing the 213-row forensic source count.

## Evidence framework

Key files include:

- `evidence/EVIDENCE_REGISTER.json`
- `evidence/FORENSIC_V0_3_TRACK_COVERAGE_INDEX.json`
- `evidence/QCS_RECOVERY_EVIDENCE.md`
- `evidence/QCS_FORENSIC_CANDIDATE_MAP_v0_3.json`
- `evidence/MAIN_LEGACY_FORENSIC_CANDIDATES_15_199_v0_3.json`
- `evidence/QTC_FORENSIC_CANDIDATE_MAP_v0_3.json`
- `FEATURE_PROVENANCE.md`

## Coverage semantics

`implemented_demo` means executable MVP logic exists for a meaningful portion of the documented capability.

`represented_demo` means a related simulation, workflow, design boundary or partial mechanism exists, but the full capability is not implemented.

`catalogued_only` means the source capability is preserved in the registry but not implemented in the current MVP.

`production_verified` is a separate evidence dimension and remains false for all capabilities.

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

“Dynamic” in v1.6 means continuously recomputed within the deterministic browser simulation. It does **not** mean live field streaming.

All network, fleet, incident, scenario, forecast, intervention, QCS, twin-risk, routing, signal, emergency and preventive-command outputs are proof-of-concept simulation data. No quantum sensor, quantum communication link, live road feed, production V2X infrastructure, traffic-signal controller, government feed, emergency dispatch integration, vehicle actuator or safety-certified control loop is connected.

Production readiness requires authenticated data interfaces, calibrated real sensing or approved high-fidelity data, integration contracts, cyber security and privacy controls, safety engineering, authorization policies, auditability, resilience testing, operational observability, algorithm validation and controlled field or high-fidelity validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
