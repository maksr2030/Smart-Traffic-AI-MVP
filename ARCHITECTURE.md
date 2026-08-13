# Architecture and Evidence Boundary — Executable Engineering MVP v1.9.2

## Objective

Version 1.9.2 completes Stage D of the Smart Traffic AI MVP production-hardening path for the assembled executable.

Stage C remains intact: operational mutations pass through one deterministic Unified State Bus owned by `engine/authoritativeRuntimeStore.js`. Stage D adds runtime health classification, a fail-safe decision gate, isolated deterministic failure injection and a browser-visible health panel that consumes the same authoritative state.

The architecture remains an engineering proof-of-concept simulation. No recommendation, policy decision, audit entry, health result, failure-injection result or replay output executes field control.

## Architecture overview

The v1.9.2 executable architecture follows this authority and assurance chain:

1. deterministic fixtures and browser actions generate explicit operational events;
2. `engine/authoritativeRuntimeStore.js` owns the current `smart-traffic-live-state/v1` state;
3. `engine/unifiedStateBus.js` deterministically reduces accepted mutations;
4. the assembled executable derives the legacy UI mirror from authoritative state;
5. traffic, QCS, twin, predictive and policy logic operate on authoritative snapshots/mutations;
6. `hardeningRuntime.js` subscribes directly to the same state;
7. `runtimeHealthRuntime.js` waits for runtime and policy readiness and evaluates that same state;
8. `engine/runtimeHealthEngine.js` classifies the snapshot READY, DEGRADED or BLOCKED;
9. the fail-safe gate suppresses decision output under blocking conditions;
10. `engine/failureInjectionEngine.js` exercises controlled faults against cloned snapshots only;
11. decisions remain fingerprinted and chained with SHA-256;
12. captured state/policy/inputs remain replayable through Exact Replay;
13. the same assembled artifact shape is used by browser E2E and GitHub Pages.

## Logical layers

### 1. Source and ingestion layer

Potential authorized production sources include road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds.

The present MVP uses deterministic fixtures and simulated inputs. No live government or field feed is connected.

### 2. Network-state and traffic-engine layer

`data/network.json` defines the demo graph used by `engine/trafficEngine.js` for validation, travel-time calculation, shortest-path routing, incidents, demand, signal allocation and network metrics.

### 3. Operations and scenario layer

`engine/operationsEngine.js` provides concurrent incidents, operating scenarios, deterministic metrics, mitigation baselines, before/after comparison, short-horizon forecasting baseline and operational snapshot export.

### 4. QCS proxy-risk layer

`engine/qcsRiskEngine.js` converts simulated QCS observations into deterministic proxy-risk assessments.

No output is evidence of real quantum sensing, real quantum V2V/V2I communication or production vehicle integration.

### 5. Dynamic Risk Digital Twin layer

`engine/dynamicRiskTwinEngine.js` fuses:

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

Closed roads remain closed through simulated intervention logic.

### 9. Multi-horizon evaluation layer

`evaluateOrchestrationCandidate()` evaluates every candidate at every forecast horizon and produces the shared route/signal/emergency decision bundle.

### 10. Robust orchestration layer

`orchestratePredictiveRisk()` ranks candidates using:

`robustScore = 0.80 × weightedMeanScore + 0.20 × worstHorizonScore + interventionPenalty`

Outputs preserve:

- `simulation=true`;
- `autonomousRecommendation=true`;
- `autoApply=false`;
- `humanApprovalRequired=true`;
- `productionControlConnected=false`;
- `safetyCertified=false`.

### 11. Explainability layer

`engine/explainableOrchestrationEngine.js` reconstructs the deterministic robust score and compares the selected candidate with alternatives.

The explanation is arithmetic/model-internal and preserves `causalClaim=false`.

### 12. Policy guardrail layer

`data/orchestration_policy.json` constrains target count, simulated load reduction, incident relief, intervention penalty, simulation-only operation, mandatory human approval, automatic-application prohibition and production-control prohibition.

