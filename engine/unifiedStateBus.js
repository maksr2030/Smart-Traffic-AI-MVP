import { applyIncident, cloneNetwork, validateNetwork } from './trafficEngine.js';
import { sha256Fingerprint } from './auditHash.js';

const MAX_EVENT_LOG = 200;

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function incidentsFromNetwork(network) {
  return (network?.edges || [])
    .filter(edge => Boolean(edge.closed) || Number(edge.incidentSeverity || 0) > 0)
    .map(edge => ({
      edgeId: edge.id,
      severity: Number(edge.incidentSeverity || 0),
      closed: Boolean(edge.closed),
      load: Number(edge.load || 0)
    }));
}

function normalizeInitial(initial = {}) {
  if (!initial.network) throw new Error('unified traffic state requires a network');
  validateNetwork(initial.network);
  const network = cloneNetwork(initial.network);
  const baseNetwork = cloneNetwork(initial.baseNetwork || initial.network);
  return {
    schema: 'smart-traffic-live-state/v1',
    revision: 0,
    sequence: 0,
    tick: Number(initial.tick || 0),
    running: initial.running !== false,
    scenarioId: initial.scenarioId || 'normal',
    network,
    baseNetwork,
    qcsObservations: clone(initial.qcsObservations || []),
    fleet: clone(initial.fleet || []),
    routeParameters: clone(initial.routeParameters || {}),
    emergencyTarget: initial.emergencyTarget || null,
    policy: clone(initial.policy || null),
    activeIncidents: incidentsFromNetwork(network),
    dynamicRiskTwin: clone(initial.dynamicRiskTwin || null),
    predictiveOrchestration: clone(initial.predictiveOrchestration || null),
    lastDecision: clone(initial.lastDecision || null),
    eventLog: [],
    evidence: {
      simulation: true,
      productionControlConnected: false,
      safetyCertified: false,
      fieldActuation: false
    },
    lastEvent: null
  };
}

export function createUnifiedTrafficState(initial = {}) {
  return normalizeInitial(initial);
}

function nextEnvelope(state, event) {
  const sequence = Number(state.sequence || 0) + 1;
  return {
    sequence,
    type: String(event.type || ''),
    payload: clone(event.payload || {}),
    source: event.source || 'runtime',
    deterministicTime: event.deterministicTime ?? sequence
  };
}

function withEnvelope(state, next, envelope) {
  next.sequence = envelope.sequence;
  next.revision = Number(state.revision || 0) + 1;
  next.lastEvent = clone(envelope);
  next.activeIncidents = incidentsFromNetwork(next.network);
  next.eventLog = [...(state.eventLog || []), envelope].slice(-MAX_EVENT_LOG);
  next.evidence = clone(state.evidence);
  return next;
}

