import { edgeTravelMinutes, optimizeSignalPlan, shortestPath, validateNetwork } from './trafficEngine.js';
import { assessQcsRoadRisk } from './qcsRiskEngine.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value)));

function riskLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'moderate';
  return 'low';
}

function trendFor(current, previous) {
  if (!Number.isFinite(previous)) return 'new';
  const delta = current - previous;
  if (delta >= 5) return 'rising';
  if (delta <= -5) return 'falling';
  return 'stable';
}

export function buildDynamicRiskTwin(network, observations = [], options = {}) {
  validateNetwork(network);
  if (!Array.isArray(observations)) throw new Error('observations must be an array');
  const previousTwin = options.previousTwin ?? null;
  const unknownQcsRisk = clamp(options.unknownQcsRisk ?? 18);
  const qcsByEdge = new Map(observations.map(observation => {
    const assessment = assessQcsRoadRisk(observation);
    return [assessment.edgeId, assessment];
  }));
  const previousByEdge = new Map((previousTwin?.edges ?? []).map(edge => [edge.edgeId, edge]));

  const edges = network.edges.map(edge => {
    const qcs = qcsByEdge.get(edge.id);
    const loadRisk = clamp(edge.load ?? 0);
    const incidentRisk = clamp((edge.incidentSeverity ?? 0) * 100);
    const qcsRisk = qcs?.score ?? unknownQcsRisk;
    const closureRisk = edge.closed ? 100 : 0;
    const score = Math.round(clamp(
      loadRisk * 0.30 + incidentRisk * 0.28 + qcsRisk * 0.32 + closureRisk * 0.10
    ));
    const previousScore = previousByEdge.get(edge.id)?.score;
    return {
      edgeId: edge.id,
      from: edge.from,
      to: edge.to,
      score,
      level: riskLevel(score),
      trend: trendFor(score, previousScore),
      delta: Number.isFinite(previousScore) ? score - previousScore : 0,
      load: Number(edge.load ?? 0),
      incidentSeverity: Number(edge.incidentSeverity ?? 0),
      closed: Boolean(edge.closed),
      qcsRiskScore: qcsRisk,
      qcsObserved: Boolean(qcs),
      travelMinutes: edgeTravelMinutes(edge),
      sources: {
        networkLoad: true,
        incidentState: true,
        qcsProxyObservation: Boolean(qcs)
      }
    };
  }).sort((a, b) => b.score - a.score || a.edgeId.localeCompare(b.edgeId));

  const avg = edges.reduce((sum, edge) => sum + edge.score, 0) / Math.max(1, edges.length);
  const rising = edges.filter(edge => edge.trend === 'rising').length;
  const highOrCritical = edges.filter(edge => edge.score >= 60).length;
  const critical = edges.filter(edge => edge.score >= 80).length;
  const observedQcs = edges.filter(edge => edge.qcsObserved).length;
  const incidentEdges = edges.filter(edge => edge.incidentSeverity > 0).length;
  const closedEdges = edges.filter(edge => edge.closed).length;

  return {
    schema: 'smart-traffic-dynamic-risk-twin/v1',
    simulation: true,
    tick: Number(options.tick ?? 0),
    generatedAt: new Date(0).toISOString(),
    method: 'deterministic_network_incident_qcs_composite_risk',
    evidenceBoundary: 'Uses simulated network, incident and QCS proxy data. No live road, government, vehicle, quantum-sensor or production-control feed is connected.',
    weights: { networkLoad: 0.30, incidentSeverity: 0.28, qcsProxyRisk: 0.32, closure: 0.10 },
    summary: {
      edgeCount: edges.length,
      averageRiskScore: Number(avg.toFixed(1)),
      maxRiskScore: edges[0]?.score ?? 0,
      maxRiskEdge: edges[0]?.edgeId ?? null,
      highOrCriticalCount: highOrCritical,
      criticalCount: critical,
      risingCount: rising,
      qcsObservedEdges: observedQcs,
      qcsCoveragePercent: Number((observedQcs / Math.max(1, edges.length) * 100).toFixed(1)),
      incidentEdges,
      closedEdges
    },
    edges
  };
}

