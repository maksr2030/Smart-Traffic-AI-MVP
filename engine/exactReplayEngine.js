import { buildExplainablePolicyOrchestration } from './explainableOrchestrationEngine.js';
import { sha256Fingerprint } from './auditHash.js';
import { snapshotTrafficState, stateFingerprint } from './unifiedStateBus.js';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function replayInputsFromState(state, inputs = {}) {
  return {
    network: clone(state.network),
    observations: clone(state.qcsObservations || []),
    fleet: clone(state.fleet || []),
    origin: inputs.origin || state.routeParameters?.origin || 'N1',
    destination: inputs.destination || state.routeParameters?.destination || 'N8',
    emergencyTarget: inputs.emergencyTarget || state.emergencyTarget || 'N10',
    policy: clone(inputs.policy || state.policy),
    options: clone(inputs.options || {})
  };
}

function runCaptured(inputs) {
  if (!inputs.policy) throw new Error('exact replay requires a captured policy');
  return buildExplainablePolicyOrchestration(
    inputs.network,
    inputs.observations,
    inputs.fleet,
    inputs.origin,
    inputs.destination,
    inputs.emergencyTarget,
    inputs.policy,
    inputs.options
  );
}

export async function captureReplayPackage({ state, inputs = {}, output = null, ledgerEntry = null } = {}) {
  if (!state) throw new Error('state is required for replay capture');
  const stateSnapshot = snapshotTrafficState(state);
  const capturedInputs = replayInputsFromState(stateSnapshot, inputs);
  const originalOutput = output || runCaptured(capturedInputs);
  const [stateHash, inputHash, policyHash, outputHash] = await Promise.all([
    stateFingerprint(stateSnapshot),
    sha256Fingerprint({
      origin: capturedInputs.origin,
      destination: capturedInputs.destination,
      emergencyTarget: capturedInputs.emergencyTarget,
      options: capturedInputs.options,
      network: capturedInputs.network,
      observations: capturedInputs.observations,
      fleet: capturedInputs.fleet
    }),
    sha256Fingerprint(capturedInputs.policy),
    sha256Fingerprint(originalOutput)
  ]);
  return {
    schema: 'smart-traffic-exact-replay-package/v1',
    engine: 'buildExplainablePolicyOrchestration',
    deterministicRuntime: true,
    stateRevision: Number(stateSnapshot.revision || 0),
    stateFingerprint: stateHash,
    inputFingerprint: inputHash,
    policyFingerprint: policyHash,
    originalOutputFingerprint: outputHash,
    stateSnapshot,
    inputs: capturedInputs,
    originalOutput: clone(originalOutput),
    ledgerEntry: clone(ledgerEntry),
    evidence: {
      simulation: true,
      exactWithinCapturedDeterministicSoftwareInputs: true,
      realWorldGroundTruthReplay: false,
      fieldExecution: false,
      productionControlConnected: false,
      safetyCertified: false
    }
  };
}

export async function replayDecisionPackage(replayPackage) {
  if (!replayPackage || replayPackage.schema !== 'smart-traffic-exact-replay-package/v1') throw new Error('invalid exact replay package');
  if (replayPackage.engine !== 'buildExplainablePolicyOrchestration') throw new Error(`unsupported replay engine ${replayPackage.engine}`);
  const replayedOutput = runCaptured(clone(replayPackage.inputs));
  const [stateHash, inputHash, policyHash, outputHash] = await Promise.all([
    stateFingerprint(replayPackage.stateSnapshot),
    sha256Fingerprint({
      origin: replayPackage.inputs.origin,
      destination: replayPackage.inputs.destination,
      emergencyTarget: replayPackage.inputs.emergencyTarget,
      options: replayPackage.inputs.options,
      network: replayPackage.inputs.network,
      observations: replayPackage.inputs.observations,
      fleet: replayPackage.inputs.fleet
    }),
    sha256Fingerprint(replayPackage.inputs.policy),
    sha256Fingerprint(replayedOutput)
  ]);
  const comparison = {
    stateMatch: stateHash === replayPackage.stateFingerprint,
    inputMatch: inputHash === replayPackage.inputFingerprint,
    policyMatch: policyHash === replayPackage.policyFingerprint,
    outputFingerprintMatch: outputHash === replayPackage.originalOutputFingerprint,
    selectedCandidateMatch: (replayedOutput.selected?.candidate?.id || null) === (replayPackage.originalOutput?.selected?.candidate?.id || null),
    robustScoreMatch: Number(replayedOutput.selected?.robustScore ?? NaN) === Number(replayPackage.originalOutput?.selected?.robustScore ?? NaN)
  };
  comparison.exactReplayMatch = Object.values(comparison).every(Boolean);
  return {
    schema: 'smart-traffic-exact-replay-result/v1',
    replayedOutput,
    replayedOutputFingerprint: outputHash,
    comparison,
    simulation: true,
    fieldExecution: false,
    exactReplayDefinition: 'Exact match within the captured deterministic software logic, state, policy, fixtures and inputs; not a claim of real-world outcome reproduction.'
  };
}

export async function compareReplayResult(replayPackage, replayResult) {
  if (!replayResult) replayResult = await replayDecisionPackage(replayPackage);
  return clone(replayResult.comparison);
}

export const exactReplayEvidenceBoundary = Object.freeze({
  exactSoftwareReplay: true,
  deterministicCapturedInputsOnly: true,
  realWorldGroundTruthReplay: false,
  productionSafetyProof: false,
  fieldExecution: false
});
