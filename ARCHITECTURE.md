# Architecture and Evidence Boundary

## Objective

The Smart AI Traffic Platform MVP demonstrates a city-scale and sovereign traffic intelligence layer rather than a standalone navigation application.

## Logical architecture

- Data ingestion layer: road sensors, traffic signals, cameras, connected vehicles, weather, positioning, public transport, parking, logistics and infrastructure feeds when lawfully authorized.
- State layer: normalized nodes, road edges, loads, incident state, closures, capacity constraints and a dynamic graph representation.
- Intelligence layer: congestion-adjusted travel-cost computation, routing, scenario simulation, network metrics and candidate comparison.
- Orchestration layer: rerouting recommendations, adaptive signal plans, authorized emergency priority and future lane or multimodal control strategies.
- User layer: driver guidance, authorized sharing, vehicle-aware routing and cross-device delivery.
- Government layer: operational dashboards, diagnostic reporting, intervention evaluation and infrastructure prioritization.
- Governance layer: authorization, cybersecurity, privacy, auditability, local law and provider-interface constraints.

## MVP v1.2 engineering implementation

The testable engineering core is implemented in `engine/trafficEngine.js` using a deterministic graph model held in `data/network.json`.

The demo network contains 12 nodes and 17 connected road edges. Each edge can carry distance, speed limit, traffic load, incident severity and closure state.

The engine implements:

- graph and edge validation;
- congestion and incident-sensitive travel time;
- shortest-path selection using current weighted edge costs;
- route avoidance and priority-edge weighting;
- simulated incident injection and closure;
- demand scaling;
- constrained adaptive signal green-time allocation;
- network load, critical-edge and stress metrics;
- scenario simulation;
- lower-stress scenario selection for the QTOS demonstration.

## Verification architecture

The project includes two verification layers:

1. Traffic-engine unit tests under `tests/trafficEngine.test.js`.
2. Feature-registry provenance validation under `scripts/validate-registry.mjs`.

The GitHub Actions workflow `.github/workflows/ci.yml` executes both checks on relevant pushes and pull requests. This provides repeatable evidence that software changes do not silently break the engineering core or contaminate the historical feature registry.

## Simulation boundary

The current MVP intentionally uses controlled simulated road state rather than external production feeds. The simulation demonstrates software behavior and algorithmic interactions but does not constitute field validation, production performance proof or evidence of a live government integration.

## QTOS boundary

QTOS includes graph-based city representation, digital-twin concepts, advanced optimization and optional quantum or hybrid optimization. The current MVP implements a classical deterministic baseline and scenario-selection layer. Quantum or hybrid computing remains a candidate optimization extension and should only be claimed where a measurable advantage is demonstrated against appropriate classical baselines.

## Production evidence still required

Production readiness should be demonstrated separately through authenticated interfaces, integration and contract tests, high-fidelity scenario benchmarks, security testing, authorization controls, immutable audit logs, data-governance controls, observability, resilience tests and controlled field validation.
