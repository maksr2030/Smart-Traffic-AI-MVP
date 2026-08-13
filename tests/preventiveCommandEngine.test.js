import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPreventiveCommandPlan } from '../engine/preventiveCommandEngine.js';

const route = {reachable:true,edgeIds:['E1','E2']};
const observations = [
  {edgeId:'E1',roadQuality:0.2,roughness:0.85,visibility:0.25,weatherSeverity:0.9,blindSpotRisk:0.8,curvatureRisk:0.8,friction:0.3,hiddenHazardConfidence:0.75,vehicleSpeedKph:100}
];

test('preventive command plan turns high proxy risk into explicit simulated commands', () => {
  const plan = buildPreventiveCommandPlan(route,observations);
  const commands = plan.commands.filter(item=>item.edgeId==='E1').map(item=>item.command);
  assert.ok(commands.includes('set_target_speed'));
  assert.ok(commands.includes('arm_stability_control'));
  assert.ok(commands.includes('arm_brake_assist'));
  assert.ok(commands.includes('request_risk_aware_reroute'));
  assert.equal(plan.simulation,true);
  assert.equal(plan.actuatorConnected,false);
  assert.equal(plan.safetyCertified,false);
});

test('unobserved route segment remains unknown and monitor-only', () => {
  const plan = buildPreventiveCommandPlan(route,observations);
  const e2 = plan.segments.find(segment=>segment.edgeId==='E2');
  assert.equal(e2.observed,false);
  assert.equal(e2.riskLevel,'unknown');
  assert.deepEqual(e2.commands.map(item=>item.command),['monitor']);
});

test('V2X proxy command never claims quantum communication or real actuation', () => {
  const plan = buildPreventiveCommandPlan(route,observations);
  const broadcast = plan.commands.find(item=>item.command==='broadcast_v2x_hazard_proxy');
  assert.equal(broadcast.quantumCommunicationClaim,false);
  assert.equal(broadcast.actuatorConnected,false);
});
