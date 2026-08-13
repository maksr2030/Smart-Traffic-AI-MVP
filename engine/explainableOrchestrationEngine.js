import { orchestratePredictiveRisk } from './predictiveOrchestrationEngine.js';

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function resultMap(orchestration) {
  const rows = [orchestration.selected, ...(orchestration.alternatives ?? [])];
  return new Map(rows.filter(Boolean).map(item => [item.candidate.id, item]));
}

export function evaluatePolicyGuardrails(orchestration, policy) {
  if (!orchestration?.rankedCandidates?.length) throw new Error('orchestration result is required');
  if (!policy?.schema) throw new Error('policy is required');
  const raw = resultMap(orchestration);
  const globalViolations = [];
  if (policy.simulationOnly && orchestration.simulation !== true) globalViolations.push('simulation_required');
  if (policy.requireHumanApproval && orchestration.humanApprovalRequired !== true) globalViolations.push('human_approval_required');
  if (!policy.autoApplyAllowed && orchestration.autoApply !== false) globalViolations.push('auto_apply_forbidden');
  if (!policy.productionControlAllowed && orchestration.productionControlConnected !== false) globalViolations.push('production_control_forbidden');
  if (orchestration.rankedCandidates.length < Number(policy.minimumRankedCandidates ?? 1)) globalViolations.push('insufficient_candidate_count');

  const candidates = orchestration.rankedCandidates.map((ranked, index) => {
    const detail = raw.get(ranked.id);
    const candidate = detail?.candidate ?? {};
    const violations = [];
    if (Number(candidate.targetCount ?? 0) > Number(policy.maxTargetCount ?? Infinity)) violations.push('target_count_limit');
    if (Number(candidate.loadReduction ?? 0) > Number(policy.maxLoadReduction ?? Infinity)) violations.push('load_reduction_limit');
    if (Number(candidate.incidentRelief ?? 0) > Number(policy.maxIncidentRelief ?? Infinity)) violations.push('incident_relief_limit');
    if (Number(candidate.interventionPenalty ?? 0) > Number(policy.maxInterventionPenalty ?? Infinity)) violations.push('intervention_penalty_limit');
    if (policy.preserveClosedEdges) {
      const changedClosedEdge = (detail?.evaluations ?? []).some(item =>
        item.twin.edges.some(edge => edge.closed !== true && edge.sources?.networkLoad && edge.score === 100 && edge.closed === false)
      );
      if (changedClosedEdge) violations.push('closed_edge_preservation');
    }
    return {
      rank: index + 1,
      id: ranked.id,
      label: ranked.label,
      compliant: violations.length === 0 && globalViolations.length === 0,
      violations,
      robustScore: ranked.robustScore
    };
  });
  const selected = candidates.find(item => item.compliant) ?? null;
  return {
    schema: 'smart-traffic-orchestration-policy-evaluation/v1',
    simulation: true,
    policySchema: policy.schema,
    globalViolations,
    candidates,
    selectedCandidateId: selected?.id ?? null,
    blocked: !selected,
    autoApply: false,
    humanApprovalRequired: true
  };
}

export function explainOrchestration(orchestration, selectedCandidateId = orchestration?.selected?.candidate?.id) {
  if (!orchestration?.rankedCandidates?.length) throw new Error('orchestration result is required');
  const raw = resultMap(orchestration);
  const selected = raw.get(selectedCandidateId);
  if (!selected) throw new Error(`unknown selected candidate ${selectedCandidateId}`);
  const baseline = raw.get('observe_only') ?? null;
  const decomposition = {
    weightedMeanContribution: round(selected.weightedMeanScore * 0.80),
    worstHorizonContribution: round(selected.worstHorizonScore * 0.20),
    interventionPenalty: round(selected.candidate.interventionPenalty ?? 0)
  };
  decomposition.reconstructedRobustScore = round(
    decomposition.weightedMeanContribution + decomposition.worstHorizonContribution + decomposition.interventionPenalty
  );

  const comparisons = orchestration.rankedCandidates
    .filter(item => item.id !== selectedCandidateId)
    .map(item => ({
      alternativeId: item.id,
      alternativeLabel: item.label,
      robustScoreDelta: round(item.robustScore - selected.robustScore),
      meanScoreDelta: round(item.weightedMeanScore - selected.weightedMeanScore),
      worstScoreDelta: round(item.worstHorizonScore - selected.worstHorizonScore),
      penaltyDelta: round(item.interventionPenalty - Number(selected.candidate.interventionPenalty ?? 0)),
      rejectedBecause: item.robustScore > selected.robustScore
        ? 'higher_robust_multi_horizon_score'
        : 'policy_or_tie_break'
    }));

  const reasons = [];
  if (baseline) {
    const delta = round(baseline.robustScore - selected.robustScore);
    reasons.push({ factor: 'robust_score_vs_observe_only', effect: delta, direction: delta >= 0 ? 'better' : 'worse' });
    const finalSelected = selected.finalSummary;
    const finalBaseline = baseline.finalSummary;
    reasons.push({ factor: 'final_average_risk', effect: round(finalBaseline.averageRiskScore - finalSelected.averageRiskScore), direction: finalBaseline.averageRiskScore >= finalSelected.averageRiskScore ? 'better' : 'worse' });
    reasons.push({ factor: 'final_max_risk', effect: round(finalBaseline.maxRiskScore - finalSelected.maxRiskScore), direction: finalBaseline.maxRiskScore >= finalSelected.maxRiskScore ? 'better' : 'worse' });
    reasons.push({ factor: 'final_average_load', effect: round(finalBaseline.avgLoad - finalSelected.avgLoad), direction: finalBaseline.avgLoad >= finalSelected.avgLoad ? 'better' : 'worse' });
  }

  return {
    schema: 'smart-traffic-explainable-orchestration/v1',
    simulation: true,
    selectedCandidateId,
    selectedLabel: selected.candidate.label,
    robustScore: selected.robustScore,
    decomposition,
    reasons,
    comparisons,
    explanationType: 'deterministic_arithmetic_decision_explanation',
    causalClaim: false,
    evidenceBoundary: 'The explanation decomposes deterministic simulated scoring and comparisons. It is not a causal proof, safety case, or production decision justification.'
  };
}

