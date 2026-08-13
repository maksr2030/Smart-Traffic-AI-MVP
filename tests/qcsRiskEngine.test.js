import test from 'node:test';
import assert from 'node:assert/strict';
import { assessQcsRoadRisk, buildQcsHazardBroadcast, evaluateQcsCorridor, recommendQcsVehicleResponse } from '../engine/qcsRiskEngine.js';

const low = {edgeId:'E01',roadQuality:.95,roughness:.08,visibility:.98,weatherSeverity:.04,blindSpotRisk:.05,curvatureRisk:.08,friction:.95,hiddenHazardConfidence:.03,vehicleSpeedKph:55};
const severe = {edgeId:'E12',roadQuality:.35,roughness:.82,visibility:.28,weatherSeverity:.86,blindSpotRisk:.78,curvatureRisk:.72,friction:.38,hiddenHazardConfidence:.74,vehicleSpeedKph:82};

test('QCS proxy risk score increases under worse simulated conditions', () => {
  const lowRisk = assessQcsRoadRisk(low);
  const highRisk = assessQcsRoadRisk(severe);
  assert.ok(highRisk.score > lowRisk.score);
  assert.equal(highRisk.simulation,true);
  assert.equal(highRisk.quantumHardwareConnected,false);
});

test('high risk produces deterministic preventive response', () => {
  const assessment = assessQcsRoadRisk(severe);
  const response = recommendQcsVehicleResponse(assessment);
  assert.ok(response.targetSpeedKph < response.currentSpeedKph);
  assert.ok(response.actions.includes('hazard_broadcast'));
  assert.ok(response.actions.includes('brake_assist_ready'));
  assert.equal(response.actuatorConnected,false);
});

test('hazard broadcast never claims quantum communication', () => {
  const message = buildQcsHazardBroadcast(assessQcsRoadRisk(severe));
  assert.equal(message.simulated,true);
  assert.equal(message.quantumCommunicationClaim,false);
  assert.equal(message.transport,'v2x_proxy_message');
});

test('corridor assessment returns deterministic ranked output and evidence boundary', () => {
  const result = evaluateQcsCorridor([low,severe]);
  assert.equal(result.assessments.length,2);
  assert.equal(result.assessments[0].edgeId,'E12');
  assert.equal(result.summary.highestRiskEdge,'E12');
  assert.equal(result.simulation,true);
  assert.match(result.evidenceBoundary,/No quantum sensor/);
  assert.ok(result.supportedDemoCapabilities.includes('QCS-92'));
  assert.ok(result.representedCapabilities.includes('QCS-93'));
});
