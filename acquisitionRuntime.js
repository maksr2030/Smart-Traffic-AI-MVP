import { buildCoverage, coverageSummary } from './coverage/coverageModel.js';

const MODULE_TARGETS = {
  'predictive-risk-baseline': 'predictiveOrchestrationPanel',
  'predictive-network-load-orchestration': 'predictiveOrchestrationPanel',
  'predictive-autonomous-recommendation': 'predictiveOrchestrationPanel',
  'multi-horizon-candidate-orchestration': 'predictiveOrchestrationPanel',
  'dynamic-risk-digital-twin': 'twinDecisionBtn',
  'routing': 'riskRouteBtn',
  'priority-routing': 'riskRouteBtn',
  'dynamic-twin-risk-routing-and-command-plan': 'riskRouteBtn',
  'signals': 'twinDecisionBtn',
  'signals-simulation': 'twinDecisionBtn',
  'emergency-dispatch': 'dispatchBtn',
  'analytics-export': 'exportSnapshotBtn',
  'multi-incident': 'scenarioBtn',
  'incident-input': 'incidentBtn',
  'network-metrics': 'network',
  'graph-engine': 'network',
  'operations-engine': 'scenarioBtn',
  'qcs-risk-response': 'qcsRiskBtn',
  'v2x-proxy-broadcast': 'qcsRiskBtn',
  'hidden-hazard-input': 'qcsRiskBtn',
  'adaptive-response-recommendation': 'qcsRiskBtn',
  'weather-response-proxy': 'qcsRiskBtn',
  'weather-scenario': 'scenarioBtn',
  'scenario-analysis': 'scenarioBtn',
  'critical-area-scenario': 'scenarioBtn',
  'decision-log': 'timeline',
  'classical-baseline-only': 'predictiveOrchestrationPanel',
  'connected-vehicle-design': 'coverageRows',
  'network-integration-design': 'coverageRows',
  'deployment-design': 'coverageRows'
};

const ui = { features: [], coverage: [], query: '', status: '', group: '', page: 1, perPage: 18 };

