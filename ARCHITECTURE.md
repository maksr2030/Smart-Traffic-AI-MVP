# Architecture and Evidence Boundary — Executable Engineering MVP v1.9.1

## Objective

Version 1.9.1 completes Stage C of the Smart Traffic AI MVP production-hardening path for the assembled executable: operational mutations now pass through one deterministic Unified State Bus owned by `engine/authoritativeRuntimeStore.js`, while SHA-256 decision integrity, Exact Replay, acquisition review and browser E2E assurance remain active.

The architecture remains an engineering proof-of-concept simulation. No recommendation, policy decision, audit entry or replay result executes field control.

## Architecture overview

The v1.9.1 executable architecture adds a strict state-authority relationship to the existing traffic-intelligence stack:

1. deterministic fixtures and browser actions generate explicit operational events;
2. `engine/authoritativeRuntimeStore.js` owns the current `smart-traffic-live-state/v1` state;
3. `engine/unifiedStateBus.js` is the deterministic reducer for accepted mutations;
4. the transformed executable `app.js` derives its legacy UI mirror from that authoritative state;
5. traffic, QCS, twin, predictive and policy logic operate on the authoritative snapshots/mutations;
6. `hardeningRuntime.js` directly subscribes to the same state instead of polling/reconciling a second state;
7. decisions are fingerprinted and chained with SHA-256;
8. captured state/policy/inputs can be rerun by Exact Replay;
9. the same assembled executable build is validated in desktop Chromium and mobile WebKit E2E.

## Logical layers

### 1. Source and ingestion layer

Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds.

The present MVP uses deterministic fixtures and simulated inputs. No live government or field feed is connected.

### 2. Network-state and traffic-engine layer

`data/network.json` defines the demo graph used by `engine/trafficEngine.js` for validation, travel-time calculation, shortest-path routing, incidents, demand, signal allocation and network metrics.

### 3. Operations and scenario layer

`engine/operationsEngine.js` provides concurrent incidents, operating scenarios, deterministic metrics, mitigation baselines, before/after comparison, short-horizon forecast baseline and operational snapshot export.

### 4. QCS proxy-risk layer

`engine/qcsRiskEngine.js` converts simulated QCS observations into deterministic proxy-risk assessments.

No output is evidence of real quantum sensing, real quantum V2V/V2I communication or production vehicle integration.

### 5. Dynamic Risk Digital Twin layer

`engine/dynamicRiskTwinEngine.js` constructs shared edge-level risk state from:

- network load: `0.30`;
- incident severity: `0.28`;
- QCS proxy risk: `0.32`;
- road closure: `0.10`.

The twin tracks composite risk, risk level, trend, delta, load, incident severity, closure state, QCS proxy presence and simulated travel time.

### 6. Predictive network projection layer

`engine/predictiveOrchestrationEngine.js` projects deterministic simulated network state at 5, 15, 30 and 60 minutes.

Projection remains transparent and retains `trainedModel=false`.

### 7. Predictive risk-propagation layer

`forecastRiskPropagation()` rebuilds a Dynamic Risk Digital Twin for every projected state and records average risk, maximum risk, high/critical edge count, emerging hotspots, projected load and risk delta.

### 8. Candidate intervention layer

The explicit candidate set remains:

- `observe_only`;
- `balanced_preemptive`;
- `network_relief`;
- `safety_priority`.

Closed roads remain closed through the simulated intervention logic.

### 9. Multi-horizon evaluation layer

`evaluateOrchestrationCandidate()` evaluates every candidate at every forecast horizon, rebuilding the future twin, calculating metrics and producing the shared route/signal/emergency decision bundle.

### 10. Robust orchestration layer

`orchestratePredictiveRisk()` ranks candidates using:

`robustScore = 0.80 × weightedMeanScore + 0.20 × worstHorizonScore + interventionPenalty`

The result preserves:

- `simulation=true`;
- `autonomousRecommendation=true`;
- `autoApply=false`;
- `humanApprovalRequired=true`;
- `productionControlConnected=false`;
- `safetyCertified=false`.

### 11. Explainability layer

