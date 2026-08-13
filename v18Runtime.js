import { runOperationalScenario } from './engine/operationsEngine.js';
import {
  buildExplainablePolicyOrchestration,
  runOrchestrationSensitivity
} from './engine/explainableOrchestrationEngine.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForBaseUi() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const scenario = document.getElementById('scenarioSelect');
    const origin = document.getElementById('routeOrigin');
    const destination = document.getElementById('routeDestination');
    const target = document.getElementById('emergencyTarget');
    if (scenario?.options.length && origin?.options.length && destination?.options.length && target?.options.length) return true;
    await sleep(100);
  }
  return false;
}

function ensureV18Ui() {
  if (document.getElementById('explainableOrchestrationPanel')) return;
  const anchor = document.getElementById('predictiveOrchestrationPanel') ?? document.querySelector('.operations-grid');
  const section = document.createElement('section');
  section.className = 'card';
  section.id = 'explainableOrchestrationPanel';
  section.innerHTML = `
    <div class="section-title"><div><h2 data-ar="Explainable Orchestration · Policy Guardrails · Scenario Replay" data-en="Explainable Orchestration · Policy Guardrails · Scenario Replay">Explainable Orchestration · Policy Guardrails · Scenario Replay</h2><p data-ar="يفسر القرار حسابياً، يمرره عبر سياسة تشغيل محاكاة، ثم يعيد تشغيل أثره مقابل عدم التدخل" data-en="Explains the recommendation arithmetically, checks simulated policy guardrails, then replays it against no intervention">يفسر القرار حسابياً، يمرره عبر سياسة تشغيل محاكاة، ثم يعيد تشغيل أثره مقابل عدم التدخل</p></div><button class="btn primary" id="explainableBtn">تشغيل v1.8</button></div>
    <div class="comparison-grid">
      <div class="comparison-card"><span data-ar="حالة السياسة" data-en="Policy status">حالة السياسة</span><div><b id="policyStatus">—</b></div></div>
      <div class="comparison-card"><span data-ar="الخطة المسموح بها" data-en="Policy-selected plan">الخطة المسموح بها</span><div><b id="policySelected">—</b></div></div>
      <div class="comparison-card"><span data-ar="إعادة بناء Robust Score" data-en="Reconstructed robust score">إعادة بناء Robust Score</span><div><b id="explainScore">—</b></div></div>
      <div class="comparison-card"><span data-ar="تحسن Replay عند 60 دقيقة" data-en="60-min replay improvement">تحسن Replay عند 60 دقيقة</span><div><b id="replayImprovement">—</b></div></div>
    </div>
    <div id="explainableResult" class="output">Explainable policy orchestrator ready.</div>
    <div class="notice" data-ar="هذه سياسة هندسية للعرض وليست سياسة تشغيل طرق عامة. causalClaim=false · autoApply=false · humanApprovalRequired=true دائماً." data-en="This is an engineering demo policy, not a public-road operating policy. causalClaim=false · autoApply=false · humanApprovalRequired=true at all times.">هذه سياسة هندسية للعرض وليست سياسة تشغيل طرق عامة. causalClaim=false · autoApply=false · humanApprovalRequired=true دائماً.</div>
    <h3 data-ar="لماذا فازت الخطة ولماذا خسرت البدائل" data-en="Why the plan won and alternatives lost">لماذا فازت الخطة ولماذا خسرت البدائل</h3>
    <div class="table-wrap coverage-table"><table><thead><tr><th>Alternative</th><th>Robust Δ</th><th>Mean Δ</th><th>Worst Δ</th><th>Penalty Δ</th><th>Reason</th></tr></thead><tbody id="explanationRows"></tbody></table></div>
    <h3 data-ar="بوابة السياسات" data-en="Policy gate">بوابة السياسات</h3>
    <div class="table-wrap coverage-table"><table><thead><tr><th>Rank</th><th>Candidate</th><th>Compliant</th><th>Violations</th><th>Score</th></tr></thead><tbody id="policyRows"></tbody></table></div>
    <h3 data-ar="إعادة تشغيل السيناريو مقابل Observe Only" data-en="Scenario replay versus Observe Only">إعادة تشغيل السيناريو مقابل Observe Only</h3>
    <div class="table-wrap coverage-table"><table><thead><tr><th>Horizon</th><th>Objective Improvement</th><th>Avg Risk Improvement</th><th>Max Risk Improvement</th><th>Load Improvement</th><th>Stress Improvement</th></tr></thead><tbody id="replayRows"></tbody></table></div>
    <h3 data-ar="Sensitivity: أفق التنبؤ × وزن السلامة" data-en="Sensitivity: forecast horizon × safety weight">Sensitivity: أفق التنبؤ × وزن السلامة</h3>
    <div class="table-wrap coverage-table"><table><thead><tr><th>Horizons</th><th>Risk Weight</th><th>Selected</th><th>Robust</th><th>Route Minutes</th><th>Route Risk</th></tr></thead><tbody id="sensitivityRows"></tbody></table></div>`;
  if (anchor?.id === 'predictiveOrchestrationPanel') anchor.insertAdjacentElement('afterend', section);
  else anchor?.insertAdjacentElement('beforebegin', section);
  document.title = 'Smart AI Traffic Platform | Engineering MVP v1.8';
  const brand = document.querySelector('.brand small');
  if (brand) brand.textContent = 'Smart AI Traffic Platform | Engineering MVP v1.8';
  const firstBadge = document.querySelector('.hero .badge');
  if (firstBadge) firstBadge.textContent = 'MVP v1.8';
  const badgeHolder = document.querySelector('.hero article.card > div');
  if (badgeHolder && !badgeHolder.textContent.includes('Policy Guardrails')) {
    for (const text of ['Explainable Decisions', 'Policy Guardrails', 'Scenario Replay']) {
      const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = text; badgeHolder.appendChild(badge);
    }
  }
}

