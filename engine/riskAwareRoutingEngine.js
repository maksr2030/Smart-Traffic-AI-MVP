import { edgeTravelMinutes, shortestPath, validateNetwork } from './trafficEngine.js';
import { assessQcsRoadRisk } from './qcsRiskEngine.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));

function buildAdjacency(network) {
  validateNetwork(network);
  const map = new Map(network.nodes.map(node => [node.id, []]));
  for (const edge of network.edges) {
    map.get(edge.from).push({ edge, next: edge.to });
    if (!edge.directed) map.get(edge.to).push({ edge, next: edge.from });
  }
  return map;
}

export function buildQcsRiskProfile(observations = [], { unknownRiskScore = 18 } = {}) {
  if (!Array.isArray(observations)) throw new Error('observations must be an array');
  const fallback = clamp(unknownRiskScore, 0, 100);
  const assessments = observations.map(assessQcsRoadRisk);
  const byEdge = new Map(assessments.map(item => [item.edgeId, item]));
  return {
    fallbackRiskScore: fallback,
    assessments,
    byEdge,
    scoreFor(edgeId) { return byEdge.get(edgeId)?.score ?? fallback; },
    observed(edgeId) { return byEdge.has(edgeId); }
  };
}

export function summarizeRouteRisk(edgeIds = [], profile) {
  if (!profile?.scoreFor) throw new Error('risk profile is required');
  if (!Array.isArray(edgeIds)) throw new Error('edgeIds must be an array');
  if (!edgeIds.length) return { averageRiskScore: 0, maxRiskScore: 0, observedEdges: 0, unknownEdges: 0, edgeRisks: [] };
  const edgeRisks = edgeIds.map(edgeId => ({ edgeId, riskScore: profile.scoreFor(edgeId), observed: profile.observed(edgeId) }));
  const total = edgeRisks.reduce((sum, item) => sum + item.riskScore, 0);
  return {
    averageRiskScore: Number((total / edgeRisks.length).toFixed(1)),
    maxRiskScore: Math.max(...edgeRisks.map(item => item.riskScore)),
    observedEdges: edgeRisks.filter(item => item.observed).length,
    unknownEdges: edgeRisks.filter(item => !item.observed).length,
    edgeRisks
  };
}

export function riskAwareRoute(network, origin, destination, observations = [], options = {}) {
  const riskWeight = clamp(options.riskWeight ?? 1.6, 0, 5);
  const avoidRiskScore = clamp(options.avoidRiskScore ?? 96, 0, 100);
  const hardBlockEnabled = avoidRiskScore < 100;
  const profile = buildQcsRiskProfile(observations, { unknownRiskScore: options.unknownRiskScore ?? 18 });
  const graph = buildAdjacency(network);
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
      const baseMinutes = edgeTravelMinutes(edge);
      const riskScore = profile.scoreFor(edge.id);
      const blockedByRisk = hardBlockEnabled && profile.observed(edge.id) && riskScore >= avoidRiskScore;
      const weight = blockedByRisk || !Number.isFinite(baseMinutes)
        ? Number.POSITIVE_INFINITY
        : baseMinutes * (1 + riskWeight * riskScore / 100);
      const candidate = best + weight;
      if (candidate < dist.get(next)) {
        dist.set(next, candidate);
        prev.set(next, { node: current, edgeId: edge.id });
      }
    }
  }

  if (!Number.isFinite(dist.get(destination))) {
    return {
      reachable: false, nodes: [], edgeIds: [], minutes: Number.POSITIVE_INFINITY, distanceKm: Number.POSITIVE_INFINITY,
      riskAdjustedCost: Number.POSITIVE_INFINITY, risk: summarizeRouteRisk([], profile), riskWeight, avoidRiskScore,
      simulation: true, method: 'deterministic_time_plus_qcs_proxy_risk'
    };
  }

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
  const distanceKm = edgeIds.reduce((sum, id) => sum + edgeMap.get(id).distanceKm, 0);
  const minutes = edgeIds.reduce((sum, id) => sum + edgeTravelMinutes(edgeMap.get(id)), 0);
  return {
    reachable: true,
    nodes,
    edgeIds,
    minutes,
    distanceKm,
    riskAdjustedCost: dist.get(destination),
    risk: summarizeRouteRisk(edgeIds, profile),
    riskWeight,
    avoidRiskScore,
    hardBlockEnabled,
    simulation: true,
    method: 'deterministic_time_plus_qcs_proxy_risk',
    evidenceBoundary: 'Uses simulated QCS proxy observations; no quantum sensor or production road feed is connected.'
  };
}

export function compareConventionalAndRiskAwareRoutes(network, origin, destination, observations = [], options = {}) {
  const profile = buildQcsRiskProfile(observations, { unknownRiskScore: options.unknownRiskScore ?? 18 });
  const conventional = shortestPath(network, origin, destination);
  const riskAware = riskAwareRoute(network, origin, destination, observations, options);
  const conventionalRisk = conventional.reachable ? summarizeRouteRisk(conventional.edgeIds, profile) : null;
  const safer = Boolean(
    conventional.reachable && riskAware.reachable &&
    (riskAware.risk.averageRiskScore < conventionalRisk.averageRiskScore || riskAware.risk.maxRiskScore < conventionalRisk.maxRiskScore)
  );
  return {
    schema: 'smart-traffic-risk-aware-route-comparison/v1',
    simulation: true,
    conventional: conventional.reachable ? { ...conventional, risk: conventionalRisk } : conventional,
    riskAware,
    delta: conventional.reachable && riskAware.reachable ? {
      minutes: Number((riskAware.minutes - conventional.minutes).toFixed(2)),
      distanceKm: Number((riskAware.distanceKm - conventional.distanceKm).toFixed(2)),
      averageRiskScore: Number((riskAware.risk.averageRiskScore - conventionalRisk.averageRiskScore).toFixed(1)),
      maxRiskScore: riskAware.risk.maxRiskScore - conventionalRisk.maxRiskScore
    } : null,
    saferRouteSelected: safer,
    evidenceBoundary: 'Routing is deterministic proof-of-concept logic using simulated risk observations. It is not a safety-certified navigation or vehicle-control system.'
  };
}
