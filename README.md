# Smart AI Traffic Platform — Engineering MVP v1.3

Public engineering proof-of-concept for a city-scale and sovereign traffic intelligence platform.

## Unified registry status

The repository currently exposes 108 source records in the bilingual unified registry:

- 52 verified Main Legacy historical features from ranges 1-14 and 200-237.
- 23 conversation-recovered capabilities without verified Main Legacy numbers.
- 5 additional capabilities recovered from project history.
- 25 QTOS capabilities.
- 3 directly reopened QCS track-local capabilities: `QCS-102`, `QCS-103`, and `QCS-104`.

Main Legacy identifiers 15-199 remain reserved and are not fabricated.

The registry count is intentionally separate from forensic recovery-ledger counts, candidate rows and cross-project source records.

## Complete forensic accounting

The secondary source `Smart_Traffic_Forensic_Master_Recovery_v0_3.html` has SHA-256:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

It preserves 213 Arabic recovery-ledger rows across 14 historical tracks. The repository now contains an explicit accounting index:

`evidence/FORENSIC_V0_3_TRACK_COVERAGE_INDEX.json`

The CI validator requires all 14 tracks to have an explicit registry, evidence, candidate-map, precursor or exclusion destination, and verifies that their row counts sum to exactly 213/213.

The 213 recovery-ledger rows are not claimed to be 213 unique canonical features. They contain overlapping capabilities, reused historical numbers, secondary candidates and cross-project material.

## Historical evidence layers

### Directly promoted Main Legacy

- 1-10 — original Arabic/English Smart Traffic files.
- 11-14 — directly reopened 17 October 2024 Smart Traffic conversation.
- 200-237 — verified REDS2 historical block.

### Directly promoted QCS

- `QCS-102`
- `QCS-103`
- `QCS-104`

`QCS-102` has two historical English-title variants; the conflict is preserved rather than silently reconciled.

### Verified precursor with zero registry effect

A directly reopened 7 October 2024 smart-city conversation confirms Idea 9 and the BRD title:

`AI-Powered Smart Toll Management System for Optimizing Traffic Flow and Revenue Generation`

Evidence:

`evidence/OCT07_TRAFFIC_PRECURSOR_EVIDENCE.md`

This is retained as a traffic-related smart-city precursor, not as a replacement for Main Legacy Feature 9, because the source context predates the later Smart Traffic feature sequence and reused number 9 for different content.

## Normalized forensic maps

The repository currently preserves these secondary forensic layers without inflating the 108-record unified registry:

- `evidence/QCS_FORENSIC_CANDIDATE_MAP_v0_3.json` — 54 QCS rows; 3 separately promoted direct, 51 remain candidates.
- `evidence/MAIN_LEGACY_FORENSIC_CANDIDATES_15_199_v0_3.json` — 23 Main Legacy candidates; zero promoted from this map.
- `evidence/QTC_FORENSIC_CANDIDATE_MAP_v0_3.json` — 14 QTC candidates; zero promoted.
- `evidence/OCT17_APP_FORENSIC_CANDIDATE_MAP_v0_3.json` — 14 unnumbered October 2024 traffic-app rows with overlap crosswalks; reconciliation pending.
- `evidence/IDEAS100_FORENSIC_CANDIDATE_MAP_v0_3.json` — February 2025 100-ideas track: rows 1-3 recovered, 4-100 explicitly open.
- `evidence/DEC17_TRAFFIC_TRACK_FORENSIC_MAP_v0_3.json` — full 16-row December 17 track: 2 B candidates and 14 existence-only rows.
- `evidence/CROSS_PROJECT_TRAFFIC_INTEGRATION_CANDIDATES_v0_3.json` — 2 Smart AI Environment integration candidates kept outside Smart Traffic legacy numbering.

Across QCS, Main Legacy and QTC alone, 88 rows remain unpromoted: 51 + 23 + 14. OCT17 and IDEAS100 are additional reconciliation rows and may overlap existing unified capabilities.

## Highest-priority open recovery targets

Main Legacy:

