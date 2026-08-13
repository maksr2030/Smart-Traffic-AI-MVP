# Smart AI Traffic Platform — Executable Engineering MVP v1.9.2

Public executable proof-of-concept for a city-scale and sovereign traffic intelligence platform.

Live executable platform:

https://maksr2030.github.io/Smart-Traffic-AI-MVP/?v=192

Version 1.9.2 retains the traffic-engine MVP, Dynamic Risk Digital Twin, deterministic predictive orchestration, explainability, policy guardrails, scenario replay, acquisition presentation, guided executive demo, Acquisition Decision Room, SHA-256 decision integrity, Exact Replay, browser E2E assurance, and the v1.9.1 Authoritative Live-State Migration. It adds Stage D Runtime Health, Resilience & Failure Injection.

## Current evidence status

The unified registry contains 123 source records loaded dynamically from `data/features.json`:

- 52 verified Main Legacy historical features: 1-14 and 200-237.
- 23 conversation-recovered capabilities.
- 5 additional project-history capabilities.
- 25 QTOS capabilities.
- 18 directly verified QCS track-local capabilities.

Main Legacy 15-199 remains reserved pending verified direct recovery.

Current validated coverage remains:

- 33 `implemented_demo`.
- 17 `represented_demo`.
- 73 `catalogued_only`.
- 0 `production_verified`.

Version 1.9.2 does not promote a historical capability merely because runtime hardening, auditability, resilience or browser assurance became stronger.

## Engineering MVP v1.9.2 — Stage D Runtime Health, Resilience & Failure Injection

Stage D adds a deterministic engineering health and fail-safe layer around the same authoritative state introduced in v1.9.1.

New Stage D components:

- `engine/runtimeHealthEngine.js` — evaluates authoritative state health and exposes READY, DEGRADED and BLOCKED states.
- `engine/failureInjectionEngine.js` — injects deterministic faults into cloned snapshots only.
- `runtimeHealthRuntime.js` — subscribes to the authoritative browser state and renders Runtime Health & Fail-Safe Gate in the executable platform.
- `data/runtime_health_policy.json` — Stage D health-policy fixture used by the engineering checks.
- `tests/runtimeHealthEngine.test.js` — unit coverage for health classification and fail-safe behavior.
- `e2e/stage-d-runtime-health.spec.js` — browser proof that the healthy executable reports READY and that an unsafe policy is blocked without mutating authoritative state.
- `scripts/stage-d-health-check.mjs` — static Stage D wiring contract.
- `STAGE_D_RUNTIME_RESILIENCE.md` — focused Stage D evidence boundary and design note.

The Stage D boundary remains:

- `simulation=true`.
- `autoApply=false`.
- `humanApprovalRequired=true`.
- `productionControlConnected=false`.
- `fieldActuation=false`.
- `safetyCertified=false`.
- `production_verified=0`.

## Runtime health model

`engine/runtimeHealthEngine.js` uses schema:

`smart-traffic-runtime-health/v1`

The runtime is classified as:

- READY — required authoritative state, network, policy and decision inputs satisfy the engineering checks.
- DEGRADED — no blocking safety condition exists, but optional/supporting data is incomplete, such as missing QCS proxy observations or virtual emergency fleet data.
- BLOCKED — a required state, network or mandatory safety-policy invariant is invalid.

Blocking checks include missing/invalid authoritative state, invalid revision or sequence, missing/corrupt operational network, invalid route-risk weight, missing orchestration policy, unsafe policy boundaries, and invalid policy limits.

Degraded checks include incomplete route/emergency inputs, unavailable QCS proxy observations and unavailable virtual emergency fleet data.

## Fail-safe decision gate

`applyFailSafeDecisionGate()` evaluates health before a decision is considered usable.

If health is BLOCKED:

- `allowed=false`;
- `decision=null`;
- `autoApply=false`;
- `humanApprovalRequired=true`;
- `fieldActuation=false`.

If health is READY or DEGRADED and no blocking issue exists, the engineering decision may remain visible for human review, while automatic application and field actuation stay disabled.

This is an engineering simulation guardrail. It is not a certified safety interlock or production traffic-control safety case.

## Controlled failure injection

`engine/failureInjectionEngine.js` uses schema:

`smart-traffic-failure-injection/v1`

The current deterministic suite covers seven scenarios:

1. `missing_network`.
2. `corrupt_network_load`.
3. `missing_policy`.
4. `unsafe_policy`.
5. `missing_qcs`.
6. `missing_fleet`.
7. `invalid_decision_inputs`.