export function buildScenarioReplay(orchestration, selectedCandidateId) {
  const raw = resultMap(orchestration);
  const selected = raw.get(selectedCandidateId);
  const baseline = raw.get('observe_only');
  if (!selected || !baseline) throw new Error('selected candidate and observe_only baseline are required');
  const baselineByHorizon = new Map(baseline.evaluations.map(item => [item.horizonMinutes, item]));
  const frames = selected.evaluations.map(item => {
    const base = baselineByHorizon.get(item.horizonMinutes);
    if (!base) throw new Error(`baseline horizon missing ${item.horizonMinutes}`);
    return {
      horizonMinutes: item.horizonMinutes,
      selected: item.objective,
      baseline: base.objective,
      improvement: {
        objectiveScore: round(base.objective.score - item.objective.score),
        averageRiskScore: round(base.objective.averageRiskScore - item.objective.averageRiskScore),
        maxRiskScore: round(base.objective.maxRiskScore - item.objective.maxRiskScore),
        avgLoad: round(base.objective.avgLoad - item.objective.avgLoad),
        avgEdgeMinutes: round(base.objective.avgEdgeMinutes - item.objective.avgEdgeMinutes),
        stressIndex: round(base.objective.stressIndex - item.objective.stressIndex)
      },
      route: item.decisions.route.twinRoute,
      emergency: item.decisions.emergency.selected ? {
        unitId: item.decisions.emergency.selected.unit.id,
        minutes: item.decisions.emergency.selected.route.minutes,
        averageTwinRisk: item.decisions.emergency.selected.route.averageTwinRisk
      } : null,
      signalPhases: item.decisions.signals.phases.map(phase => ({ id: phase.id, greenSeconds: round(phase.greenSeconds, 1) }))
    };
  });
  return {
    schema: 'smart-traffic-orchestration-scenario-replay/v1',
    simulation: true,
    selectedCandidateId,
    baselineCandidateId: 'observe_only',
    horizons: frames.map(frame => frame.horizonMinutes),
    frames,
    replayOnly: true,
    fieldExecution: false
  };
}

export function runOrchestrationSensitivity(network, observations, fleet, origin, destination, emergencyTarget, options = {}) {
  const riskWeights = options.riskWeights ?? [0.8, 1.8, 2.5, 3.5];
  const horizonSets = options.horizonSets ?? [[5, 15], [5, 15, 30], [5, 15, 30, 60]];
  const rows = [];
  horizonSets.forEach(horizons => {
    riskWeights.forEach(routeRiskWeight => {
      const result = orchestratePredictiveRisk(network, observations, fleet, origin, destination, emergencyTarget, {
        horizons,
        routeRiskWeight,
        currentTwin: options.currentTwin
      });
      const finalRoute = result.selected.finalDecisions.route.twinRoute;
      rows.push({
        horizons: [...horizons],
        routeRiskWeight,
        selectedCandidateId: result.selected.candidate.id,
        robustScore: result.selected.robustScore,
        finalRouteMinutes: finalRoute.reachable ? round(finalRoute.minutes, 2) : null,
        finalRouteAverageRisk: finalRoute.reachable ? finalRoute.averageTwinRisk : null,
        autoApply: result.autoApply
      });
    });
  });
  return {
    schema: 'smart-traffic-orchestration-sensitivity/v1',
    simulation: true,
    rows,
    trainedModel: false,
    autoApply: false
  };
}

export function buildExplainablePolicyOrchestration(network, observations, fleet, origin, destination, emergencyTarget, policy, options = {}) {
  const orchestration = orchestratePredictiveRisk(network, observations, fleet, origin, destination, emergencyTarget, options);
  const policyEvaluation = evaluatePolicyGuardrails(orchestration, policy);
  const policySelectedId = policyEvaluation.selectedCandidateId;
  if (!policySelectedId) {
    return {
      schema: 'smart-traffic-explainable-policy-orchestration/v1',
      simulation: true,
      orchestration,
      policyEvaluation,
      selected: null,
      explanation: null,
      replay: null,
      blocked: true,
      autoApply: false,
      humanApprovalRequired: true
    };
  }
  const raw = resultMap(orchestration);
  const selected = raw.get(policySelectedId);
  return {
    schema: 'smart-traffic-explainable-policy-orchestration/v1',
    simulation: true,
    orchestration,
    policyEvaluation,
    selected,
    explanation: explainOrchestration(orchestration, policySelectedId),
    replay: buildScenarioReplay(orchestration, policySelectedId),
    blocked: false,
    autoApply: false,
    humanApprovalRequired: true,
    productionControlConnected: false,
    evidenceBoundary: 'Policy-compliant recommendation, explanation and replay are simulation-only decision support. Human approval remains mandatory.'
  };
}
