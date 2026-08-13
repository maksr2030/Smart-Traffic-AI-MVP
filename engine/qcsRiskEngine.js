const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value)));

function normalizeObservation(observation = {}) {
  if (!observation.edgeId) throw new Error('edgeId is required');
  const roadQuality = clamp(observation.roadQuality ?? 0.85);
  return {
    edgeId: String(observation.edgeId),
    roadQuality,
    roughness: clamp(observation.roughness ?? (1 - roadQuality)),
    visibility: clamp(observation.visibility ?? 0.9),
    weatherSeverity: clamp(observation.weatherSeverity ?? 0.1),
    blindSpotRisk: clamp(observation.blindSpotRisk ?? 0.1),
    curvatureRisk: clamp(observation.curvatureRisk ?? 0.1),
    friction: clamp(observation.friction ?? 0.9),
    hiddenHazardConfidence: clamp(observation.hiddenHazardConfidence ?? 0.05),
    vehicleSpeedKph: clamp(observation.vehicleSpeedKph ?? 60, 0, 180)
  };
}

function riskLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'moderate';
  return 'low';
}

export function assessQcsRoadRisk(observation = {}) {
  const input = normalizeObservation(observation);
  const contributions = {
    roadSurface: (1 - input.roadQuality) * 0.18 + input.roughness * 0.10 + (1 - input.friction) * 0.14,
    weatherVisibility: input.weatherSeverity * 0.16 + (1 - input.visibility) * 0.12,
    geometryBlindSpot: input.blindSpotRisk * 0.12 + input.curvatureRisk * 0.10,
    hiddenHazard: input.hiddenHazardConfidence * 0.08
  };
  const baseRisk = Object.values(contributions).reduce((sum, value) => sum + value, 0);
  const speedMultiplier = 0.7 + clamp(input.vehicleSpeedKph / 120) * 0.6;
  const score = Math.round(clamp(baseRisk * speedMultiplier) * 100);
  return {
    edgeId: input.edgeId,
    score,
    level: riskLevel(score),
    input,
    contributions,
    method: 'deterministic_qcs_proxy_risk_model',
    simulation: true,
    quantumHardwareConnected: false
  };
}

export function recommendQcsVehicleResponse(assessment) {
  if (!assessment?.input || !Number.isFinite(assessment.score)) throw new Error('valid assessment is required');
  const { input, score } = assessment;
  const risk = clamp(score / 100);
  const targetSpeedKph = Math.max(15, Math.round(input.vehicleSpeedKph * (1 - risk * 0.55)));
  const actions = [];

  if (score >= 35) actions.push('reduce_speed');
  if (input.friction < 0.7 || score >= 55) actions.push('stability_control_ready');
  if (input.roughness >= 0.5 || input.roadQuality <= 0.55) actions.push('adaptive_suspension_rough_road');
  if (input.blindSpotRisk >= 0.55 || input.hiddenHazardConfidence >= 0.55) actions.push('blind_spot_guard');
  if (input.curvatureRisk >= 0.6) actions.push('curve_speed_assist');
  if (input.weatherSeverity >= 0.55 || input.visibility <= 0.5) actions.push('weather_degraded_mode');
  if (score >= 65) actions.push('hazard_broadcast');
  if (score >= 72) actions.push('brake_assist_ready');
  if (score >= 82) actions.push('reroute_recommended');

  return {
    edgeId: assessment.edgeId,
    riskScore: score,
    riskLevel: assessment.level,
    currentSpeedKph: input.vehicleSpeedKph,
    targetSpeedKph,
    actions,
    simulatedControlRecommendation: true,
    actuatorConnected: false
  };
}

export function buildQcsHazardBroadcast(assessment) {
  if (!assessment?.edgeId) throw new Error('assessment is required');
  return {
    schema: 'smart-traffic-qcs-hazard-broadcast/v1',
    edgeId: assessment.edgeId,
    riskScore: assessment.score,
    riskLevel: assessment.level,
    recommendedAction: assessment.score >= 82 ? 'reroute' : assessment.score >= 65 ? 'reduce_speed_and_warn' : 'monitor',
    simulated: true,
    transport: 'v2x_proxy_message',
    quantumCommunicationClaim: false
  };
}

export function evaluateQcsCorridor(observations = []) {
  if (!Array.isArray(observations) || observations.length === 0) throw new Error('observations must be a non-empty array');
  const assessments = observations
    .map(observation => {
      const assessment = assessQcsRoadRisk(observation);
      return {
        ...assessment,
        response: recommendQcsVehicleResponse(assessment),
        broadcast: buildQcsHazardBroadcast(assessment)
      };
    })
    .sort((a, b) => b.score - a.score || a.edgeId.localeCompare(b.edgeId));

  const totalRisk = assessments.reduce((sum, item) => sum + item.score, 0);
  const summary = {
    assessedEdges: assessments.length,
    averageRiskScore: Number((totalRisk / assessments.length).toFixed(1)),
    highestRiskScore: assessments[0].score,
    highestRiskEdge: assessments[0].edgeId,
    criticalCount: assessments.filter(item => item.level === 'critical').length,
    highCount: assessments.filter(item => item.level === 'high').length,
    rerouteRecommendations: assessments.filter(item => item.response.actions.includes('reroute_recommended')).length,
    hazardBroadcasts: assessments.filter(item => item.response.actions.includes('hazard_broadcast')).length
  };

  return {
    schema: 'smart-traffic-qcs-risk-demo/v1',
    simulation: true,
    method: 'deterministic_qcs_proxy_risk_model',
    evidenceBoundary: 'No quantum sensor, vehicle actuator, V2X infrastructure, or production road feed is connected.',
    supportedDemoCapabilities: ['QCS-80','QCS-85','QCS-86','QCS-87','QCS-88','QCS-92'],
    representedCapabilities: ['QCS-93','QCS-94','QCS-95','QCS-101','QCS-103','QCS-104'],
    summary,
    assessments
  };
}