Failure injection always runs against a cloned state. It never applies the injected fault to the authoritative browser runtime.

The suite is designed to demonstrate which conditions degrade operation and which conditions suppress decision output entirely.

## Runtime Health browser panel

`runtimeHealthRuntime.js` waits for the authoritative runtime to report ready and for the policy handoff to reach the Unified State Bus before evaluating health. This avoids classifying a valid startup as degraded or blocked merely because asynchronous policy initialization has not completed.

The panel shows:

- current health state;
- authoritative state revision;
- total, degraded and blocking findings;
- current decision-gate state;
- health findings;
- isolated failure-injection self-test results;
- explicit simulation and safety evidence boundary.

The panel publishes `window.smartTrafficHealth` for engineering inspection, including current health, the isolated failure suite, live reassessment and guarded decision evaluation.

## Authoritative operational state retained from v1.9.1

`engine/unifiedStateBus.js` uses schema:

`smart-traffic-live-state/v1`

`engine/authoritativeRuntimeStore.js` owns the current unified state and exposes cloned snapshots through:

- `initializeAuthoritativeRuntime()`;
- `getAuthoritativeState()`;
- `dispatchAuthoritativeEvent()`;
- `subscribeAuthoritativeState()`.

External snapshots and subscriber callbacks cannot mutate the stored authoritative state directly.

Operational changes pass through explicit events including traffic drift, incidents, scenarios, interventions, route/emergency inputs, simulation-running state, QCS observations, fleet, twin, predictive output, policy, decisions and reset.

`runtime_reconciled` remains only for compatibility; the normal executable path does not depend on periodic reconciliation.

## Source/build distinction

The repository intentionally retains the historical raw `app.js` source and transforms the assembled executable through `scripts/build-executable-site-v190.mjs` and `scripts/prepare-authoritative-runtime-v191.mjs`.

The accurate architecture claim is therefore:

- the assembled v1.9.2 executable uses the Unified State Bus as operational source of truth;
- the transformed top-level legacy state is a derived UI compatibility mirror;
- Stage D subscribes to and evaluates that same authoritative state;
- the raw historical `app.js` file alone is not the final executable architecture.

## SHA-256 decision integrity ledger retained

`engine/decisionLedgerEngine.js` uses schema:

`smart-traffic-decision-ledger/v1`

Each captured decision contains monotonic sequence, authoritative state revision, SHA-256 state/input/policy/output fingerprints, previous-entry hash, current-entry hash, deterministic method metadata and explicit evidence flags.

`verifyLedgerChain()` recalculates the chain and detects stored-entry mutation.

This is cryptographic integrity/tamper evidence for the engineering demo ledger. It is not a digital signature, blockchain anchor, non-repudiation mechanism or certified production audit system.

## Exact Replay retained

`engine/exactReplayEngine.js` uses schema:

`smart-traffic-exact-replay-package/v1`

Replay reruns the same deterministic explainable-policy orchestration path and checks state, inputs, policy, output, selected candidate and robust-score equality.

Exact Replay means deterministic software/input exactness inside the captured MVP environment. It does not claim reproduction of a real-world physical traffic outcome.

## Browser and mobile E2E validation

`playwright.config.js` validates:

- desktop Chromium at 1440 × 1000;
- mobile WebKit emulation at 390 × 844 with touch enabled.

The executable browser suite now contains eight scenarios per browser project, 16 browser tests total:

1. Entry-gate usability and mobile action reachability.
2. Decision Room, Hardening Panel, Guided Demo and authoritative runtime loading.
3. Decision capture, SHA-256 ledger verification and Exact Replay.
4. Incident mutation becoming authoritative without reconciliation polling.
5. Route, emergency and risk inputs reaching authoritative state.
6. Explicit traffic drift advancing authoritative revision/tick.
7. Stage D healthy executable reporting READY and an allowing human-review gate.
8. Stage D unsafe-policy failure being BLOCKED without mutating authoritative state.

Latest pre-documentation Stage D browser run:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31668889467

WebKit mobile emulation is not physical-iPhone acceptance evidence. Physical-device acceptance remains separate.

## One build for test and deployment

`scripts/build-executable-site-v190.mjs` remains the shared executable-site builder for browser E2E and GitHub Pages. The filename is historical; the output is v1.9.2.

The builder applies compatibility and authoritative-runtime transformation, assembles the executable site, includes Stage D runtime/engine assets, and feeds the same artifact shape to E2E and Pages.

