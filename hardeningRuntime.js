import { shortFingerprint } from './engine/auditHash.js';
import { snapshotTrafficState, stateFingerprint } from './engine/unifiedStateBus.js';
import {
  appendLedgerEntry,
  createDecisionLedger,
  verifyLedgerChain
} from './engine/decisionLedgerEngine.js';
import { captureReplayPackage, replayDecisionPackage } from './engine/exactReplayEngine.js';

const hardening = {
  state: null,
  ledger: createDecisionLedger(),
  replayPackages: new Map(),
  policy: null,
  chainVerification: null,
  lastReplay: null,
  unsubscribe: null
};

const byId = id => document.getElementById(id);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const ar = () => document.documentElement.lang !== 'en';
const t = (a, e) => ar() ? a : e;

async function waitForRuntime(timeoutMs = 18000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const runtime = window.smartTrafficRuntime;
    if (
      runtime?.isReady?.() === true &&
      typeof runtime.getUnifiedState === 'function' &&
      typeof runtime.subscribe === 'function' &&
      window.smartTrafficAppReady === true
    ) return runtime;
    if (window.smartTrafficAppFailed) throw new Error(`Core runtime failed: ${window.smartTrafficAppFailed}`);
    await sleep(100);
  }
  throw new Error('Authoritative core runtime did not become ready for production hardening');
}

async function loadPolicy() {
  if (hardening.policy) return hardening.policy;
  const response = await fetch('data/orchestration_policy.json');
  if (!response.ok) throw new Error('orchestration policy unavailable');
  hardening.policy = await response.json();
  return hardening.policy;
}

function currentInputs(runtimeState) {
  const route = runtimeState.routeParameters || {};
  return {
    origin: route.origin || byId('routeOrigin')?.value || 'N1',
    destination: route.destination || byId('routeDestination')?.value || 'N8',
    emergencyTarget: runtimeState.emergencyTarget || byId('emergencyTarget')?.value || 'N10',
    options: {
      horizons: [5, 15, 30, 60],
      routeRiskWeight: Number(route.routeRiskWeight ?? byId('riskWeight')?.value ?? 1.8),
      currentTwin: runtimeState.dynamicRiskTwin || undefined
    }
  };
}

async function synchronizeRuntime() {
  const runtime = await waitForRuntime();
  hardening.state = runtime.getUnifiedState();
  await renderHardening();
  return hardening.state;
}

function subscribeToAuthority(runtime) {
  hardening.unsubscribe?.();
  hardening.unsubscribe = runtime.subscribe(snapshot => {
    hardening.state = snapshot;
    void renderHardening();
  });
}