`engine/explainableOrchestrationEngine.js` reconstructs the deterministic robust score and compares the selected candidate with alternatives.

The explanation is arithmetic/model-internal and explicitly preserves `causalClaim=false`.

### 12. Policy guardrail layer

`data/orchestration_policy.json` constrains target count, simulated load reduction, incident relief, intervention penalty, simulation-only operation, mandatory human approval, automatic-application prohibition and production-control prohibition.

The policy is an engineering-demo policy, not road-authority operating policy.

### 13. Policy-aware recommendation layer

`buildExplainablePolicyOrchestration()` combines predictive orchestration, policy evaluation, compliant-candidate selection, arithmetic explanation and replay.

If no candidate satisfies policy, the result is blocked.

### 14. Scenario replay layer

`buildScenarioReplay()` compares the policy-selected plan with `observe_only` at every shared horizon.

This is simulated candidate comparison, not field-event reconstruction.

### 15. Sensitivity layer

`runOrchestrationSensitivity()` performs what-if analysis across forecast horizon sets and route-safety weights.

### 16. Preventive command simulation layer

`engine/preventiveCommandEngine.js` produces simulated preventive vehicle-response recommendations from directly observed QCS proxy information.

Every command remains actuator-disconnected and non-certified.

### 17. Acquisition presentation layer

`acquisitionRuntime.js` adds the acquisition-ready entry experience, executive navigation and complete feature explorer while preserving the distinction among implemented demo, represented demo, catalogued only and production verified.

### 18. Executive Guided Demo layer

The deployed guided runtime provides an 11-step executive path through baseline state, incident injection, Dynamic Risk Twin, prediction, candidate comparison, explanation, policy gate, scenario replay, Acquisition Decision Room and capability portfolio.

### 19. Acquisition Decision Room layer

`decisionRoomRuntime.js` and `decisionRoom.css` expose strategic acquisition rationale, architecture snapshot, evidence/readiness matrix, due-diligence links, MVP-to-production roadmap, deployment/transaction models, IP disclosure boundary and buyer next action.

### 20. Authoritative unified-state layer

`engine/unifiedStateBus.js` defines schema:

`smart-traffic-live-state/v1`

The state includes revision, monotonic sequence, tick, simulation-running status, scenario, current/base network snapshots, QCS observations, fleet, route parameters, emergency target, demo policy, active incidents, twin snapshot, predictive snapshot, last decision and bounded event history.

`engine/authoritativeRuntimeStore.js` is the singleton owner of that state. It exposes cloned snapshots and a deterministic dispatch interface. Consumers cannot mutate the stored state by modifying returned snapshots or subscriber payloads.

Authoritative Stage C operational events include:

- `traffic_drift_applied`;
- `incident_injected`;
- `incident_cleared`;
- `scenario_loaded`;
- `intervention_applied`;
- `decision_inputs_updated`;
- `route_parameters_updated`;
- `emergency_target_updated`;
- `simulation_running_changed`;
- `qcs_observations_updated`;
- `fleet_updated`;
- `twin_updated`;
- `predictive_updated`;
- `policy_updated`;
- `decision_recorded`;
- `manual_reset`.

`runtime_reconciled` is retained in the reducer only for compatibility/backward use. The normal v1.9.1 executable path no longer relies on a periodic reconciliation event.

### 21. Executable source-migration layer

The historical raw `app.js` remains in the repository, but the executable artifact is assembled through `scripts/build-executable-site-v190.mjs` and transformed by `scripts/prepare-authoritative-runtime-v191.mjs`.

The Stage C transformation:

- imports the authoritative runtime store;
- initializes the unified state from the loaded fixtures;
- converts simulation drift to `traffic_drift_applied`;
- converts incident mutation to `incident_injected`;
- converts scenario selection to `scenario_loaded`;
- converts simulated mitigation application to `intervention_applied`;
- converts route/emergency/risk UI changes to `decision_inputs_updated`;
- converts pause/resume to `simulation_running_changed`;
- converts reset to `manual_reset`;
- records twin and predictive outputs with `twin_updated` and `predictive_updated`;
- exposes `getUnifiedState()`, `dispatch()` and `subscribe()` through `window.smartTrafficRuntime`;
- makes the transformed legacy top-level `state` a derived UI mirror of the authoritative state.

