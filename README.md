# Smart AI Traffic Platform — Engineering MVP v1.3

Public engineering proof-of-concept for a city-scale and sovereign traffic intelligence platform.

## Evidence status

The repository currently exposes 108 source records in a bilingual unified registry:

- 52 verified Main Legacy historical features from recovered ranges 1-14 and 200-237.
- 23 conversation-recovered capabilities without verified Main Legacy numbers.
- 5 additional capabilities recovered from project history.
- 25 independent QTOS capabilities from the Quantum Traffic Orchestration System package.
- 3 directly re-opened QCS track-local capabilities: `QCS-102`, `QCS-103`, and `QCS-104`.
- Main Legacy identifiers 15-199 remain reserved and are not fabricated.

The latest Main Legacy promotion is the block 11-14 from a Smart Traffic conversation dated 17 October 2024. The latest separate-track promotion is QCS 102-104 from the original 5 March 2025 collision-prevention / quantum-sensing conversation.

The capability registry, forensic recovery maps, MVP implementation status, and production-verification status are deliberately separate. A recovered candidate is not automatically a unified-registry record, and a documented capability is not automatically a production integration.

## Evidence and forensic recovery framework

The project now uses a layered evidence model:

1. Unified registry — only records that passed the applicable promotion rule.
2. Direct evidence — original files or directly reopened historical conversation evidence.
3. Forensic candidate maps — historically recovered leads preserved without inflating the unified registry.
4. MVP coverage — implementation evidence kept separate from historical-source evidence.

Core evidence files:

- `evidence/EVIDENCE_REGISTER.json` — machine-readable central evidence register.
- `evidence/source/` — archived original source artifacts where byte-level repository archival is available.
- `evidence/QTOS_SOURCE_EVIDENCE.md` — QTOS source-to-capability mapping.
- `evidence/QCS_RECOVERY_EVIDENCE.md` — direct QCS 102-104 conversation evidence and version-conflict record.
- `evidence/QCS_FORENSIC_CANDIDATE_MAP_v0_3.json` — 54 QCS recovery-ledger records; only 102-104 are currently promoted from direct evidence.
- `evidence/MAIN_LEGACY_FORENSIC_CANDIDATES_15_199_v0_3.json` — 23 Main Legacy candidates inside the reserved range 15-199; none currently promoted.
- `evidence/QTC_FORENSIC_CANDIDATE_MAP_v0_3.json` — 14 Quantum Traffic Computing candidates; none currently promoted.
- `evidence/SOURCE_INTAKE_TEMPLATE.md` — standard intake workflow for newly recovered files.
- `evidence/RECOVERY_QUEUE.md` — open historical recovery targets and unverified leads.
- `evidence/RECOVERY_SEARCH_LOG_2026-08-12.md` — controlled search log.
- `FEATURE_PROVENANCE.md` — provenance policy and promotion rules.

## Secondary forensic recovery artifact

`Smart_Traffic_Forensic_Master_Recovery_v0_3.html` was independently materialized and fingerprinted as a secondary forensic source.

SHA-256:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

It preserves 213 Arabic recovery-ledger records across multiple historical tracks, with confidence classes:

- A: 73
- B: 79
- B2: 42
- C: 17
- D: 2

This 213-record figure is a recovery-ledger count, not a claim of 213 unique canonical platform features after deduplication.

### Explicit candidate layers extracted from v0.3

The repository now preserves three high-value candidate maps without changing the 108-record unified registry:

- QCS: 54 forensic rows — 49 B, 3 B2, 2 C. QCS-102 through QCS-104 are separately promoted by direct source reopening; the other 51 remain candidates.
- Main Legacy 15-199: 23 forensic candidates. High-priority anchors include 46, 47, 77, 114-118, 148-149, and 152. None is promoted yet.
- QTC: 14 forensic candidates from the quantum traffic-computing track. None is promoted yet.

This means 88 candidate rows are currently preserved but not promoted: 51 QCS + 23 Main Legacy + 14 QTC. They are recovery leads, not additions to the unified feature count.

## Main Legacy recovery boundary

Main Legacy currently verifies 1-14 and 200-237. The range 15-199 remains open.

The forensic map preserves several strong December 2024 candidates, including:

