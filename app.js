import { applyIncident, chooseBestScenario, edgeTravelMinutes, networkMetrics, optimizeSignalPlan, shortestPath } from './engine/trafficEngine.js';
import {
  applyOperationalIntervention,
  compareOperations,
  makeOperationalSnapshot,
  operationalMetrics,
  planEmergencyDispatch,
  runOperationalScenario,
  shortHorizonForecast
} from './engine/operationsEngine.js';
import { evaluateQcsCorridor } from './engine/qcsRiskEngine.js';
import { buildCoverage, coverageSummary, coverageToCsv } from './coverage/coverageModel.js';

const state = {
  lang: 'ar', running: true, features: [], coverageRows: [], baseNetwork: null, networkModel: null,
  scenarios: [], fleet: [], qcsObservations: [], qcsResult: null, currentScenario: 'normal', pendingIntervention: null,
  lastForecast: null, lastComparison: null, tick: 0
};

const labels = {
  ar: {
    run:'تشغيل', pause:'إيقاف المحاكاة', resume:'استئناف المحاكاة', load:'الحمل', speed:'كم/س',
    route:'احسب المسار', unreachable:'لا يوجد مسار متاح', flowing:'انسيابي', busy:'مزدحم', critical:'حرج', closed:'مغلق',
    forecast:'تشغيل التنبؤ', dispatch:'إرسال وحدة الطوارئ', applied:'تم تطبيق التدخل المحاكى', qcs:'تشغيل تحليل QCS المحاكى'
  },
  en: {
    run:'Run', pause:'Pause simulation', resume:'Resume simulation', load:'Load', speed:'km/h',
    route:'Calculate route', unreachable:'No route available', flowing:'Flowing', busy:'Busy', critical:'Critical', closed:'Closed',
    forecast:'Run forecast', dispatch:'Dispatch emergency unit', applied:'Simulated intervention applied', qcs:'Run simulated QCS analysis'
  }
};

const arabicNodes = {
  N1:'البوابة الشمالية',N2:'طريق الملك',N3:'الجامعة',N4:'وصلة المطار',N5:'وسط المدينة الشرقي',N6:'وسط المدينة الغربي',
  N7:'مدخل الميناء',N8:'المنطقة الصناعية',N9:'المستشفى',N10:'منطقة المدارس',N11:'الطريق الدائري',N12:'المنطقة اللوجستية'
};

function rnd(seed){ const x=Math.sin(seed*999.91)*43758.5453; return x-Math.floor(x); }
function nodeLabel(id){ const node=state.networkModel?.nodes.find(n=>n.id===id); return state.lang==='ar'?(arabicNodes[id]||node?.name||id):(node?.name||id); }
function edgeName(edge){ return `${nodeLabel(edge.from)} ↔ ${nodeLabel(edge.to)}`; }
function congestionLabel(edge){
  if(edge.closed) return labels[state.lang].closed;
  const load=Number(edge.load||0); return load>78?labels[state.lang].critical:load>62?labels[state.lang].busy:labels[state.lang].flowing;
}

function renderNetwork(){
  const el=document.getElementById('network'); el.innerHTML='';
  state.networkModel.edges.slice(0,12).forEach(edge=>{
    const minutes=edgeTravelMinutes(edge), load=Math.round(edge.load||0);
    const speed=Number.isFinite(minutes)?Math.max(8,Math.round(edge.distanceKm/(minutes/60))):0;
    const div=document.createElement('div'); div.className=`segment${edge.closed?' closed':''}`;
    div.innerHTML=`<h3>${edge.id} · ${edgeName(edge)}</h3><div class="metric">${load}%</div><div class="sub">${labels[state.lang].load} · ${speed} ${labels[state.lang].speed} · ${congestionLabel(edge)}</div><div class="bar"><i style="width:${load}%"></i></div>`;
    el.appendChild(div);
  });
  renderMetrics();
}

function renderMetrics(){
  const m=operationalMetrics(state.networkModel);
  document.getElementById('networkLoad').textContent=`${Math.round(m.avgLoad)}%`;
  document.getElementById('predictedDelay').textContent=m.avgEdgeMinutes.toFixed(1);
  document.getElementById('activeIncidents').textContent=m.incidentCount;
  document.getElementById('stressIndex').textContent=m.stressIndex.toFixed(1);
}