function twinEdgeMap(twin) {
  if (!twin?.edges) throw new Error('dynamic risk twin is required');
  return new Map(twin.edges.map(edge => [edge.edgeId, edge]));
}

function adjacency(network) {
  validateNetwork(network);
  const map = new Map(network.nodes.map(node => [node.id, []]));
  for (const edge of network.edges) {
    map.get(edge.from).push({ edge, next: edge.to });
    if (!edge.directed) map.get(edge.to).push({ edge, next: edge.from });
  }
  return map;
}

export function routeWithDynamicRiskTwin(network, twin, origin, destination, options = {}) {
  const riskWeight = clamp(options.riskWeight ?? 1.8, 0, 5);
  const hardBlockRisk = clamp(options.hardBlockRisk ?? 98);
  const riskMap = twinEdgeMap(twin);
  const graph = adjacency(network);
  if (!graph.has(origin) || !graph.has(destination)) throw new Error('unknown origin or destination');

  const dist = new Map(network.nodes.map(node => [node.id, Number.POSITIVE_INFINITY]));
  const prev = new Map();
  const unvisited = new Set(network.nodes.map(node => node.id));
  dist.set(origin, 0);

  while (unvisited.size) {
    let current = null;
    let best = Number.POSITIVE_INFINITY;
    for (const id of unvisited) {
      if (dist.get(id) < best) { best = dist.get(id); current = id; }
    }
    if (current === null || !Number.isFinite(best)) break;
    unvisited.delete(current);
    if (current === destination) break;

    for (const { edge, next } of graph.get(current)) {
      if (!unvisited.has(next)) continue;
      const base = edgeTravelMinutes(edge);
      const twinRisk = riskMap.get(edge.id)?.score ?? 25;
      const blocked = edge.closed || (hardBlockRisk < 100 && twinRisk >= hardBlockRisk);
      const weight = blocked || !Number.isFinite(base) ? Number.POSITIVE_INFINITY : base * (1 + riskWeight * twinRisk / 100);
      const candidate = best + weight;
      if (candidate < dist.get(next)) {
        dist.set(next, candidate);
        prev.set(next, { node: current, edgeId: edge.id });
      }
    }
  }

  if (!Number.isFinite(dist.get(destination))) return { reachable: false, nodes: [], edgeIds: [], minutes: Number.POSITIVE_INFINITY, riskAdjustedCost: Number.POSITIVE_INFINITY, simulation: true };
  const nodes = [destination];
  const edgeIds = [];
  let cursor = destination;
  while (cursor !== origin) {
    const step = prev.get(cursor);
    if (!step) throw new Error('route reconstruction failed');
    edgeIds.unshift(step.edgeId);
    cursor = step.node;
    nodes.unshift(cursor);
  }
  const edgeMap = new Map(network.edges.map(edge => [edge.id, edge]));
  const selectedRisk = edgeIds.map(id => riskMap.get(id)?.score ?? 25);
  const distanceKm = edgeIds.reduce((sum, id) => sum + edgeMap.get(id).distanceKm, 0);
  const minutes = edgeIds.reduce((sum, id) => sum + edgeTravelMinutes(edgeMap.get(id)), 0);
  return {
    reachable: true,
    nodes,
    edgeIds,
    minutes,
    distanceKm,
    riskAdjustedCost: dist.get(destination),
    averageTwinRisk: Number((selectedRisk.reduce((a, b) => a + b, 0) / Math.max(1, selectedRisk.length)).toFixed(1)),
    maxTwinRisk: Math.max(...selectedRisk),
    riskWeight,
    method: 'deterministic_dynamic_twin_time_plus_risk',
    simulation: true
  };
}

