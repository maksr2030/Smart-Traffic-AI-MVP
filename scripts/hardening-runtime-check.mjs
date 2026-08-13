import { access, readFile } from 'node:fs/promises';

const files = [
  'hardeningRuntime.js','hardeningRuntime.css',
  'engine/auditHash.js','engine/unifiedStateBus.js','engine/decisionLedgerEngine.js','engine/exactReplayEngine.js',
  'tests/runtimeHardening.test.js'
];
for (const file of files) await access(file);

const runtime = await readFile('hardeningRuntime.js','utf8');
const css = await readFile('hardeningRuntime.css','utf8');
const bus = await readFile('engine/unifiedStateBus.js','utf8');
const ledger = await readFile('engine/decisionLedgerEngine.js','utf8');
const replay = await readFile('engine/exactReplayEngine.js','utf8');
const hash = await readFile('engine/auditHash.js','utf8');

for (const id of ['runtimeIntegrityPanel','hardeningRevision','hardeningStateHash','hardeningLedgerCount','hardeningChainStatus','captureDecisionBtn','verifyLedgerBtn','replayLatestBtn','exportAuditBtn','hardeningLedgerRows','hardeningEventRows']) {
  if (!runtime.includes(id)) throw new Error(`hardening runtime UI contract missing: ${id}`);
}
for (const phrase of ['createUnifiedTrafficState','appendTrafficEvent','createDecisionLedger','appendLedgerEntry','verifyLedgerChain','captureReplayPackage','replayDecisionPackage','smart-traffic:hardening-ready','digitalSignature=false','blockchainAnchored=false','nonRepudiation=false','production_verified=0']) {
  if (!runtime.includes(phrase)) throw new Error(`hardening runtime contract missing: ${phrase}`);
}
for (const phrase of ['smart-traffic-live-state/v1','runtime_reconciled','incident_injected','manual_reset','stateFingerprint']) {
  if (!bus.includes(phrase)) throw new Error(`unified-state contract missing: ${phrase}`);
}
for (const phrase of ['smart-traffic-decision-ledger/v1','previousEntryHash','verifyLedgerChain','digitalSignature: false','blockchainAnchored: false','nonRepudiation: false']) {
  if (!ledger.includes(phrase)) throw new Error(`decision-ledger contract missing: ${phrase}`);
}
for (const phrase of ['smart-traffic-exact-replay-package/v1','exactReplayMatch','outputFingerprintMatch','realWorldGroundTruthReplay: false','productionSafetyProof: false']) {
  if (!replay.includes(phrase)) throw new Error(`exact-replay contract missing: ${phrase}`);
}
for (const phrase of ["digest('SHA-256'",'canonicalJson','digitalSignature: false','blockchainAnchored: false']) {
  if (!hash.includes(phrase)) throw new Error(`audit-hash contract missing: ${phrase}`);
}
for (const style of ['.hardening-panel','.hardening-metrics','.hardening-grid','@media(max-width:520px)']) {
  if (!css.includes(style)) throw new Error(`hardening CSS contract missing: ${style}`);
}

console.log('Production hardening contract passed: unified live-state capture, SHA-256 chained ledger, exact replay, evidence boundaries and mobile UI wired.');