The policy is an engineering-demo policy, not road-authority operating policy.

### 13. Policy-aware recommendation layer

`buildExplainablePolicyOrchestration()` combines predictive orchestration, policy evaluation, compliant-candidate selection, arithmetic explanation and replay.

If no candidate satisfies policy, the result is blocked.

### 14. Scenario replay layer

`buildScenarioReplay()` compares the policy-selected plan with `observe_only` at each shared horizon.

This is simulated candidate comparison, not field-event reconstruction.

### 15. Sensitivity layer

`runOrchestrationSensitivity()` performs what-if analysis across forecast horizon sets and route-safety weights.

### 16. Preventive command simulation layer

`engine/preventiveCommandEngine.js` produces simulated preventive vehicle-response recommendations from directly observed QCS proxy information.

Every command remains actuator-disconnected and non-certified.

### 17. Acquisition presentation layer

`acquisitionRuntime.js` provides the acquisition-ready entry experience, executive navigation and complete feature explorer while preserving capability evidence distinctions.

### 18. Executive Guided Demo layer

The guided runtime provides an 11-step executive path through baseline state, incident injection, Dynamic Risk Twin, prediction, candidate comparison, explanation, policy gate, replay, Acquisition Decision Room and capability portfolio.

### 19. Acquisition Decision Room layer

`decisionRoomRuntime.js` and `decisionRoom.css` expose acquisition rationale, architecture snapshot, evidence/readiness matrix, due-diligence links, MVP-to-production roadmap, deployment/transaction models, IP disclosure boundary and buyer next action.

### 20. Authoritative unified-state layer

`engine/unifiedStateBus.js` defines:

`smart-traffic-live-state/v1`

The state includes revision, sequence, tick, simulation-running status, scenario, current/base network snapshots, QCS observations, fleet, route parameters, emergency target, demo policy, incidents, twin snapshot, predictive snapshot, last decision and bounded event history.

`engine/authoritativeRuntimeStore.js` is the singleton owner. It exposes cloned snapshots and deterministic dispatch/subscription. Consumers cannot mutate stored state by modifying returned snapshots or subscriber payloads.

Operational events include:

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

`runtime_reconciled` remains only for compatibility. The normal executable path does not depend on periodic reconciliation.

### 21. Executable source-migration layer

The historical raw `app.js` remains in the repository, while the executable artifact is assembled through `scripts/build-executable-site-v190.mjs` and transformed by `scripts/prepare-authoritative-runtime-v191.mjs`.

The assembled artifact imports and initializes the authoritative runtime, routes core operational mutations through the bus/store, records twin/predictive output through authority events, exposes `getUnifiedState()`, `dispatch()` and `subscribe()`, and makes the legacy top-level state a derived UI mirror.

The source-of-truth claim therefore applies to the assembled executable, not to an isolated reading of the untransformed historical `app.js` source file.

### 22. Direct hardening-state subscription layer

`hardeningRuntime.js` reads `getUnifiedState()`, subscribes through the authoritative runtime and uses the same snapshot for audited decision capture, decision ledger linkage and Exact Replay packaging.

### 23. Canonical cryptographic fingerprint layer

`engine/auditHash.js` provides deterministic canonical JSON serialization and SHA-256 through Web Crypto.

Evidence boundary:

- cryptographic SHA-256 hash: yes;
- digital signature: no;
- blockchain anchoring: no;
- non-repudiation: no;
- production audit certification: no.

### 24. Decision integrity ledger layer

`engine/decisionLedgerEngine.js` uses:

`smart-traffic-decision-ledger/v1`

Each entry contains sequence, authoritative state revision, state/input/policy/output fingerprints, previous entry hash, current entry hash, method metadata and evidence flags.

`verifyLedgerChain()` detects stored-entry mutation.

### 25. Exact deterministic replay layer

`engine/exactReplayEngine.js` captures deterministic state, inputs, policy and orchestration output into:

`smart-traffic-exact-replay-package/v1`

Replay checks state hash, input hash, policy hash, output hash, selected candidate and robust score.

Exact match means software/input deterministic equality inside the captured MVP environment, not physical-world replay evidence.

### 26. Runtime Integrity UI layer

`hardeningRuntime.js` and `hardeningRuntime.css` expose authoritative state revision, state hash, ledger count, chain status, recent hashes/events and controls for capture, verification, replay and engineering audit export.

### 27. Dynamic capability evidence layer

`coverage/coverageModel.js` maintains one row for every unified source-registry capability.

Current validated coverage remains:

- 33 implemented-demo;
- 17 represented-demo;
- 73 catalogued-only;
- 0 production-verified.

Stage D does not change these counts merely because runtime resilience became stronger.

### 28. Runtime health assessment layer

`engine/runtimeHealthEngine.js` defines:

`smart-traffic-runtime-health/v1`

It validates authoritative state, revision, sequence, operational network, route/emergency decision inputs, QCS proxy availability, virtual fleet availability and mandatory policy safety boundaries.

Health classification is:

- READY — no health findings.
- DEGRADED — supporting data/input limitations exist, but no blocking issue exists.
- BLOCKED — one or more required state/network/policy safety invariants are invalid.

The result includes issue counts, blocking/degraded counts, decision allowance and explicit simulation evidence flags.

### 29. Fail-safe decision gate layer

`applyFailSafeDecisionGate()` consumes an authoritative snapshot plus a proposed engineering decision.

For BLOCKED health:

- decision output is suppressed;
- `allowed=false`;
- `decision=null`;
- `autoApply=false`;
- `humanApprovalRequired=true`;
- `fieldActuation=false`.

For READY or DEGRADED health without a blocking finding, the decision can remain visible for human review, but it is still not auto-applied or field-actuated.

This layer is an engineering guardrail, not certified functional safety.

### 30. Controlled failure-injection layer

`engine/failureInjectionEngine.js` defines:

`smart-traffic-failure-injection/v1`

Seven deterministic failure scenarios are exercised:

1. missing network;
2. corrupt network load;
3. missing policy;
4. unsafe policy;
5. missing QCS observations;
6. missing virtual emergency fleet;
7. invalid decision inputs.

Every scenario is applied to a cloned snapshot. The authoritative runtime is never mutated by failure injection.

The output records resulting health status, whether the decision gate blocks, simulation status and `stateMutationAppliedToAuthoritativeRuntime=false`.

### 31. Runtime Health browser layer

`runtimeHealthRuntime.js` waits until:

- `window.smartTrafficRuntime` exists;
- the runtime reports ready;
- `getUnifiedState()` and `subscribe()` are available;
- the asynchronous policy handoff has reached authoritative state.

Only then does it assess health. This removes the startup race that could otherwise classify a valid runtime before policy initialization completed.

The layer subscribes to authoritative updates and renders Runtime Health & Fail-Safe Gate in the Acquisition Decision Room or main executable surface.

It also exposes an isolated failure-injection self-test and publishes `window.smartTrafficHealth` for engineering inspection.

### 32. Browser E2E assurance layer

`playwright.config.js`, `e2e/executable-platform.spec.js` and `e2e/stage-d-runtime-health.spec.js` validate the assembled executable site.

Browser projects:

- desktop Chromium at 1440 × 1000;
- mobile WebKit emulation at 390 × 844 with touch enabled.

Eight scenarios run in both browser projects, for 16 browser tests total:

1. entry-gate and mobile-action usability;
2. Decision Room, Hardening Panel, Guided Demo and authoritative-runtime loading;
3. decision capture, ledger verification and Exact Replay;
4. authoritative incident mutation with no reconciliation dependency;
5. authoritative route/emergency/risk input mutation;
6. explicit traffic-drift mutation with exact revision/tick progression;
7. healthy Stage D browser runtime reporting READY and allowing human review;
8. unsafe-policy snapshot being BLOCKED without authoritative-state mutation.

