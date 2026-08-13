import {
  createUnifiedTrafficState,
  reduceTrafficEvent,
  snapshotTrafficState
} from './unifiedStateBus.js';

let authoritativeState = null;
const subscribers = new Set();

function requireState() {
  if (!authoritativeState) throw new Error('authoritative traffic runtime is not initialized');
  return authoritativeState;
}

function notify(event) {
  const snapshot = snapshotTrafficState(requireState());
  for (const subscriber of subscribers) {
    try {
      subscriber(snapshot, event ? JSON.parse(JSON.stringify(event)) : null);
    } catch (error) {
      console.error('authoritative runtime subscriber failed', error);
    }
  }
}

export function initializeAuthoritativeRuntime(initial = {}) {
  authoritativeState = createUnifiedTrafficState(initial);
  notify({ type: 'runtime_initialized', source: 'authoritative-runtime-store' });
  return snapshotTrafficState(authoritativeState);
}

export function isAuthoritativeRuntimeReady() {
  return Boolean(authoritativeState);
}

export function getAuthoritativeState() {
  return snapshotTrafficState(requireState());
}

export function dispatchAuthoritativeEvent(event) {
  authoritativeState = reduceTrafficEvent(requireState(), event);
  notify(event);
  return snapshotTrafficState(authoritativeState);
}

export function subscribeAuthoritativeState(subscriber, { emitCurrent = false } = {}) {
  if (typeof subscriber !== 'function') throw new Error('authoritative runtime subscriber must be a function');
  subscribers.add(subscriber);
  if (emitCurrent && authoritativeState) subscriber(snapshotTrafficState(authoritativeState), { type: 'subscription_snapshot', source: 'authoritative-runtime-store' });
  return () => subscribers.delete(subscriber);
}

export function clearAuthoritativeRuntimeForTests() {
  authoritativeState = null;
  subscribers.clear();
}

export const authoritativeRuntimeEvidenceBoundary = Object.freeze({
  operationalStateAuthority: 'unified-state-bus',
  sourceOfTruth: true,
  legacyUiStateRole: 'derived_mirror_only',
  deterministicReducer: true,
  simulation: true,
  productionControlConnected: false,
  fieldActuation: false,
  safetyCertified: false
});
