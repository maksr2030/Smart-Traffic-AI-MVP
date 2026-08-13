# Stage D — Runtime Health, Resilience & Failure Injection

Stage D adds an engineering fail-safe layer to the executable Smart Traffic AI MVP without changing the historical capability coverage or making production-readiness claims.

## Runtime health states

The browser runtime is classified as one of:

- READY — required authoritative state, network, policy and decision inputs are valid.
- DEGRADED — optional supporting data such as QCS proxy observations or the virtual emergency fleet are unavailable, while no blocking safety condition is present.
- BLOCKED — a required state, network or safety-policy invariant is invalid. Decision output is suppressed by the fail-safe gate.

## Fail-safe decision gate

`engine/runtimeHealthEngine.js` evaluates the authoritative snapshot before a decision is considered usable. A BLOCKED health state returns no decision and preserves:

- `autoApply=false`;
- `humanApprovalRequired=true`;
- `fieldActuation=false`.

The gate is an engineering simulation guardrail. It is not a certified safety case or production traffic-control interlock.

## Failure injection

`engine/failureInjectionEngine.js` runs deterministic failure scenarios against cloned snapshots only. It does not mutate the authoritative runtime. Scenarios include missing/corrupt network data, missing/unsafe policy, missing QCS observations, missing virtual fleet data and invalid decision inputs.

## Browser health panel

`runtimeHealthRuntime.js` subscribes to the same authoritative browser state exposed by `window.smartTrafficRuntime` and renders a live Runtime Health & Fail-Safe Gate panel inside the Acquisition Decision Room or main executable page.

The browser panel also exposes an isolated failure-injection self-test so an evaluator can see which faults degrade operation and which faults block decisions.

## Evidence boundary

Stage D preserves the existing evidence boundary:

- simulation only;
- no live road/government control integration;
- no field actuation;
- no safety certification;
- no automatic application of orchestration recommendations;
- no increase in `production_verified` from this hardening work alone.
