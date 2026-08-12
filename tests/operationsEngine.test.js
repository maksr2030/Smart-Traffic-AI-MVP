import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyIncidents, applyOperationalIntervention, compareOperations, operationalMetrics, planEmergencyDispatch, runOperationalScenario, shortHorizonForecast } from '../engine/operationsEngine.js';

const network = JSON.parse(await readFile(new URL('../data/network.json', import.meta.url), 'utf8'));

test('multiple incidents are applied independently', () => {
  const next = applyIncidents(network, [{edgeId:'E04',severity:.8},{edgeId:'E09',severity:.6,close:true}]);
  assert.equal(next.edges.find(e=>e.id==='E04').incidentSeverity, .8);
  assert.equal(next.edges.find(e=>e.id==='E09').closed, true);
});

test('operational scenario supports demand and multiple incidents', () => {
  const result = runOperationalScenario(network, {demandMultiplier:1.2,incidents:[{edgeId:'E04',severity:.9},{edgeId:'E12',severity:.7}]});
  assert.ok(result.metrics.avgLoad > operationalMetrics(network).avgLoad);
  assert.equal(result.metrics.incidentCount, 2);
});

test('short horizon forecast produces a transparent deterministic baseline', () => {
  const result = shortHorizonForecast(network, {horizonMinutes:15});
  assert.equal(result.method, 'deterministic_short_horizon_baseline');
  assert.ok(result.forecast.avgLoad > result.before.avgLoad);
});

test('comparison reports positive improvement when load is reduced', () => {
  const lighter = structuredClone(network);
  lighter.edges.forEach(e=>e.load=Math.max(5,e.load-15));
  const comparison = compareOperations(network, lighter);
  assert.ok(comparison.improvement.stressPercent > 0);
  assert.ok(comparison.improvement.travelTimePercent > 0);
});

test('emergency dispatch selects the fastest available unit', () => {
  const fleet = [
    {id:'A',currentNode:'N1',status:'available'},
    {id:'B',currentNode:'N9',status:'available'},
    {id:'C',currentNode:'N5',status:'busy'}
  ];
  const dispatch = planEmergencyDispatch(network,fleet,'N10');
  assert.equal(dispatch.selected.unit.id,'B');
  assert.equal(dispatch.evaluatedUnits,2);
});

test('simulated intervention reduces stress without reopening closed roads', () => {
  const stressed = applyIncidents(network, [{edgeId:'E04',severity:.9},{edgeId:'E09',severity:1,close:true}]);
  const after = applyOperationalIntervention(stressed,{targetCount:8,loadReduction:12,incidentRelief:.3});
  assert.ok(operationalMetrics(after).stressIndex < operationalMetrics(stressed).stressIndex);
  assert.equal(after.edges.find(e=>e.id==='E09').closed,true);
});