This reduces the risk of testing a materially different artifact from the one being published.

## Validation status

The Stage D engineering head before this documentation commit validated:

- 123 unique registry records.
- Coverage 33 implemented / 17 represented / 73 catalogued / 0 production verified.
- 67/67 Node unit/integration tests.
- Static executable smoke contract.
- Acquisition Decision Room contract.
- Authoritative Production Hardening contract.
- Stage D Runtime Health contract.
- 16/16 Playwright E2E tests across desktop Chromium and mobile WebKit emulation.

Pre-documentation Stage D CI:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31668889454

The documentation-head commit is validated again by CI, E2E and GitHub Pages before Stage D is treated as closed.

## Explainable orchestration and policy guardrails retained

The deterministic robust score remains:

`0.80 × weightedMeanScore + 0.20 × worstHorizonScore + interventionPenalty`

The explanation remains arithmetic/model-internal and sets `causalClaim=false`.

`data/orchestration_policy.json` continues to constrain target count, simulated load reduction, incident relief, intervention penalty, simulation-only operation, mandatory human approval, automatic-application prohibition and production-control prohibition.

## Predictive orchestration retained

`engine/predictiveOrchestrationEngine.js` projects deterministic simulated state at 5, 15, 30 and 60 minutes, rebuilds the Dynamic Risk Digital Twin, identifies hotspots, evaluates four candidate interventions, ranks them and returns a recommendation without field application.

Forecasting remains a transparent deterministic engineering baseline, not a trained production AI model.

## Dynamic Risk Digital Twin retained

`engine/dynamicRiskTwinEngine.js` continues to fuse:

- network load: `0.30`;
- incident severity: `0.28`;
- QCS proxy risk: `0.32`;
- closure state: `0.10`.

The same twin snapshot feeds route, signal and virtual emergency decisions inside each evaluated candidate/horizon.

## QCS and QTOS evidence boundary

Executable QCS logic is a deterministic proxy simulation only. No current output is evidence of real quantum sensing, real quantum V2V/V2I communication, production vehicle integration or field actuation.

QTOS executable mappings remain simulation-level demonstrations of selected digital-twin, predictive-risk, network-balancing, crisis-management and multi-horizon candidate-ranking concepts.

## Complete forensic accounting

`Smart_Traffic_Forensic_Master_Recovery_v0_3.html` remains fingerprinted by SHA-256:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

It preserves 213 source recovery-ledger rows across 14 historical tracks. The 213 forensic source rows and 123 unified implementation-registry records are different accounting scopes and must not be added together.

QCS-92 is a direct supplemental recovery absent from v0.3 and therefore affects the unified registry without changing the 213-row forensic source count.

## Coverage semantics

`implemented_demo` means executable MVP logic exists for a meaningful portion of the documented capability.

`represented_demo` means a related simulation, workflow, design boundary or partial mechanism exists, but the full historical capability is not implemented.

`catalogued_only` means the source capability is preserved in the registry but is not implemented in the current MVP.

`production_verified` is an independent evidence dimension and remains false for every current capability.

## Run locally

Raw source preview:

```bash
python -m http.server 8000
```

For the assembled executable build:

```bash
node scripts/build-executable-site-v190.mjs site
python -m http.server 8000 --directory site
```

## Validation

```bash
npm run validate
npm test
npm run check
```

The E2E workflow installs its pinned Playwright test runner/browser binaries and executes the assembled `site/` build.

## Production-readiness boundary

This repository is an executable engineering MVP, not a production traffic-control system.

No live government road feed, production camera feed, authenticated V2X infrastructure, traffic-signal controller, emergency dispatch system, vehicle actuator, real quantum sensor, real quantum communication link or safety-certified control loop is connected.

Stage D closes the current engineering milestone for runtime health classification, a fail-safe decision gate and deterministic isolated failure injection. It does not close the broader production-readiness program.

Production deployment still requires, among other controls:

- authenticated real-time interfaces and authoritative data contracts;
- calibrated sensing or authority-approved high-fidelity datasets;
- validated predictive models where appropriate;
- approved operating policies and authority controls;
- cyber-security, identity, privacy and secrets management;
- safety engineering, formal hazard analysis and certified fail-safe behavior;
- signed/authorized audit where required;
- production observability, alerting, health-state and error monitoring;
- resilience, load, latency, recovery and chaos/failure testing at production scale;
- controlled traffic-controller and emergency-agency integration;
- physical-device/browser acceptance testing;
- staged sandbox, shadow-mode and controlled field validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
