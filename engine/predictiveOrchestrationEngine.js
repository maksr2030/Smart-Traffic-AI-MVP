import { cloneNetwork, validateNetwork } from './trafficEngine.js';
import { operationalMetrics } from './operationsEngine.js';
import { buildDynamicRiskTwin, buildTwinDecisionBundle } from './dynamicRiskTwinEngine.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value)));

function normalizedHorizons(horizons = [5, 15, 30, 60]) {
  const values = [...new Set(horizons.map(Number))].filter(value => value > 0 && value <= 60).sort((a, b) => a - b);
  if (!values.length) throw new Error('at least one forecast horizon between 1 and 60 minutes is required');
  return values;
}

function neighboringPressure(network) {
  const byNode = new Map(network.nodes.map(node => [node.id, []]));
  network.edges.forEach(edge => {
    byNode.get(edge.from).push(edge);
    byNode.get(edge.to).push(edge);
  });
  const pressure = new Map();
  network.edges.forEach(edge => {
    const neighbors = [...new Set([...byNode.get(edge.from), ...byNode.get(edge.to)])].filter(item => item.id !== edge.id);
    const avg = neighbors.length ? neighbors.reduce((sum, item) => sum + Number(item.load ?? 0), 0) / neighbors.length : Number(edge.load ?? 0);
    pressure.set(edge.id, avg);
  });
  return pressure;
}

export function projectNetworkRiskState(network, horizonMinutes, options = {}) {
  validateNetwork(network);
  const horizon = Number(horizonMinutes);
  if (!(horizon > 0 && horizon <= 60)) throw new Error('horizonMinutes must be between 1 and 60');
  const next = cloneNetwork(network);
  const pressure = neighboringPressure(network);
  const trendStrength = clamp(options.trendStrength ?? 1, 0, 2);
  const factor = horizon / 15;

  next.edges.forEach(edge => {
    const current = Number(edge.load ?? 0);
    const incidentSeverity = clamp(edge.incidentSeverity ?? 0, 0, 1);
    const neighborAvg = pressure.get(edge.id) ?? current;
    const upwardPressure = Math.max(0, neighborAvg - current);
    const momentum = current >= 85 ? 5.2 : current >= 70 ? 3.8 : current >= 55 ? 2.4 : current >= 35 ? 1.2 : 0.5;
    const incidentBoost = incidentSeverity * 7.5;
    const spilloverBoost = upwardPressure * 0.10;
    const closureFactor = edge.closed ? 0 : 1;
    const projected = current + (momentum + incidentBoost + spilloverBoost) * factor * trendStrength * closureFactor;
    edge.forecastBaseLoad = current;
    edge.load = Math.round(clamp(projected));
    edge.forecastHorizonMinutes = horizon;
    edge.forecastMethod = 'deterministic_congestion_incident_neighbor_spillover';
  });

  return next;
}

export function forecastRiskPropagation(network, observations = [], options = {}) {
  validateNetwork(network);
  if (!Array.isArray(observations)) throw new Error('observations must be an array');
  const horizons = normalizedHorizons(options.horizons);
  const currentTwin = options.currentTwin ?? buildDynamicRiskTwin(network, observations, { tick: 0 });
  const currentMap = new Map(currentTwin.edges.map(edge => [edge.edgeId, edge]));

  const timeline = horizons.map(horizonMinutes => {
    const projectedNetwork = projectNetworkRiskState(network, horizonMinutes, { trendStrength: options.trendStrength ?? 1 });
    const twin = buildDynamicRiskTwin(projectedNetwork, observations, { previousTwin: currentTwin, tick: horizonMinutes });
    const hotspots = twin.edges
      .map(edge => ({
        edgeId: edge.edgeId,
        score: edge.score,
        level: edge.level,
        currentScore: currentMap.get(edge.edgeId)?.score ?? 0,
        delta: edge.score - (currentMap.get(edge.edgeId)?.score ?? 0),
        projectedLoad: edge.load,
        closed: edge.closed
      }))
      .filter(edge => edge.score >= 60 || edge.delta >= 8)
      .sort((a, b) => b.score - a.score || b.delta - a.delta || a.edgeId.localeCompare(b.edgeId));
    return {
      horizonMinutes,
      projectedNetwork,
      twin,
      hotspots,
      summary: {
        averageRiskScore: twin.summary.averageRiskScore,
        maxRiskScore: twin.summary.maxRiskScore,
        highOrCriticalCount: twin.summary.highOrCriticalCount,
        emergingHotspots: hotspots.filter(item => item.delta >= 8).length
      }
    };
  });

  return {
    schema: 'smart-traffic-predictive-risk-forecast/v1',
    simulation: true,
    horizons,
    currentTwin,
    timeline,
    method: 'deterministic_multi_horizon_risk_propagation_baseline',
    trainedModel: false,
    evidenceBoundary: 'Forecast is a deterministic engineering baseline using simulated load, incidents, topology spillover and QCS proxy inputs. It is not a trained production prediction model.'
  };
}

