# Smart AI Traffic Platform — Executable Engineering MVP v1.9

Public executable proof-of-concept for a city-scale and sovereign traffic intelligence platform.

Live executable platform:

https://maksr2030.github.io/Smart-Traffic-AI-MVP/?v=190

The current release combines the traffic-engine MVP, Dynamic Risk Digital Twin, deterministic predictive orchestration, explainability, policy guardrails, scenario replay, acquisition presentation, guided executive demo, Acquisition Decision Room, and the v1.9 Production Hardening layer.

## Current evidence status

The unified registry contains 123 source records loaded dynamically from `data/features.json`:

- 52 verified Main Legacy historical features: 1-14 and 200-237.
- 23 conversation-recovered capabilities.
- 5 additional project-history capabilities.
- 25 QTOS capabilities.
- 18 directly verified QCS track-local capabilities.

Main Legacy 15-199 remains reserved pending verified direct recovery.

Current CI-validated coverage remains:

- 33 `implemented_demo`.
- 17 `represented_demo`.
- 73 `catalogued_only`.
- 0 `production_verified`.

Version 1.9 does not promote any historical capability merely because the engineering depth increased.

## Engineering MVP v1.9 — Production Hardening Core

Version 1.9 adds auditable runtime-hardening mechanisms around the executable simulation while retaining the strict field-control boundary.

New core modules:

- `engine/auditHash.js` — canonical JSON and browser-safe SHA-256 fingerprints.
- `engine/unifiedStateBus.js` — deterministic captured live-state/event model.
- `engine/decisionLedgerEngine.js` — SHA-256 chained decision ledger.
- `engine/exactReplayEngine.js` — deterministic captured-input replay packages.
- `hardeningRuntime.js` — browser integration and runtime-integrity panel.
- `hardeningRuntime.css` — desktop/mobile hardening interface.
- `tests/runtimeHardening.test.js` — hardening unit tests.
- `scripts/hardening-runtime-check.mjs` — hardening contract validation.
- `scripts/build-executable-site-v190.mjs` — one executable build path shared by Pages and browser E2E.

The v1.9 boundary remains:

- `simulation=true`.
- `autoApply=false`.
- `humanApprovalRequired=true`.
- `productionControlConnected=false`.
- `fieldActuation=false`.
- `safetyCertified=false`.
- `digitalSignature=false`.
- `blockchainAnchored=false`.
- `nonRepudiation=false`.
- `production_verified=0`.

## Unified captured live-state layer

`engine/unifiedStateBus.js` introduces schema:

`smart-traffic-live-state/v1`

The captured state includes:

- revision and monotonic sequence;
- simulation tick and scenario ID;
- current and base network snapshots;
- QCS proxy observations;
- virtual emergency fleet;
- route parameters and emergency target;
- current demo policy;
- active incidents;
- Dynamic Risk Twin snapshot;
- predictive orchestration snapshot;
- last captured decision;
- bounded runtime-event history;
- explicit evidence-boundary flags.

Supported deterministic event types include:

- `scenario_loaded`;
- `traffic_drift_applied`;
- `incident_injected`;
- `incident_cleared`;
- `qcs_observations_updated`;
- `fleet_updated`;
- `route_parameters_updated`;
- `emergency_target_updated`;
- `policy_updated`;
- `twin_updated`;
- `predictive_updated`;
- `decision_recorded`;
- `manual_reset`;
- `runtime_reconciled`.

The production-hardening browser layer synchronizes this state with the current executable demo runtime and wraps key runtime mutation methods so incident, reset, twin and prediction changes are captured for audit/replay use.

Important current limitation: `app.js` remains the primary operational UI/runtime state owner. The v1.9 state bus is an auditable synchronized hardening state, not yet the sole authoritative source of every core application mutation. A deeper source-level migration remains part of later production hardening.

## SHA-256 decision integrity ledger

`engine/decisionLedgerEngine.js` uses schema:

`smart-traffic-decision-ledger/v1`

Every captured decision entry contains:

- monotonic sequence;
- state revision;
- SHA-256 state fingerprint;
- input fingerprint;
- policy fingerprint;
- output fingerprint;
- previous-entry hash;
- current-entry hash;
- deterministic method metadata;
- explicit simulation/evidence flags.

`verifyLedgerChain()` recalculates each entry hash and verifies the previous-hash chain. Mutating a stored entry invalidates verification.

This provides cryptographic integrity/tamper evidence for the captured demo ledger. It is not a digital signature, blockchain anchor, legal non-repudiation mechanism, or certified production audit system.

## Exact replay packages

`engine/exactReplayEngine.js` captures schema:

`smart-traffic-exact-replay-package/v1`

A replay package preserves:

- captured unified state;
- route and emergency inputs;
- QCS observations and fleet inputs;
- policy snapshot;
- deterministic orchestration options;
- original orchestration output;
- state/input/policy/output fingerprints;
- optional linked ledger entry.

`replayDecisionPackage()` reruns the same deterministic `buildExplainablePolicyOrchestration()` logic and verifies:

- state fingerprint match;
- input fingerprint match;
- policy fingerprint match;
- output fingerprint match;
- selected-candidate match;
- robust-score match.

“Exact Replay” means exactness within the captured deterministic software logic, fixtures, policy, state and inputs. It does not claim recreation of a real-world road outcome.

## Runtime Integrity panel

The Acquisition Decision Room now contains a `Runtime Integrity, Decision Ledger & Exact Replay` panel.

It exposes:

- captured state revision;
- shortened SHA-256 state fingerprint;
- decision-ledger entry count;
- chain-integrity status;
- recent decision-ledger hashes;
- recent synchronized state events;
- Capture Current Decision;
- Verify Ledger;
- Replay Latest Decision;
- Export Audit Bundle.

The export is a JSON engineering evidence bundle. It preserves the same non-production evidence boundary.

## Browser and mobile E2E validation

Version 1.9 adds Playwright buyer-grade executable testing.

`playwright.config.js` currently validates two browser projects:

- desktop Chromium at 1440 × 1000;
- mobile WebKit emulation at 390 × 844 with touch enabled.

`e2e/executable-platform.spec.js` validates four end-to-end scenarios in both projects, for eight browser tests total:

1. Entry-gate usability and mobile action reachability.
2. Acquisition Decision Room, Hardening Panel and 11-step Guided Demo loading.
3. Decision capture, SHA-256 ledger verification and Exact Replay match.
4. Runtime incident mutation on `E09` reflected in the captured hardening state.

The first complete E2E run passed 8/8 browser tests.

This mobile result is WebKit mobile emulation in CI, not evidence from physical iPhone hardware. Physical-device acceptance testing remains separate.

E2E workflow:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31665468699

## One build for test and deployment

`scripts/build-executable-site-v190.mjs` is now the single executable-site builder used by both:

- the Playwright E2E workflow; and
- the GitHub Pages production workflow.

This removes the previous risk that browser tests could validate a different assembled site from the one published to GitHub Pages.

Latest unified-builder Pages deployment:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31665486328

## Validation status

Latest v1.9 engineering validation includes:

- 123 unique registry records validated.
- Coverage: 33 implemented / 17 represented / 73 catalogued / 0 production verified.
- 56/56 Node unit/integration tests passing.
- Static executable smoke contract passing.
- Acquisition Decision Room contract passing.
- Production Hardening contract passing.
- 8/8 Playwright browser E2E tests passing across desktop Chromium and mobile WebKit emulation.

Latest v1.9 core CI:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31665290668

## Explainable orchestration and policy guardrails retained

The v1.8 governance layer remains active.

The deterministic robust score is:

`0.80 × weightedMeanScore + 0.20 × worstHorizonScore + interventionPenalty`

The explanation reports score contributions, differences versus `observe_only`, and reasons alternatives lost. It remains arithmetic/model-internal and sets `causalClaim=false`.

`data/orchestration_policy.json` continues to constrain target count, simulated load reduction, incident relief, intervention penalty, simulation-only operation, mandatory human approval, automatic-application prohibition and production-control prohibition.

