import { assessQcsRoadRisk, recommendQcsVehicleResponse } from './qcsRiskEngine.js';

function commandForAction(action, response) {
  const common = { simulated: true, actuatorConnected: false };
  if (action === 'reduce_speed') return { ...common, command: 'set_target_speed', value: response.targetSpeedKph, unit: 'km/h', priority: 70 };
  if (action === 'stability_control_ready') return { ...common, command: 'arm_stability_control', value: true, priority: 72 };
  if (action === 'adaptive_suspension_rough_road') return { ...common, command: 'prepare_adaptive_suspension', value: 'rough_road', priority: 55 };
  if (action === 'blind_spot_guard') return { ...common, command: 'enable_blind_spot_guard', value: true, priority: 68 };
  if (action === 'curve_speed_assist') return { ...common, command: 'enable_curve_speed_assist', value: true, priority: 66 };
  if (action === 'weather_degraded_mode') return { ...common, command: 'enable_weather_degraded_mode', value: true, priority: 75 };
  if (action === 'hazard_broadcast') return { ...common, command: 'broadcast_v2x_hazard_proxy', value: true, priority: 80, quantumCommunicationClaim: false };
  if (action === 'brake_assist_ready') return { ...common, command: 'arm_brake_assist', value: true, priority: 88 };
  if (action === 'reroute_recommended') return { ...common, command: 'request_risk_aware_reroute', value: true, priority: 95 };
  return { ...common, command: 'monitor', value: true, priority: 20 };
}

export function buildPreventiveCommandPlan(route, observations = []) {
  if (!route?.reachable || !Array.isArray(route.edgeIds)) throw new Error('reachable route is required');
  if (!Array.isArray(observations)) throw new Error('observations must be an array');
  const observationMap = new Map(observations.map(item => [String(item.edgeId), item]));
  const segments = route.edgeIds.map(edgeId => {
    const observation = observationMap.get(String(edgeId));
    if (!observation) {
      return {
        edgeId,
        observed: false,
        riskScore: null,
        riskLevel: 'unknown',
        commands: [{ command: 'monitor', value: true, priority: 20, simulated: true, actuatorConnected: false }]
      };
    }
    const assessment = assessQcsRoadRisk(observation);
    const response = recommendQcsVehicleResponse(assessment);
    const commands = (response.actions.length ? response.actions : ['monitor'])
      .map(action => commandForAction(action, response))
      .sort((a, b) => b.priority - a.priority || a.command.localeCompare(b.command));
    return {
      edgeId,
      observed: true,
      riskScore: assessment.score,
      riskLevel: assessment.level,
      currentSpeedKph: response.currentSpeedKph,
      targetSpeedKph: response.targetSpeedKph,
      commands
    };
  });

  const flatCommands = segments.flatMap(segment => segment.commands.map(command => ({ edgeId: segment.edgeId, ...command })));
  const uniqueCommands = [...new Set(flatCommands.map(item => item.command))];
  return {
    schema: 'smart-traffic-preventive-command-plan/v1',
    simulation: true,
    actuatorConnected: false,
    safetyCertified: false,
    routeEdgeIds: [...route.edgeIds],
    segments,
    summary: {
      segments: segments.length,
      observedSegments: segments.filter(segment => segment.observed).length,
      unknownSegments: segments.filter(segment => !segment.observed).length,
      generatedCommands: flatCommands.length,
      uniqueCommandTypes: uniqueCommands,
      highestPriority: flatCommands.length ? Math.max(...flatCommands.map(item => item.priority)) : 0,
      rerouteRequests: flatCommands.filter(item => item.command === 'request_risk_aware_reroute').length,
      brakeAssistArms: flatCommands.filter(item => item.command === 'arm_brake_assist').length,
      hazardBroadcasts: flatCommands.filter(item => item.command === 'broadcast_v2x_hazard_proxy').length
    },
    commands: flatCommands,
    evidenceBoundary: 'Commands are simulation outputs only. No vehicle actuator, ADAS controller, V2X infrastructure, or safety-certified control loop is connected.'
  };
}
