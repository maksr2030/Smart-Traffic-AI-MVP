import { applyDemand, applyIncident, cloneNetwork, networkMetrics, shortestPath } from './trafficEngine.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function applyIncidents(network, incidents = []) {
  if (!Array.isArray(incidents)) throw new Error('incidents must be an array');
  return incidents.reduce((current, incident) => {
    if (!incident?.edgeId) throw new Error('incident edgeId is required');
    return applyIncident(current, incident.edgeId, {
      severity: incident.severity ?? 0.7,
      close: incident.close ?? false,
      loadIncrease: incident.loadIncrease ?? 15
    });
  }, cloneNetwork(network));
}

export function runOperationalScenario(network, scenario = {}) {
  let next = applyDemand(network, Number(scenario.demandMultiplier ?? 1));
  next = applyIncidents(next, scenario.incidents ?? []);
  return { network: next, metrics: operationalMetrics(next), scenario };
}

export function applyOperationalIntervention(network, { targetCount = 6, loadReduction = 10, incidentRelief = 0.25 } = {}) {
  const next = cloneNetwork(network);
  const targets = [...next.edges]
    .filter(edge => !edge.closed)
    .sort((a, b) => (Number(b.load ?? 0) + Number(b.incidentSeverity ?? 0) * 40) - (Number(a.load ?? 0) + Number(a.incidentSeverity ?? 0) * 40))
    .slice(0, Math.max(1, targetCount));
  targets.forEach(edge => {
    edge.load = clamp(Number(edge.load ?? 0) - loadReduction, 0, 100);
    edge.incidentSeverity = clamp(Number(edge.incidentSeverity ?? 0) - incidentRelief, 0, 1);
    edge.simulatedIntervention = true;
  });
  return next;
}

export function shortHorizonForecast(network, { horizonMinutes = 15, trendStrength = 1 } = {}) {
  if (!(horizonMinutes > 0 && horizonMinutes <= 120)) throw new Error('horizonMinutes must be between 1 and 120');
  const next = cloneNetwork(network);
  const horizonFactor = horizonMinutes / 15;
  next.edges.forEach(edge => {
    const current = Number(edge.load ?? 0);
    const momentum = current >= 80 ? 5.5 : current >= 65 ? 3.5 : current >= 45 ? 1.8 : 0.6;
    const incidentBoost = Number(edge.incidentSeverity ?? 0) * 8;
    const closureLoad = edge.closed ? 0 : 1;
    edge.forecastBaseLoad = current;
    edge.load = clamp(Math.round(current + (momentum * horizonFactor + incidentBoost) * trendStrength * closureLoad), 0, 100);
    edge.forecastHorizonMinutes = horizonMinutes;
  });
  return {
    horizonMinutes,
    method: 'deterministic_short_horizon_baseline',
    network: next,
    before: operationalMetrics(network),
    forecast: operationalMetrics(next)
  };
}

export function operationalMetrics(network) {
  const base = networkMetrics(network);
  const edgeCount = Math.max(1, network.edges.length);
  const closureCount = network.edges.filter(e => e.closed).length;
  const incidentCount = network.edges.filter(e => Number(e.incidentSeverity ?? 0) > 0).length;
  const congestedCount = network.edges.filter(e => Number(e.load ?? 0) >= 70).length;
  const severeCount = network.edges.filter(e => Number(e.load ?? 0) >= 85 || Number(e.incidentSeverity ?? 0) >= 0.8 || e.closed).length;
  return {
    ...base,
    closureCount,
    incidentCount,
    congestedCount,
    severeCount,
    congestedShare: congestedCount / edgeCount,
    severeShare: severeCount / edgeCount
  };
}

export function compareOperations(beforeNetwork, afterNetwork) {
  const before = operationalMetrics(beforeNetwork);
  const after = operationalMetrics(afterNetwork);
  const delta = {
    avgLoad: after.avgLoad - before.avgLoad,
    avgEdgeMinutes: after.avgEdgeMinutes - before.avgEdgeMinutes,
    criticalEdges: after.criticalEdges - before.criticalEdges,
    stressIndex: after.stressIndex - before.stressIndex,
    congestedShare: after.congestedShare - before.congestedShare
  };
  const improvement = {
    stressPercent: before.stressIndex > 0 ? (before.stressIndex - after.stressIndex) / before.stressIndex * 100 : 0,
    travelTimePercent: before.avgEdgeMinutes > 0 ? (before.avgEdgeMinutes - after.avgEdgeMinutes) / before.avgEdgeMinutes * 100 : 0,
    loadPercent: before.avgLoad > 0 ? (before.avgLoad - after.avgLoad) / before.avgLoad * 100 : 0
  };
  return { before, after, delta, improvement };
}

export function planEmergencyDispatch(network, fleet, targetNode, options = {}) {
  if (!Array.isArray(fleet) || !fleet.length) throw new Error('fleet is required');
  const targetExists = network.nodes.some(n => n.id === targetNode);
  if (!targetExists) throw new Error(`unknown target node ${targetNode}`);
  const candidates = fleet
    .filter(unit => unit.status === 'available' && unit.currentNode)
    .map(unit => {
      const route = shortestPath(network, unit.currentNode, targetNode, { priorityEdgeIds: options.priorityEdgeIds ?? [] });
      return { unit, route };
    })
    .filter(candidate => candidate.route.reachable)
    .sort((a, b) => a.route.minutes - b.route.minutes);
  return {
    targetNode,
    selected: candidates[0] ?? null,
    alternatives: candidates.slice(1),
    evaluatedUnits: candidates.length
  };
}

export function makeOperationalSnapshot({ network, scenarioName = 'current', forecast = null, comparison = null, coverageSummary = null } = {}) {
  if (!network) throw new Error('network is required');
  return {
    schema: 'smart-traffic-operational-snapshot/v1',
    generatedAt: new Date().toISOString(),
    simulation: true,
    scenarioName,
    metrics: operationalMetrics(network),
    forecast: forecast ? { horizonMinutes: forecast.horizonMinutes, method: forecast.method, metrics: forecast.forecast } : null,
    comparison: comparison ? { delta: comparison.delta, improvement: comparison.improvement } : null,
    coverageSummary
  };
}
