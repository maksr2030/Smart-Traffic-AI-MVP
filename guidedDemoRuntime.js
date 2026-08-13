const tour = {
  active: false,
  paused: false,
  index: 0,
  timer: null,
  executed: new Set(),
  durationMs: 6000
};

const STEPS = [
  {
    id: 'executive', target: 'acquisitionDashboard',
    arTitle: '1. النظرة التنفيذية', enTitle: '1. Executive overview',
    arBody: 'نبدأ بحجم المحفظة وحالة الإثبات الفعلية: جميع القدرات مرئية، لكن حالة التنفيذ منفصلة عن التحقق الإنتاجي.',
    enBody: 'Start with portfolio scale and the real evidence boundary: all capabilities are visible, while demo status remains separate from production verification.'
  },
  {
    id: 'baseline', target: 'network', action: 'baseline',
    arTitle: '2. حالة المدينة الأساسية', enTitle: '2. City baseline',
    arBody: 'تُعاد الشبكة إلى الحالة الأساسية وتُوقف الحركة العشوائية أثناء الجولة حتى تبقى المقارنة قابلة للتكرار.',
    enBody: 'The network is reset to baseline and random simulation drift is paused during the tour so the comparison remains repeatable.'
  },
  {
    id: 'incident', target: 'incidentBtn', action: 'incident',
    arTitle: '3. إدخال حادث محاكى', enTitle: '3. Simulated incident',
    arBody: 'نضيف حادثاً محاكياً إلى مقطع طريق حقيقي داخل نموذج الشبكة، ثم نراقب كيف تتغير حالة المخاطر.',
    enBody: 'A simulated incident is injected into a real demo-network edge, then the risk state is recalculated.'
  },
  {
    id: 'twin', target: 'twinDecisionResult', action: 'twin',
    arTitle: '4. تحديث التوأم الرقمي للمخاطر', enTitle: '4. Refresh the Dynamic Risk Twin',
    arBody: 'التوأم يجمع الحمل والحوادث والإغلاق وQCS في حالة مخاطر واحدة تُستخدم للمسارات والإشارات والطوارئ.',
    enBody: 'The twin fuses load, incidents, closures and QCS into one shared risk state used by routing, signals and emergency planning.'
  },
  {
    id: 'prediction', target: 'predictiveOrchestrationPanel', action: 'predictive',
    arTitle: '5. التنبؤ 5–60 دقيقة', enTitle: '5. Predict 5–60 minutes ahead',
    arBody: 'يُسقط النظام حالة الخطر إلى آفاق 5 و15 و30 و60 دقيقة ويحدد نقاط الخطر الناشئة قبل تفاقمها.',
    enBody: 'The system projects network risk at 5, 15, 30 and 60 minutes and identifies emerging hotspots before escalation.'
  },
  {
    id: 'plans', target: 'predictiveCandidateRows',
    arTitle: '6. مقارنة خطط التدخل', enTitle: '6. Compare intervention plans',
    arBody: 'تُرتب الخطط المرشحة وفق Robust Score شفاف يجمع الأداء متعدد الآفاق وأسوأ حالة وتكلفة التدخل.',
    enBody: 'Candidate plans are ranked with a transparent robust score combining multi-horizon performance, worst-case outcome and intervention penalty.'
  },
  {
    id: 'explain', target: 'explainableOrchestrationPanel', action: 'explain',
    arTitle: '7. تفسير سبب اختيار الخطة', enTitle: '7. Explain why the plan won',
    arBody: 'يُفكك النظام الدرجة حسابياً ويشرح لماذا فازت الخطة ولماذا خسرت البدائل، دون ادعاء تفسير سببي.',
    enBody: 'The score is decomposed arithmetically to show why the selected plan won and why alternatives lost, without claiming causal explanation.'
  },
  {
    id: 'policy', target: 'policyRows',
    arTitle: '8. Policy Gate', enTitle: '8. Policy gate',
    arBody: 'تمر الخطة عبر حدود تشغيل معلنة. يمكن رفض الخطة الأعلى حسابياً إذا خالفت السياسة، مع بقاء الموافقة البشرية إلزامية.',
    enBody: 'The plan is screened against explicit operating limits. A numerically superior plan can be rejected by policy, while human approval remains mandatory.'
  },
  {
    id: 'replay', target: 'replayRows',
    arTitle: '9. Scenario Replay', enTitle: '9. Scenario replay',
    arBody: 'نعيد المقارنة زمنياً بين الخطة المختارة وعدم التدخل لنرى أثر القرار عند كل أفق زمني داخل المحاكاة.',
    enBody: 'The selected plan is replayed against no-action across each forecast horizon to inspect the simulated decision impact over time.'
  },
  {
    id: 'portfolio', target: 'acquisitionFeatureExplorer',
    arTitle: '10. محفظة القدرات الكاملة', enTitle: '10. Complete capability portfolio',
    arBody: 'تنتهي الجولة في Feature Explorer الذي يعرض جميع القدرات الـ123 وحالتها ومصدرها والوحدة التنفيذية المرتبطة بها إن وجدت.',
    enBody: 'The tour ends in Feature Explorer, which exposes all 123 capabilities with status, source group and linked executable module where available.'
  }
];

