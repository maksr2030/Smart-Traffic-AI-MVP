import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyDemand, applyIncident, edgeTravelMinutes, networkMetrics, optimizeSignalPlan, shortestPath, simulateScenario, validateNetwork } from '../engine/trafficEngine.js';

const network = JSON.parse(await readFile(new URL('../data/network.json', import.meta.url), 'utf8'));

test('network model validates', () => assert.equal(validateNetwork(network), true));

test('travel time rises with congestion', () => {
  const free = { distanceKm: 5, speedLimitKph: 100, load: 10 };
  const congested = { ...free, load: 90 };
  assert.ok(edgeTravelMinutes(congested) > edgeTravelMinutes(free));
});

test('shortest path is reachable and returns edges', () => {
  const route = shortestPath(network, 'N1', 'N8');
  assert.equal(route.reachable, true);
  assert.ok(route.edgeIds.length >= 2);
  assert.ok(route.minutes > 0);
});

test('closure forces a route change when alternatives exist', () => {
  const baseline = shortestPath(network, 'N1', 'N8');
  const blocked = applyIncident(network, baseline.edgeIds[2], { close: true, severity: 1 });
  const rerouted = shortestPath(blocked, 'N1', 'N8');
  assert.equal(rerouted.reachable, true);
  assert.notDeepEqual(rerouted.edgeIds, baseline.edgeIds);
});

test('signal optimization preserves usable cycle and prioritizes demand', () => {
  const plan = optimizeSignalPlan([{id:'A',load:90},{id:'B',load:40},{id:'C',load:20}], {cycleSeconds:90,lostSeconds:9,minGreenSeconds:8});
  const total = plan.phases.reduce((sum,p)=>sum+p.greenSeconds,0);
  assert.ok(Math.abs(total - 81) < 1e-9);
  assert.ok(plan.phases[0].greenSeconds > plan.phases[2].greenSeconds);
});

test('higher demand increases network stress', () => {
  const base = networkMetrics(network);
  const high = networkMetrics(applyDemand(network, 1.35));
  assert.ok(high.avgLoad > base.avgLoad);
  assert.ok(high.stressIndex > base.stressIndex);
});

test('incident scenario reports critical edges', () => {
  const result = simulateScenario(network, {demandMultiplier:1.15,incidentEdgeId:'E04',incidentSeverity:0.9});
  assert.ok(result.metrics.criticalEdges >= 1);
});