function addPanel() {
  if (byId('runtimeIntegrityPanel')) return;
  const room = byId('acquisitionDecisionRoom');
  if (!room) return;
  const section = document.createElement('section');
  section.id = 'runtimeIntegrityPanel';
  section.className = 'hardening-panel';
  section.innerHTML = `
    <div class="hardening-head">
      <div><div class="hardening-kicker">PRODUCTION HARDENING · v1.9.1</div><h3 data-hard-ar="الحالة التشغيلية الموحدة وسجل القرارات وإعادة التشغيل الدقيقة" data-hard-en="Authoritative Runtime State, Decision Ledger & Exact Replay">الحالة التشغيلية الموحدة وسجل القرارات وإعادة التشغيل الدقيقة</h3><p data-hard-ar="الـUnified State Bus هو مصدر الحالة التشغيلية في النسخة التنفيذية. واجهة التطبيق وطبقة التدقيق تقرآن الحالة نفسها، وسلسلة SHA-256 توفر كشف سلامة هندسي داخل الـMVP فقط؛ ليست توقيعاً رقمياً أو بلوك تشين أو إثباتاً قانونياً." data-hard-en="The Unified State Bus is the operational source of truth in the executable build. The application and audit layer consume the same state. The SHA-256 chain provides engineering integrity evidence inside the MVP only; it is not a digital signature, blockchain anchoring or legal non-repudiation.">الـUnified State Bus هو مصدر الحالة التشغيلية في النسخة التنفيذية. واجهة التطبيق وطبقة التدقيق تقرآن الحالة نفسها، وسلسلة SHA-256 توفر كشف سلامة هندسي داخل الـMVP فقط؛ ليست توقيعاً رقمياً أو بلوك تشين أو إثباتاً قانونياً.</p></div>
      <span class="hardening-badge">AUTHORITY: STATE BUS · SHA-256</span>
    </div>
    <div class="hardening-metrics">
      <article><span data-hard-ar="مراجعة الحالة" data-hard-en="State revision">مراجعة الحالة</span><strong id="hardeningRevision">0</strong></article>
      <article><span data-hard-ar="بصمة الحالة" data-hard-en="State fingerprint">بصمة الحالة</span><strong id="hardeningStateHash">—</strong></article>
      <article><span data-hard-ar="قيود السجل" data-hard-en="Ledger entries">قيود السجل</span><strong id="hardeningLedgerCount">0</strong></article>
      <article><span data-hard-ar="سلامة السلسلة" data-hard-en="Chain integrity">سلامة السلسلة</span><strong id="hardeningChainStatus">EMPTY</strong></article>
    </div>
    <div class="hardening-actions">
      <button class="btn primary" id="captureDecisionBtn" data-hard-ar="التقاط القرار الحالي" data-hard-en="Capture current decision">التقاط القرار الحالي</button>
      <button class="btn" id="verifyLedgerBtn" data-hard-ar="تحقق من السجل" data-hard-en="Verify ledger">تحقق من السجل</button>
      <button class="btn" id="replayLatestBtn" data-hard-ar="إعادة تشغيل آخر قرار" data-hard-en="Replay latest decision">إعادة تشغيل آخر قرار</button>
      <button class="btn" id="exportAuditBtn" data-hard-ar="تصدير حزمة التدقيق" data-hard-en="Export audit bundle">تصدير حزمة التدقيق</button>
    </div>
    <div class="hardening-result" id="hardeningResult">Authoritative hardening runtime ready.</div>
    <div class="hardening-replay" id="hardeningReplayStatus">Exact replay: not run</div>
    <div class="hardening-grid">
      <div><h4 data-hard-ar="سجل القرارات" data-hard-en="Decision ledger">سجل القرارات</h4><div class="table-wrap"><table><thead><tr><th>Seq</th><th>State</th><th>Policy</th><th>Output</th><th>Entry</th></tr></thead><tbody id="hardeningLedgerRows"></tbody></table></div></div>
      <div><h4 data-hard-ar="أحداث الحالة الأخيرة" data-hard-en="Recent state events">أحداث الحالة الأخيرة</h4><div class="table-wrap"><table><thead><tr><th>Seq</th><th>Type</th><th>Source</th></tr></thead><tbody id="hardeningEventRows"></tbody></table></div></div>
    </div>
    <div class="hardening-boundary">stateAuthority=unified-state-bus · simulation=true · autoApply=false · humanApprovalRequired=true · digitalSignature=false · blockchainAnchored=false · nonRepudiation=false · production_verified=0</div>`;
  room.appendChild(section);
  byId('captureDecisionBtn').onclick = () => void captureCurrentDecision();
  byId('verifyLedgerBtn').onclick = () => void verifyCurrentLedger();
  byId('replayLatestBtn').onclick = () => void replayLatestDecision();
  byId('exportAuditBtn').onclick = exportAuditBundle;
}