Latest pre-documentation Stage D engineering browser result: 16/16 passed.

WebKit mobile emulation is not physical-iPhone acceptance evidence.

### 33. Single executable build layer

`scripts/build-executable-site-v190.mjs` is the shared builder. The filename is historical; the current executable version is v1.9.2.

The builder applies compatibility and authoritative-state transformation and includes Stage D runtime/engine assets in the assembled executable used by both browser E2E and Pages.

### 34. Governance and assurance boundary

The repository separates:

- historical source provenance;
- demo implementation coverage;
- authoritative executable runtime state;
- deterministic decision logic;
- policy configuration;
- runtime health state;
- isolated failure injection;
- cryptographic integrity evidence;
- browser compatibility evidence;
- production verification.

The code/tests protect against unsupported claims including real quantum data/communication, trained production forecasting where none exists, automatic field execution, bypassing human approval, causal explanation, regulatory policy approval, real-world field-event replay, digital signature/non-repudiation/blockchain anchoring, physical iPhone validation from WebKit emulation, certified safety claims and production verification without independent evidence.

## Runtime data flow — v1.9.2 executable

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
        ├──────────────→ hardeningRuntime direct subscription
        │                      ↓
        │               SHA-256 Decision Ledger
        │                      ↓
        │                 Exact Replay
        │
        └──────────────→ runtimeHealthRuntime
                               ↓
                      runtimeHealthEngine
                    READY / DEGRADED / BLOCKED
                               ↓
                      Fail-Safe Decision Gate
                               ↓
              Human-review output or BLOCKED decision

Cloned authoritative snapshot
        ↓
failureInjectionEngine
        ↓
7 isolated failure scenarios
        ↓
Health/gate result only
(no authoritative-state mutation)
```

## Validation

Version 1.9.2 Stage D validation covers the existing traffic, QCS, twin, prediction, orchestration, explainability, policy, authoritative-state, ledger and replay contracts plus:

1. runtime health schema and deterministic classification;
2. authoritative state/network validity checks;
3. mandatory policy safety-boundary checks;
4. degraded QCS/fleet behavior;
5. blocking invalid-network/policy/input behavior;
6. fail-safe suppression of blocked decision output;
7. preservation of human approval and no-auto-apply flags;
8. seven cloned failure-injection scenarios;
9. proof that failure injection does not mutate authoritative state;
10. Stage D static wiring contract;
11. READY browser health-panel behavior;
12. unsafe-policy browser blocking behavior;
13. startup waiting for authoritative policy handoff;
14. desktop Chromium and mobile WebKit E2E behavior.

Latest pre-documentation Stage D engineering results:

- 67/67 Node tests passing;
- 16/16 Playwright browser E2E tests passing;
- 123 registry records valid;
- coverage 33 / 17 / 73 / 0;
- executable smoke, Decision Room, Authoritative Production Hardening and Stage D Runtime Health contracts passing.

Pre-documentation Stage D CI:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31668889454

Pre-documentation Stage D E2E:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31668889467

The documentation-head commit is validated again by CI, E2E and GitHub Pages before Stage D is treated as closed.

## Production-readiness boundary

Production readiness remains outside this proof-of-concept.

Stage D completes the current engineering milestone for deterministic runtime-health classification, a fail-safe decision gate and controlled isolated failure injection. It does not constitute production safety certification, operational resilience certification or field acceptance.

A production deployment still requires authenticated authoritative interfaces, calibrated/approved data, validated forecasting where appropriate, identity and authorization, authority-approved policies, cyber-security/privacy engineering, formal safety/hazard analysis, signed audit where required, production observability and incident response, resilience/load/latency/recovery testing at production scale, physical-device validation, traffic-controller and emergency-agency integration, shadow mode, staged deployment and controlled field evidence.

No live road controller, production vehicle actuator, emergency dispatch system, government feed, real quantum sensor or safety-certified control loop is connected.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