function ar() { return document.documentElement.lang !== 'en'; }
function esc(value = '') { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function text(arText, enText) { return ar() ? arText : enText; }
function statusLabel(status) {
  if (status === 'implemented_demo') return text('عرض تنفيذي','Executable demo');
  if (status === 'represented_demo') return text('تمثيل تجريبي','Represented demo');
  return text('موثق في السجل','Catalogued');
}
function statusClass(status) { return status === 'implemented_demo' ? 'exec' : status === 'represented_demo' ? 'represented' : 'catalogued'; }
function groupLabel(group) {
  return ({verified_historical:'Verified Historical',conversation_recovered:'Conversation Recovered',additional_history:'Project History',qtos:'QTOS',qcs_recovered:'QCS Direct'})[group] || group;
}

async function loadPortfolio() {
  const manifest = await fetch('data/features.json').then(r => { if (!r.ok) throw new Error('features manifest unavailable'); return r.json(); });
  const parts = await Promise.all(manifest.files.map(file => fetch(`data/${file}`).then(r => r.json())));
  ui.features = parts.flat();
  ui.coverage = buildCoverage(ui.features);
  if (ui.features.length !== manifest.total) throw new Error(`portfolio mismatch ${ui.features.length}/${manifest.total}`);
}

function addEntryGate(summary) {
  if (document.getElementById('acquisitionEntry')) return;
  const gate = document.createElement('div');
  gate.id = 'acquisitionEntry';
  gate.className = 'acq-entry';
  gate.innerHTML = `
    <div class="acq-entry-card">
      <div class="acq-kicker">SMART TRAFFIC AI · EXECUTABLE MVP</div>
      <h1 data-acq-ar="منصة ذكاء مروري قابلة للتشغيل والعرض المباشر" data-acq-en="Executable Smart Traffic Intelligence Platform">منصة ذكاء مروري قابلة للتشغيل والعرض المباشر</h1>
      <p data-acq-ar="نسخة تنفيذية تفاعلية لعرض محركات المرور، التوأم الرقمي للمخاطر، التنبؤ، التنظيم الاستباقي، QCS، السياسات، التفسير وإعادة تشغيل السيناريوهات — مع سجل موحد لجميع القدرات المستردة." data-acq-en="An interactive executable MVP presenting traffic engines, the Dynamic Risk Digital Twin, prediction, orchestration, QCS, policy guardrails, explainability and scenario replay — with the complete recovered capability registry.">نسخة تنفيذية تفاعلية لعرض محركات المرور، التوأم الرقمي للمخاطر، التنبؤ، التنظيم الاستباقي، QCS، السياسات، التفسير وإعادة تشغيل السيناريوهات — مع سجل موحد لجميع القدرات المستردة.</p>
      <div class="acq-entry-stats">
        <div><strong>${summary.total}</strong><span data-acq-ar="قدرة موحدة" data-acq-en="Unified capabilities">قدرة موحدة</span></div>
        <div><strong>${summary.implemented_demo}</strong><span data-acq-ar="عرض تنفيذي" data-acq-en="Executable demos">عرض تنفيذي</span></div>
        <div><strong>${summary.represented_demo}</strong><span data-acq-ar="تمثيل تجريبي" data-acq-en="Represented demos">تمثيل تجريبي</span></div>
        <div><strong>${summary.catalogued_only}</strong><span data-acq-ar="موثق في السجل" data-acq-en="Catalogued">موثق في السجل</span></div>
      </div>
      <div class="acq-entry-actions">
        <button class="btn primary acq-enter" id="acqEnter" data-acq-ar="دخول المنصة" data-acq-en="Enter platform">دخول المنصة</button>
        <button class="btn acq-enter" id="acqFeatures" data-acq-ar="استعراض جميع الميزات" data-acq-en="Explore all features">استعراض جميع الميزات</button>
      </div>
      <small data-acq-ar="Engineering MVP · Simulation only · 0 Production Verified" data-acq-en="Engineering MVP · Simulation only · 0 Production Verified">Engineering MVP · Simulation only · 0 Production Verified</small>
    </div>`;
  document.body.prepend(gate);
  document.body.classList.add('acq-locked');
  const close = target => {
    gate.classList.add('leaving');
    document.body.classList.remove('acq-locked');
    setTimeout(() => { gate.remove(); document.getElementById(target)?.scrollIntoView({behavior:'smooth', block:'start'}); }, 260);
  };
  document.getElementById('acqEnter').onclick = () => close('acquisitionDashboard');
  document.getElementById('acqFeatures').onclick = () => close('acquisitionFeatureExplorer');
}

function addExecutiveNav() {
  if (document.getElementById('acqNav')) return;
  const nav = document.createElement('nav');
  nav.id = 'acqNav'; nav.className = 'acq-nav';
  const items = [
    ['acquisitionDashboard','نظرة تنفيذية','Executive'],
    ['network','التوأم','Twin'],
    ['predictiveOrchestrationPanel','التنبؤ','Predictive'],
    ['explainableOrchestrationPanel','الحوكمة','Governance'],
    ['acquisitionFeatureExplorer','الميزات','Features']
  ];
  nav.innerHTML = `<div class="acq-nav-inner"><strong>SMART TRAFFIC AI</strong><div>${items.map(([id,a,e]) => `<button class="acq-nav-btn" data-target="${id}" data-acq-ar="${a}" data-acq-en="${e}">${a}</button>`).join('')}</div></div>`;
  document.querySelector('.topbar')?.insertAdjacentElement('afterend', nav);
  nav.querySelectorAll('[data-target]').forEach(btn => btn.onclick = () => document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'}));
}

function demoButton(target, arLabel='فتح العرض', enLabel='Open demo') {
  return `<button class="btn primary acq-jump" data-target="${target}" data-acq-ar="${arLabel}" data-acq-en="${enLabel}">${arLabel}</button>`;
}

function addDashboard(summary) {
  if (document.getElementById('acquisitionDashboard')) return;
  const main = document.querySelector('main.shell'); if (!main) return;
  const section = document.createElement('section'); section.id = 'acquisitionDashboard'; section.className = 'acq-dashboard';
  section.innerHTML = `
    <div class="acq-dashboard-head">
      <div><div class="acq-kicker">ACQUISITION-READY EXECUTABLE MVP</div><h2 data-acq-ar="لوحة العرض التنفيذي للمنصة" data-acq-en="Executive platform showcase">لوحة العرض التنفيذي للمنصة</h2><p data-acq-ar="ابدأ من محرك تنفيذي أو استعرض محفظة القدرات كاملة. كل حالة تنفيذ معروضة من مصفوفة التغطية الفعلية ولا تعني تحققاً إنتاجياً." data-acq-en="Start from an executable engine or explore the complete capability portfolio. Every status comes from the actual coverage matrix and does not imply production verification.">ابدأ من محرك تنفيذي أو استعرض محفظة القدرات كاملة. كل حالة تنفيذ معروضة من مصفوفة التغطية الفعلية ولا تعني تحققاً إنتاجياً.</p></div>
      <div class="acq-proof"><span>CI TESTED</span><span>LIVE STATIC MVP</span><span>SIMULATION</span></div>
    </div>
    <div class="acq-summary-grid">
      <div><strong>${summary.total}</strong><span data-acq-ar="إجمالي القدرات" data-acq-en="Total capabilities">إجمالي القدرات</span></div>
      <div><strong>${summary.implemented_demo}</strong><span data-acq-ar="Executable Demo" data-acq-en="Executable demos">Executable Demo</span></div>
      <div><strong>${summary.represented_demo}</strong><span data-acq-ar="Represented Demo" data-acq-en="Represented demos">Represented Demo</span></div>
      <div><strong>${summary.catalogued_only}</strong><span data-acq-ar="Catalogued Only" data-acq-en="Catalogued only">Catalogued Only</span></div>
      <div><strong>${summary.production_verified}</strong><span data-acq-ar="Production Verified" data-acq-en="Production verified">Production Verified</span></div>
    </div>
    <div class="acq-demo-grid">
      <article><span>01</span><h3 data-acq-ar="Dynamic Risk Digital Twin" data-acq-en="Dynamic Risk Digital Twin">Dynamic Risk Digital Twin</h3><p data-acq-ar="حالة مخاطر موحدة للشبكة وقرارات مشتركة للمسار والإشارات والطوارئ." data-acq-en="Shared network-risk state coordinating route, signal and emergency decisions.">حالة مخاطر موحدة للشبكة وقرارات مشتركة للمسار والإشارات والطوارئ.</p>${demoButton('twinDecisionBtn')}</article>
      <article><span>02</span><h3 data-acq-ar="Predictive Orchestration" data-acq-en="Predictive Orchestration">Predictive Orchestration</h3><p data-acq-ar="توقعات 5/15/30/60 دقيقة ومقارنة خطط التدخل قبل تصاعد الخطر." data-acq-en="5/15/30/60-minute projections and intervention-plan ranking before risk escalates.">توقعات 5/15/30/60 دقيقة ومقارنة خطط التدخل قبل تصاعد الخطر.</p>${demoButton('predictiveBtn')}</article>
      <article><span>03</span><h3 data-acq-ar="Explainability & Policy" data-acq-en="Explainability & Policy">Explainability & Policy</h3><p data-acq-ar="شرح حسابي للقرار، بوابة سياسات، Replay وتحليل حساسية." data-acq-en="Arithmetic decision explanation, policy gate, replay and sensitivity analysis.">شرح حسابي للقرار، بوابة سياسات، Replay وتحليل حساسية.</p>${demoButton('explainableBtn')}</article>
      <article><span>04</span><h3 data-acq-ar="QCS Risk Lab" data-acq-en="QCS Risk Lab">QCS Risk Lab</h3><p data-acq-ar="محاكاة استجابة مخاطر QCS مع حدود إثبات صريحة ومن دون ادعاء عتاد كمومي." data-acq-en="QCS proxy risk-response simulation with explicit evidence boundaries and no quantum-hardware claim.">محاكاة استجابة مخاطر QCS مع حدود إثبات صريحة ومن دون ادعاء عتاد كمومي.</p>${demoButton('qcsRiskBtn')}</article>
      <article><span>05</span><h3 data-acq-ar="Routing & Emergency" data-acq-en="Routing & Emergency">Routing & Emergency</h3><p data-acq-ar="مقارنة المسار التقليدي بالمسار الواعي بالخطر وتخطيط استجابة الطوارئ." data-acq-en="Conventional versus risk-aware routing with virtual emergency-response planning.">مقارنة المسار التقليدي بالمسار الواعي بالخطر وتخطيط استجابة الطوارئ.</p>${demoButton('riskRouteBtn')}</article>
      <article><span>06</span><h3 data-acq-ar="Capability Portfolio" data-acq-en="Capability Portfolio">Capability Portfolio</h3><p data-acq-ar="استعراض جميع القدرات الـ123، حالتها، مصدرها ووصفها." data-acq-en="Explore all 123 capabilities, their status, source group and description.">استعراض جميع القدرات الـ123، حالتها، مصدرها ووصفها.</p>${demoButton('acquisitionFeatureExplorer','استعراض الميزات','Explore features')}</article>
    </div>`;
  main.prepend(section);
  section.querySelectorAll('.acq-jump').forEach(bindJump);
}

function bindJump(button) {
  button.onclick = () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    const card = target.closest('.card') || target;
    card.scrollIntoView({behavior:'smooth', block:'center'});
    card.classList.add('acq-highlight'); setTimeout(() => card.classList.remove('acq-highlight'), 1800);
  };
}

function filteredRows() {
  const q = ui.query.trim().toLowerCase();
  const coverageById = new Map(ui.coverage.map(row => [row.id,row]));
  return ui.features.map(feature => ({ feature, coverage: coverageById.get(String(feature.id)) })).filter(({feature,coverage}) => {
    const hay = `${feature.id} ${feature.title_ar} ${feature.title_en} ${feature.category_ar} ${feature.category_en} ${feature.description_ar} ${feature.description_en}`.toLowerCase();
    return (!q || hay.includes(q)) && (!ui.status || coverage.status === ui.status) && (!ui.group || feature.group === ui.group);
  });
}

function addFeatureExplorer() {
  if (document.getElementById('acquisitionFeatureExplorer')) return;
  const registry = document.querySelector('.registry-card'); if (!registry) return;
  const section = document.createElement('section'); section.id = 'acquisitionFeatureExplorer'; section.className = 'card acq-explorer';
  section.innerHTML = `
    <div class="section-title"><div><div class="acq-kicker">FEATURE EXPLORER</div><h2 data-acq-ar="جميع ميزات وقدرات المنصة" data-acq-en="Complete platform capability portfolio">جميع ميزات وقدرات المنصة</h2><p data-acq-ar="الحالة هنا مشتقة مباشرة من Coverage Model الفعلي." data-acq-en="Statuses are derived directly from the current Coverage Model.">الحالة هنا مشتقة مباشرة من Coverage Model الفعلي.</p></div><div id="acqVisibleCount" class="acq-visible-count"></div></div>
    <div class="acq-filters">
      <input id="acqSearch" placeholder="ابحث بالرقم أو الاسم / Search by ID or title">
      <select id="acqStatus"><option value="">كل الحالات / All statuses</option><option value="implemented_demo">Executable Demo</option><option value="represented_demo">Represented Demo</option><option value="catalogued_only">Catalogued Only</option></select>
      <select id="acqGroup"><option value="">كل المصادر / All source groups</option><option value="verified_historical">Verified Historical</option><option value="conversation_recovered">Conversation Recovered</option><option value="additional_history">Project History</option><option value="qtos">QTOS</option><option value="qcs_recovered">QCS Direct</option></select>
    </div>
    <div id="acqFeatureGrid" class="acq-feature-grid"></div>
    <div id="acqPager" class="acq-pager"></div>`;
  registry.insertAdjacentElement('beforebegin', section);
  document.getElementById('acqSearch').oninput = e => { ui.query=e.target.value;ui.page=1;renderExplorer(); };
  document.getElementById('acqStatus').onchange = e => { ui.status=e.target.value;ui.page=1;renderExplorer(); };
  document.getElementById('acqGroup').onchange = e => { ui.group=e.target.value;ui.page=1;renderExplorer(); };
  renderExplorer();
}

function renderExplorer() {
  const grid = document.getElementById('acqFeatureGrid'); if (!grid) return;
  const rows = filteredRows(); const pages = Math.max(1, Math.ceil(rows.length/ui.perPage)); ui.page=Math.min(ui.page,pages);
  const slice = rows.slice((ui.page-1)*ui.perPage, ui.page*ui.perPage);
  document.getElementById('acqVisibleCount').textContent = `${rows.length} / ${ui.features.length}`;
  grid.innerHTML = slice.map(({feature,coverage}) => {
    const moduleTarget = MODULE_TARGETS[coverage.module] || '';
    const title = ar()?feature.title_ar:feature.title_en;
    const desc = ar()?feature.description_ar:feature.description_en;
    const cat = ar()?feature.category_ar:feature.category_en;
    const action = coverage.status === 'implemented_demo' && moduleTarget
      ? `<button class="btn primary acq-card-action" data-target="${moduleTarget}" data-acq-ar="فتح العرض التنفيذي" data-acq-en="Open executable demo">${text('فتح العرض التنفيذي','Open executable demo')}</button>`
      : `<button class="btn acq-detail" data-id="${esc(feature.id)}" data-acq-ar="عرض التفاصيل" data-acq-en="View details">${text('عرض التفاصيل','View details')}</button>`;
    return `<article class="acq-feature-card ${statusClass(coverage.status)}"><div class="acq-feature-top"><span class="id">${esc(feature.id)}</span><span class="acq-status ${statusClass(coverage.status)}">${statusLabel(coverage.status)}</span></div><h3>${esc(title)}</h3><p>${esc(desc || '')}</p><div class="acq-feature-meta"><span>${esc(cat||'—')}</span><span>${esc(groupLabel(feature.group))}</span><span>${esc(coverage.module||'registry')}</span></div>${action}</article>`;
  }).join('');
  grid.querySelectorAll('.acq-card-action').forEach(bindJump);
  grid.querySelectorAll('.acq-detail').forEach(btn => btn.onclick = () => openFeatureModal(btn.dataset.id));
  const pager = document.getElementById('acqPager');
  pager.innerHTML = `<button class="btn" id="acqPrev" ${ui.page<=1?'disabled':''}>‹</button><span>${ui.page} / ${pages}</span><button class="btn" id="acqNext" ${ui.page>=pages?'disabled':''}>›</button>`;
  document.getElementById('acqPrev').onclick=()=>{if(ui.page>1){ui.page--;renderExplorer();}};
  document.getElementById('acqNext').onclick=()=>{if(ui.page<pages){ui.page++;renderExplorer();}};
}

function openFeatureModal(id) {
  const feature = ui.features.find(f => String(f.id)===String(id));
  const coverage = ui.coverage.find(r => r.id===String(id)); if(!feature||!coverage) return;
  let modal=document.getElementById('acqModal');
  if(!modal){ modal=document.createElement('div');modal.id='acqModal';modal.className='acq-modal';document.body.appendChild(modal); }
  modal.innerHTML=`<div class="acq-modal-card"><button class="acq-modal-close" aria-label="Close">×</button><div class="acq-feature-top"><span class="id">${esc(feature.id)}</span><span class="acq-status ${statusClass(coverage.status)}">${statusLabel(coverage.status)}</span></div><h2>${esc(ar()?feature.title_ar:feature.title_en)}</h2><p>${esc(ar()?feature.description_ar:feature.description_en)}</p><dl><dt>${text('الفئة','Category')}</dt><dd>${esc(ar()?feature.category_ar:feature.category_en)}</dd><dt>${text('مجموعة المصدر','Source group')}</dt><dd>${esc(groupLabel(feature.group))}</dd><dt>${text('الوحدة التنفيذية','Demo module')}</dt><dd>${esc(coverage.module||text('غير منفذة في MVP الحالي','Not implemented in current MVP'))}</dd><dt>Production Verified</dt><dd>false</dd></dl></div>`;
  modal.classList.add('open');
  modal.querySelector('.acq-modal-close').onclick=()=>modal.classList.remove('open');
  modal.onclick=e=>{if(e.target===modal)modal.classList.remove('open');};
}

function translateAcquisition() {
  document.querySelectorAll('[data-acq-ar][data-acq-en]').forEach(el => { el.textContent = ar()?el.dataset.acqAr:el.dataset.acqEn; });
  renderExplorer();
}

async function initAcquisition() {
  await loadPortfolio();
  const summary=coverageSummary(ui.coverage);
  addExecutiveNav(); addDashboard(summary); addFeatureExplorer(); addEntryGate(summary);
  document.querySelectorAll('.acq-jump').forEach(bindJump);
  document.getElementById('langBtn')?.addEventListener('click',()=>setTimeout(translateAcquisition,0));
  new MutationObserver(translateAcquisition).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}

initAcquisition().catch(error=>{ console.error('Acquisition presentation layer failed:',error); });
