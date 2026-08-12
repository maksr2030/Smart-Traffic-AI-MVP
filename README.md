# Smart AI Traffic Platform — Engineering MVP v1.3

Public engineering proof-of-concept for a city-scale and sovereign traffic intelligence platform.

## Evidence status

The repository currently exposes 105 source records in a bilingual registry:

- 52 verified historical features from recovered legacy ranges 1-14 and 200-237.
- 23 conversation-recovered capabilities without verified legacy numbers.
- 5 additional capabilities recovered from project history.
- 25 independent QTOS capabilities from the Quantum Traffic Orchestration System package.
- Historical identifiers 15-199 remain reserved and are not fabricated.

The latest verified historical recovery is the block 11-14 from a Smart Traffic conversation dated 17 October 2024. The source message explicitly presented a numbered Smart Traffic sequence through feature 14. English titles/descriptions for this recovered block are editorial translations of the Arabic source, not claims of original English wording.

The capability registry, MVP implementation status, and production-verification status are deliberately separate. A documented capability is not automatically a production integration.

## Evidence and forensic recovery framework

Source artifacts and historical conversation evidence are handled through a dedicated evidence layer:

- `evidence/EVIDENCE_REGISTER.json` — machine-readable central evidence register.
- `evidence/source/` — archived original source artifacts where byte-level access is available.
- `evidence/SOURCE_INTAKE_TEMPLATE.md` — standard intake workflow for newly recovered files.
- `evidence/RECOVERY_QUEUE.md` — open historical recovery targets and unverified leads.
- `evidence/RECOVERY_SEARCH_LOG_2026-08-12.md` — controlled search log.
- `FEATURE_PROVENANCE.md` — provenance policy and promotion rules.

The central evidence validator distinguishes archived byte-identical evidence, located Library sources, and direct historical conversation retrieval.

## Archived QTOS source evidence

The original bilingual QTOS source artifact supplied by the project owner is preserved at:

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
11. A dynamic 105-capability coverage matrix with three MVP states: `implemented_demo`, `represented_demo`, and `catalogued_only`.
12. `production_verified` remains false for every capability until independent integration evidence exists.
13. Automated registry, unit, syntax and static-wiring checks through GitHub Actions.

## Coverage semantics

`implemented_demo` means executable MVP logic exists for a meaningful portion of the documented capability.

`represented_demo` means the capability is represented by a related simulation, workflow, design boundary or partial mechanism, but the full capability is not implemented.

`catalogued_only` means the source capability is preserved in the registry but not implemented in the current MVP.

`production_verified` is a separate evidence dimension and is currently false for all records.

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

The validation pipeline checks registry provenance, supported historical-ID boundaries, one-to-one coverage rows, the prohibition on unsubstantiated production verification, archived-source SHA-256 fingerprints, located Library source mappings, historical conversation evidence for 11-14, preservation of the open historical range 15-199, traffic and operations logic, JavaScript syntax, required files, DOM wiring, scenario fixtures and emergency-fleet fixtures.

## Evidence boundary

All network, fleet, incident, scenario, forecast and intervention outputs in this repository are proof-of-concept simulation data. They do not claim live government, road, camera, vehicle, enforcement or emergency-service integration. Production readiness requires authenticated interfaces, integration tests, security testing, auditability, governance controls and controlled field or high-fidelity simulation validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
