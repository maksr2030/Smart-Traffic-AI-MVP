import test from 'node:test';
import assert from 'node:assert/strict';
import policy from '../data/orchestration_policy.json' with { type: 'json' };
import { defaultOrchestrationCandidates, orchestratePredictiveRisk } from '../engine/predictiveOrchestrationEngine.js';
import {
  buildExplainablePolicyOrchestration,
  buildScenarioReplay,
  evaluatePolicyGuardrails,
  explainOrchestration,
  runOrchestrationSensitivity
} from '../engine/explainableOrchestrationEngine.js';

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

test('explanation reconstructs deterministic robust score and compares alternatives', () => {
  const orchestration = orchestratePredictiveRisk(network, observations, fleet, 'A', 'E', 'E');
  const explanation = explainOrchestration(orchestration);
  assert.equal(explanation.causalClaim, false);
  assert.equal(explanation.explanationType, 'deterministic_arithmetic_decision_explanation');
  assert.ok(Math.abs(explanation.decomposition.reconstructedRobustScore - orchestration.selected.robustScore) <= 0.02);
  assert.equal(explanation.comparisons.length, orchestration.rankedCandidates.length - 1);
  assert.ok(explanation.reasons.some(item => item.factor === 'robust_score_vs_observe_only'));
});

test('policy guard rejects an over-limit intervention candidate', () => {
  const candidates = [
    ...defaultOrchestrationCandidates(),
    { id:'overreach', label:'Overreach', targetCount:9, loadReduction:30, incidentRelief:0.6, interventionPenalty:0 }
  ];
  const orchestration = orchestratePredictiveRisk(network, observations, fleet, 'A', 'E', 'E', { candidates });
  const evaluation = evaluatePolicyGuardrails(orchestration, policy);
  const overreach = evaluation.candidates.find(item => item.id === 'overreach');
  assert.equal(overreach.compliant, false);
  assert.ok(overreach.violations.includes('target_count_limit'));
  assert.ok(overreach.violations.includes('load_reduction_limit'));
  assert.ok(overreach.violations.includes('incident_relief_limit'));
  assert.notEqual(evaluation.selectedCandidateId, 'overreach');
  assert.equal(evaluation.autoApply, false);
  assert.equal(evaluation.humanApprovalRequired, true);
});

test('policy-aware orchestration returns explanation and replay without auto-apply', () => {
  const result = buildExplainablePolicyOrchestration(network, observations, fleet, 'A', 'E', 'E', policy);
  assert.equal(result.blocked, false);
  assert.ok(result.selected);
  assert.ok(result.explanation);
  assert.ok(result.replay);
  assert.equal(result.autoApply, false);
  assert.equal(result.humanApprovalRequired, true);
  assert.equal(result.productionControlConnected, false);
});

test('scenario replay compares selected plan with observe-only at every horizon', () => {
  const orchestration = orchestratePredictiveRisk(network, observations, fleet, 'A', 'E', 'E');
  const replay = buildScenarioReplay(orchestration, orchestration.selected.candidate.id);
  assert.deepEqual(replay.horizons, [5,15,30,60]);
  assert.equal(replay.frames.length, 4);
  assert.equal(replay.replayOnly, true);
  assert.equal(replay.fieldExecution, false);
  assert.ok(replay.frames.every(frame => Number.isFinite(frame.improvement.objectiveScore)));
  assert.ok(replay.frames.every(frame => frame.route.simulation === true));
});

test('sensitivity analysis evaluates horizon and safety-weight combinations deterministically', () => {
  const result = runOrchestrationSensitivity(network, observations, fleet, 'A', 'E', 'E', {
    riskWeights: [0.8, 1.8],
    horizonSets: [[5,15], [5,15,30,60]]
  });
  assert.equal(result.rows.length, 4);
  assert.equal(result.trainedModel, false);
  assert.equal(result.autoApply, false);
  assert.ok(result.rows.every(row => row.autoApply === false));
  const again = runOrchestrationSensitivity(network, observations, fleet, 'A', 'E', 'E', {
    riskWeights: [0.8, 1.8],
    horizonSets: [[5,15], [5,15,30,60]]
  });
  assert.deepEqual(result.rows, again.rows);
});
