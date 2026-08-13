import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalJson, sha256Fingerprint } from '../engine/auditHash.js';
import {
  appendTrafficEvent,
  createUnifiedTrafficState,
  replayTrafficEvents,
  snapshotTrafficState,
  stateFingerprint
} from '../engine/unifiedStateBus.js';
import {
  appendLedgerEntry,
  createDecisionLedger,
  decisionLedgerEvidenceBoundary,
  verifyLedgerChain
} from '../engine/decisionLedgerEngine.js';
import {
  captureReplayPackage,
  exactReplayEvidenceBoundary,
  replayDecisionPackage
} from '../engine/exactReplayEngine.js';

async function json(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

const [network, observations, fleet, policy] = await Promise.all([
  json('../data/network.json'),
  json('../data/qcs_demo_observations.json'),
  json('../data/emergency_fleet.json'),
  json('../data/orchestration_policy.json')
]);

function makeState() {
  return createUnifiedTrafficState({
    network,
    qcsObservations: observations,
    fleet,
    policy,
    routeParameters: { origin: 'N1', destination: 'N8', routeRiskWeight: 1.8 },
    emergencyTarget: 'N10',
    scenarioId: 'normal'
  });
}

test('unified state bus starts deterministic and preserves source fixtures', () => {
  const originalLoad = network.edges.find(edge => edge.id === 'E09').load;
  const state = makeState();
  state.network.edges.find(edge => edge.id === 'E09').load = 99;
  assert.equal(network.edges.find(edge => edge.id === 'E09').load, originalLoad);
  assert.equal(state.schema, 'smart-traffic-live-state/v1');
  assert.equal(state.revision, 0);
  assert.equal(state.sequence, 0);
  assert.equal(state.evidence.productionControlConnected, false);
});

test('incident event is immutable, increments revision once and becomes active state', () => {
  const before = makeState();
  const after = appendTrafficEvent(before, { type: 'incident_injected', payload: { edgeId: 'E09', severity: 0.9, closed: false, loadIncrease: 18 } });
  assert.equal(before.revision, 0);
  assert.equal(after.revision, 1);
  assert.equal(after.sequence, 1);
  assert.equal(after.activeIncidents.length, 1);
  assert.equal(after.activeIncidents[0].edgeId, 'E09');
  assert.equal(after.network.edges.find(edge => edge.id === 'E09').incidentSeverity, 0.9);
  assert.equal(before.network.edges.find(edge => edge.id === 'E09').incidentSeverity ?? 0, 0);
});

test('traffic drift event is deterministic and replayable', () => {
  const initial = makeState();
  const event = { type: 'traffic_drift_applied', payload: { tick: 7, deltas: { E01: 3, E02: -2 } } };
  const once = appendTrafficEvent(initial, event);
  const replayed = replayTrafficEvents(initial, [event]);
  assert.deepEqual(replayed.network, once.network);
  assert.equal(replayed.tick, 7);
  assert.equal(replayed.revision, 1);
});

test('manual reset clears incident-derived runtime state and advances revision', () => {
  const incident = appendTrafficEvent(makeState(), { type: 'incident_injected', payload: { edgeId: 'E09' } });
  const reset = appendTrafficEvent(incident, { type: 'manual_reset', payload: {} });
  assert.equal(reset.revision, 2);
  assert.equal(reset.activeIncidents.length, 0);
  assert.equal(reset.dynamicRiskTwin, null);
  assert.equal(reset.predictiveOrchestration, null);
});

test('canonical JSON and SHA-256 fingerprints are stable across object key order', async () => {
  const left = { b: 2, a: { z: 9, y: 8 } };
  const right = { a: { y: 8, z: 9 }, b: 2 };
  assert.equal(canonicalJson(left), canonicalJson(right));
  assert.equal(await sha256Fingerprint(left), await sha256Fingerprint(right));
});

test('state fingerprint changes after a state event', async () => {
  const before = makeState();
  const after = appendTrafficEvent(before, { type: 'route_parameters_updated', payload: { routeRiskWeight: 3.5 } });
  assert.notEqual(await stateFingerprint(before), await stateFingerprint(after));
});

test('decision ledger forms a valid SHA-256 chain across entries', async () => {
  let ledger = createDecisionLedger();
  const state = makeState();
  ({ ledger } = await appendLedgerEntry(ledger, {
    stateSnapshot: snapshotTrafficState(state),
    stateRevision: state.revision,
    inputs: { origin: 'N1', destination: 'N8' },
    policy,
    output: { selected: 'balanced_preemptive', robustScore: 42.1 }
  }));
  ({ ledger } = await appendLedgerEntry(ledger, {
    stateSnapshot: snapshotTrafficState(state),
    stateRevision: state.revision,
    inputs: { origin: 'N1', destination: 'N10' },
    policy,
    output: { selected: 'safety_priority', robustScore: 39.2 }
  }));
  const verification = await verifyLedgerChain(ledger);
  assert.equal(verification.valid, true);
  assert.equal(verification.checkedEntries, 2);
  assert.equal(ledger.entries[1].previousEntryHash, ledger.entries[0].entryHash);
  assert.equal(ledger.entries[0].entryHash.length, 64);
});

test('decision ledger verification detects tampering', async () => {
  let ledger = createDecisionLedger();
  ({ ledger } = await appendLedgerEntry(ledger, {
    stateSnapshot: makeState(),
    inputs: { route: 'N1-N8' },
    policy,
    output: { selected: 'observe_only' }
  }));
  ledger.entries[0].metadata.tampered = true;
  const verification = await verifyLedgerChain(ledger);
  assert.equal(verification.valid, false);
  assert.ok(verification.failures.some(item => item.reason === 'entry_hash_mismatch'));
});

test('exact replay reproduces the same deterministic recommendation fingerprint', async () => {
  const state = makeState();
  const replayPackage = await captureReplayPackage({
    state,
    inputs: { origin: 'N1', destination: 'N8', emergencyTarget: 'N10', options: { horizons: [5, 15, 30, 60], routeRiskWeight: 1.8 } }
  });
  const replay = await replayDecisionPackage(replayPackage);
  assert.equal(replay.comparison.exactReplayMatch, true);
  assert.equal(replay.comparison.outputFingerprintMatch, true);
  assert.equal(replay.comparison.policyMatch, true);
  assert.equal(replay.replayedOutputFingerprint, replayPackage.originalOutputFingerprint);
});

test('exact replay preserves an injected incident in the captured state', async () => {
  const incidentState = appendTrafficEvent(makeState(), {
    type: 'incident_injected',
    payload: { edgeId: 'E09', severity: 0.9, closed: false, loadIncrease: 18 }
  });
  const replayPackage = await captureReplayPackage({
    state: incidentState,
    inputs: { origin: 'N1', destination: 'N8', emergencyTarget: 'N10', options: { horizons: [5, 15, 30, 60], routeRiskWeight: 1.8 } }
  });
  assert.equal(replayPackage.stateSnapshot.activeIncidents[0].edgeId, 'E09');
  const replay = await replayDecisionPackage(replayPackage);
  assert.equal(replay.comparison.exactReplayMatch, true);
});

test('audit and replay evidence boundaries do not claim signatures, blockchain or field proof', () => {
  assert.equal(decisionLedgerEvidenceBoundary.digitalSignature, false);
  assert.equal(decisionLedgerEvidenceBoundary.blockchainAnchored, false);
  assert.equal(decisionLedgerEvidenceBoundary.nonRepudiation, false);
  assert.equal(exactReplayEvidenceBoundary.realWorldGroundTruthReplay, false);
  assert.equal(exactReplayEvidenceBoundary.productionSafetyProof, false);
});