export function reduceTrafficEvent(state, event) {
  if (!state || state.schema !== 'smart-traffic-live-state/v1') throw new Error('invalid unified traffic state');
  if (!event?.type) throw new Error('traffic event type is required');
  const envelope = nextEnvelope(state, event);
  const payload = envelope.payload;
  const next = clone(state);

  switch (envelope.type) {
    case 'scenario_loaded': {
      if (!payload.network) throw new Error('scenario_loaded requires payload.network');
      validateNetwork(payload.network);
      next.network = cloneNetwork(payload.network);
      if (payload.baseNetwork) next.baseNetwork = cloneNetwork(payload.baseNetwork);
      next.scenarioId = payload.scenarioId || state.scenarioId || 'normal';
      next.tick = Number(payload.tick || 0);
      next.dynamicRiskTwin = null;
      next.predictiveOrchestration = null;
      break;
    }
    case 'traffic_drift_applied': {
      const loads = payload.loads || {};
      const deltas = payload.deltas || {};
      next.network.edges = next.network.edges.map(edge => {
        if (edge.closed) return edge;
        const copy = { ...edge };
        if (Object.prototype.hasOwnProperty.call(loads, edge.id)) copy.load = clamp(loads[edge.id], 0, 100);
        else if (Object.prototype.hasOwnProperty.call(deltas, edge.id)) copy.load = clamp(Number(edge.load || 0) + Number(deltas[edge.id] || 0), 0, 100);
        return copy;
      });
      next.tick = Number(payload.tick ?? (Number(state.tick || 0) + 1));
      break;
    }
    case 'incident_injected': {
      next.network = applyIncident(next.network, payload.edgeId, {
        severity: payload.severity ?? 0.9,
        close: payload.closed ?? payload.close ?? false,
        loadIncrease: payload.loadIncrease ?? 18
      });
      next.dynamicRiskTwin = null;
      next.predictiveOrchestration = null;
      break;
    }
    case 'incident_cleared': {
      const edge = next.network.edges.find(item => item.id === payload.edgeId);
      if (!edge) throw new Error(`unknown edge ${payload.edgeId}`);
      edge.incidentSeverity = 0;
      edge.closed = false;
      if (payload.load != null) edge.load = clamp(payload.load, 0, 100);
      next.dynamicRiskTwin = null;
      next.predictiveOrchestration = null;
      break;
    }
    case 'intervention_applied': {
      if (!payload.network) throw new Error('intervention_applied requires payload.network');
      validateNetwork(payload.network);
      next.network = cloneNetwork(payload.network);
      next.dynamicRiskTwin = null;
      next.predictiveOrchestration = null;
      break;
    }
    case 'qcs_observations_updated':
      next.qcsObservations = clone(payload.observations || []);
      next.dynamicRiskTwin = null;
      next.predictiveOrchestration = null;
      break;
    case 'fleet_updated':
      next.fleet = clone(payload.fleet || []);
      break;
    case 'route_parameters_updated':
      next.routeParameters = { ...(next.routeParameters || {}), ...clone(payload) };
      break;
    case 'decision_inputs_updated':
      next.routeParameters = { ...(next.routeParameters || {}), ...clone(payload.routeParameters || {}) };
      if (Object.prototype.hasOwnProperty.call(payload, 'emergencyTarget')) next.emergencyTarget = payload.emergencyTarget || null;
      break;
    case 'emergency_target_updated':
      next.emergencyTarget = payload.target || null;
      break;
    case 'policy_updated':
      next.policy = clone(payload.policy || null);
      break;
    case 'simulation_running_changed':
      next.running = Boolean(payload.running);
      break;
    case 'twin_updated':
      next.dynamicRiskTwin = clone(payload.twin || null);
      break;
    case 'predictive_updated':
      next.predictiveOrchestration = clone(payload.orchestration || null);
      break;
    case 'decision_recorded':
      next.lastDecision = clone(payload.decision || null);
      break;
    case 'manual_reset': {
      const resetNetwork = payload.network || next.baseNetwork;
      if (!resetNetwork) throw new Error('manual_reset requires a reset network');
      validateNetwork(resetNetwork);
      next.network = cloneNetwork(resetNetwork);
      next.scenarioId = payload.scenarioId || 'normal';
      next.tick = Number(payload.tick || 0);
      next.dynamicRiskTwin = null;
      next.predictiveOrchestration = null;
      next.lastDecision = null;
      break;
    }
    case 'runtime_reconciled': {
      if (payload.network) {
        validateNetwork(payload.network);
        next.network = cloneNetwork(payload.network);
      }
      if (payload.baseNetwork) next.baseNetwork = cloneNetwork(payload.baseNetwork);
      if (payload.qcsObservations) next.qcsObservations = clone(payload.qcsObservations);
      if (payload.fleet) next.fleet = clone(payload.fleet);
      if (payload.dynamicRiskTwin !== undefined) next.dynamicRiskTwin = clone(payload.dynamicRiskTwin);
      if (payload.predictiveOrchestration !== undefined) next.predictiveOrchestration = clone(payload.predictiveOrchestration);
      if (payload.routeParameters) next.routeParameters = clone(payload.routeParameters);
      if (payload.emergencyTarget !== undefined) next.emergencyTarget = payload.emergencyTarget || null;
      if (payload.policy !== undefined) next.policy = clone(payload.policy);
      if (payload.scenarioId) next.scenarioId = payload.scenarioId;
      if (payload.tick != null) next.tick = Number(payload.tick);
      if (payload.running != null) next.running = Boolean(payload.running);
      break;
    }
    default:
      throw new Error(`unsupported traffic event ${envelope.type}`);
  }

  return withEnvelope(state, next, envelope);
}

export function appendTrafficEvent(state, event) {
  return reduceTrafficEvent(state, event);
}

export function snapshotTrafficState(state) {
  if (!state || state.schema !== 'smart-traffic-live-state/v1') throw new Error('invalid unified traffic state');
  return clone(state);
}

export async function stateFingerprint(state) {
  const snapshot = snapshotTrafficState(state);
  return sha256Fingerprint(snapshot);
}

export function replayTrafficEvents(initialState, events = []) {
  return events.reduce((current, event) => reduceTrafficEvent(current, event), snapshotTrafficState(initialState));
}

export const unifiedStateEvidenceBoundary = Object.freeze({
  authoritativeForCapturedHardeningState: true,
  operationalRuntimeIntegration: 'authoritative_state_bus_ready',
  simulation: true,
  productionControlConnected: false,
  fieldActuation: false,
  safetyCertified: false
});
