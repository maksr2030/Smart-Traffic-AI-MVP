# Smart AI Traffic Platform MVP

Public proof-of-concept for a city-scale and sovereign traffic intelligence platform.

Current implementation status:

- 100 source records are exposed in a searchable bilingual registry.
- 48 are verified historical features from the recovered legacy ranges 1-10 and 200-237.
- 22 are conversation-recovered capabilities without verified legacy numbers.
- 5 are additional capabilities recovered from project history.
- 25 are independent QTOS capabilities from the Quantum Traffic Orchestration System package.
- Historical identifiers 11-199 remain reserved and are not fabricated.
- The interactive dashboard uses simulation data only. It does not claim live government, road, camera, vehicle, or enforcement integration.

## MVP modules

1. Simulated city network twin with 12 virtual road segments.
2. Congestion and delay indicators.
3. Adaptive signal intervention demonstration.
4. Network-aware rerouting demonstration.
5. Emergency-priority corridor demonstration.
6. QTOS hybrid optimization demonstration.
7. Decision log.
8. Searchable bilingual feature and capability registry with provenance classes.

## Run locally

Use a local HTTP server because the registry is loaded with `fetch()`:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Evidence boundary

This repository separates three concepts:

- documented platform capability,
- MVP demonstration,
- production-verified integration.

A documented capability is not automatically represented as a production integration. All live-looking metrics in this MVP are explicitly simulated until a separate technical evidence package establishes otherwise.

## Intellectual property

All rights reserved to Eng. Mohamed Abdulkarim Sulaiman Rihan.
