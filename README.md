# Smart AI Traffic Platform — Engineering MVP v1.8

Public engineering proof-of-concept for a city-scale and sovereign traffic intelligence platform.

## Unified registry

The branch currently exposes 123 source records through a dynamic bilingual registry loaded from `data/features.json`:

- 52 verified Main Legacy historical features: 1-14 and 200-237.
- 23 conversation-recovered capabilities.
- 5 additional project-history capabilities.
- 25 QTOS capabilities.
- 18 directly verified QCS track-local capabilities.

Direct QCS registry records currently include `QCS-80`, `QCS-85`-`QCS-89`, `QCS-92`-`QCS-95`, and `QCS-97`-`QCS-104`.

Main Legacy 15-199 remains reserved pending verified direct recovery.

## Engineering MVP v1.8 — Explainable Orchestration, Policy Guardrails & Scenario Replay

Version 1.8 extends the v1.7 Predictive Risk & Autonomous Orchestration layer with explicit decision explanation, a configurable policy gate, scenario replay, and sensitivity analysis.

The new implementation consists of:

- `engine/explainableOrchestrationEngine.js`;
- `data/orchestration_policy.json`;
- `v18Runtime.js`;
- `tests/explainableOrchestrationEngine.test.js`.

The v1.8 layer does not change the field-control boundary. It preserves:

- `simulation=true`;
- `autoApply=false`;
- `humanApprovalRequired=true`;
- `productionControlConnected=false`;
- `causalClaim=false` for the explanation layer;
- `trainedModel=false` for the predictive baseline.

## Explainable orchestration

`explainOrchestration()` explains the selected simulated intervention by decomposing the same deterministic score used by the orchestrator.

The v1.7 robust score is reconstructed as:

`0.80 × weightedMeanScore + 0.20 × worstHorizonScore + interventionPenalty`

The explanation reports:

- contribution from the weighted multi-horizon mean;
- contribution from the worst forecast horizon;
- intervention penalty;
- reconstructed robust score;
- difference versus `observe_only`;
- final average-risk difference;
- final maximum-risk difference;
- final average-load difference;
- why each alternative lost relative to the selected candidate.

This is an arithmetic decision explanation. It is not a causal proof, safety case, regulatory justification, or production decision certificate.

## Policy guardrails

`data/orchestration_policy.json` defines the current engineering-demo policy boundary.

The policy currently constrains:

- maximum number of targeted edges;
- maximum simulated load reduction;
- maximum simulated incident relief;
- maximum intervention penalty;
- mandatory simulation-only operation;
- mandatory human approval;
- prohibition of automatic application;
- prohibition of production-control connection;
- preservation of closed-road state through the underlying intervention invariant;
- minimum candidate-set size.

`evaluatePolicyGuardrails()` screens candidate plans and returns the highest-ranked compliant plan rather than automatically accepting the raw scoring winner.

The current policy file is a demo policy, not a public-road operating rule set. A production deployment would require policy supplied and approved by the relevant road, emergency, safety, cyber-security, privacy and regulatory authorities.

## Scenario replay

`buildScenarioReplay()` compares the policy-selected candidate with `observe_only` at every forecast horizon.

The standard replay frames are:

- 5 minutes;
- 15 minutes;
- 30 minutes;
- 60 minutes.

Each replay frame reports the simulated difference in:

- objective score;
- average risk;
- maximum risk;
- average network load;
- average edge travel time;
- network stress index.

The frame also preserves the selected simulated route, virtual emergency decision and signal timing plan for that horizon.

Replay is retrospective comparison inside the deterministic simulation. It does not execute or recreate real-world road operations.

## Sensitivity analysis

`runOrchestrationSensitivity()` runs controlled what-if combinations across forecast horizons and route safety weights.

The v1.8 browser panel currently evaluates:

- risk weights `0.8`, `1.8`, and `3.5`;
- horizon sets `5/15` and `5/15/30/60` minutes.

Each row reports:

- selected candidate;
- robust score;
- final route time;
- final route average twin risk;
- preserved `autoApply=false` boundary.

This provides a visible check of how recommendation and route behavior respond to policy-relevant modeling choices.

## v1.8 runtime panel

`v18Runtime.js` adds a separate Explainable Orchestration panel to the existing MVP page.

It displays:

- policy PASS/BLOCK status;
- policy-selected plan;
- reconstructed robust score;
- 60-minute replay improvement;
- alternative-plan comparison table;
- policy compliance table;
- 5/15/30/60-minute scenario replay table;
- horizon × safety-weight sensitivity table.

The v1.8 runtime intentionally reads the currently selected scenario fixture and reconstructs that scenario from `data/network.json` and `data/operations_scenarios.json`. It does not yet consume every transient random browser drift or manually injected in-memory incident created after page load. This limitation is explicit and avoids claiming state synchronization that is not implemented.