function updateSim(){
  if(!state.running) return; state.tick++;
  state.networkModel.edges.forEach((edge,i)=>{
    if(edge.closed) return;
    const drift=Math.round((rnd(state.tick*7+i)-.5)*5);
    edge.load=Math.max(15,Math.min(96,(edge.load||0)+drift));
  });
  renderNetwork();
}

function logEvent(text){
  const line=document.createElement('div'); line.className='event';
  line.innerHTML=`<time>${new Date().toLocaleTimeString()}</time><p>${text}</p>`;
  const tl=document.getElementById('timeline'); tl.prepend(line); while(tl.children.length>12) tl.lastChild.remove();
}

function runRoute(){
  const origin=document.getElementById('routeOrigin').value, destination=document.getElementById('routeDestination').value;
  const route=shortestPath(state.networkModel,origin,destination), box=document.getElementById('routeResult');
  if(!route.reachable){ box.textContent=labels[state.lang].unreachable; return; }
  box.innerHTML=`<strong>${route.minutes.toFixed(1)} min · ${route.distanceKm.toFixed(1)} km</strong><br>${route.nodes.map(nodeLabel).join(' → ')}<br><span>${route.edgeIds.join(' · ')}</span>`;
  logEvent(`${state.lang==='ar'?'مسار محسوب':'Route calculated'}: ${route.edgeIds.join(' → ')}`);
}

function renderComparison(comparison){
  if(!comparison) return;
  const pairs=[
    ['beforeStress','afterStress','stressDelta',comparison.before.stressIndex,comparison.after.stressIndex,comparison.improvement.stressPercent,'%'],
    ['beforeLoad','afterLoad','loadDelta',comparison.before.avgLoad,comparison.after.avgLoad,comparison.improvement.loadPercent,'%'],
    ['beforeTime','afterTime','timeDelta',comparison.before.avgEdgeMinutes,comparison.after.avgEdgeMinutes,comparison.improvement.travelTimePercent,'%'],
    ['beforeCritical','afterCritical','criticalDelta',comparison.before.criticalEdges,comparison.after.criticalEdges,comparison.before.criticalEdges-comparison.after.criticalEdges,'']
  ];
  pairs.forEach(([beforeId,afterId,deltaId,before,after,improvement,suffix])=>{
    document.getElementById(beforeId).textContent=Number(before).toFixed(beforeId.includes('Critical')?0:1)+(beforeId.includes('Load')?'%':'');
    document.getElementById(afterId).textContent=Number(after).toFixed(afterId.includes('Critical')?0:1)+(afterId.includes('Load')?'%':'');
    const el=document.getElementById(deltaId); el.textContent=`${improvement>=0?'+':''}${Number(improvement).toFixed(1)}${suffix}`;
    el.className=`delta ${improvement>=0?'positive':'negative'}`;
  });
}

function runScenario(){
  const id=document.getElementById('scenarioSelect').value;
  const scenario=state.scenarios.find(s=>s.id===id); if(!scenario) return;
  const result=runOperationalScenario(state.baseNetwork,scenario);
  const intervention=applyOperationalIntervention(result.network,{targetCount:7,loadReduction:11,incidentRelief:.28});
  const comparison=compareOperations(result.network,intervention);
  state.currentScenario=id; state.networkModel=result.network; state.pendingIntervention=intervention; state.lastComparison=comparison;
  renderNetwork(); renderComparison(comparison); populateEngineeringSelectors(); runRoute();
  const name=state.lang==='ar'?scenario.name_ar:scenario.name_en;
  document.getElementById('scenarioResult').textContent=`${name} · Stress ${result.metrics.stressIndex.toFixed(1)} · Avg load ${result.metrics.avgLoad.toFixed(1)}% · Incidents ${result.metrics.incidentCount}`;
  document.getElementById('comparisonNote').textContent=state.lang==='ar'?'المقارنة أدناه بين حالة السيناريو وخطة تدخل محاكاة محددة وليست نتيجة ميدانية.':'The comparison below is between the scenario state and a deterministic simulated mitigation plan, not a field result.';
  logEvent(`${state.lang==='ar'?'تشغيل سيناريو':'Scenario executed'}: ${name}`);
}