function isArabic() { return document.documentElement.lang !== 'en'; }
function label(arText, enText) { return isArabic() ? arText : enText; }
function byId(id) { return document.getElementById(id); }
function clearTimer() { if (tour.timer) { clearTimeout(tour.timer); tour.timer = null; } }
function removeHighlight() { document.querySelectorAll('.guided-focus').forEach(el => el.classList.remove('guided-focus')); }

function pauseBaseSimulation() {
  const pause = byId('pauseBtn');
  if (!pause) return;
  const value = pause.textContent.trim().toLowerCase();
  if (value.includes('إيقاف') || value.includes('pause')) pause.click();
}

function runAction(action) {
  if (!action || tour.executed.has(action)) return;
  tour.executed.add(action);
  if (action === 'baseline') {
    byId('resetNetworkBtn')?.click();
    pauseBaseSimulation();
    return;
  }
  if (action === 'incident') {
    const edge = byId('incidentEdge');
    if (edge && [...edge.options].some(option => option.value === 'E09')) edge.value = 'E09';
    const closed = byId('closeEdge'); if (closed) closed.checked = false;
    byId('incidentBtn')?.click();
    return;
  }
  if (action === 'twin') { byId('twinDecisionBtn')?.click(); return; }
  if (action === 'predictive') { byId('predictiveBtn')?.click(); return; }
  if (action === 'explain') { byId('explainableBtn')?.click(); }
}

function ensureController() {
  let controller = byId('guidedDemoController');
  if (controller) return controller;
  controller = document.createElement('aside');
  controller.id = 'guidedDemoController';
  controller.className = 'guided-controller';
  controller.setAttribute('aria-live', 'polite');
  controller.innerHTML = `
    <div class="guided-head">
      <div><span id="guidedStepCount">1 / ${STEPS.length}</span><strong id="guidedTitle">Executive Guided Demo</strong></div>
      <button class="guided-close" id="guidedClose" aria-label="Close guided demo">×</button>
    </div>
    <div class="guided-progress"><i id="guidedProgress"></i></div>
    <p id="guidedBody"></p>
    <div class="guided-boundary">SIMULATION · autoApply=false · humanApprovalRequired=true · production_verified=0</div>
    <div class="guided-actions">
      <button class="btn" id="guidedPrev">السابق</button>
      <button class="btn" id="guidedPause">إيقاف مؤقت</button>
      <button class="btn primary" id="guidedNext">التالي</button>
    </div>`;
  document.body.appendChild(controller);
  byId('guidedClose').onclick = endTour;
  byId('guidedPrev').onclick = () => goTo(Math.max(0, tour.index - 1), false);
  byId('guidedNext').onclick = () => goTo(Math.min(STEPS.length - 1, tour.index + 1), true);
  byId('guidedPause').onclick = togglePause;
  return controller;
}