async function captureCurrentDecision() {
  try {
    const runtime = await waitForRuntime();
    await synchronizeRuntime();
    const capturedState = snapshotTrafficState(hardening.state);
    const inputs = currentInputs(capturedState);
    const replayPackage = await captureReplayPackage({ state: capturedState, inputs });
    const stateHash = replayPackage.stateFingerprint;
    const appended = await appendLedgerEntry(hardening.ledger, {
      stateRevision: capturedState.revision,
      stateFingerprint: stateHash,
      stateSnapshot: capturedState,
      inputs,
      policy: hardening.policy,
      output: replayPackage.originalOutput,
      decisionType: 'policy_orchestration_recommendation',
      method: 'deterministic-v1.9.1-authoritative-runtime',
      metadata: {
        stateAuthority: 'unified-state-bus',
        selectedCandidateId: replayPackage.originalOutput.selected?.candidate?.id || null,
        blocked: replayPackage.originalOutput.blocked === true
      }
    });
    hardening.ledger = appended.ledger;
    replayPackage.ledgerEntry = appended.entry;
    hardening.replayPackages.set(appended.entry.sequence, replayPackage);
    hardening.chainVerification = await verifyLedgerChain(hardening.ledger);
    runtime.dispatch({
      type: 'decision_recorded',
      source: 'hardeningRuntime',
      payload: {
        decision: {
          ledgerSequence: appended.entry.sequence,
          stateRevision: capturedState.revision,
          stateFingerprint: stateHash,
          entryHash: appended.entry.entryHash,
          selectedCandidateId: replayPackage.originalOutput.selected?.candidate?.id || null
        }
      }
    });
    byId('hardeningResult').textContent = t(
      `تم التقاط القرار #${appended.entry.sequence} من revision ${capturedState.revision} · state ${shortFingerprint(stateHash)} · entry ${shortFingerprint(appended.entry.entryHash)}`,
      `Captured decision #${appended.entry.sequence} from revision ${capturedState.revision} · state ${shortFingerprint(stateHash)} · entry ${shortFingerprint(appended.entry.entryHash)}`
    );
    await renderHardening();
  } catch (error) {
    console.error('Decision capture failed:', error);
    byId('hardeningResult').textContent = t(`فشل التقاط القرار: ${error.message}`, `Decision capture failed: ${error.message}`);
  }
}

async function verifyCurrentLedger() {
  hardening.chainVerification = await verifyLedgerChain(hardening.ledger);
  byId('hardeningResult').textContent = hardening.chainVerification.valid
    ? t(`السجل سليم · ${hardening.chainVerification.checkedEntries} قيود · head ${shortFingerprint(hardening.chainVerification.headHash)}`, `Ledger valid · ${hardening.chainVerification.checkedEntries} entries · head ${shortFingerprint(hardening.chainVerification.headHash)}`)
    : t(`اكتشف فشل سلامة في ${hardening.chainVerification.failures.length} موضع`, `Integrity failure detected at ${hardening.chainVerification.failures.length} location(s)`);
  await renderHardening();
}

async function replayLatestDecision() {
  try {
    const latest = hardening.ledger.entries.at(-1);
    if (!latest) throw new Error('no captured decision available');
    const replayPackage = hardening.replayPackages.get(latest.sequence);
    if (!replayPackage) throw new Error('captured replay package unavailable');
    hardening.lastReplay = await replayDecisionPackage(replayPackage);
    const c = hardening.lastReplay.comparison;
    byId('hardeningReplayStatus').textContent = c.exactReplayMatch
      ? t(`Exact Replay مطابق · state=${c.stateMatch} · policy=${c.policyMatch} · output=${c.outputFingerprintMatch}`, `Exact Replay MATCH · state=${c.stateMatch} · policy=${c.policyMatch} · output=${c.outputFingerprintMatch}`)
      : t('Exact Replay غير مطابق — راجع الحالة والسياسة والمدخلات.', 'Exact Replay MISMATCH — inspect state, policy and inputs.');
    await renderHardening();
  } catch (error) {
    byId('hardeningReplayStatus').textContent = t(`تعذر Replay: ${error.message}`, `Replay failed: ${error.message}`);
  }
}

