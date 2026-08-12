# Smart AI Traffic Platform MVP

Engineering proof-of-concept for a city-scale and sovereign traffic intelligence platform.

## Current status

- MVP version: 1.2.
- 101 source records in a searchable bilingual registry.
- 48 verified historical features from legacy ranges 1-10 and 200-237.
- 23 conversation-recovered capabilities without verified legacy numbers.
- 5 additional capabilities recovered from project history.
- 25 independent QTOS capabilities from the Quantum Traffic Orchestration System package.
- Historical identifiers 11-199 remain reserved and are not fabricated.
- Operational indicators use simulated data only. No live government, camera, signal, connected-vehicle, enforcement or road-data integration is claimed.

## Testable engineering core

The repository now contains a deterministic graph-based traffic engine rather than a dashboard-only simulation.

Implemented functions include:

1. Road-network model validation.
2. Congestion and incident-adjusted edge travel cost.
3. Congestion-weighted shortest-path routing.
4. Rerouting around closed or penalized road segments.
5. Authorized priority-edge weighting for emergency corridor demonstrations.
6. Demand scaling and incident injection.
7. Adaptive signal green-time allocation under minimum-green constraints.
8. Network load, critical-edge and stress metrics.
9. Scenario simulation and lower-stress candidate selection.

## Interactive MVP modules

1. Simulated city network with 12 nodes and 17 connected road edges.
2. Network load, average edge travel time, critical-edge count and stress index.
3. Routing and incident test bench with selectable origin, destination and road segment.
4. Adaptive traffic-signal planning demonstration.
5. Network-aware rerouting demonstration.
6. Emergency-priority route demonstration.
7. QTOS scenario comparison demonstration.
8. Normal, rush-hour, major-event and severe-weather scenarios.
9. Decision log.
10. Searchable bilingual feature registry with provenance classes.

## Automated evidence

GitHub Actions runs two independent checks on every relevant push and pull request:

- feature-registry integrity and provenance validation;
- Node.js traffic-engine unit tests.

The unit-test suite checks network validity, congestion cost behavior, route computation, incident rerouting, signal allocation, network stress and incident detection.

## Run locally

A local HTTP server is required because browser modules and registry files are loaded through HTTP:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

For engineering validation:

```bash
npm run validate
npm test
```

## Evidence boundary

This repository deliberately separates:

- documented platform capability;
- MVP-demonstrated engineering behavior;
- production-verified external integration.

A documented capability is not automatically a production integration. Production claims require separate authenticated integration evidence, security verification, operational logs and controlled field or high-fidelity validation.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
