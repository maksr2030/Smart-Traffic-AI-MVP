import test from 'node:test';
import assert from 'node:assert/strict';
import { compareConventionalAndRiskAwareRoutes, riskAwareRoute } from '../engine/riskAwareRoutingEngine.js';

const network = {
  nodes: [{id:'A'},{id:'B'},{id:'C'},{id:'D'}],
  edges: [
    {id:'AB',from:'A',to:'B',distanceKm:1,speedLimitKph:60,load:0},
    {id:'BD',from:'B',to:'D',distanceKm:1,speedLimitKph:60,load:0},
    {id:'AC',from:'A',to:'C',distanceKm:1.5,speedLimitKph:60,load:0},
    {id:'CD',from:'C',to:'D',distanceKm:1.5,speedLimitKph:60,load:0}
  ]
};

const high = edgeId => ({edgeId,roadQuality:0.1,roughness:0.95,visibility:0.1,weatherSeverity:0.95,blindSpotRisk:0.9,curvatureRisk:0.9,friction:0.1,hiddenHazardConfidence:0.9,vehicleSpeedKph:100});
const low = edgeId => ({edgeId,roadQuality:0.98,roughness:0.02,visibility:0.98,weatherSeverity:0.02,blindSpotRisk:0.02,curvatureRisk:0.02,friction:0.98,hiddenHazardConfidence:0.01,vehicleSpeedKph:45});
const observations = [high('AB'),high('BD'),low('AC'),low('CD')];

test('risk-aware routing may choose a longer safer route', () => {
  const comparison = compareConventionalAndRiskAwareRoutes(network,'A','D',observations,{riskWeight:2.5,avoidRiskScore:100});
  assert.deepEqual(comparison.conventional.edgeIds,['AB','BD']);
  assert.deepEqual(comparison.riskAware.edgeIds,['AC','CD']);
  assert.ok(comparison.riskAware.distanceKm > comparison.conventional.distanceKm);
  assert.ok(comparison.riskAware.risk.averageRiskScore < comparison.conventional.risk.averageRiskScore);
  assert.equal(comparison.saferRouteSelected,true);
  assert.equal(comparison.simulation,true);
});

test('zero risk weight reduces to travel-time routing cost', () => {
  const route = riskAwareRoute(network,'A','D',observations,{riskWeight:0,avoidRiskScore:100});
  assert.deepEqual(route.edgeIds,['AB','BD']);
  assert.equal(route.method,'deterministic_time_plus_qcs_proxy_risk');
});

test('unobserved route edges are counted explicitly', () => {
  const route = riskAwareRoute(network,'A','D',[],{riskWeight:1,unknownRiskScore:25});
  assert.equal(route.risk.unknownEdges,2);
  assert.equal(route.risk.observedEdges,0);
  assert.equal(route.risk.averageRiskScore,25);
});
