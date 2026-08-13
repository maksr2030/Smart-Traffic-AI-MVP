import { assessRuntimeHealth, applyFailSafeDecisionGate } from './engine/runtimeHealthEngine.js';
import { runFailureInjectionSuite } from './engine/failureInjectionEngine.js';

const panelId = 'runtimeHealthPanel';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function ensurePanel() {
  let panel = document.getElementById(panelId);
  if (panel) return panel;
  panel = document.createElement('section');
  panel.id = panelId;
  panel.className = 'runtime-health-panel';
  panel.setAttribute('aria-live', 'polite');
  const target = document.getElementById('acquisitionDecisionRoom') || document.querySelector('main') || document.body;
  target.appendChild(panel);
  return panel;
}

function render(health, suite) {
  const panel = ensurePanel();
  const failures = suite.map((item) => `<tr><td>${esc(item.scenario)}</td><td>${esc(item.health.status)}</td><td>${item.decisionAllowed ? 'ALLOW' : 'BLOCK'}</td></tr>`).join('');
  const issues = health.issues.length ? health.issues.map((item) => `<li><strong>${esc(item.code)}</strong> — ${esc(item.message)}</li>`).join('') : '<li>No runtime health issues detected.</li>';
  panel.dataset.healthStatus = health.status;
  panel.innerHTML = `
    <div class="runtime-health-head">
      <div><span class="runtime-health-eyebrow">Stage D · Runtime Resilience</span><h3>Runtime Health & Fail-Safe Gate</h3></div>
      <span id="runtimeHealthStatus" class="runtime-health-status status-${health.status.toLowerCase()}">${health.status}</span>
    </div>
    <div class="runtime-health-grid">
      <div><span>State revision</span><strong id="runtimeHealthRevision">${esc(health.revision)}</strong></div>
      <div><span>Issues</span><strong>${health.issueCount}</strong></div>
      <div><span>Blocking</span><strong>${health.blockingCount}</strong></div>
      <div><span>Decision gate</span><strong id="runtimeDecisionGate">${health.decisionAllowed ? 'ALLOW WITH HUMAN APPROVAL' : 'BLOCKED'}</strong></div>
    </div>
    <details><summary>Health findings</summary><ul>${issues}</ul></details>
    <details><summary>Failure-injection self-test</summary><div class="runtime-health-table-wrap"><table><thead><tr><th>Scenario</th><th>Expected runtime state</th><th>Decision</th></tr></thead><tbody>${failures}</tbody></table></div><p class="runtime-health-note">Failure injection runs against cloned snapshots only; it never mutates the authoritative browser state.</p></details>
    <p class="runtime-health-boundary">simulation=true · autoApply=false · humanApprovalRequired=true · productionControlConnected=false · safetyCertified=false</p>`;
}

async function boot() {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    const runtime = window.smartTrafficRuntime;
    if (runtime?.getUnifiedState && runtime?.subscribe) {
      const update = (state) => {
        const health = assessRuntimeHealth(state);
        const suite = runFailureInjectionSuite(state);
        render(health, suite);
        window.smartTrafficHealth = {
          current: health,
          failureSuite: suite,
          assess: () => assessRuntimeHealth(runtime.getUnifiedState()),
          gateDecision: (decision) => applyFailSafeDecisionGate(runtime.getUnifiedState(), decision)
        };
      };
      update(runtime.getUnifiedState());
      runtime.subscribe(update);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  render({ status: 'BLOCKED', revision: null, issueCount: 1, blockingCount: 1, decisionAllowed: false, issues: [{ code: 'RUNTIME_UNAVAILABLE', message: 'Authoritative runtime did not become available.' }] }, []);
}

boot();
