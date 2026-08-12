# Smart AI Traffic Platform — Engineering MVP v1.3

Public engineering proof-of-concept for a city-scale and sovereign traffic intelligence platform.

## Evidence status

The repository currently exposes 101 source records in a bilingual registry:

- 48 verified historical features from recovered legacy ranges 1-10 and 200-237.
- 23 conversation-recovered capabilities without verified legacy numbers.
- 5 additional capabilities recovered from project history.
- 25 independent QTOS capabilities from the Quantum Traffic Orchestration System package.
- Historical identifiers 11-199 remain reserved and are not fabricated.

The capability registry, MVP implementation status, and production-verification status are deliberately separate. A documented capability is not automatically a production integration.

## Archived QTOS source evidence

The original bilingual QTOS source artifact supplied by the project owner is preserved at:

`evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html`

The mapping from the source document's 25 features to `QTOS-01` through `QTOS-25` is preserved at:

`evidence/QTOS_SOURCE_EVIDENCE.md`

The source artifact is protected by SHA-256 provenance validation in CI. Adding this evidence does not add duplicate registry records; the unified registry remains 101 source records.

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
11. A dynamic 101-capability coverage matrix with three MVP states: `implemented_demo`, `represented_demo`, and `catalogued_only`.
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

The validation pipeline checks registry provenance, historical-ID boundaries, one-to-one coverage rows, the prohibition on unsubstantiated production verification, the presence and SHA-256 fingerprint of the archived QTOS source evidence, all 25 QTOS identifiers and source attribution, traffic and operations logic, JavaScript syntax, required files, DOM wiring, scenario fixtures and emergency-fleet fixtures.

## Evidence boundary

All network, fleet, incident, scenario, forecast and intervention outputs in this repository are proof-of-concept simulation data. They do not claim live government, road, camera, vehicle, enforcement or emergency-service integration. Production readiness requires authenticated interfaces, integration tests, security testing, auditability, governance controls and controlled field or high-fidelity simulation validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