- 46 — automated traffic control and congestion prevention.
- 47 — intelligent traffic-signal management and congestion prevention.
- 77 — heavy-truck monitoring and regulation.
- 114 — instant traffic solutions during sudden crises.
- 115 — road-fee and financial-flow management.
- 116 — parking management and financial utilization.
- 117 — traffic carbon-emissions reduction.
- 118 — truck-flow and logistics-efficiency analysis.
- 148 — existence lead only; title unrecovered.
- 149 — AI traffic-violation monitoring platform.
- 152 — real-time traffic-violation recognition.

QCS next direct-source sequence:

`101 → 100 → 99 → 98 → 97 → 96 → 95 → 94 → 93`

QTC first direct-source targets:

`46 → 47 → 48`, then `82 → 83`.

IDEAS100 remains open from `4-100` because current source retrieval did not independently reopen those historical items.

## Evidence framework files

- `evidence/EVIDENCE_REGISTER.json` — central machine-readable evidence register.
- `evidence/FORENSIC_V0_3_TRACK_COVERAGE_INDEX.json` — complete 213-row track accounting.
- `evidence/QTOS_SOURCE_EVIDENCE.md` — QTOS source mapping.
- `evidence/QCS_RECOVERY_EVIDENCE.md` — direct QCS 102-104 evidence.
- `evidence/OCT07_TRAFFIC_PRECURSOR_EVIDENCE.md` — direct precursor evidence.
- `evidence/SOURCE_INTAKE_TEMPLATE.md` — source-intake procedure.
- `evidence/RECOVERY_QUEUE.md` — open recovery targets.
- `FEATURE_PROVENANCE.md` — promotion and namespace policy.

## Archived QTOS evidence

The original bilingual QTOS source is archived at:

`evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html`

Its SHA-256 is:

`a0e7bf1e78e2fb271012dbca722b4d03a2a9e957c0a19778353a23e680472d9f`

The artifact maps to `QTOS-01` through `QTOS-25` and does not duplicate registry records.

## Engineering MVP v1.3

The current branch includes:

1. A testable graph traffic engine with 12 simulated nodes and 17 road links.
2. Congestion-weighted routing and incident-aware rerouting.
3. Deterministic adaptive signal allocation.
4. Concurrent multi-incident scenarios.
5. A city operations engine for demand, incidents and deterministic mitigation baselines.
6. A transparent short-horizon forecast baseline for 15, 30 and 60 minutes; it is not represented as a trained AI model.
7. Simulated emergency-fleet dispatch.
8. Before/after network comparison.
9. Operational JSON export carrying `simulation: true`.
10. Feature coverage CSV export.
11. A dynamic 108-capability coverage matrix.
12. `production_verified` remains false for every unified capability until independent integration evidence exists.
13. Automated registry, evidence, forensic-accounting, unit, syntax and static-wiring checks through GitHub Actions.

Current validated coverage remains:

- 24 `implemented_demo`
- 14 `represented_demo`
- 70 `catalogued_only`
- 0 `production_verified`

## Coverage semantics

`implemented_demo` means executable MVP logic exists for a meaningful portion of the documented capability.

`represented_demo` means the capability is represented by a related simulation, workflow, design boundary or partial mechanism, but the full capability is not implemented.

`catalogued_only` means the source capability is preserved in the unified registry but not implemented in the current MVP.

`production_verified` is a separate evidence dimension.

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

The validation pipeline checks registry counts, namespace boundaries, direct evidence mappings, SHA-256 source provenance, candidate-map counts, the full 14-track / 213-row forensic accounting, the reserved Main Legacy range, coverage semantics, traffic-engine tests, JavaScript syntax and static MVP wiring.

## Evidence boundary

All network, fleet, incident, scenario, forecast and intervention outputs in this repository are proof-of-concept simulation data. They do not claim live government, road, camera, vehicle, enforcement or emergency-service integration. Production readiness requires authenticated interfaces, integration tests, security testing, auditability, governance controls and controlled field or high-fidelity simulation validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
