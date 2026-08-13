# Architecture and Evidence Boundary — Executable Engineering MVP v1.9

## Objective

Version 1.9 extends the executable Smart Traffic AI MVP with production-hardening mechanisms for captured runtime state, decision integrity, exact deterministic replay, acquisition review and browser-level validation.

The architecture remains an engineering proof-of-concept simulation. No recommendation, policy decision, audit entry or replay result executes field control.

## Architecture overview

The v1.9 architecture preserves the traffic intelligence stack from v1.8 and adds five hardening concerns:

1. synchronized captured live-state and runtime events;
2. canonical SHA-256 state/input/policy/output fingerprints;
3. chained decision-integrity ledger;
4. captured deterministic Exact Replay;
5. one executable build validated by desktop Chromium and mobile WebKit E2E before/alongside Pages deployment.

## Logical layers

### 1. Source and ingestion layer

Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds.

The present MVP uses deterministic fixtures and simulated inputs. No live government or field feed is connected.

### 2. Network-state layer

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

`acquisitionRuntime.js` adds the acquisition-ready entry experience, executive navigation and complete feature explorer.

The entry layer preserves the distinction among implemented demo, represented demo, catalogued only and production verified.

### 18. Executive Guided Demo layer

The deployed guided runtime provides an 11-step executive path through baseline state, incident injection, Dynamic Risk Twin, prediction, candidate comparison, explanation, policy gate, scenario replay, Acquisition Decision Room and capability portfolio.

The tour acts on the executable demo controls and maintains the same evidence boundary.

### 19. Acquisition Decision Room layer

`decisionRoomRuntime.js` and `decisionRoom.css` expose acquisition-relevant material without exposing sensitive algorithmic implementation details.

The Decision Room includes strategic acquisition rationale, architecture snapshot, evidence/readiness matrix, due-diligence links, MVP-to-production roadmap, deployment/transaction models, IP disclosure boundary and buyer next action.

### 20. Synchronized captured live-state layer

`engine/unifiedStateBus.js` introduces schema:

`smart-traffic-live-state/v1`

The captured state includes revision, sequence, tick, scenario, network/base-network snapshots, QCS observations, fleet, route parameters, emergency target, demo policy, incidents, twin snapshot, predictive snapshot, last decision and event history.

Deterministic reducer events include scenario load, traffic drift, incident injection/clear, QCS update, route/policy changes, twin/predictive update, manual reset and runtime reconciliation.

`hardeningRuntime.js` synchronizes this captured state with the executable demo runtime and wraps selected runtime mutation methods so changes are visible to the audit/replay layer.

Current architectural boundary: `app.js` is still the primary operational UI/runtime state owner. The v1.9 unified state bus is a synchronized captured hardening state and has not yet replaced every direct core-state mutation. Therefore it must not be described as the sole authoritative production source-of-truth.

### 21. Canonical cryptographic fingerprint layer

`engine/auditHash.js` provides deterministic canonical JSON serialization and SHA-256 through Web Crypto.

Fingerprints are used for captured state, inputs, policy, outputs and chained ledger entries.

Evidence boundary:

- cryptographic SHA-256 hash: yes;
- digital signature: no;
- blockchain anchoring: no;
- non-repudiation: no;
- production audit certification: no.

### 22. Decision integrity ledger layer

`engine/decisionLedgerEngine.js` introduces schema:

`smart-traffic-decision-ledger/v1`

Each entry contains sequence, state revision, state/input/policy/output fingerprints, previous entry hash, current entry hash, method metadata and evidence flags.

`verifyLedgerChain()` recalculates the chain and detects stored-entry mutation.

This is cryptographic integrity/tamper evidence within the captured engineering ledger, not a legally signed audit trail.

### 23. Exact deterministic replay layer

`engine/exactReplayEngine.js` captures the state, inputs, policy and deterministic orchestration output into:

`smart-traffic-exact-replay-package/v1`

Replay reruns `buildExplainablePolicyOrchestration()` and checks:

- state hash;
- input hash;
- policy hash;
- output hash;
- selected candidate;
- robust score.

An exact match means software/input deterministic exactness inside the captured MVP environment. It is not evidence that real traffic would reproduce the same physical outcome.

### 24. Runtime Integrity UI layer

`hardeningRuntime.js` and `hardeningRuntime.css` add the Production Hardening panel to the Acquisition Decision Room.

