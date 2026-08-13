import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPredictiveIntervention,
  defaultOrchestrationCandidates,
  forecastRiskPropagation,
  orchestratePredictiveRisk,
  projectNetworkRiskState
} from '../engine/predictiveOrchestrationEngine.js';

const network = {
  nodes: ['A','B','C','D','E'].map(id => ({ id, name: id })),
  edges: [
    { id:'E1', from:'A', to:'B', distanceKm:2.0, speedLimitKph:60, load:74, incidentSeverity:0.15 },
    { id:'E2', from:'B', to:'E', distanceKm:2.0, speedLimitKph:60, load:82, incidentSeverity:0.55 },
    { id:'E3', from:'A', to:'C', distanceKm:2.7, speedLimitKph:60, load:42, incidentSeverity:0 },
    { id:'E4', from:'C', to:'D', distanceKm:2.0, speedLimitKph:60, load:48, incidentSeverity:0 },
    { id:'E5', from:'D', to:'E', distanceKm:2.0, speedLimitKph:60, load:52, incidentSeverity:0 }
  ]
};

const observations = [
  { edgeId:'E1', roadQuality:0.72, roughness:0.25, visibility:0.8, weatherSeverity:0.25, blindSpotRisk:0.25, curvatureRisk:0.2, friction:0.78, hiddenHazardConfidence:0.1, vehicleSpeedKph:65 },
  { edgeId:'E2', roadQuality:0.42, roughness:0.62, visibility:0.45, weatherSeverity:0.62, blindSpotRisk:0.55, curvatureRisk:0.55, friction:0.48, hiddenHazardConfidence:0.45, vehicleSpeedKph:72 },
  { edgeId:'E3', roadQuality:0.88, roughness:0.12, visibility:0.92, weatherSeverity:0.12, blindSpotRisk:0.12, curvatureRisk:0.1, friction:0.9, hiddenHazardConfidence:0.05, vehicleSpeedKph:58 },
  { edgeId:'E4', roadQuality:0.86, roughness:0.15, visibility:0.9, weatherSeverity:0.15, blindSpotRisk:0.15, curvatureRisk:0.18, friction:0.88, hiddenHazardConfidence:0.08, vehicleSpeedKph:58 },
  { edgeId:'E5', roadQuality:0.82, roughness:0.2, visibility:0.86, weatherSeverity:0.18, blindSpotRisk:0.18, curvatureRisk:0.2, friction:0.84, hiddenHazardConfidence:0.1, vehicleSpeedKph:60 }
];

const fleet = [
  { id:'AMB-1', type:'ambulance', currentNode:'A', status:'available' },
  { id:'AMB-2', type:'ambulance', currentNode:'C', status:'available' }
];

test('network projection grows congested incident pressure over horizon', () => {
  const h5 = projectNetworkRiskState(network, 5);
  const h60 = projectNetworkRiskState(network, 60);
  const e2h5 = h5.edges.find(edge => edge.id === 'E2');
  const e2h60 = h60.edges.find(edge => edge.id === 'E2');
  assert.ok(e2h5.load >= 82);
  assert.ok(e2h60.load >= e2h5.load);
  assert.equal(e2h60.forecastHorizonMinutes, 60);
});

test('predictive risk propagation produces 5-60 minute timeline and hotspots', () => {
  const forecast = forecastRiskPropagation(network, observations);
  assert.deepEqual(forecast.horizons, [5,15,30,60]);
  assert.equal(forecast.timeline.length, 4);
  assert.equal(forecast.trainedModel, false);
  assert.ok(forecast.timeline.at(-1).twin.summary.averageRiskScore >= forecast.currentTwin.summary.averageRiskScore);
  assert.ok(forecast.timeline.some(frame => frame.hotspots.some(item => item.edgeId === 'E2')));
});

test('predictive intervention targets highest forecast risk without reopening closed roads', () => {
  const closedNetwork = structuredClone(network);
  closedNetwork.edges.find(edge => edge.id === 'E2').closed = true;
  const forecast = forecastRiskPropagation(closedNetwork, observations);
  const candidate = defaultOrchestrationCandidates().find(item => item.id === 'network_relief');
  const intervened = applyPredictiveIntervention(forecast.timeline[1].projectedNetwork, forecast.timeline[1].twin, candidate);
  assert.equal(intervened.edges.find(edge => edge.id === 'E2').closed, true);
  assert.ok(intervened.edges.some(edge => edge.predictiveIntervention === 'network_relief'));
});

test('autonomous orchestrator ranks candidates across all horizons but never auto-applies', () => {
  const result = orchestratePredictiveRisk(network, observations, fleet, 'A', 'E', 'E');
  assert.equal(result.simulation, true);
  assert.equal(result.autonomousRecommendation, true);
  assert.equal(result.autoApply, false);
  assert.equal(result.humanApprovalRequired, true);
  assert.equal(result.productionControlConnected, false);
  assert.equal(result.safetyCertified, false);
  assert.equal(result.rankedCandidates.length, 4);
  assert.ok(result.selected.robustScore <= Math.min(...result.alternatives.map(item => item.robustScore)));
});

test('selected orchestration plan coordinates route, signals and emergency from each predicted twin', () => {
  const result = orchestratePredictiveRisk(network, observations, fleet, 'A', 'E', 'E');
  const evaluation = result.selected.evaluations.at(-1);
  assert.equal(evaluation.decisions.simulation, true);
  assert.ok(evaluation.decisions.route.twinRoute.reachable);
  assert.ok(evaluation.decisions.signals.phases.length >= 2);
  assert.ok(evaluation.decisions.emergency.selected);
  assert.equal(evaluation.twin.tick, 60);
});

test('orchestration is deterministic for the same simulated state', () => {
  const a = orchestratePredictiveRisk(network, observations, fleet, 'A', 'E', 'E');
  const b = orchestratePredictiveRisk(network, observations, fleet, 'A', 'E', 'E');
  assert.equal(a.selected.candidate.id, b.selected.candidate.id);
  assert.equal(a.selected.robustScore, b.selected.robustScore);
  assert.deepEqual(a.rankedCandidates, b.rankedCandidates);
});
