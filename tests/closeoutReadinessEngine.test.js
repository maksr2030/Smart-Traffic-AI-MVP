import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEngineeringCloseoutScorecard } from '../engine/closeoutReadinessEngine.js';

function baseline(overrides = {}) {
  return {
    coverageSummary: { total: 123, implemented_demo: 33, represented_demo: 17, catalogued_only: 73, production_verified: 0 },
    stateAuthority: 'unified-state-bus',
    healthStatus: 'READY',
    failureInjectionScenarios: 7,
    decisionLedger: true,
    exactReplay: true,
    nodeTests: 67,
    browserTests: 16,
    sameBuildForE2EAndPages: true,
    ...overrides
  };
}

test('engineering MVP can close while production verification remains explicitly absent', () => {
  const result = buildEngineeringCloseoutScorecard(baseline());
  assert.equal(result.status, 'ENGINEERING_MVP_CLOSEOUT_READY');
  assert.equal(result.engineeringCloseoutReady, true);
  assert.equal(result.engineeringPassed, result.engineeringTotal);
  assert.equal(result.productionReadiness, 'NOT_VERIFIED');
  assert.equal(result.productionVerifiedCount, 0);
  assert.equal(result.checks.find(item => item.id === 'production_verification').status, 'GAP');
});

test('registry accounting mismatch prevents closeout', () => {
  const result = buildEngineeringCloseoutScorecard(baseline({ coverageSummary: { total: 122, implemented_demo: 33, represented_demo: 17, catalogued_only: 72, production_verified: 0 } }));
  assert.equal(result.engineeringCloseoutReady, false);
  assert.equal(result.checks.find(item => item.id === 'registry_integrity').status, 'GAP');
});

test('blocked runtime prevents engineering closeout', () => {
  const result = buildEngineeringCloseoutScorecard(baseline({ healthStatus: 'BLOCKED' }));
  assert.equal(result.engineeringCloseoutReady, false);
  assert.equal(result.checks.find(item => item.id === 'runtime_health').status, 'GAP');
});

test('browser emulation never becomes physical iPhone evidence', () => {
  const result = buildEngineeringCloseoutScorecard(baseline({ browserTests: 20 }));
  assert.equal(result.evidenceBoundary.physicalIPhoneValidated, false);
  assert.equal(result.checks.find(item => item.id === 'browser_assurance').evidence.physicalIPhoneValidated, false);
});