## Predictive orchestration retained from v1.7

`engine/predictiveOrchestrationEngine.js` continues to:

1. project the simulated network at 5, 15, 30 and 60 minutes;
2. rebuild a Dynamic Risk Digital Twin for each future state;
3. identify emerging hotspots;
4. evaluate `observe_only`, `balanced_preemptive`, `network_relief`, and `safety_priority`;
5. rank candidates across all horizons;
6. return an autonomous recommendation without applying it.

Forecasting remains a deterministic engineering baseline and not a trained production AI model.

## Dynamic Risk Digital Twin retained from v1.6

`engine/dynamicRiskTwinEngine.js` continues to fuse:

- network load with weight `0.30`;
- incident severity with weight `0.28`;
- QCS proxy risk with weight `0.32`;
- closure state with weight `0.10`.

The same future twin snapshot is shared by route, signal and virtual emergency decisions inside each candidate/horizon evaluation.

## QCS and QTOS demo coverage

Executable QCS proxy logic meaningfully represents:

- `QCS-80` — vehicle stability and skid-prevention risk logic.
- `QCS-85` — rough-terrain response logic.
- `QCS-86` — blind-spot risk logic.
- `QCS-87` — severe-weather response logic.
- `QCS-88` — sharp-turn risk logic.
- `QCS-92` — road-quality and vehicle-response logic.
- `QCS-101` — deterministic risk analysis, twin-aware route selection and preemptive command-plan logic.

QTOS executable demo mappings remain:

- `QTOS-02` — Dynamic City Traffic Digital Twin;
- `QTOS-03` — predictive congestion/risk baseline;
- `QTOS-05` — network-wide predictive load-balancing recommendation;
- `QTOS-21` — proactive crisis-management recommendation workflow;
- `QTOS-22` — multi-horizon candidate simulation and ranking.

Version 1.8 deliberately does not increase historical capability coverage counts solely because explainability and governance depth increased. No historical feature is promoted without a direct semantic mapping.

## Validated coverage

Latest successful CI validation before this documentation update reports:

- 123 total registry records.
- 33 `implemented_demo`.
- 17 `represented_demo`.
- 73 `catalogued_only`.
- 0 `production_verified`.

The automated suite passes 45/45 tests.

The static smoke check validates:

- 31 required/dynamic files;
- 81 static DOM bindings;
- 9 runtime Predictive Orchestration bindings;
- 11 runtime Explainability/Policy/Replay bindings;
- 12 simulated road nodes;
- 17 road links;
- 5 operating scenarios;
- 4 virtual emergency units;
- 6 QCS simulated observations.

## Operational capabilities demonstrated

The branch currently demonstrates:

1. Graph traffic engine and validation.
2. Conventional congestion-aware routing.
3. Incident-aware rerouting.
4. Multi-incident scenarios.
5. Deterministic operational metrics and mitigation baselines.
6. QCS proxy road-risk analysis.
7. Dynamic Risk Digital Twin state and trends.
8. Twin-aware route comparison.
9. Risk-aware signal-priority simulation.
10. Risk-aware virtual emergency dispatch.
11. Preventive vehicle-command simulation.
12. 5/15/30/60-minute risk propagation.
13. Emerging-hotspot detection.
14. Multi-plan intervention generation.
15. Robust multi-horizon candidate ranking.
16. Autonomous recommendation with human approval boundary.
17. Arithmetic score explanation.
18. Policy-compliance screening.
19. Observe-only versus selected-plan replay.
20. Horizon and safety-weight sensitivity analysis.
21. Operational JSON and coverage export from the core v1.7 application.
22. Dynamic bilingual feature and evidence views.

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

“Predictive” means deterministic simulated projection over short horizons, not a trained validated production forecast.

“Autonomous Orchestration” means autonomous ranking and recommendation inside the simulation, not automatic field execution.

“Explainable” means deterministic arithmetic decomposition and comparison of the implemented scoring logic, not causal proof or regulatory certification.

“Policy Guardrails” means the current configurable engineering-demo constraints, not approved public-road policy.

“Scenario Replay” means simulated comparison of candidate and baseline outcomes, not reconstruction of field events.

No quantum sensor, quantum communication link, live road feed, production V2X infrastructure, traffic-signal controller, government feed, emergency dispatch integration, vehicle actuator or safety-certified control loop is connected.

Production readiness requires authenticated data interfaces, calibrated sensing or approved high-fidelity datasets, validated forecasting where appropriate, approved operating policy, cyber-security and privacy controls, safety engineering, authorization and human-oversight design, auditability, resilience testing, observability, field-controller integration validation, emergency-agency controls and staged controlled deployment evidence.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