function applyPendingIntervention(){
  if(!state.pendingIntervention) runScenario();
  state.networkModel=JSON.parse(JSON.stringify(state.pendingIntervention)); renderNetwork(); runRoute();
  logEvent(labels[state.lang].applied);
}

function runForecast(){
  const horizon=Number(document.getElementById('forecastHorizon').value||15);
  const result=shortHorizonForecast(state.networkModel,{horizonMinutes:horizon}); state.lastForecast=result;
  document.getElementById('forecastResult').innerHTML=`<strong>${horizon} min</strong><br>Stress ${result.before.stressIndex.toFixed(1)} → ${result.forecast.stressIndex.toFixed(1)}<br>Avg load ${result.before.avgLoad.toFixed(1)}% → ${result.forecast.avgLoad.toFixed(1)}%<br><span>${result.method}</span>`;
  logEvent(`${state.lang==='ar'?'تنبؤ قصير المدى':'Short-horizon forecast'}: ${horizon} min`);
}

function dispatchEmergency(){
  const target=document.getElementById('emergencyTarget').value;
  const dispatch=planEmergencyDispatch(state.networkModel,state.fleet,target,{priorityEdgeIds:['E11','E08','E17']});
  const box=document.getElementById('dispatchResult');
  if(!dispatch.selected){ box.textContent=state.lang==='ar'?'لا توجد وحدة متاحة بمسار قابل للوصول.':'No available unit has a reachable route.'; return; }
  const {unit,route}=dispatch.selected;
  box.innerHTML=`<strong>${unit.id} · ${unit.type}</strong><br>${route.minutes.toFixed(1)} min · ${route.distanceKm.toFixed(1)} km<br>${route.nodes.map(nodeLabel).join(' → ')}<br><span>${dispatch.evaluatedUnits} units evaluated · SIMULATION</span>`;
  logEvent(`${state.lang==='ar'?'اختيار وحدة طوارئ':'Emergency unit selected'}: ${unit.id}`);
}

function runQcsRisk(){
  const result=evaluateQcsCorridor(state.qcsObservations); state.qcsResult=result;
  const top=result.assessments[0];
  document.getElementById('qcsRiskScore').textContent=`${top.score}`;
  document.getElementById('qcsRiskEdge').textContent=top.edgeId;
  document.getElementById('qcsTargetSpeed').textContent=`${top.response.targetSpeedKph} km/h`;
  document.getElementById('qcsBroadcasts').textContent=result.summary.hazardBroadcasts;
  const actions=top.response.actions.join(' · ')||'monitor';
  document.getElementById('qcsRiskResult').innerHTML=`<strong>${top.edgeId} · ${top.level.toUpperCase()} · ${top.score}/100</strong><br>${state.lang==='ar'?'متوسط الخطر':'Average risk'}: ${result.summary.averageRiskScore}/100 · ${state.lang==='ar'?'أعلى سرعة مقترحة للمقطع':'Suggested target speed'}: ${top.response.targetSpeedKph} km/h<br><span>${actions}</span><br><small>SIMULATION · ${result.method} · quantumHardwareConnected=false</small>`;
  renderQcsRiskTable();
  logEvent(`${state.lang==='ar'?'تحليل مخاطر QCS محاكى':'Simulated QCS risk analysis'}: ${top.edgeId} ${top.score}/100`);
}

