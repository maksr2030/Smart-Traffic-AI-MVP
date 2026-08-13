# Smart AI Traffic Platform — Engineering MVP v1.5

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

## Engineering MVP v1.5

Version 1.5 extends the v1.4 QCS risk lab into a closed deterministic decision loop for demonstration purposes:

1. evaluate simulated QCS road-risk observations;
2. compare the conventional fastest route with a risk-aware route;
3. calculate the safety-versus-time tradeoff;
4. build a simulated preventive command plan for the selected route;
5. export the resulting QCS, routing and command summaries inside the operational snapshot.

The browser continues to load the feature registry dynamically from `data/features.json`, so newly recovered registry files are automatically included without maintaining a second hard-coded file list.

## Risk-aware routing engine

`engine/riskAwareRoutingEngine.js` adds deterministic time-plus-risk routing.

The conventional route remains visible as a baseline. The risk-aware route uses the same traffic graph and travel-time model, then applies a transparent QCS proxy-risk penalty to each road segment.

The route output reports:

- conventional route time and road sequence;
- risk-aware route time and road sequence;
- time and distance deltas;
- average-risk delta;
- maximum route risk;
- observed versus unknown QCS-risk segments;
- the configured `riskWeight`;
- a deterministic risk-adjusted route cost.

The UI exposes four safety/time settings: `0.8`, `1.6`, `2.5`, and `3.5`.

A separate `avoidRiskScore` option supports hard avoidance of directly observed extreme-risk segments. A value of `100` explicitly disables hard blocking; lower values enable the threshold. The zero-risk-weight test verifies that the engine returns to the travel-time routing baseline when hard blocking is disabled.

This module is not represented as safety-certified navigation.

## Preventive vehicle command simulator

`engine/preventiveCommandEngine.js` translates route-segment QCS proxy assessments into an auditable simulated command plan.

Possible command types include:

- `set_target_speed`;
- `arm_stability_control`;
- `prepare_adaptive_suspension`;
- `enable_blind_spot_guard`;
- `enable_curve_speed_assist`;
- `enable_weather_degraded_mode`;
- `broadcast_v2x_hazard_proxy`;
- `arm_brake_assist`;
- `request_risk_aware_reroute`;
- `monitor`.

The plan reports observed and unknown route segments, command counts, command priorities, reroute requests, brake-assist readiness and simulated hazard broadcasts.

The command layer enforces:

- `simulation: true`;
- `actuatorConnected: false`;
- `safetyCertified: false`;
- `quantumCommunicationClaim: false` for the V2X proxy broadcast.

Unobserved route segments are never silently assigned fabricated QCS measurements; they remain explicitly unknown and receive a monitor-only command.

## QCS risk and preventive-response lab

`engine/qcsRiskEngine.js` remains the deterministic proxy risk source for the v1.5 decision loop. It consumes simulated road-quality, roughness, visibility, weather, blind-spot, curvature, friction, hidden-hazard and vehicle-speed observations.

The QCS lab produces risk scores, risk levels, suggested preventive speeds, response recommendations and proxy hazard broadcasts while preserving the explicit boundary that no quantum hardware is connected.

## QCS demo coverage

Executable demo logic meaningfully represents:

- `QCS-80` — vehicle stability and skid-prevention risk logic.
- `QCS-85` — rough-terrain response logic.
- `QCS-86` — blind-spot risk logic.
- `QCS-87` — severe-weather response logic.
- `QCS-88` — sharp-turn risk logic.
- `QCS-92` — road-quality and vehicle-response logic.
- `QCS-101` — deterministic risk analysis plus risk-aware route selection and preemptive command-plan logic.

Related QCS capabilities such as `QCS-93`, `QCS-94`, `QCS-95`, `QCS-103` and `QCS-104` remain represented by proxy workflows or integration boundaries rather than overstated as fully implemented.

## Validated coverage

Latest successful CI validation reports:

- 123 total registry records.
- **31 `implemented_demo`.**
- **19 `represented_demo`.**
- **73 `catalogued_only`.**
- **0 `production_verified`.**

The current automated suite passes **27/27 tests**. It covers registry provenance, traffic routing, city operations, QCS proxy risk, risk-aware routing, preventive commands, coverage semantics and static application wiring.

The static smoke check validates:

- **26 required/dynamic files**;
- **73 DOM bindings**;
- 12 simulated road nodes;
- 17 road links;
- 5 operating scenarios;
- 4 virtual emergency units;
- 6 QCS simulated observations.

## Existing operational capabilities

The branch also retains:

1. Graph traffic engine and network validation.
2. Congestion-weighted conventional routing.
3. Incident-aware rerouting.
4. Deterministic adaptive signal allocation.
5. Concurrent multi-incident scenarios.
6. City operations and deterministic mitigation baselines.
7. Transparent short-horizon forecast baselines.
8. Simulated emergency-fleet dispatch.
9. Before/after intervention comparison.
10. QCS corridor risk analysis.
11. Risk-aware routing comparison.
12. Preventive command-plan simulation.
13. Operational JSON export carrying `simulation: true` and the latest QCS/routing/command summaries.
14. Coverage CSV export.
15. Dynamic bilingual feature and evidence views.

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

All network, fleet, incident, scenario, forecast, intervention, QCS, risk-aware routing and preventive-command outputs are proof-of-concept simulation data. No quantum sensor, quantum communication link, live road feed, production V2X infrastructure, vehicle actuator or safety-certified control loop is connected.

Production readiness requires authenticated data interfaces, calibrated real sensing or approved high-fidelity data, integration contracts, cyber security and privacy controls, safety engineering, auditability, resilience testing, observability and controlled field or high-fidelity validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
