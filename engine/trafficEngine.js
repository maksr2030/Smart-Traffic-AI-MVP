export function cloneNetwork(network) {
  return JSON.parse(JSON.stringify(network));
}

export function validateNetwork(network) {
  if (!network || !Array.isArray(network.nodes) || !Array.isArray(network.edges)) {
    throw new Error('network must contain nodes and edges arrays');
  }
  const ids = new Set(network.nodes.map(n => n.id));
  if (ids.size !== network.nodes.length) throw new Error('duplicate node id');
  for (const edge of network.edges) {
    if (!edge.id || !ids.has(edge.from) || !ids.has(edge.to)) throw new Error(`invalid edge ${edge.id || 'unknown'}`);
    if (!(edge.distanceKm > 0) || !(edge.speedLimitKph > 0)) throw new Error(`invalid edge geometry ${edge.id}`);
  }
  return true;
}

export function edgeTravelMinutes(edge) {
  if (edge.closed) return Number.POSITIVE_INFINITY;
  const load = Math.max(0, Math.min(100, Number(edge.load ?? 0)));
  const severity = Math.max(0, Math.min(1, Number(edge.incidentSeverity ?? 0)));
  const effectiveSpeed = Math.max(8, edge.speedLimitKph * (1 - 0.62 * load / 100));
  const freeFlowMinutes = edge.distanceKm / effectiveSpeed * 60;
  const congestionPenalty = 1 + 1.35 * Math.pow(load / 100, 2);
  const incidentPenalty = 1 + 3.5 * severity;
  return freeFlowMinutes * congestionPenalty * incidentPenalty;
}

function adjacency(network) {
  validateNetwork(network);
  const map = new Map(network.nodes.map(n => [n.id, []]));
  for (const edge of network.edges) {
    map.get(edge.from).push({ edge, next: edge.to });
    if (!edge.directed) map.get(edge.to).push({ edge, next: edge.from });
  }
  return map;
}

export function shortestPath(network, origin, destination, options = {}) {
  const graph = adjacency(network);
  if (!graph.has(origin) || !graph.has(destination)) throw new Error('unknown origin or destination');
  const dist = new Map(network.nodes.map(n => [n.id, Number.POSITIVE_INFINITY]));
  const prev = new Map();
  const unvisited = new Set(network.nodes.map(n => n.id));
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
      let weight = edgeTravelMinutes(edge);
      if (options.avoidEdgeIds?.includes(edge.id)) weight = Number.POSITIVE_INFINITY;
      if (options.priorityEdgeIds?.includes(edge.id)) weight *= 0.72;
      const candidate = best + weight;
      if (candidate < dist.get(next)) {
        dist.set(next, candidate);
        prev.set(next, { node: current, edgeId: edge.id });
      }
    }
  }

  if (!Number.isFinite(dist.get(destination))) {
    return { reachable: false, nodes: [], edgeIds: [], minutes: Number.POSITIVE_INFINITY, distanceKm: Number.POSITIVE_INFINITY };
  }

  const nodes = [destination];
  const edgeIds = [];
  let cursor = destination;
  while (cursor !== origin) {
    const step = prev.get(cursor);
    if (!step) return { reachable: false, nodes: [], edgeIds: [], minutes: Number.POSITIVE_INFINITY, distanceKm: Number.POSITIVE_INFINITY };
    edgeIds.unshift(step.edgeId);
    cursor = step.node;
    nodes.unshift(cursor);
  }
  const edgeMap = new Map(network.edges.map(e => [e.id, e]));
  const distanceKm = edgeIds.reduce((sum, id) => sum + edgeMap.get(id).distanceKm, 0);
  return { reachable: true, nodes, edgeIds, minutes: dist.get(destination), distanceKm };
}

export function applyIncident(network, edgeId, { severity = 0.7, close = false, loadIncrease = 18 } = {}) {
  const next = cloneNetwork(network);
  const edge = next.edges.find(e => e.id === edgeId);
  if (!edge) throw new Error(`unknown edge ${edgeId}`);
  edge.incidentSeverity = Math.max(0, Math.min(1, severity));
  edge.closed = Boolean(close);
  edge.load = Math.max(0, Math.min(100, Number(edge.load ?? 0) + loadIncrease));
  return next;
}

export function applyDemand(network, multiplier = 1) {
  const next = cloneNetwork(network);
  next.edges.forEach(edge => {
    edge.load = Math.max(0, Math.min(100, Math.round(Number(edge.load ?? 0) * multiplier)));
  });
  return next;
}

export function optimizeSignalPlan(approaches, { cycleSeconds = 90, lostSeconds = 10, minGreenSeconds = 8 } = {}) {
  if (!Array.isArray(approaches) || approaches.length < 2) throw new Error('at least two approaches are required');
  const usable = cycleSeconds - lostSeconds;
  if (usable <= approaches.length * minGreenSeconds) throw new Error('cycle too short for minimum green constraints');
  const base = minGreenSeconds * approaches.length;
  const distributable = usable - base;
  const weights = approaches.map(a => Math.sqrt(Math.max(0, Number(a.load ?? 0)) + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const greens = approaches.map((a, i) => minGreenSeconds + distributable * weights[i] / totalWeight);
  return {
    cycleSeconds,
    lostSeconds,
    usableGreenSeconds: usable,
    phases: approaches.map((a, i) => ({ id: a.id, load: Number(a.load ?? 0), greenSeconds: greens[i] }))
  };
}

export function networkMetrics(network) {
  validateNetwork(network);
  const loads = network.edges.map(e => Number(e.load ?? 0));
  const avgLoad = loads.reduce((a, b) => a + b, 0) / Math.max(1, loads.length);
  const active = network.edges.filter(e => !e.closed);
  const avgEdgeMinutes = active.map(edgeTravelMinutes).reduce((a, b) => a + b, 0) / Math.max(1, active.length);
  const criticalEdges = network.edges.filter(e => e.closed || Number(e.load ?? 0) >= 80 || Number(e.incidentSeverity ?? 0) >= 0.5).length;
  const stressIndex = Math.min(100, avgLoad * 0.72 + criticalEdges * 4.5 + avgEdgeMinutes * 0.8);
  return { avgLoad, avgEdgeMinutes, criticalEdges, stressIndex };
}

export function simulateScenario(network, scenario = {}) {
  let next = applyDemand(network, Number(scenario.demandMultiplier ?? 1));
  if (scenario.incidentEdgeId) {
    next = applyIncident(next, scenario.incidentEdgeId, {
      severity: scenario.incidentSeverity ?? 0.7,
      close: scenario.closeIncidentEdge ?? false,
      loadIncrease: scenario.incidentLoadIncrease ?? 15
    });
  }
  return { network: next, metrics: networkMetrics(next) };
}

export function chooseBestScenario(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) throw new Error('candidates required');
  return [...candidates].sort((a, b) => a.metrics.stressIndex - b.metrics.stressIndex)[0];
}