let resources = null;
let lastResult = null;
let lastSensitivity = null;

async function loadResources() {
  if (resources) return resources;
  const [network, scenarios, fleet, observations, policy] = await Promise.all([
    fetch('data/network.json').then(r => r.json()),
    fetch('data/operations_scenarios.json').then(r => r.json()),
    fetch('data/emergency_fleet.json').then(r => r.json()),
    fetch('data/qcs_demo_observations.json').then(r => r.json()),
    fetch('data/orchestration_policy.json').then(r => r.json())
  ]);
  resources = { network, scenarios, fleet, observations, policy };
  return resources;
}

function selectedScenarioNetwork(baseNetwork, scenarios) {
  const id = document.getElementById('scenarioSelect')?.value || 'normal';
  const scenario = scenarios.find(item => item.id === id) ?? scenarios[0];
  return { id: scenario.id, ...runOperationalScenario(baseNetwork, scenario) };
}

function render(result, sensitivity) {
  const policyEvaluation = result.policyEvaluation;
  const explanation = result.explanation;
  const replay = result.replay;
  document.getElementById('policyStatus').textContent = result.blocked ? 'BLOCKED' : 'PASS';
  document.getElementById('policySelected').textContent = result.selected?.candidate?.label ?? '—';
  document.getElementById('explainScore').textContent = explanation?.decomposition?.reconstructedRobustScore ?? '—';
  document.getElementById('replayImprovement').textContent = replay?.frames?.at(-1)?.improvement?.objectiveScore ?? '—';
  document.getElementById('explainableResult').innerHTML = result.blocked
    ? `<strong>Policy blocked all candidate plans.</strong><br>${policyEvaluation.globalViolations.join(' · ') || 'Candidate constraints rejected all options.'}<br><small>autoApply=false · humanApprovalRequired=true</small>`
    : `<strong>${explanation.selectedLabel}</strong><br>Robust ${explanation.robustScore} = mean contribution ${explanation.decomposition.weightedMeanContribution} + worst-horizon contribution ${explanation.decomposition.worstHorizonContribution} + intervention penalty ${explanation.decomposition.interventionPenalty}<br><small>${explanation.explanationType} · causalClaim=false · autoApply=false</small>`;

  const explanationRows = document.getElementById('explanationRows'); explanationRows.innerHTML = '';
  (explanation?.comparisons ?? []).forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.alternativeLabel}</td><td>${item.robustScoreDelta}</td><td>${item.meanScoreDelta}</td><td>${item.worstScoreDelta}</td><td>${item.penaltyDelta}</td><td>${item.rejectedBecause}</td>`;
    explanationRows.appendChild(tr);
  });

  const policyRows = document.getElementById('policyRows'); policyRows.innerHTML = '';
  policyEvaluation.candidates.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.rank}</td><td>${item.label}</td><td>${item.compliant ? 'PASS' : 'BLOCK'}</td><td>${item.violations.join(', ') || '—'}</td><td>${item.robustScore}</td>`;
    policyRows.appendChild(tr);
  });

  const replayRows = document.getElementById('replayRows'); replayRows.innerHTML = '';
  (replay?.frames ?? []).forEach(frame => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${frame.horizonMinutes} min</td><td>${frame.improvement.objectiveScore}</td><td>${frame.improvement.averageRiskScore}</td><td>${frame.improvement.maxRiskScore}</td><td>${frame.improvement.avgLoad}</td><td>${frame.improvement.stressIndex}</td>`;
    replayRows.appendChild(tr);
  });

  const sensitivityRows = document.getElementById('sensitivityRows'); sensitivityRows.innerHTML = '';
  (sensitivity?.rows ?? []).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.horizons.join('/')}</td><td>${row.routeRiskWeight}</td><td>${row.selectedCandidateId}</td><td>${row.robustScore}</td><td>${row.finalRouteMinutes ?? '—'}</td><td>${row.finalRouteAverageRisk ?? '—'}</td>`;
    sensitivityRows.appendChild(tr);
  });
}

async function runV18() {
  const { network, scenarios, fleet, observations, policy } = await loadResources();
  const scenario = selectedScenarioNetwork(network, scenarios);
  const origin = document.getElementById('routeOrigin')?.value || 'N1';
  const destination = document.getElementById('routeDestination')?.value || 'N8';
  const emergencyTarget = document.getElementById('emergencyTarget')?.value || 'N10';
  const riskWeight = Number(document.getElementById('riskWeight')?.value || 1.8);
  lastResult = buildExplainablePolicyOrchestration(
    scenario.network, observations, fleet, origin, destination, emergencyTarget, policy,
    { horizons: [5,15,30,60], routeRiskWeight: riskWeight }
  );
  lastSensitivity = runOrchestrationSensitivity(
    scenario.network, observations, fleet, origin, destination, emergencyTarget,
    { riskWeights: [0.8,1.8,3.5], horizonSets: [[5,15],[5,15,30,60]] }
  );
  render(lastResult, lastSensitivity);
}

async function init() {
  const ready = await waitForBaseUi();
  if (!ready) return;
  ensureV18Ui();
  document.getElementById('explainableBtn').onclick = runV18;
  document.getElementById('scenarioSelect').addEventListener('change', runV18);
  document.getElementById('riskWeight').addEventListener('change', runV18);
  await runV18();
}

init().catch(error => {
  console.error(error);
  const output = document.getElementById('explainableResult');
  if (output) output.textContent = error.message;
});
