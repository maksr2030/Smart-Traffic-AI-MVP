import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HEALTH_STATUS, assessRuntimeHealth, applyFailSafeDecisionGate } from '../engine/runtimeHealthEngine.js';
import { FAILURE_SCENARIOS, runFailureInjectionSuite } from '../engine/failureInjectionEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8'));

function fixture() {
  return {
    revision: 7,
    sequence: 9,
    network: load('network.json'),
    qcsObservations: load('qcs_demo_observations.json'),
    fleet: load('emergency_fleet.json'),
    policy: load('orchestration_policy.json'),
    routeParameters: { origin: 'N1', destination: 'N8', routeRiskWeight: 1.8 },
    emergencyTarget: 'N6'
  };
}

test('healthy authoritative snapshot evaluates READY and allows guarded decision', () => {
  const state = fixture();
  const health = assessRuntimeHealth(state);
  assert.equal(health.status, HEALTH_STATUS.READY);
  assert.equal(health.decisionAllowed, true);
  const gate = applyFailSafeDecisionGate(state, { selectedCandidateId: 'observe_only' });
  assert.equal(gate.allowed, true);
  assert.equal(gate.autoApply, false);
  assert.equal(gate.humanApprovalRequired, true);
});

test('missing QCS proxy data degrades runtime without inventing production safety', () => {
  const state = fixture();
  state.qcsObservations = [];
  const health = assessRuntimeHealth(state);
  assert.equal(health.status, HEALTH_STATUS.DEGRADED);
  assert.equal(health.decisionAllowed, true);
  assert.equal(health.evidence.safetyCertified, false);
});

test('unsafe policy blocks decision through fail-safe gate', () => {
  const state = fixture();
  state.policy = { ...state.policy, simulationOnly: false, requireHumanApproval: false, autoApplyAllowed: true, productionControlAllowed: true };
  const gate = applyFailSafeDecisionGate(state, { selectedCandidateId: 'network_relief' });
  assert.equal(gate.allowed, false);
  assert.equal(gate.status, HEALTH_STATUS.BLOCKED);
  assert.equal(gate.decision, null);
  assert.equal(gate.reason, 'FAIL_SAFE_BLOCKED');
});

test('invalid network data blocks decision', () => {
  const state = fixture();
  state.network.edges[0].load = Number.NaN;
  const health = assessRuntimeHealth(state);
  assert.equal(health.status, HEALTH_STATUS.BLOCKED);
  assert.equal(health.decisionAllowed, false);
  assert.ok(health.issues.some((entry) => entry.code === 'NETWORK_INVALID_LOAD'));
});

test('failure injection suite is isolated and classifies all deterministic scenarios', () => {
  const state = fixture();
  const original = JSON.stringify(state);
  const results = runFailureInjectionSuite(state);
  assert.equal(results.length, Object.keys(FAILURE_SCENARIOS).length);
  assert.equal(JSON.stringify(state), original);
  const byName = Object.fromEntries(results.map((entry) => [entry.scenario, entry]));
  assert.equal(byName.missing_qcs.health.status, HEALTH_STATUS.DEGRADED);
  assert.equal(byName.missing_fleet.health.status, HEALTH_STATUS.DEGRADED);
  assert.equal(byName.missing_network.health.status, HEALTH_STATUS.BLOCKED);
  assert.equal(byName.unsafe_policy.decisionAllowed, false);
  assert.equal(byName.missing_policy.decisionAllowed, false);
  assert.equal(byName.invalid_decision_inputs.health.status, HEALTH_STATUS.BLOCKED);
  assert.ok(results.every((entry) => entry.stateMutationAppliedToAuthoritativeRuntime === false));
});
