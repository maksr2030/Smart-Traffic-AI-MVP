# Smart AI Traffic Platform — Executable Engineering MVP v1.9.1

Public executable proof-of-concept for a city-scale and sovereign traffic intelligence platform.

Live executable platform:

https://maksr2030.github.io/Smart-Traffic-AI-MVP/?v=191

The current executable combines the traffic-engine MVP, Dynamic Risk Digital Twin, deterministic predictive orchestration, explainability, policy guardrails, scenario replay, acquisition presentation, guided executive demo, Acquisition Decision Room, SHA-256 decision integrity, Exact Replay, browser E2E assurance, and the v1.9.1 Authoritative Live-State Migration.

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

Version 1.9.1 does not promote a historical capability merely because runtime architecture, auditability or browser assurance became stronger.

## Engineering MVP v1.9.1 — Authoritative Live-State Migration

Version 1.9.1 completes Stage C of the production-hardening work for the executable build: the Unified State Bus is now the operational source of truth for the assembled browser runtime rather than a polling/reconciliation audit mirror.

New and changed components:

- `engine/authoritativeRuntimeStore.js` — singleton ownership layer over the deterministic unified-state reducer.
- `engine/unifiedStateBus.js` — authoritative event reducer for operational mutations.
- `scripts/prepare-authoritative-runtime-v191.mjs` — transforms the executable `app.js` build so core mutations dispatch through the authoritative store.
- `hardeningRuntime.js` — directly subscribes to the same authoritative state; no periodic reconciliation poll is used in the normal v1.9.1 path.
- `tests/authoritativeRuntimeStore.test.js` — direct state-ownership and mutation-isolation tests.
- `e2e/executable-platform.spec.js` — browser tests proving authoritative incident, route-input and traffic-drift behavior.
- `scripts/build-executable-site-v190.mjs` — retained filename, now emits the v1.9.1 executable and applies both compatibility and authoritative migration steps.

The v1.9.1 boundary remains:

- `stateAuthority=unified-state-bus` in the executable build.
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

## Authoritative operational state

`engine/unifiedStateBus.js` uses schema:

`smart-traffic-live-state/v1`

`engine/authoritativeRuntimeStore.js` owns the current unified state and exposes cloned snapshots through:

- `initializeAuthoritativeRuntime()`;
- `getAuthoritativeState()`;
- `dispatchAuthoritativeEvent()`;
- `subscribeAuthoritativeState()`.

External snapshots and subscriber callbacks cannot mutate the stored authoritative state directly.

The executable build routes operational changes through explicit events including:

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

Each accepted event advances a monotonic sequence and state revision through the deterministic reducer.

`runtime_reconciled` remains available in the reducer for backward compatibility, but the normal Stage C executable path no longer depends on it. Browser E2E explicitly verifies that incident mutation reaches the authoritative state without a reconciliation event.

### Source/build distinction

The repository intentionally retains the historical raw `app.js` source and applies the Stage C transformation while assembling the executable site. `scripts/prepare-authoritative-runtime-v191.mjs` converts the assembled application runtime so the operational network mutations dispatch through `engine/authoritativeRuntimeStore.js`.

Therefore the accurate claim is:

- the **v1.9.1 executable build** uses the Unified State Bus as its operational source of truth;
- the transformed top-level legacy `state` object is a derived UI mirror for compatibility;
- the raw historical `app.js` file should not by itself be interpreted as the final authoritative architecture.

This distinction is deliberate and is covered by executable-build and browser E2E tests.

## Hardening runtime now consumes the same state

`hardeningRuntime.js` no longer constructs a separate captured state or periodically polls the application for reconciliation.

It now:

1. waits for `window.smartTrafficRuntime` to expose `getUnifiedState()` and `subscribe()`;
2. subscribes directly to the authoritative store;
3. displays the exact authoritative revision and fingerprint;
4. captures a decision from that exact snapshot;
5. records the decision in the SHA-256 ledger;
6. dispatches `decision_recorded` back through the same state authority;
7. performs Exact Replay from the captured deterministic package.

The Acquisition Decision Room panel is now labeled:

`Authoritative Runtime State, Decision Ledger & Exact Replay`

## SHA-256 decision integrity ledger

`engine/decisionLedgerEngine.js` uses schema:

`smart-traffic-decision-ledger/v1`

Every captured decision entry contains:

- monotonic sequence;
- authoritative state revision;
- SHA-256 state fingerprint;
- input fingerprint;
- policy fingerprint;
- output fingerprint;
- previous-entry hash;
- current-entry hash;
- deterministic method metadata;
- explicit simulation/evidence flags.

`verifyLedgerChain()` recalculates each entry hash and verifies the previous-hash chain. Mutating a stored entry invalidates verification.

This provides cryptographic integrity/tamper evidence for the demo ledger. It is not a digital signature, blockchain anchor, legal non-repudiation mechanism, or certified production audit system.

## Exact Replay packages

`engine/exactReplayEngine.js` uses schema:

`smart-traffic-exact-replay-package/v1`

A replay package preserves the authoritative captured state, route/emergency inputs, QCS observations, fleet, policy snapshot, deterministic options, original orchestration output and their fingerprints.

`replayDecisionPackage()` reruns the same deterministic `buildExplainablePolicyOrchestration()` path and checks:

- state fingerprint match;
- input fingerprint match;
- policy fingerprint match;
- output fingerprint match;
- selected-candidate match;
- robust-score match;
- aggregate `exactReplayMatch`.

“Exact Replay” means exactness within the captured deterministic software logic, state, policy and inputs. It does not claim recreation of a real-world physical traffic outcome.

## Browser and mobile E2E validation

`playwright.config.js` validates two executable browser projects:

- desktop Chromium at 1440 × 1000;
- mobile WebKit emulation at 390 × 844 with touch enabled.

`e2e/executable-platform.spec.js` now validates six end-to-end scenarios in both projects, for 12 browser tests total:

1. Entry-gate usability and mobile action reachability.
2. Acquisition Decision Room, Hardening Panel and 11-step Guided Demo loading, plus runtime version/state-authority checks.
3. Decision capture, SHA-256 ledger verification and Exact Replay match.
4. Incident mutation becoming authoritative immediately, with no `runtime_reconciled` event.
5. Route origin, destination, emergency target and route-risk weight becoming `decision_inputs_updated` authoritative state.
6. Explicit `traffic_drift_applied` mutation advancing revision/tick exactly through the authoritative event path.

Latest Stage C engineering browser result: 12/12 passed across Chromium and mobile WebKit emulation.

Engineering E2E run:

https://github.com/maksr2030/Smart-Traffic-AI-MVP/actions/runs/31666941448

WebKit mobile emulation is not physical-iPhone acceptance evidence. Physical-device acceptance remains separate.

## One build for test and deployment

`scripts/build-executable-site-v190.mjs` remains the shared executable-site builder for browser E2E and GitHub Pages. Despite its historical filename, it now builds v1.9.1 and runs:

1. `scripts/prepare-runtime-sync-v183.mjs` for compatibility;
2. `scripts/prepare-authoritative-runtime-v191.mjs` for Stage C state-authority migration;
3. the same asset assembly/cache-busting path consumed by E2E and Pages.

This prevents testing a differently assembled site from the one intended for publication.

## Validation status

Latest Stage C engineering validation includes:

- 123 unique registry records validated.
- Coverage unchanged at 33 implemented / 17 represented / 73 catalogued / 0 production verified.
- 62/62 Node unit/integration tests passing.
- Static executable smoke contract passing.
- Acquisition Decision Room contract passing.
- Authoritative Production Hardening contract passing.
- 12/12 Playwright browser E2E tests passing across desktop Chromium and mobile WebKit emulation.

The final documentation-head CI/E2E links are updated after the documentation commit is validated.

## Explainable orchestration and policy guardrails retained

The v1.8 governance layer remains active.

The deterministic robust score is:

`0.80 × weightedMeanScore + 0.20 × worstHorizonScore + interventionPenalty`

The explanation reports score contributions, differences versus `observe_only`, and reasons alternatives lost. It remains arithmetic/model-internal and sets `causalClaim=false`.

`data/orchestration_policy.json` continues to constrain target count, simulated load reduction, incident relief, intervention penalty, simulation-only operation, mandatory human approval, automatic-application prohibition and production-control prohibition.

`buildScenarioReplay()` continues to compare the policy-selected candidate with `observe_only` at 5, 15, 30 and 60 minutes.

## Predictive orchestration retained

`engine/predictiveOrchestrationEngine.js` continues to project deterministic state at 5, 15, 30 and 60 minutes, rebuild the Dynamic Risk Digital Twin, identify hotspots, evaluate four candidates, rank them across horizons and return a recommendation without field application.

Forecasting remains a deterministic engineering baseline, not a trained production AI model.

## Dynamic Risk Digital Twin retained

`engine/dynamicRiskTwinEngine.js` continues to fuse:

- network load: `0.30`;
- incident severity: `0.28`;
- QCS proxy risk: `0.32`;
- closure state: `0.10`.

The same twin snapshot feeds route, signal and virtual emergency decisions inside each evaluated candidate/horizon.

## QCS and QTOS demo coverage

Executable QCS proxy logic meaningfully represents selected directly verified track-local capabilities including `QCS-80`, `QCS-85` through `QCS-88`, `QCS-92` and `QCS-101` within the documented simulation boundary.

QTOS executable mappings retain Dynamic City Traffic Digital Twin, predictive risk baseline, network-wide predictive load-balancing recommendation, proactive crisis-management recommendation and multi-horizon candidate simulation/ranking.

No QCS/QTOS demo is evidence of real quantum sensing, real quantum V2V/V2I communication or field actuation.

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

Raw source preview:

```bash
python -m http.server 8000
```

For the exact authoritative v1.9.1 assembled executable build:

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

Production deployment still requires, among other controls:

- authenticated real-time interfaces and authoritative data contracts;
- calibrated sensing or authority-approved high-fidelity datasets;
- validated predictive models where appropriate;
- approved operating policies and authority controls;
- cyber-security, identity, privacy and secrets management;
- safety engineering, hazard analysis and fail-safe behavior;
- signed/authorized audit where required;
- observability, alerting, health-state and error monitoring;
- resilience, load, latency and failure-injection testing;
- controlled traffic-controller and emergency-agency integration;
- physical-device/browser acceptance testing;
- staged sandbox, shadow-mode and controlled field validation.

The next production-hardening stage is resilience/health/error handling and failure injection. It must not be represented as already complete.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.