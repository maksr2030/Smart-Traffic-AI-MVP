import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  authoritativeRuntimeEvidenceBoundary,
  clearAuthoritativeRuntimeForTests,
  dispatchAuthoritativeEvent,
  getAuthoritativeState,
  initializeAuthoritativeRuntime,
  isAuthoritativeRuntimeReady,
  subscribeAuthoritativeState
} from '../engine/authoritativeRuntimeStore.js';

async function json(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

const [network, observations, fleet] = await Promise.all([
  json('../data/network.json'),
  json('../data/qcs_demo_observations.json'),
  json('../data/emergency_fleet.json')
]);

function init() {
  clearAuthoritativeRuntimeForTests();
  return initializeAuthoritativeRuntime({
    network,
    baseNetwork: network,
    qcsObservations: observations,
    fleet,
    routeParameters: { origin: 'N1', destination: 'N8', routeRiskWeight: 1.8 },
    emergencyTarget: 'N10',
    scenarioId: 'normal',
    running: true
  });
}

test('authoritative runtime owns an isolated unified-state snapshot', () => {
  const initial = init();
  assert.equal(isAuthoritativeRuntimeReady(), true);
  assert.equal(initial.schema, 'smart-traffic-live-state/v1');
  assert.equal(initial.running, true);
  initial.network.edges[0].load = 100;
  assert.notEqual(getAuthoritativeState().network.edges[0].load, 100);
  assert.equal(authoritativeRuntimeEvidenceBoundary.sourceOfTruth, true);
  assert.equal(authoritativeRuntimeEvidenceBoundary.legacyUiStateRole, 'derived_mirror_only');
});

test('incident mutation occurs through the authoritative event reducer', () => {
  init();
  const before = getAuthoritativeState();
  const after = dispatchAuthoritativeEvent({
    type: 'incident_injected',
    source: 'test',
    payload: { edgeId: 'E09', severity: 0.9, closed: false, loadIncrease: 18 }
  });
  assert.equal(after.revision, before.revision + 1);
  assert.equal(after.lastEvent.type, 'incident_injected');
  assert.equal(after.activeIncidents[0].edgeId, 'E09');
});

test('traffic drift advances authoritative tick without direct network mutation', () => {
  init();
  const before = getAuthoritativeState();
  const after = dispatchAuthoritativeEvent({
    type: 'traffic_drift_applied',
    payload: { tick: 11, deltas: { E01: 4, E02: -3 } }
  });
  assert.equal(after.tick, 11);
  assert.equal(after.network.edges.find(edge => edge.id === 'E01').load, before.network.edges.find(edge => edge.id === 'E01').load + 4);
  assert.equal(after.revision, 1);
});

test('decision inputs and running state are governed by the same authoritative bus', () => {
  init();
  dispatchAuthoritativeEvent({
    type: 'decision_inputs_updated',
    payload: { routeParameters: { origin: 'N2', destination: 'N9', routeRiskWeight: 3.5 }, emergencyTarget: 'N11' }
  });
  const paused = dispatchAuthoritativeEvent({ type: 'simulation_running_changed', payload: { running: false } });
  assert.equal(paused.routeParameters.origin, 'N2');
  assert.equal(paused.routeParameters.destination, 'N9');
  assert.equal(paused.routeParameters.routeRiskWeight, 3.5);
  assert.equal(paused.emergencyTarget, 'N11');
  assert.equal(paused.running, false);
});

test('intervention replacement is an explicit authoritative event', () => {
  init();
  const modified = structuredClone(network);
  modified.edges.find(edge => edge.id === 'E01').load = 17;
  const after = dispatchAuthoritativeEvent({ type: 'intervention_applied', payload: { network: modified } });
  assert.equal(after.network.edges.find(edge => edge.id === 'E01').load, 17);
  assert.equal(after.lastEvent.type, 'intervention_applied');
  assert.equal(after.dynamicRiskTwin, null);
  assert.equal(after.predictiveOrchestration, null);
});

test('subscribers receive authoritative state transitions and cannot mutate the store', () => {
  init();
  const received = [];
  const unsubscribe = subscribeAuthoritativeState((snapshot, event) => {
    snapshot.network.edges[0].load = 100;
    received.push(event.type);
  });
  dispatchAuthoritativeEvent({ type: 'route_parameters_updated', payload: { routeRiskWeight: 2.5 } });
  unsubscribe();
  assert.deepEqual(received, ['route_parameters_updated']);
  assert.notEqual(getAuthoritativeState().network.edges[0].load, 100);
});
