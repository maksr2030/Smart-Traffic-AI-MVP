import { HEALTH_STATUS, assessRuntimeHealth } from './runtimeHealthEngine.js';

export const FAILURE_INJECTION_SCHEMA = 'smart-traffic-failure-injection/v1';

function clone(value) {
  return globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

export const FAILURE_SCENARIOS = Object.freeze({
  missing_network: 'missing_network',
  corrupt_network_load: 'corrupt_network_load',
  missing_policy: 'missing_policy',
  unsafe_policy: 'unsafe_policy',
  missing_qcs: 'missing_qcs',
  missing_fleet: 'missing_fleet',
  invalid_decision_inputs: 'invalid_decision_inputs'
});

export function injectFailure(state, scenario) {
  const next = clone(state);
  switch (scenario) {
    case FAILURE_SCENARIOS.missing_network:
      next.network = null;
      break;
    case FAILURE_SCENARIOS.corrupt_network_load:
      if (next.network?.edges?.[0]) next.network.edges[0].load = Number.NaN;
      break;
    case FAILURE_SCENARIOS.missing_policy:
      next.policy = null;
      break;
    case FAILURE_SCENARIOS.unsafe_policy:
      next.policy = { ...(next.policy ?? {}), autoApplyAllowed: true, productionControlAllowed: true, requireHumanApproval: false, simulationOnly: false };
      break;
    case FAILURE_SCENARIOS.missing_qcs:
      next.qcsObservations = [];
      break;
    case FAILURE_SCENARIOS.missing_fleet:
      next.fleet = [];
      break;
    case FAILURE_SCENARIOS.invalid_decision_inputs:
      next.routeParameters = { ...(next.routeParameters ?? {}), origin: null, destination: null, routeRiskWeight: Number.NaN };
      next.emergencyTarget = null;
      break;
    default:
      throw new Error(`Unknown failure injection scenario: ${scenario}`);
  }
  return next;
}

export function runFailureInjection(state, scenario) {
  const injectedState = injectFailure(state, scenario);
  const health = assessRuntimeHealth(injectedState);
  return {
    schema: FAILURE_INJECTION_SCHEMA,
    scenario,
    health,
    blocked: health.status === HEALTH_STATUS.BLOCKED,
    degraded: health.status === HEALTH_STATUS.DEGRADED,
    decisionAllowed: health.decisionAllowed,
    simulation: true,
    stateMutationAppliedToAuthoritativeRuntime: false
  };
}

export function runFailureInjectionSuite(state) {
  return Object.values(FAILURE_SCENARIOS).map((scenario) => runFailureInjection(state, scenario));
}