export function defaultOrchestrationCandidates() {
  return [
    { id: 'observe_only', label: 'Observe only', targetCount: 0, loadReduction: 0, incidentRelief: 0, interventionPenalty: 0 },
    { id: 'balanced_preemptive', label: 'Balanced preemptive relief', targetCount: 4, loadReduction: 8, incidentRelief: 0.08, interventionPenalty: 5 },
    { id: 'network_relief', label: 'Network-wide relief', targetCount: 6, loadReduction: 12, incidentRelief: 0.12, interventionPenalty: 8 },
    { id: 'safety_priority', label: 'Safety-priority relief', targetCount: 5, loadReduction: 10, incidentRelief: 0.22, interventionPenalty: 9 }
  ];
}

export function applyPredictiveIntervention(network, predictedTwin, candidate) {
  validateNetwork(network);
  if (!predictedTwin?.edges) throw new Error('predicted twin is required');
  if (!candidate?.id) throw new Error('candidate is required');
  const next = cloneNetwork(network);
  const targetCount = Math.max(0, Math.min(next.edges.length, Number(candidate.targetCount ?? 0)));
  if (!targetCount) return next;
  const riskRank = new Map(predictedTwin.edges.map((edge, index) => [edge.edgeId, index]));
  const targets = [...next.edges]
    .filter(edge => !edge.closed)
    .sort((a, b) => (riskRank.get(a.id) ?? 999) - (riskRank.get(b.id) ?? 999))
    .slice(0, targetCount);
  targets.forEach(edge => {
    edge.load = clamp(Number(edge.load ?? 0) - Number(candidate.loadReduction ?? 0));
    edge.incidentSeverity = clamp(Number(edge.incidentSeverity ?? 0) - Number(candidate.incidentRelief ?? 0), 0, 1);
    edge.predictiveIntervention = candidate.id;
  });
  return next;
}

function objectiveFor(network, twin) {
  const metrics = operationalMetrics(network);
  const edgeCount = Math.max(1, twin.summary.edgeCount);
  const highShare = twin.summary.highOrCriticalCount / edgeCount * 100;
  const travelPenalty = Math.min(100, metrics.avgEdgeMinutes * 8);
  const score = twin.summary.averageRiskScore * 0.34 +
    twin.summary.maxRiskScore * 0.20 +
    highShare * 0.16 +
    metrics.avgLoad * 0.15 +
    travelPenalty * 0.15;
  return {
    score: Number(score.toFixed(2)),
    averageRiskScore: twin.summary.averageRiskScore,
    maxRiskScore: twin.summary.maxRiskScore,
    highOrCriticalCount: twin.summary.highOrCriticalCount,
    avgLoad: Number(metrics.avgLoad.toFixed(2)),
    avgEdgeMinutes: Number(metrics.avgEdgeMinutes.toFixed(2)),
    stressIndex: Number(metrics.stressIndex.toFixed(2))
  };
}

function horizonWeight(horizonMinutes) {
  if (horizonMinutes <= 5) return 1;
  if (horizonMinutes <= 15) return 2;
  if (horizonMinutes <= 30) return 3;
  return 4;
}