function renderQcsRiskTable(){
  const tbody=document.getElementById('qcsRiskRows'); tbody.innerHTML='';
  if(!state.qcsResult) return;
  state.qcsResult.assessments.slice(0,6).forEach(item=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td class="id">${item.edgeId}</td><td>${item.score}</td><td>${item.level}</td><td>${item.response.currentSpeedKph}</td><td>${item.response.targetSpeedKph}</td><td>${item.response.actions.join(', ')||'monitor'}</td>`;
    tbody.appendChild(tr);
  });
}

function intervene(action){
  if(action==='signals'){
    const busiest=[...state.networkModel.edges].filter(e=>!e.closed).sort((a,b)=>(b.load||0)-(a.load||0)).slice(0,4);
    const plan=optimizeSignalPlan(busiest.map(e=>({id:e.id,load:e.load})),{cycleSeconds:100,lostSeconds:12,minGreenSeconds:8});
    const text=plan.phases.map(p=>`${p.id}:${p.greenSeconds.toFixed(0)}s`).join(' · ');
    document.getElementById('engineeringOutput').textContent=`Adaptive signal plan · ${text}`; logEvent(text); return;
  }
  if(action==='reroute'){ runRoute(); return; }
  if(action==='emergency'){ dispatchEmergency(); return; }
  if(action==='qtos'){
    const candidates=[7,10,13].map(loadReduction=>{
      const network=applyOperationalIntervention(state.networkModel,{targetCount:7,loadReduction,incidentRelief:.25});
      return {network,metrics:networkMetrics(network),loadReduction};
    });
    const best=chooseBestScenario(candidates); const comparison=compareOperations(state.networkModel,best.network);
    state.pendingIntervention=best.network; state.lastComparison=comparison; renderComparison(comparison);
    document.getElementById('engineeringOutput').textContent=`Scenario selector · candidate load relief ${best.loadReduction} · stress ${best.metrics.stressIndex.toFixed(1)}`;
    logEvent('QTOS/classical scenario comparison completed');
  }
}

function injectIncident(){
  const edgeId=document.getElementById('incidentEdge').value;
  state.networkModel=applyIncident(state.networkModel,edgeId,{severity:.9,close:document.getElementById('closeEdge').checked,loadIncrease:18});
  renderNetwork(); runRoute(); logEvent(`${state.lang==='ar'?'حادث محاكى':'Simulated incident'}: ${edgeId}`);
}

function groupTag(g){ return {verified_historical:['verified','Verified'],conversation_recovered:['recovered','Recovered'],additional_history:['history','History'],qtos:['qtos','QTOS'],qcs_recovered:['recovered','QCS Direct']}[g]||['','']; }

function renderRegistryStats(){
  const counts=state.features.reduce((acc,f)=>{acc[f.group]=(acc[f.group]||0)+1;return acc;},{});
  document.getElementById('registryStats').innerHTML=`<span class="stat-pill">${counts.verified_historical||0} Verified Historical</span><span class="stat-pill">${counts.conversation_recovered||0} Conversation-Recovered</span><span class="stat-pill">${counts.additional_history||0} Project-History</span><span class="stat-pill">${counts.qtos||0} QTOS</span><span class="stat-pill">${counts.qcs_recovered||0} QCS Direct</span>`;
  document.getElementById('registryBadge').textContent=`${state.features.length} Source Records`;
}

function renderFeatures(){
  const q=document.getElementById('search').value.trim().toLowerCase(), g=document.getElementById('groupFilter').value, c=document.getElementById('categoryFilter').value, rows=document.getElementById('featureRows'); rows.innerHTML='';
  state.features.filter(f=>{
    const hay=`${f.id} ${f.title_ar} ${f.title_en} ${f.category_ar} ${f.category_en} ${f.description_ar} ${f.description_en}`.toLowerCase();
    return(!q||hay.includes(q))&&(!g||f.group===g)&&(!c||(state.lang==='ar'?f.category_ar:f.category_en)===c);
  }).forEach(f=>{
    const[cls,txt]=groupTag(f.group), tr=document.createElement('tr');
    tr.innerHTML=`<td class="id">${f.id}</td><td class="title-ar">${f.title_ar}</td><td>${f.title_en}</td><td>${state.lang==='ar'?f.category_ar:f.category_en}</td><td class="desc">${state.lang==='ar'?f.description_ar:f.description_en}</td><td><span class="tag ${cls}">${txt}</span></td>`; rows.appendChild(tr);
  });
  document.getElementById('featureCount').textContent=state.features.length;
  renderRegistryStats();
}

function renderCoverage(){
  const q=document.getElementById('coverageSearch').value.trim().toLowerCase(), status=document.getElementById('coverageStatus').value, tbody=document.getElementById('coverageRows'); tbody.innerHTML='';
  state.coverageRows.filter(row=>{
    const hay=`${row.id} ${row.title_ar} ${row.title_en} ${row.module||''}`.toLowerCase(); return(!q||hay.includes(q))&&(!status||row.status===status);
  }).forEach(row=>{
    const tr=document.createElement('tr'); const title=state.lang==='ar'?row.title_ar:row.title_en;
    tr.innerHTML=`<td class="id">${row.id}</td><td>${title}</td><td><span class="tag ${row.status==='implemented_demo'?'verified':row.status==='represented_demo'?'recovered':'history'}">${row.status}</span></td><td>${row.module||'—'}</td><td>${row.production_verified?'Yes':'No'}</td>`; tbody.appendChild(tr);
  });
  const s=coverageSummary(state.coverageRows);
  document.getElementById('coverageTotal').textContent=s.total;
  document.getElementById('coverageImplemented').textContent=s.implemented_demo;
  document.getElementById('coverageRepresented').textContent=s.represented_demo;
  document.getElementById('coverageCatalogued').textContent=s.catalogued_only;
  document.getElementById('coverageProduction').textContent=s.production_verified;
}

function rebuildCategories(){
  const sel=document.getElementById('categoryFilter'), current=sel.value;
  const cats=[...new Set(state.features.map(f=>state.lang==='ar'?f.category_ar:f.category_en).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  sel.innerHTML=`<option value="">${state.lang==='ar'?'كل الفئات':'All categories'}</option>`+cats.map(c=>`<option>${c}</option>`).join(''); if(cats.includes(current)) sel.value=current;
}

function populateEngineeringSelectors(){
  const nodeOptions=state.networkModel.nodes.map(n=>`<option value="${n.id}">${nodeLabel(n.id)}</option>`).join('');
  const origin=document.getElementById('routeOrigin'), dest=document.getElementById('routeDestination'), target=document.getElementById('emergencyTarget');
  const oldO=origin.value||'N1', oldD=dest.value||'N8', oldT=target.value||'N10'; origin.innerHTML=nodeOptions; dest.innerHTML=nodeOptions; target.innerHTML=nodeOptions; origin.value=oldO; dest.value=oldD; target.value=oldT;
  const edgeSel=document.getElementById('incidentEdge'), oldE=edgeSel.value||'E09'; edgeSel.innerHTML=state.networkModel.edges.map(e=>`<option value="${e.id}">${e.id} · ${edgeName(e)}</option>`).join(''); edgeSel.value=oldE;
}

function populateScenarios(){
  const sel=document.getElementById('scenarioSelect'), current=sel.value||state.currentScenario;
  sel.innerHTML=state.scenarios.map(s=>`<option value="${s.id}">${state.lang==='ar'?s.name_ar:s.name_en}</option>`).join(''); if(state.scenarios.some(s=>s.id===current)) sel.value=current;
}

function downloadFile(name,content,type){
  const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportSnapshot(){
  const snapshot=makeOperationalSnapshot({network:state.networkModel,scenarioName:state.currentScenario,forecast:state.lastForecast,comparison:state.lastComparison,coverageSummary:coverageSummary(state.coverageRows)});
  snapshot.qcsRiskDemo=state.qcsResult?{simulation:true,method:state.qcsResult.method,summary:state.qcsResult.summary}:null;
  downloadFile('smart-traffic-operational-snapshot.json',JSON.stringify(snapshot,null,2),'application/json'); logEvent('Operational snapshot exported');
}
function exportCoverage(){ downloadFile('smart-traffic-feature-coverage.csv',coverageToCsv(state.coverageRows),'text/csv;charset=utf-8'); logEvent('Coverage matrix exported'); }

function translate(){
  const isAr=state.lang==='ar'; document.documentElement.lang=state.lang; document.documentElement.dir=isAr?'rtl':'ltr';
  document.querySelectorAll('[data-ar][data-en]').forEach(el=>el.textContent=el.dataset[state.lang]);
  document.getElementById('langBtn').textContent=isAr?'English':'العربية'; document.getElementById('pauseBtn').textContent=state.running?labels[state.lang].pause:labels[state.lang].resume;
  document.querySelectorAll('[data-action]').forEach(b=>b.textContent=labels[state.lang].run); document.getElementById('routeBtn').textContent=labels[state.lang].route; document.getElementById('forecastBtn').textContent=labels[state.lang].forecast; document.getElementById('dispatchBtn').textContent=labels[state.lang].dispatch; document.getElementById('qcsRiskBtn').textContent=labels[state.lang].qcs;
  rebuildCategories(); populateScenarios(); populateEngineeringSelectors(); renderFeatures(); renderCoverage(); renderNetwork(); if(state.qcsResult) runQcsRisk();
}

async function load(){
  const [manifest,network,scenarios,fleet,qcsObservations]=await Promise.all([
    fetch('data/features.json').then(r=>{if(!r.ok)throw new Error('Failed data/features.json');return r.json()}),
    fetch('data/network.json').then(r=>r.json()), fetch('data/operations_scenarios.json').then(r=>r.json()), fetch('data/emergency_fleet.json').then(r=>r.json()), fetch('data/qcs_demo_observations.json').then(r=>r.json())
  ]);
  const datasets=await Promise.all(manifest.files.map(async p=>{const path=`data/${p}`;const r=await fetch(path);if(!r.ok)throw new Error(`Failed ${path}`);return r.json()}));
  state.features=datasets.flat();
  if(state.features.length!==manifest.total) throw new Error(`Feature registry mismatch ${state.features.length} != ${manifest.total}`);
  state.coverageRows=buildCoverage(state.features); state.baseNetwork=JSON.parse(JSON.stringify(network)); state.networkModel=network; state.scenarios=scenarios; state.fleet=fleet; state.qcsObservations=qcsObservations;
  populateScenarios(); populateEngineeringSelectors(); rebuildCategories(); renderFeatures(); renderCoverage(); renderNetwork(); runRoute(); runForecast(); dispatchEmergency(); runScenario(); runQcsRisk();
  logEvent(state.lang==='ar'?'تم تحميل طبقة عمليات المدينة والسجل الديناميكي ومختبر QCS':'City operations, dynamic registry and QCS lab loaded'); setInterval(updateSim,1600);
}

document.getElementById('langBtn').onclick=()=>{state.lang=state.lang==='ar'?'en':'ar';translate()};
document.getElementById('pauseBtn').onclick=()=>{state.running=!state.running;translate();logEvent(state.running?'Simulation resumed':'Simulation paused')};
document.getElementById('optimizeBtn').onclick=()=>intervene('qtos');
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>intervene(b.dataset.action));
document.getElementById('routeBtn').onclick=runRoute; document.getElementById('scenarioBtn').onclick=runScenario; document.getElementById('forecastBtn').onclick=runForecast; document.getElementById('dispatchBtn').onclick=dispatchEmergency; document.getElementById('qcsRiskBtn').onclick=runQcsRisk;
document.getElementById('incidentBtn').onclick=injectIncident; document.getElementById('applyInterventionBtn').onclick=applyPendingIntervention;
document.getElementById('resetNetworkBtn').onclick=()=>{state.networkModel=JSON.parse(JSON.stringify(state.baseNetwork));state.pendingIntervention=null;state.lastComparison=null;populateEngineeringSelectors();renderNetwork();runRoute();logEvent(state.lang==='ar'?'إعادة ضبط الشبكة':'Network reset')};
document.getElementById('exportSnapshotBtn').onclick=exportSnapshot; document.getElementById('exportCoverageBtn').onclick=exportCoverage;
['search','groupFilter','categoryFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='search'?'input':'change',renderFeatures));
document.getElementById('coverageSearch').addEventListener('input',renderCoverage); document.getElementById('coverageStatus').addEventListener('change',renderCoverage);
load().catch(err=>{console.error(err);document.getElementById('timeline').innerHTML=`<div class="event"><p>${err.message}</p></div>`});
