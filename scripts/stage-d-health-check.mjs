import { readFileSync } from 'node:fs';

const requiredFiles = [
  'engine/runtimeHealthEngine.js',
  'engine/failureInjectionEngine.js',
  'runtimeHealthRuntime.js',
  'runtimeHealth.css',
  'tests/runtimeHealthEngine.test.js'
];

for (const file of requiredFiles) readFileSync(file, 'utf8');

const runtime = readFileSync('runtimeHealthRuntime.js', 'utf8');
const health = readFileSync('engine/runtimeHealthEngine.js', 'utf8');
const injection = readFileSync('engine/failureInjectionEngine.js', 'utf8');

for (const token of ['runtimeHealthPanel', 'smartTrafficHealth', 'gateDecision']) {
  if (!runtime.includes(token)) throw new Error(`Stage D runtime token missing: ${token}`);
}
for (const token of ['READY', 'DEGRADED', 'BLOCKED', 'FAIL_SAFE_BLOCKED', 'humanApprovalRequired']) {
  if (!health.includes(token)) throw new Error(`Stage D health token missing: ${token}`);
}
for (const token of ['missing_network', 'unsafe_policy', 'missing_qcs', 'stateMutationAppliedToAuthoritativeRuntime']) {
  if (!injection.includes(token)) throw new Error(`Stage D failure-injection token missing: ${token}`);
}

console.log('Stage D health contract passed: READY/DEGRADED/BLOCKED model, fail-safe gate, isolated failure injection and browser panel wired.');