This build-time distinction is important: the architectural source-of-truth claim applies to the **assembled v1.9.1 executable**, not to an isolated reading of the untransformed historical `app.js` source file.

### 22. Direct hardening-state subscription layer

`hardeningRuntime.js` no longer builds and reconciles a separate live-state copy.

It waits for the authoritative runtime, reads `getUnifiedState()`, subscribes through `runtime.subscribe()`, and displays the same revision/state used by the executable runtime. There is no normal Stage C polling/reconciliation loop.

When an audited decision is captured, the hardening layer uses that exact authoritative snapshot, links it to the ledger, and dispatches `decision_recorded` back through the same state authority.

### 23. Canonical cryptographic fingerprint layer

`engine/auditHash.js` provides deterministic canonical JSON serialization and SHA-256 through Web Crypto.

Fingerprints are used for state, inputs, policy, outputs and chained ledger entries.

Evidence boundary:

- cryptographic SHA-256 hash: yes;
- digital signature: no;
- blockchain anchoring: no;
- non-repudiation: no;
- production audit certification: no.

### 24. Decision integrity ledger layer

`engine/decisionLedgerEngine.js` uses schema:

`smart-traffic-decision-ledger/v1`

Each entry contains sequence, authoritative state revision, state/input/policy/output fingerprints, previous entry hash, current entry hash, method metadata and evidence flags.

`verifyLedgerChain()` recalculates the chain and detects stored-entry mutation.

This is cryptographic integrity/tamper evidence within the engineering ledger, not a legally signed audit trail.

### 25. Exact deterministic replay layer

`engine/exactReplayEngine.js` captures state, inputs, policy and deterministic orchestration output into:

`smart-traffic-exact-replay-package/v1`

Replay reruns `buildExplainablePolicyOrchestration()` and checks state hash, input hash, policy hash, output hash, selected candidate and robust score.

An exact match means software/input deterministic exactness inside the captured MVP environment. It is not evidence that real traffic would reproduce the same physical outcome.

### 26. Runtime Integrity UI layer

`hardeningRuntime.js` and `hardeningRuntime.css` expose `Authoritative Runtime State, Decision Ledger & Exact Replay` in the Acquisition Decision Room.

The panel shows authoritative state revision, shortened state hash, ledger-entry count, chain status, recent ledger hashes, recent authoritative state events and controls to capture, verify, replay and export an engineering audit bundle.

### 27. Dynamic capability evidence layer

`coverage/coverageModel.js` maintains one row for every unified source-registry capability.

Current validated coverage remains:

- 33 implemented-demo;
- 17 represented-demo;
- 73 catalogued-only;
- 0 production-verified.

Stage C does not change those counts merely because state governance became stronger.

### 28. Browser E2E assurance layer

`playwright.config.js` and `e2e/executable-platform.spec.js` test the assembled executable site.

Current browser projects:

- desktop Chromium at 1440 × 1000;
- mobile WebKit emulation at 390 × 844 with touch enabled.

Six scenarios run in both projects, 12 browser tests total:

1. entry-gate and mobile-action usability;
2. Decision Room, Hardening Panel, Guided Demo, runtime version and state-authority loading;
3. decision capture, ledger verification and Exact Replay;
4. authoritative incident mutation with no `runtime_reconciled` dependency;
5. authoritative route/emergency/risk input mutation;
6. explicit authoritative traffic-drift mutation with exact revision/tick progression.

Current engineering result: 12/12 passed.

WebKit mobile emulation is not physical-iPhone acceptance evidence.

### 29. Single executable build layer

`scripts/build-executable-site-v190.mjs` is the shared builder. The filename is historical; the current output is v1.9.1.

The build runs the v1.8.3 compatibility patch and then the v1.9.1 authoritative migration before assembling the same artifact used by browser E2E and the Pages workflow.

This materially reduces the risk of validating one artifact while publishing another.

### 30. Governance and assurance boundary

The repository separates:

- historical source provenance;
- demo implementation coverage;
- authoritative executable runtime state;
- deterministic decision logic;
- policy configuration;
- cryptographic integrity evidence;
- browser compatibility evidence;
- production verification.

The code/tests protect against unsupported claims including:

- real quantum data or communication;
- trained production forecasting where none exists;
- automatic field execution;
- bypassing human approval;
- causal explanation;
- regulatory policy approval;
- real-world field-event replay;
- digital signature/non-repudiation/blockchain anchoring;
- physical iPhone validation from WebKit emulation;
- production verification without independent evidence.

## Runtime data flow — v1.9.1 executable

```text
Demo fixtures / browser actions
        ↓
Explicit operational events
        ↓
engine/authoritativeRuntimeStore.js
        ↓
engine/unifiedStateBus.js
smart-traffic-live-state/v1
        ↓
Authoritative state snapshot
        ├──────────────→ transformed app.js UI mirror
        ├──────────────→ Traffic / Operations / QCS engines
        ├──────────────→ Dynamic Risk Twin
        ├──────────────→ Predictive Orchestration
        ├──────────────→ Explainability + Policy
        └──────────────→ hardeningRuntime direct subscription
                                ↓
                         SHA-256 fingerprints
                                ↓
                       Decision Integrity Ledger
                                ↓
                          Exact Replay package
```

The prior v1.9 architecture used synchronization around an app-owned runtime. Stage C removes that normal-path ownership split in the assembled executable: the bus/store is authoritative and the legacy UI state is derived.

## Validation

Version 1.9.1 Stage C validation covers:

1. Registry and evidence integrity.
2. Traffic/operations engines.
3. QCS proxy risk.
4. Dynamic Risk Digital Twin.
5. Twin-aware route/signal/emergency logic.
6. Preventive command logic.
7. Predictive projection and multi-horizon propagation.
8. Candidate ranking and deterministic regression.
9. Explainability and policy guardrails.
10. Scenario replay and sensitivity analysis.
11. Unified-state reducer determinism and immutable behavior.
12. Authoritative store snapshot isolation.
13. Incident mutation through authoritative reducer.
14. Traffic drift/tick mutation through authoritative reducer.
15. Decision-input and running-state governance through the same bus.
16. Explicit intervention replacement through the bus.
17. Subscriber isolation from store mutation.
18. Stable canonical JSON and SHA-256 fingerprints.
19. SHA-256 decision-chain verification.
20. Ledger tamper detection.
21. Captured Exact Replay equality.
22. Incident preservation in replay packages.
23. Static Acquisition Decision Room contract.
24. Authoritative Production Hardening contract.
25. Executable-site migration/build contract.
26. Browser E2E on desktop Chromium and mobile WebKit emulation.
27. Browser proof that incident mutation requires no reconciliation poll.
28. Browser proof that route/emergency/risk inputs update authoritative state.
29. Browser proof that explicit traffic drift advances authoritative revision/tick exactly.

Latest Stage C engineering results before documentation-head verification:

- 62/62 Node tests passing;
- 12/12 Playwright browser E2E tests passing;
- 123 registry records valid;
- coverage 33 / 17 / 73 / 0;
- executable smoke, Decision Room and Authoritative Production Hardening contracts passing.

Engineering E2E run:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31666941448

The final documentation-head CI/E2E links are verified after this documentation commit.

## Production-readiness boundary

Production readiness remains outside this proof-of-concept.

A production deployment still requires authenticated authoritative interfaces, calibrated/approved data, validated forecasting where appropriate, identity and authorization, authority-approved policies, cyber-security/privacy engineering, safety and hazard analysis, signed audit where required, observability and incident response, resilience/load/latency/failure testing, physical-device validation, traffic-controller and emergency-agency integration, shadow mode, staged deployment and controlled field evidence.

The next hardening stage is health/error monitoring and controlled failure injection with explicit READY/DEGRADED/BLOCKED behavior. That stage is not claimed as complete in v1.9.1.

No live road controller, production vehicle actuator, emergency dispatch system, government feed, real quantum sensor or safety-certified closed-loop control is connected to the current MVP.