`buildScenarioReplay()` continues to compare the policy-selected candidate with `observe_only` at 5, 15, 30 and 60 minutes.

## Predictive orchestration retained

`engine/predictiveOrchestrationEngine.js` continues to:

1. project network state at 5, 15, 30 and 60 minutes;
2. rebuild a Dynamic Risk Digital Twin at every horizon;
3. identify emerging hotspots;
4. evaluate `observe_only`, `balanced_preemptive`, `network_relief`, and `safety_priority`;
5. rank candidates across all horizons;
6. return a recommendation without field application.

Forecasting remains a deterministic engineering baseline, not a trained production AI model.

## Dynamic Risk Digital Twin retained

`engine/dynamicRiskTwinEngine.js` continues to fuse:

- network load: `0.30`;
- incident severity: `0.28`;
- QCS proxy risk: `0.32`;
- closure state: `0.10`.

The same twin snapshot feeds route, signal and virtual emergency decisions inside each evaluated candidate/horizon.

## QCS and QTOS demo coverage

Executable QCS proxy logic meaningfully represents:

- `QCS-80` — vehicle stability and skid-prevention risk logic.
- `QCS-85` — rough-terrain response logic.
- `QCS-86` — blind-spot risk logic.
- `QCS-87` — severe-weather response logic.
- `QCS-88` — sharp-turn risk logic.
- `QCS-92` — road-quality and vehicle-response logic.
- `QCS-101` — deterministic risk analysis, twin-aware route selection and preemptive command-plan logic.

QTOS executable mappings remain:

- `QTOS-02` — Dynamic City Traffic Digital Twin.
- `QTOS-03` — predictive congestion/risk baseline.
- `QTOS-05` — network-wide predictive load-balancing recommendation.
- `QTOS-21` — proactive crisis-management recommendation workflow.
- `QTOS-22` — multi-horizon candidate simulation and ranking.

## Complete forensic accounting

`Smart_Traffic_Forensic_Master_Recovery_v0_3.html` remains fingerprinted by SHA-256:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

It preserves 213 source recovery-ledger rows across 14 historical tracks. `evidence/FORENSIC_V0_3_TRACK_COVERAGE_INDEX.json` accounts for 213/213 source rows.

The 213 forensic source rows and the 123 unified implementation-registry records are different accounting scopes and must not be added together.

QCS-92 is a direct supplemental recovery absent from v0.3 and therefore affects the unified registry without changing the 213-row forensic source count.

## Coverage semantics

`implemented_demo` means executable MVP logic exists for a meaningful portion of the documented capability.

`represented_demo` means a related simulation, workflow, design boundary or partial mechanism exists, but the full historical capability is not implemented.

`catalogued_only` means the source capability is preserved in the registry but not implemented in the current MVP.

`production_verified` is an independent evidence dimension and remains false for every current capability.

## Run locally

```bash
python -m http.server 8000
```

For the exact v1.9 assembled executable build:

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

The E2E workflow installs its pinned Playwright test runner and browser binaries in CI and executes the assembled `site/` build.

## Production-readiness boundary

This repository is an executable engineering MVP, not a production traffic-control system.

No live government road feed, production camera feed, authenticated V2X infrastructure, traffic-signal controller, emergency dispatch system, vehicle actuator, real quantum sensor, real quantum communication link or safety-certified control loop is connected.

Production deployment still requires, among other controls:

- authenticated real-time interfaces and authoritative data contracts;
- source-level migration to a single authoritative runtime state/event architecture;
- calibrated sensing or authority-approved high-fidelity datasets;
- validated predictive models where appropriate;
- approved operating policies and authority controls;
- cyber-security, identity, privacy and secrets management;
- safety engineering, hazard analysis and fail-safe behavior;
- signed/authorized audit where required;
- observability, alerting and error monitoring;
- resilience, load, latency and failure-injection testing;
- controlled traffic-controller and emergency-agency integration;
- physical-device/browser acceptance testing;
- staged sandbox, shadow-mode and controlled field validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