export function evaluateOrchestrationCandidate(forecast, candidate, observations, fleet, origin, destination, emergencyTarget, options = {}) {
  if (!forecast?.timeline?.length) throw new Error('forecast timeline is required');
  const evaluations = forecast.timeline.map(frame => {
    const interventionNetwork = applyPredictiveIntervention(frame.projectedNetwork, frame.twin, candidate);
    const interventionTwin = buildDynamicRiskTwin(interventionNetwork, observations, { previousTwin: forecast.currentTwin, tick: frame.horizonMinutes });
    const objective = objectiveFor(interventionNetwork, interventionTwin);
    const decisions = buildTwinDecisionBundle(
      interventionNetwork,
      interventionTwin,
      fleet,
      origin,
      destination,
      emergencyTarget,
      {
        routeRiskWeight: options.routeRiskWeight ?? 1.8,
        emergencyRiskWeight: options.emergencyRiskWeight ?? 1.2,
        signalOptions: options.signalOptions
      }
    );
    return {
      horizonMinutes: frame.horizonMinutes,
      objective,
      twin: interventionTwin,
      decisions
    };
  });

  const weighted = evaluations.reduce((sum, item) => sum + item.objective.score * horizonWeight(item.horizonMinutes), 0);
  const totalWeight = evaluations.reduce((sum, item) => sum + horizonWeight(item.horizonMinutes), 0);
  const meanScore = weighted / totalWeight;
  const worstScore = Math.max(...evaluations.map(item => item.objective.score));
  const robustScore = meanScore * 0.80 + worstScore * 0.20 + Number(candidate.interventionPenalty ?? 0);
  const finalFrame = evaluations[evaluations.length - 1];
  return {
    candidate,
    robustScore: Number(robustScore.toFixed(2)),
    weightedMeanScore: Number(meanScore.toFixed(2)),
    worstHorizonScore: Number(worstScore.toFixed(2)),
    evaluations,
    finalSummary: finalFrame.objective,
    finalDecisions: finalFrame.decisions,
    simulation: true
  };
}

export function orchestratePredictiveRisk(network, observations, fleet, origin, destination, emergencyTarget, options = {}) {
  validateNetwork(network);
  if (!Array.isArray(fleet) || !fleet.length) throw new Error('fleet is required');
  const forecast = forecastRiskPropagation(network, observations, {
    horizons: options.horizons ?? [5, 15, 30, 60],
    trendStrength: options.trendStrength ?? 1,
    currentTwin: options.currentTwin
  });
  const candidates = options.candidates ?? defaultOrchestrationCandidates();
  if (!Array.isArray(candidates) || !candidates.length) throw new Error('orchestration candidates are required');
  const evaluated = candidates
    .map(candidate => evaluateOrchestrationCandidate(forecast, candidate, observations, fleet, origin, destination, emergencyTarget, options))
    .sort((a, b) => a.robustScore - b.robustScore || a.candidate.id.localeCompare(b.candidate.id));
  const selected = evaluated[0];
  const baseline = evaluated.find(item => item.candidate.id === 'observe_only') ?? null;
  const improvementVsBaseline = baseline ? Number((baseline.robustScore - selected.robustScore).toFixed(2)) : null;

  return {
    schema: 'smart-traffic-predictive-autonomous-orchestration/v1',
    simulation: true,
    forecast,
    selected,
    alternatives: evaluated.slice(1),
    rankedCandidates: evaluated.map(item => ({
      id: item.candidate.id,
      label: item.candidate.label,
      robustScore: item.robustScore,
      weightedMeanScore: item.weightedMeanScore,
      worstHorizonScore: item.worstHorizonScore,
      interventionPenalty: Number(item.candidate.interventionPenalty ?? 0)
    })),
    improvementVsBaseline,
    autonomousRecommendation: true,
    autoApply: false,
    humanApprovalRequired: true,
    productionControlConnected: false,
    safetyCertified: false,
    method: 'deterministic_multi_horizon_candidate_orchestration',
    evidenceBoundary: 'The orchestrator autonomously ranks simulated candidate plans but never applies them to real infrastructure. Human approval and independent production validation are required.'
  };
}
