export const CLOSEOUT_SCHEMA = 'smart-traffic-engineering-closeout/v1';

function check(id, label, passed, evidence, boundary = null) {
  return { id, label, passed: Boolean(passed), status: passed ? 'PASS' : 'GAP', evidence, boundary };
}

export function buildEngineeringCloseoutScorecard(input = {}) {
  const coverage = input.coverageSummary || {};
  const coverageTotal = Number(coverage.total || 0);
  const accounted = Number(coverage.implemented_demo || 0) + Number(coverage.represented_demo || 0) + Number(coverage.catalogued_only || 0);
  const checks = [
    check('registry_integrity', 'Registry & evidence accounting', coverageTotal === 123 && accounted === coverageTotal, { total: coverageTotal, accounted }),
    check('authoritative_state', 'Authoritative live-state governance', input.stateAuthority === 'unified-state-bus', { stateAuthority: input.stateAuthority || null }),
    check('runtime_health', 'Runtime health & fail-safe gate', ['READY','DEGRADED'].includes(input.healthStatus) && Number(input.failureInjectionScenarios || 0) >= 7, { healthStatus: input.healthStatus || null, failureInjectionScenarios: Number(input.failureInjectionScenarios || 0) }),
    check('decision_integrity', 'Decision integrity & exact replay', input.decisionLedger === true && input.exactReplay === true, { decisionLedger: input.decisionLedger === true, exactReplay: input.exactReplay === true }),
    check('node_assurance', 'Node unit/integration assurance', Number(input.nodeTests || 0) >= 67, { nodeTests: Number(input.nodeTests || 0) }),
    check('browser_assurance', 'Desktop + mobile browser assurance', Number(input.browserTests || 0) >= 16, { browserTests: Number(input.browserTests || 0), physicalIPhoneValidated: false }, 'WebKit emulation is not physical-iPhone acceptance evidence.'),
    check('deployment_assurance', 'Single-build publication assurance', input.sameBuildForE2EAndPages === true, { sameBuildForE2EAndPages: input.sameBuildForE2EAndPages === true }),
    check('production_verification', 'Independent production verification', Number(coverage.production_verified || 0) > 0, { production_verified: Number(coverage.production_verified || 0) }, 'Production verification requires independent field evidence and is intentionally not inferred from MVP hardening.')
  ];

  const engineeringChecks = checks.filter(item => item.id !== 'production_verification');
  const engineeringPassed = engineeringChecks.filter(item => item.passed).length;
  const engineeringCloseoutReady = engineeringPassed === engineeringChecks.length;

  return {
    schema: CLOSEOUT_SCHEMA,
    status: engineeringCloseoutReady ? 'ENGINEERING_MVP_CLOSEOUT_READY' : 'ENGINEERING_MVP_CLOSEOUT_INCOMPLETE',
    engineeringCloseoutReady,
    engineeringPassed,
    engineeringTotal: engineeringChecks.length,
    productionReadiness: 'NOT_VERIFIED',
    productionVerifiedCount: Number(coverage.production_verified || 0),
    checks,
    evidenceBoundary: {
      simulation: true,
      autoApply: false,
      humanApprovalRequired: true,
      productionControlConnected: false,
      fieldActuation: false,
      safetyCertified: false,
      physicalIPhoneValidated: false
    }
  };
}
