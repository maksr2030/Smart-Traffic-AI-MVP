export const RUNTIME_HEALTH_SCHEMA = 'smart-traffic-runtime-health/v1';

export const HEALTH_STATUS = Object.freeze({
  READY: 'READY',
  DEGRADED: 'DEGRADED',
  BLOCKED: 'BLOCKED'
});

const severityRank = { READY: 0, DEGRADED: 1, BLOCKED: 2 };

function issue(code, status, message, details = {}) {
  return { code, status, message, details };
}

function hasArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function validateNetwork(network) {
  const issues = [];
  if (!network || !hasArray(network.nodes) || !hasArray(network.edges)) {
    issues.push(issue('NETWORK_MISSING', HEALTH_STATUS.BLOCKED, 'Operational network is missing or empty.'));
    return issues;
  }

  const nodeIds = new Set(network.nodes.map((node) => node.id));
  const invalidEdge = network.edges.find((edge) => !edge?.id || !nodeIds.has(edge.from) || !nodeIds.has(edge.to));
  if (invalidEdge) {
    issues.push(issue('NETWORK_INVALID_EDGE', HEALTH_STATUS.BLOCKED, 'Network contains an invalid edge reference.', { edgeId: invalidEdge.id ?? null }));
  }

  const badLoad = network.edges.find((edge) => !isFiniteNumber(edge.load) || Number(edge.load) < 0 || Number(edge.load) > 100);
  if (badLoad) {
    issues.push(issue('NETWORK_INVALID_LOAD', HEALTH_STATUS.BLOCKED, 'Network contains a non-finite or out-of-range load.', { edgeId: badLoad.id ?? null }));
  }
  return issues;
}

function validatePolicy(policy) {
  const issues = [];
  if (!policy || typeof policy !== 'object') {
    return [issue('POLICY_MISSING', HEALTH_STATUS.BLOCKED, 'Orchestration policy is unavailable.')];
  }
  if (policy.simulationOnly !== true || policy.requireHumanApproval !== true || policy.autoApplyAllowed !== false || policy.productionControlAllowed !== false) {
    issues.push(issue('POLICY_SAFETY_BOUNDARY_INVALID', HEALTH_STATUS.BLOCKED, 'Mandatory simulation and human-approval policy boundaries are not intact.'));
  }
  if (!isFiniteNumber(policy.maxTargetCount) || !isFiniteNumber(policy.maxLoadReduction) || !isFiniteNumber(policy.maxIncidentRelief)) {
    issues.push(issue('POLICY_LIMITS_INVALID', HEALTH_STATUS.BLOCKED, 'One or more orchestration policy limits are invalid.'));
  }
  return issues;
}

function validateDecisionInputs(state) {
  const issues = [];
  const params = state?.routeParameters || {};
  const emergencyTarget = state?.emergencyTarget;
  if (!params.origin || !params.destination || !emergencyTarget) {
    issues.push(issue('DECISION_INPUTS_INCOMPLETE', HEALTH_STATUS.DEGRADED, 'Route or emergency decision inputs are incomplete.'));
  }
  if (!isFiniteNumber(params.routeRiskWeight) || Number(params.routeRiskWeight) < 0) {
    issues.push(issue('ROUTE_RISK_WEIGHT_INVALID', HEALTH_STATUS.BLOCKED, 'Route risk weight is invalid.'));
  }
  return issues;
}

function validateQcs(state) {
  if (!Array.isArray(state?.qcsObservations) || state.qcsObservations.length === 0) {
    return [issue('QCS_OBSERVATIONS_UNAVAILABLE', HEALTH_STATUS.DEGRADED, 'QCS proxy observations are unavailable; risk fusion is degraded.')];
  }
  return [];
}

function validateFleet(state) {
  if (!Array.isArray(state?.fleet) || state.fleet.length === 0) {
    return [issue('EMERGENCY_FLEET_UNAVAILABLE', HEALTH_STATUS.DEGRADED, 'Virtual emergency fleet data is unavailable.')];
  }
  return [];
}

function validateRuntimeState(state) {
  const issues = [];
  if (!state || typeof state !== 'object') {
    return [issue('STATE_MISSING', HEALTH_STATUS.BLOCKED, 'Authoritative runtime state is unavailable.')];
  }
  if (!Number.isInteger(state.revision) || state.revision < 0) {
    issues.push(issue('STATE_REVISION_INVALID', HEALTH_STATUS.BLOCKED, 'Authoritative state revision is invalid.'));
  }
  if (!Number.isInteger(state.sequence) || state.sequence < 0) {
    issues.push(issue('STATE_SEQUENCE_INVALID', HEALTH_STATUS.BLOCKED, 'Authoritative event sequence is invalid.'));
  }
  issues.push(...validateNetwork(state.network));
  issues.push(...validateDecisionInputs(state));
  issues.push(...validateQcs(state));
  issues.push(...validateFleet(state));
  issues.push(...validatePolicy(state.policy));
  return issues;
}

function selectStatus(issues) {
  let status = HEALTH_STATUS.READY;
  for (const current of issues) {
    if ((severityRank[current.status] ?? 0) > severityRank[status]) status = current.status;
  }
  return status;
}

export function assessRuntimeHealth(state, options = {}) {
  const injected = Array.isArray(options.injectedIssues) ? options.injectedIssues : [];
  const issues = [...validateRuntimeState(state), ...injected];
  const status = selectStatus(issues);
  const blockingIssues = issues.filter((entry) => entry.status === HEALTH_STATUS.BLOCKED);
  const degradedIssues = issues.filter((entry) => entry.status === HEALTH_STATUS.DEGRADED);

  return {
    schema: RUNTIME_HEALTH_SCHEMA,
    status,
    ready: status === HEALTH_STATUS.READY,
    degraded: status === HEALTH_STATUS.DEGRADED,
    blocked: status === HEALTH_STATUS.BLOCKED,
    decisionAllowed: blockingIssues.length === 0,
    revision: state?.revision ?? null,
    sequence: state?.sequence ?? null,
    issueCount: issues.length,
    blockingCount: blockingIssues.length,
    degradedCount: degradedIssues.length,
    issues,
    evidence: {
      simulation: true,
      productionControlConnected: false,
      fieldActuation: false,
      safetyCertified: false
    }
  };
}

export function applyFailSafeDecisionGate(state, decision, options = {}) {
  const health = assessRuntimeHealth(state, options);
  if (!health.decisionAllowed) {
    return {
      allowed: false,
      status: HEALTH_STATUS.BLOCKED,
      decision: null,
      health,
      reason: 'FAIL_SAFE_BLOCKED',
      autoApply: false,
      humanApprovalRequired: true,
      fieldActuation: false
    };
  }

  return {
    allowed: true,
    status: health.status,
    decision,
    health,
    reason: health.degraded ? 'DEGRADED_WITH_GUARDRAILS' : 'READY',
    autoApply: false,
    humanApprovalRequired: true,
    fieldActuation: false
  };
}