function renderController(step) {
  ensureController().classList.add('visible');
  byId('guidedStepCount').textContent = `${tour.index + 1} / ${STEPS.length}`;
  byId('guidedTitle').textContent = label(step.arTitle, step.enTitle);
  byId('guidedBody').textContent = label(step.arBody, step.enBody);
  byId('guidedProgress').style.width = `${((tour.index + 1) / STEPS.length) * 100}%`;
  byId('guidedPrev').textContent = label('السابق', 'Previous');
  byId('guidedNext').textContent = tour.index === STEPS.length - 1 ? label('إنهاء الجولة', 'Finish tour') : label('التالي', 'Next');
  byId('guidedPause').textContent = tour.paused ? label('استئناف تلقائي', 'Resume auto') : label('إيقاف مؤقت', 'Pause auto');
  byId('guidedPrev').disabled = tour.index === 0;
}

function scheduleNext() {
  clearTimer();
  if (!tour.active || tour.paused) return;
  if (tour.index >= STEPS.length - 1) return;
  tour.timer = setTimeout(() => goTo(tour.index + 1, true), tour.durationMs);
}

function goTo(index, execute = true) {
  if (!tour.active) return;
  clearTimer(); removeHighlight();
  tour.index = index;
  const step = STEPS[index];
  if (execute) runAction(step.action);
  const target = byId(step.target);
  if (target) {
    target.classList.add('guided-focus');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  renderController(step);
  if (index === STEPS.length - 1) {
    byId('guidedNext').onclick = endTour;
  } else {
    byId('guidedNext').onclick = () => goTo(Math.min(STEPS.length - 1, tour.index + 1), true);
  }
  scheduleNext();
}

function togglePause() {
  tour.paused = !tour.paused;
  renderController(STEPS[tour.index]);
  scheduleNext();
}

function startTour() {
  if (tour.active) { goTo(0, false); return; }
  const gate = byId('acquisitionEntry');
  if (gate) {
    byId('acqEnter')?.click();
    setTimeout(startTour, 420);
    return;
  }
  tour.active = true;
  tour.paused = false;
  tour.index = 0;
  tour.executed.clear();
  document.body.classList.add('guided-active');
  goTo(0, true);
}

function endTour() {
  clearTimer(); removeHighlight();
  tour.active = false; tour.paused = false;
  document.body.classList.remove('guided-active');
  byId('guidedDemoController')?.classList.remove('visible');
  byId('acquisitionFeatureExplorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addStartButtons() {
  const gateActions = document.querySelector('.acq-entry-actions');
  if (gateActions && !byId('acqGuidedStart')) {
    const button = document.createElement('button');
    button.className = 'btn primary acq-enter guided-start'; button.id = 'acqGuidedStart';
    button.textContent = label('ابدأ الجولة التنفيذية', 'Start guided demo');
    button.onclick = startTour;
    gateActions.prepend(button);
  }
  const dashboardHead = document.querySelector('#acquisitionDashboard .acq-dashboard-head');
  if (dashboardHead && !byId('guidedDemoStart')) {
    const button = document.createElement('button');
    button.className = 'btn primary guided-start guided-dashboard-start'; button.id = 'guidedDemoStart';
    button.textContent = label('ابدأ الجولة التنفيذية', 'Start guided demo');
    button.onclick = startTour;
    dashboardHead.appendChild(button);
  }
}

function refreshLanguage() {
  const start1 = byId('acqGuidedStart'); if (start1) start1.textContent = label('ابدأ الجولة التنفيذية', 'Start guided demo');
  const start2 = byId('guidedDemoStart'); if (start2) start2.textContent = label('ابدأ الجولة التنفيذية', 'Start guided demo');
  if (tour.active) renderController(STEPS[tour.index]);
}

const observer = new MutationObserver(() => addStartButtons());
observer.observe(document.documentElement, { childList: true, subtree: true });
addStartButtons();
setInterval(() => { addStartButtons(); refreshLanguage(); }, 1200);

window.smartTrafficGuidedDemo = { start: startTour, stop: endTour, next: () => goTo(Math.min(STEPS.length - 1, tour.index + 1), true), previous: () => goTo(Math.max(0, tour.index - 1), false) };