function exportAuditBundle() {
  if (!hardening.state) return;
  const latest = hardening.ledger.entries.at(-1);
  const bundle = {
    schema: 'smart-traffic-hardening-audit-export/v1.9.1',
    exportedFrom: 'Smart Traffic AI MVP v1.9.1',
    stateAuthority: 'unified-state-bus',
    state: snapshotTrafficState(hardening.state),
    ledger: hardening.ledger,
    latestReplayPackage: latest ? hardening.replayPackages.get(latest.sequence) || null : null,
    latestReplayResult: hardening.lastReplay,
    evidenceBoundary: {
      simulation: true,
      digitalSignature: false,
      blockchainAnchored: false,
      nonRepudiation: false,
      productionVerified: false
    }
  };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smart-traffic-audit-bundle-v1.9.1.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function renderHardening() {
  if (!hardening.state || !byId('runtimeIntegrityPanel')) return;
  const hash = await stateFingerprint(hardening.state);
  byId('hardeningRevision').textContent = hardening.state.revision;
  byId('hardeningStateHash').textContent = shortFingerprint(hash);
  byId('hardeningLedgerCount').textContent = hardening.ledger.entries.length;
  const chain = hardening.chainVerification;
  byId('hardeningChainStatus').textContent = hardening.ledger.entries.length === 0 ? 'EMPTY' : chain?.valid ? 'VERIFIED' : chain ? 'FAILED' : 'UNVERIFIED';

  const ledgerRows = byId('hardeningLedgerRows');
  ledgerRows.innerHTML = hardening.ledger.entries.slice(-8).reverse().map(entry => `<tr><td>${entry.sequence}</td><td>${shortFingerprint(entry.stateFingerprint, 8)}</td><td>${shortFingerprint(entry.policyFingerprint, 8)}</td><td>${shortFingerprint(entry.outputFingerprint, 8)}</td><td>${shortFingerprint(entry.entryHash, 8)}</td></tr>`).join('');
  const eventRows = byId('hardeningEventRows');
  eventRows.innerHTML = (hardening.state.eventLog || []).slice(-8).reverse().map(event => `<tr><td>${event.sequence}</td><td>${event.type}</td><td>${event.source}</td></tr>`).join('');
}

function translateHardening() {
  document.querySelectorAll('[data-hard-ar][data-hard-en]').forEach(el => {
    el.textContent = ar() ? el.dataset.hardAr : el.dataset.hardEn;
  });
}

async function initHardening() {
  const [runtime, policy] = await Promise.all([waitForRuntime(), loadPolicy()]);
  runtime.dispatch({ type: 'policy_updated', source: 'hardeningRuntime', payload: { policy } });
  hardening.state = runtime.getUnifiedState();
  subscribeToAuthority(runtime);
  for (let i = 0; i < 120 && !byId('acquisitionDecisionRoom'); i += 1) await sleep(100);
  if (!byId('acquisitionDecisionRoom')) throw new Error('Acquisition Decision Room unavailable');
  addPanel();
  new MutationObserver(() => { translateHardening(); void renderHardening(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  translateHardening();
  await renderHardening();
  window.smartTrafficHardening = {
    getState: () => snapshotTrafficState(hardening.state),
    getLedger: () => JSON.parse(JSON.stringify(hardening.ledger)),
    capture: captureCurrentDecision,
    verify: verifyCurrentLedger,
    replayLatest: replayLatestDecision,
    sync: synchronizeRuntime
  };
  window.smartTrafficHardeningReady = true;
  window.dispatchEvent(new CustomEvent('smart-traffic:hardening-ready', { detail: { version: '1.9.1', stateAuthority: 'unified-state-bus' } }));
}

initHardening().catch(error => {
  window.smartTrafficHardeningReady = false;
  console.error('Production hardening runtime failed:', error);
});