- 46 — AI-based automated traffic control to prevent congestion.
- 47 — intelligent traffic-signal management to prevent congestion.
- 114 — instant traffic solutions during sudden crises.
- 117 — traffic carbon-emissions analysis and reduction solutions.
- 118 — truck-movement analysis and logistics-efficiency optimization.
- 152 — real-time traffic-violation recognition.

These remain candidates because the current recovery pass has not independently reopened the primary historical messages to the promotion standard.

## QCS direct recovery evidence

The directly reopened March 2025 conversation establishes:

- `QCS-102` — self-monitoring quantum sensors.
- `QCS-103` — autonomous-vehicle performance in extreme weather using quantum sensing.
- `QCS-104` — integrating vehicles into a smart traffic system using quantum-connected sensing.

`QCS-102` has two recovered historical English title variants. The conflict is preserved explicitly rather than silently reconciled. `QCS-101` remains a forensic candidate until its primary source can be independently reopened.

## QTC recovery boundary

QTC is a separate historical namespace from QTOS and Main Legacy. Its forensic map currently preserves 14 candidate rows, including:

- QTC-46 — quantum-based energy optimization for traffic infrastructure.
- QTC-47 — quantum-based dynamic traffic-signal management.
- QTC-48 — quantum-based traffic-flow prediction.
- QTC-82 — quantum-based ultra-secure vehicle-data encryption.
- QTC-83 — quantum-based smart-vehicle energy management.

These are not counted in the 108 unified records until primary-source reopening supports promotion.

## Archived QTOS source evidence

The original bilingual QTOS source artifact is preserved at:

`evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html`

The mapping from the source document's 25 features to `QTOS-01` through `QTOS-25` is preserved at:

`evidence/QTOS_SOURCE_EVIDENCE.md`

The evidence register identifies this source as `SRC-QTOS-001`. Its archived artifact is protected by SHA-256 provenance validation in CI. Adding this evidence does not duplicate QTOS registry records.

## Engineering MVP v1.3

The current branch includes:

1. A testable graph traffic engine with 12 simulated nodes and 17 road links.
2. Congestion-weighted routing and incident-aware rerouting.
3. Deterministic adaptive signal allocation.
4. Concurrent multi-incident scenarios.
5. A city operations engine for demand, incidents and deterministic mitigation baselines.
6. A transparent short-horizon forecast baseline for 15, 30 and 60 minutes. This is not represented as a trained AI model.
7. Simulated emergency-fleet dispatch that evaluates reachable available units and selects the fastest route.
8. Before/after comparison for network stress, average load, average edge travel time and critical edges.
9. Operational JSON export carrying `simulation: true`.
10. Feature coverage CSV export.
11. A dynamic 108-capability coverage matrix with three MVP states: `implemented_demo`, `represented_demo`, and `catalogued_only`.
12. `production_verified` remains false for every capability until independent integration evidence exists.
13. Automated registry, evidence, candidate-map, unit, syntax and static-wiring checks through GitHub Actions.

Current validated coverage remains 24 `implemented_demo`, 14 `represented_demo`, 70 `catalogued_only`, and 0 `production_verified`.

## Coverage semantics

`implemented_demo` means executable MVP logic exists for a meaningful portion of the documented capability.

`represented_demo` means the capability is represented by a related simulation, workflow, design boundary or partial mechanism, but the full capability is not implemented.

`catalogued_only` means the source capability is preserved in the unified registry but not implemented in the current MVP.

`production_verified` is a separate evidence dimension and is currently false for all unified records.

## Run locally

Use a local HTTP server because the application loads JSON datasets with `fetch()`:

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

The validation pipeline checks registry provenance, supported Main Legacy ID boundaries, QCS/QTC namespace separation, one-to-one coverage rows, the prohibition on unsubstantiated production verification, archived-source SHA-256 fingerprints, located Library mappings, direct conversation evidence for Main Legacy 11-14 and QCS 102-104, preservation of the QCS-102 version conflict, forensic v0.3 intake metadata, all three forensic candidate-map structures, preservation of the open Main Legacy range 15-199, traffic and operations logic, JavaScript syntax, required files, DOM wiring, scenario fixtures and emergency-fleet fixtures.

## Evidence boundary

All network, fleet, incident, scenario, forecast and intervention outputs in this repository are proof-of-concept simulation data. They do not claim live government, road, camera, vehicle, enforcement or emergency-service integration. Production readiness requires authenticated interfaces, integration tests, security testing, auditability, governance controls and controlled field or high-fidelity simulation validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
