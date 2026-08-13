# Smart AI Traffic Platform — Engineering MVP v1.4

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

## Engineering MVP v1.4

Version 1.4 adds two major engineering changes.

### Dynamic registry loading

The browser no longer contains a hard-coded list of feature JSON files. `app.js` loads `data/features.json`, follows `manifest.files`, validates the loaded row count against `manifest.total`, and builds the feature and coverage views from the resulting registry. This prevents newly recovered capabilities from silently disappearing from the UI.

### QCS risk and preventive-response lab

`engine/qcsRiskEngine.js` implements a deterministic simulation proxy for a subset of recovered QCS capabilities. It consumes simulated road observations such as road quality, roughness, visibility, weather severity, blind-spot risk, curvature risk, friction, hidden-hazard confidence and vehicle speed.

The engine produces:

- deterministic segment risk scores;
- low/moderate/high/critical risk levels;
- suggested preventive speeds;
- simulated stability-control, suspension, blind-spot, curve, weather, braking and rerouting recommendations;
- simulated V2X-style hazard messages;
- corridor-level risk summaries.

The QCS proxy explicitly reports:

- `simulation: true`
- `quantumHardwareConnected: false`
- `quantumCommunicationClaim: false`
- no connected vehicle actuator.

No quantum sensing, quantum communications, vehicle control or field-road integration is claimed by this MVP.

## QCS demo coverage

Executable demo logic now meaningfully represents:

- `QCS-80` — vehicle stability and skid-prevention risk logic.
- `QCS-85` — rough-terrain response logic.
- `QCS-86` — blind-spot risk logic.
- `QCS-87` — severe-weather response logic.
- `QCS-88` — sharp-turn risk logic.
- `QCS-92` — road-quality and vehicle-response logic.

Related capabilities such as `QCS-93`, `QCS-94`, `QCS-95`, `QCS-101`, `QCS-103` and `QCS-104` are represented by proxy workflows or design boundaries rather than claimed as fully implemented.

## Validated coverage

Latest successful CI validation reports:

- 123 total registry records.
- 30 `implemented_demo`.
- 20 `represented_demo`.
- 73 `catalogued_only`.
- 0 `production_verified`.

The current automated suite passes **21/21 tests** and validates the traffic engine, operations engine, QCS risk engine, coverage model, registry provenance and static application wiring.

The static smoke check validates:

- 24 required/dynamic files;
- 64 DOM bindings;
- 12 simulated road nodes;
- 17 road links;
- 5 operating scenarios;
- 4 virtual emergency units;
- 6 QCS simulated observations.

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

## Existing operational capabilities

The branch also retains:

1. A graph traffic engine with 12 nodes and 17 road links.
2. Congestion-weighted routing and incident-aware rerouting.
3. Deterministic adaptive signal allocation.
4. Concurrent multi-incident scenarios.
5. City operations logic for demand, incidents and deterministic mitigation baselines.
6. Transparent short-horizon forecast baselines.
7. Simulated emergency-fleet dispatch.
8. Before/after intervention comparison.
9. Operational JSON export carrying `simulation: true`.
10. Coverage CSV export.
11. Dynamic bilingual feature and evidence views.

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

All network, fleet, incident, scenario, forecast, intervention and QCS outputs are proof-of-concept simulation data. Production readiness requires authenticated data interfaces, security controls, integration contracts, realistic datasets, observability, auditability, resilience testing and controlled field or high-fidelity validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