export function compareConventionalAndTwinRoutes(network, twin, origin, destination, options = {}) {
  const conventional = shortestPath(network, origin, destination);
  const twinRoute = routeWithDynamicRiskTwin(network, twin, origin, destination, options);
  const map = twinEdgeMap(twin);
  const conventionalRisks = conventional.reachable ? conventional.edgeIds.map(id => map.get(id)?.score ?? 25) : [];
  const conventionalAverage = conventionalRisks.length ? conventionalRisks.reduce((a, b) => a + b, 0) / conventionalRisks.length : 0;
  const conventionalMax = conventionalRisks.length ? Math.max(...conventionalRisks) : 0;
  return {
    schema: 'smart-traffic-dynamic-twin-route-comparison/v1',
    simulation: true,
    conventional: conventional.reachable ? { ...conventional, averageTwinRisk: Number(conventionalAverage.toFixed(1)), maxTwinRisk: conventionalMax } : conventional,
    twinRoute,
    delta: conventional.reachable && twinRoute.reachable ? {
      minutes: Number((twinRoute.minutes - conventional.minutes).toFixed(2)),
      averageRiskScore: Number((twinRoute.averageTwinRisk - conventionalAverage).toFixed(1)),
      maxRiskScore: twinRoute.maxTwinRisk - conventionalMax
    } : null
  };
}

export function recommendTwinSignalPlan(network, twin, options = {}) {
  const topCount = Math.max(2, Math.min(6, Number(options.topCount ?? 4)));
  const riskMap = twinEdgeMap(twin);
  const candidates = network.edges
    .filter(edge => !edge.closed)
    .map(edge => ({
      id: edge.id,
      load: Number(edge.load ?? 0),
      twinRisk: riskMap.get(edge.id)?.score ?? 25,
      priorityLoad: Number(edge.load ?? 0) * (1 + (riskMap.get(edge.id)?.score ?? 25) / 100)
    }))
    .sort((a, b) => b.priorityLoad - a.priorityLoad || b.twinRisk - a.twinRisk)
    .slice(0, topCount);
  const plan = optimizeSignalPlan(candidates.map(item => ({ id: item.id, load: item.priorityLoad })), {
    cycleSeconds: Number(options.cycleSeconds ?? 100),
    lostSeconds: Number(options.lostSeconds ?? 12),
    minGreenSeconds: Number(options.minGreenSeconds ?? 8)
  });
  return {
    ...plan,
    selectedEdges: candidates,
    simulation: true,
    method: 'dynamic_twin_risk_weighted_signal_priority'
  };
}

export function planTwinEmergencyDispatch(network, fleet = [], targetNode, twin, options = {}) {
  if (!Array.isArray(fleet)) throw new Error('fleet must be an array');
  const riskWeight = clamp(options.riskWeight ?? 1.2, 0, 5);
  const candidates = fleet
    .filter(unit => unit.status === 'available' && unit.currentNode)
    .map(unit => ({ unit, route: routeWithDynamicRiskTwin(network, twin, unit.currentNode, targetNode, { riskWeight, hardBlockRisk: 99 }) }))
    .filter(item => item.route.reachable)
    .sort((a, b) => a.route.riskAdjustedCost - b.route.riskAdjustedCost || a.route.minutes - b.route.minutes);
  return {
    targetNode,
    selected: candidates[0] ?? null,
    evaluatedUnits: candidates.length,
    simulation: true,
    method: 'dynamic_twin_risk_aware_emergency_dispatch'
  };
}

export function buildTwinDecisionBundle(network, twin, fleet, origin, destination, emergencyTarget, options = {}) {
  return {
    schema: 'smart-traffic-dynamic-risk-twin-decision-bundle/v1',
    simulation: true,
    route: compareConventionalAndTwinRoutes(network, twin, origin, destination, { riskWeight: options.routeRiskWeight ?? 1.8 }),
    signals: recommendTwinSignalPlan(network, twin, options.signalOptions),
    emergency: planTwinEmergencyDispatch(network, fleet, emergencyTarget, twin, { riskWeight: options.emergencyRiskWeight ?? 1.2 }),
    evidenceBoundary: twin.evidenceBoundary
  };
}
