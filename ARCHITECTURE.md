# Architecture and Evidence Boundary — Engineering MVP v1.8

## Objective

Version 1.8 extends the deterministic predictive traffic orchestration architecture with three governance-oriented layers:

1. deterministic decision explanation;
2. configurable policy guardrails;
3. scenario replay and sensitivity analysis.

The architecture remains a proof-of-concept simulation. Recommendation, policy screening and replay do not execute field control.

## Logical layers

### 1. Source and ingestion layer

Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds.

The present MVP uses deterministic fixtures and simulation data. No live field or government feed is connected.

### 2. Network-state layer

`data/network.json` defines the demo graph used by `engine/trafficEngine.js` for validation, travel-time calculation, shortest-path routing, incidents, demand, signal allocation and network metrics.

The conventional shortest path remains an auditable time-only baseline.

### 3. Operations and scenario layer

`engine/operationsEngine.js` provides:

- concurrent incidents;
- operating scenarios;
- operational metrics;
- deterministic mitigation baselines;
- before/after comparison;
- short-horizon forecast baseline;
- operational snapshot export.

`data/operations_scenarios.json` remains the scenario-fixture source used by both the core app and the v1.8 replay workspace.

### 4. QCS proxy risk layer

`engine/qcsRiskEngine.js` converts simulated QCS observations into deterministic risk assessments.

No output is evidence of connected quantum sensing, quantum communication or production vehicle integration.

### 5. Dynamic Risk Digital Twin layer

`engine/dynamicRiskTwinEngine.js` constructs a shared edge-level state from:

- network load: `0.30`;
- incident severity: `0.28`;
- QCS proxy risk: `0.32`;
- road closure: `0.10`.

The twin tracks:

- composite risk score;
- risk level;
- trend and delta;
- current load;
- incident severity;
- closure state;
- QCS proxy risk and observation presence;
- simulated travel time.

The same twin snapshot feeds route, signal and virtual emergency decisions.

### 6. Predictive network projection layer

`engine/predictiveOrchestrationEngine.js` projects simulated network state at standard horizons:

- 5 minutes;
- 15 minutes;
- 30 minutes;
- 60 minutes.

Projection inputs are transparent and deterministic:

- current load;
- congestion momentum;
- incident severity;
- neighboring-edge pressure;
- horizon duration;
- closure persistence.

The forecast layer preserves `trainedModel=false`.

### 7. Predictive risk propagation layer

`forecastRiskPropagation()` rebuilds a Dynamic Risk Digital Twin for each projected network state.

Each horizon records average risk, maximum risk, high/critical edge count, emerging hotspots, projected load and risk delta.

### 8. Candidate intervention layer

The current explicit candidate set is:

- `observe_only`;
- `balanced_preemptive`;
- `network_relief`;
- `safety_priority`.

`applyPredictiveIntervention()` targets the highest predicted-risk open edges according to candidate parameters.

Closed roads remain closed through the intervention logic.

### 9. Multi-horizon evaluation layer

`evaluateOrchestrationCandidate()` evaluates each candidate at every forecast horizon.

For every candidate/horizon pair it:

1. applies the simulated intervention;
2. rebuilds the future twin;
3. calculates operational metrics;
4. generates the shared route/signal/emergency decision bundle;
5. calculates the deterministic objective score.

The objective includes average risk, maximum risk, high/critical share, average load and average edge travel time.

### 10. Robust orchestration layer

`orchestratePredictiveRisk()` produces the v1.7 autonomous recommendation.

The final score is:

`robustScore = 0.80 × weightedMeanScore + 0.20 × worstHorizonScore + interventionPenalty`

The returned result preserves:

- `simulation=true`;
- `autonomousRecommendation=true`;
- `autoApply=false`;
- `humanApprovalRequired=true`;
- `productionControlConnected=false`;
- `safetyCertified=false`.

### 11. Explainability layer

`engine/explainableOrchestrationEngine.js` adds `explainOrchestration()`.

It reconstructs the deterministic robust score and reports:

- weighted-mean contribution;
- worst-horizon contribution;
- intervention penalty;
- reconstructed score;
- differences versus `observe_only`;
- final average-risk difference;
- final maximum-risk difference;
- final load difference;
- pairwise comparison against each alternative.

The explanation is arithmetic and model-internal.

The output explicitly preserves:

- `explanationType=deterministic_arithmetic_decision_explanation`;
- `causalClaim=false`.

This prevents arithmetic score decomposition from being presented as causal inference or a safety case.

### 12. Policy guardrail layer

`data/orchestration_policy.json` defines the current demo policy.

It currently constrains:

- maximum target count;
- maximum load reduction;
- maximum incident relief;
- maximum intervention penalty;
- simulation-only mode;
- mandatory human approval;
- automatic-application prohibition;
- production-control prohibition;
- closed-road preservation invariant;
- minimum candidate count.

`evaluatePolicyGuardrails()` evaluates ranked candidates and identifies the highest-ranked compliant candidate.

The policy-selected candidate may therefore differ from the raw scoring winner if a more aggressive candidate violates constraints.

The demo policy is not a road authority policy and is not regulatory evidence.

### 13. Policy-aware recommendation layer

`buildExplainablePolicyOrchestration()` combines:

1. predictive orchestration;
2. policy evaluation;
3. compliant candidate selection;
4. deterministic explanation;
5. scenario replay.

If no candidate satisfies the policy, the result is blocked rather than silently selecting a prohibited plan.

The returned object preserves:

- `autoApply=false`;
- `humanApprovalRequired=true`;
- `productionControlConnected=false`.

### 14. Scenario replay layer

`buildScenarioReplay()` compares the policy-selected plan with the `observe_only` baseline at each shared horizon.

Every replay frame includes:

- baseline objective metrics;
- selected-plan objective metrics;
- improvement deltas;
- selected route;
- virtual emergency decision;
- signal phases.

Replay outputs include:

- `replayOnly=true`;
- `fieldExecution=false`.

This is a deterministic comparison of simulated alternatives, not a reconstruction of real field history.

### 15. Sensitivity layer

`runOrchestrationSensitivity()` performs what-if analysis across combinations of:

- forecast horizon sets;
- route safety weights.

The v1.8 runtime currently evaluates risk weights `0.8`, `1.8`, `3.5` and horizon sets `5/15` and `5/15/30/60`.

Each sensitivity result reports:

- selected candidate;
- robust score;
- final route minutes;
- final route average risk;
- `autoApply=false`.

### 16. Runtime UI separation

The core `app.js` retains the v1.7 operational and predictive interface.

`v18Runtime.js` is a separate browser module loaded by `index.html`. It adds the v1.8 governance panel without coupling policy rendering into the traffic engine.

The panel exposes:

- policy PASS/BLOCK state;
- policy-selected plan;
- score reconstruction;
- reason table for alternatives;
- policy compliance table;
- scenario replay table;
- sensitivity table.

The v1.8 runtime uses the currently selected scenario identifier, reconstructs that scenario from the base fixture data, and evaluates the policy/replay layer against that scenario.

It does not yet consume every transient random load drift or manually injected in-memory incident from the core `app.js` state. This is an explicit synchronization limitation of v1.8.

### 17. Preventive command simulation layer

`engine/preventiveCommandEngine.js` remains downstream of current-state route analysis and generates simulated vehicle-response recommendations from directly observed QCS proxy information.

Every command remains simulated, actuator-disconnected and non-certified.

### 18. Dynamic capability evidence layer

`coverage/coverageModel.js` maintains one row for every source-registry capability.

Current CI-validated coverage remains:

- 33 implemented-demo;
- 17 represented-demo;
- 73 catalogued-only;
- 0 production-verified.

Version 1.8 does not promote additional historical capabilities because increased explainability and governance depth alone is not sufficient evidence for a new historical feature mapping.

### 19. Governance and assurance layer

The repository separates:

- source provenance;
- demo implementation;
- predictive assumptions;
- policy configuration;
- production verification.

The code and tests explicitly protect against:

- calling QCS fixtures real quantum data;
- claiming a trained prediction model where none exists;
- presenting predictive baselines as validated forecasts;
- reopening closed roads through simulated intervention;
- treating autonomous recommendation as field execution;
- bypassing mandatory human approval;
- treating arithmetic explanation as causal proof;
- accepting over-limit intervention candidates through the policy gate;
- treating scenario replay as field reconstruction;
- claiming production verification without independent evidence.

## Validation

GitHub Actions currently validates:

1. Registry and evidence integrity.
2. Traffic engine.
3. Operations engine.
4. QCS proxy risk.
5. Dynamic Risk Digital Twin.
6. Twin-aware route, signal and emergency logic.
7. Preventive command logic.
8. Predictive network projection.
9. Multi-horizon risk propagation.
10. Predictive intervention and closed-road preservation.
11. Autonomous candidate ranking.
12. Deterministic recommendation regression.
13. Robust-score explanation reconstruction.
14. Alternative-plan explanation.
15. Policy rejection of over-limit candidates.
16. Policy-aware recommendation boundary.
17. Scenario replay.
18. Sensitivity determinism.
19. Coverage semantics.
20. JavaScript syntax for the core and v1.8 runtime modules.
21. Static and runtime UI wiring.
22. Manifest-driven feature-file existence.
23. Policy-file safety boundaries.
24. QCS fixture validation.

Latest successful CI before this documentation update reports:

- 45/45 tests passing;
- 31 required/dynamic files checked;
- 81 static DOM bindings;
- 9 runtime predictive bindings;
- 11 runtime explainability/policy/replay bindings;
- 12 road nodes;
- 17 road links;
- 5 scenarios;
- 4 virtual emergency units;
- 6 QCS observations.

## Production-readiness boundary

Production readiness remains outside the present proof-of-concept.

The forecast layer is deterministic and untrained. The orchestration layer ranks simulated alternatives but never applies them automatically. The explanation layer is arithmetic, not causal. The policy file is an engineering-demo policy, not an approved operating policy. Replay is a simulation comparison, not field evidence.

Production deployment would require authenticated real-time interfaces, approved high-fidelity data, validated predictive models where appropriate, authority-approved operating policies, traffic-controller and emergency-agency integration, authorization and human-oversight controls, cyber-security and privacy engineering, safety and hazard analysis, audit logs, observability, resilience testing, performance benchmarking, staged deployment and controlled field validation.