It exposes state revision, shortened state hash, ledger-entry count, chain status, recent ledger hashes, recent state events and controls to capture, verify, replay and export an engineering audit bundle.

### 25. Dynamic capability evidence layer

`coverage/coverageModel.js` maintains one row for every unified source-registry capability.

Current validated coverage remains:

- 33 implemented-demo;
- 17 represented-demo;
- 73 catalogued-only;
- 0 production-verified.

### 26. Browser E2E assurance layer

`playwright.config.js` and `e2e/executable-platform.spec.js` test the assembled executable site rather than isolated JavaScript modules only.

Current CI browser projects:

- desktop Chromium at 1440 × 1000;
- mobile WebKit emulation at 390 × 844 with touch enabled.

Four scenarios run in both projects, eight browser tests total:

1. entry-gate and mobile-action usability;
2. Decision Room, Hardening Panel and Guided Demo loading;
3. decision capture, ledger verification and Exact Replay;
4. incident mutation synchronization into hardening state.

Current result: 8/8 passed.

WebKit mobile emulation is not physical-iPhone acceptance evidence.

### 27. Single executable build layer

`scripts/build-executable-site-v190.mjs` assembles the exact v1.9 executable site.

The same builder is called by:

- `.github/workflows/e2e.yml` for browser tests; and
- the GitHub Pages deployment workflow.

This removes duplicated site-assembly logic and materially reduces the risk of validating one artifact while publishing another.

### 28. Governance and assurance boundary

The repository separates:

- historical source provenance;
- demo implementation coverage;
- captured runtime state;
- deterministic decision logic;
- policy configuration;
- cryptographic integrity evidence;
- browser compatibility evidence;
- production verification.

The code/tests protect against claims that are not supported, including:

- real quantum data or communication;
- trained production forecasting where none exists;
- automatic field execution;
- bypassing human approval;
- causal explanation;
- regulatory policy approval;
- field-event replay;
- digital signature/non-repudiation/blockchain anchoring;
- physical iPhone validation from WebKit emulation;
- production verification without independent evidence.

## Runtime data flow — v1.9

The current executable flow is:

```text
Demo fixtures / browser actions
        ↓
app.js operational runtime
        ↓
Traffic / Operations / QCS / Twin / Predictive engines
        ↓
Explainability + Policy + Scenario Replay
        ↓
Acquisition / Guided Demo / Decision Room
        ↓
hardeningRuntime synchronization
        ↓
Captured smart-traffic-live-state/v1
        ↓
SHA-256 fingerprints
        ↓
Decision Ledger + Exact Replay package
```

The future production-hardening target is to migrate the operational mutations themselves through the unified event/state architecture, so the bus becomes the authoritative runtime state rather than a synchronized audit mirror.

## Validation

Version 1.9 validation currently includes:

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
11. Unified-state reducer determinism and immutable mutation behavior.
12. Stable canonical JSON and SHA-256 state fingerprints.
13. SHA-256 decision chain verification.
14. Tamper detection.
15. Captured Exact Replay equality.
16. Incident preservation in replay packages.
17. Static Acquisition Decision Room contract.
18. Static Production Hardening contract.
19. Executable-site build contract.
20. Browser E2E on desktop Chromium and mobile WebKit emulation.

Current automated results:

- 56/56 Node tests passing;
- 8/8 Playwright browser E2E tests passing;
- 123 registry records valid;
- coverage 33 / 17 / 73 / 0;
- executable smoke, Decision Room and Production Hardening contracts passing.

Core v1.9 CI:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31665290668

Browser E2E:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31665468699

Unified-builder GitHub Pages deployment:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31665486328

## Production-readiness boundary

Production readiness remains outside this proof-of-concept.

A production deployment requires authenticated authoritative interfaces, calibrated/approved data, validated forecasting where appropriate, source-level single-state/event migration, identity and authorization, authority-approved policies, cyber-security/privacy engineering, safety and hazard analysis, signed audit where required, observability and incident response, resilience/load/latency/failure testing, physical-device validation, traffic-controller and emergency-agency integration, shadow mode, staged deployment and controlled field evidence.

No live road controller, production vehicle actuator, emergency dispatch system, government feed, real quantum sensor or safety-certified closed-loop control is connected to the current MVP.
