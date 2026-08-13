import { auditHashEvidenceBoundary, canonicalJson, sha256Fingerprint } from './auditHash.js';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function createDecisionLedger() {
  return {
    schema: 'smart-traffic-decision-ledger/v1',
    entries: [],
    evidence: {
      ...auditHashEvidenceBoundary,
      simulation: true,
      appendOnlyIntent: true
    }
  };
}

function assertLedger(ledger) {
  if (!ledger || ledger.schema !== 'smart-traffic-decision-ledger/v1' || !Array.isArray(ledger.entries)) {
    throw new Error('invalid decision ledger');
  }
}

export async function appendLedgerEntry(ledger, input = {}) {
  assertLedger(ledger);
  const next = clone(ledger);
  const previous = next.entries[next.entries.length - 1] || null;
  const sequence = next.entries.length + 1;
  const previousEntryHash = previous?.entryHash || 'GENESIS';
  const stateHash = input.stateFingerprint || await sha256Fingerprint(input.stateSnapshot || null);
  const inputHash = await sha256Fingerprint(input.inputs || {});
  const policyHash = await sha256Fingerprint(input.policy || null);
  const outputHash = await sha256Fingerprint(input.output || null);
  const core = {
    schema: 'smart-traffic-decision-ledger-entry/v1',
    sequence,
    decisionType: input.decisionType || 'orchestration_recommendation',
    method: input.method || 'deterministic-demo-runtime',
    stateRevision: Number(input.stateRevision || 0),
    stateFingerprint: stateHash,
    inputFingerprint: inputHash,
    policyFingerprint: policyHash,
    outputFingerprint: outputHash,
    previousEntryHash,
    deterministicTime: input.deterministicTime ?? sequence,
    evidence: {
      simulation: true,
      autoApply: false,
      humanApprovalRequired: true,
      productionControlConnected: false,
      digitalSignature: false,
      blockchainAnchored: false,
      nonRepudiation: false,
      productionAuditCertified: false,
      ...(clone(input.evidence || {}))
    },
    metadata: clone(input.metadata || {})
  };
  const entryHash = await sha256Fingerprint(core);
  const entry = { ...core, entryHash };
  next.entries.push(entry);
  return { ledger: next, entry };
}

export async function verifyLedgerChain(ledger) {
  assertLedger(ledger);
  const failures = [];
  let previousEntryHash = 'GENESIS';
  for (let index = 0; index < ledger.entries.length; index += 1) {
    const entry = ledger.entries[index];
    const expectedSequence = index + 1;
    const { entryHash, ...core } = entry;
    const calculated = await sha256Fingerprint(core);
    if (entry.sequence !== expectedSequence) failures.push({ sequence: expectedSequence, reason: 'sequence_mismatch' });
    if (entry.previousEntryHash !== previousEntryHash) failures.push({ sequence: expectedSequence, reason: 'previous_hash_mismatch' });
    if (calculated !== entryHash) failures.push({ sequence: expectedSequence, reason: 'entry_hash_mismatch' });
    previousEntryHash = entryHash;
  }
  return {
    valid: failures.length === 0,
    checkedEntries: ledger.entries.length,
    failures,
    headHash: ledger.entries.at(-1)?.entryHash || 'GENESIS'
  };
}

export function findLedgerEntry(ledger, selector) {
  assertLedger(ledger);
  if (typeof selector === 'number') return clone(ledger.entries.find(entry => entry.sequence === selector) || null);
  if (typeof selector === 'string') return clone(ledger.entries.find(entry => entry.entryHash === selector) || null);
  if (selector?.sequence) return clone(ledger.entries.find(entry => entry.sequence === selector.sequence) || null);
  if (selector?.entryHash) return clone(ledger.entries.find(entry => entry.entryHash === selector.entryHash) || null);
  return null;
}

export function exportLedgerJson(ledger) {
  assertLedger(ledger);
  return canonicalJson(ledger);
}

export const decisionLedgerEvidenceBoundary = Object.freeze({
  cryptographicHash: true,
  tamperEvidenceWithinCapturedLedger: true,
  digitalSignature: false,
  blockchainAnchored: false,
  nonRepudiation: false,
  legalAuditCertification: false,
  productionAuditCertified: false
});
