import { applyIncident, edgeTravelMinutes, shortestPath } from './engine/trafficEngine.js';
import {
  applyOperationalIntervention,
  compareOperations,
  makeOperationalSnapshot,
  operationalMetrics,
  runOperationalScenario,
  shortHorizonForecast
} from './engine/operationsEngine.js';
import { evaluateQcsCorridor } from './engine/qcsRiskEngine.js';
import { buildPreventiveCommandPlan } from './engine/preventiveCommandEngine.js';
import {
  buildDynamicRiskTwin,
  buildTwinDecisionBundle,
  compareConventionalAndTwinRoutes,
  planTwinEmergencyDispatch,
  recommendTwinSignalPlan
} from './engine/dynamicRiskTwinEngine.js';
import { orchestratePredictiveRisk } from './engine/predictiveOrchestrationEngine.js';
import { buildCoverage, coverageSummary, coverageToCsv } from './coverage/coverageModel.js';

const state = {
  lang: 'ar', running: true, features: [], coverageRows: [], baseNetwork: null, networkModel: null,
  scenarios: [], fleet: [], qcsObservations: [], qcsResult: null, dynamicRiskTwin: null, lastTwinDecisionBundle: null,
  lastPredictiveOrchestration: null, currentScenario: 'normal', pendingIntervention: null, lastForecast: null, lastComparison: null,
  lastRiskRouteComparison: null, lastCommandPlan: null, tick: 0
};

const labels = {
  ar: {
    run:'تشغيل', pause:'إيقاف المحاكاة', resume:'استئناف المحاكاة', load:'الحمل', speed:'كم/س',
    route:'احسب المسار', riskRoute:'قارن مسار التوأم الديناميكي', unreachable:'لا يوجد مسار متاح', flowing:'انسيابي', busy:'مزدحم', critical:'حرج', closed:'مغلق',
    forecast:'تشغيل التنبؤ', dispatch:'إرسال وحدة الطوارئ', applied:'تم تطبيق التدخل المحاكى', qcs:'تشغيل تحليل QCS المحاكى',
    twin:'حدّث التوأم وشغّل القرارات الموحدة', predictive:'شغّل التنبؤ والاستعراض الاستباقي'
  },
  en: {
    run:'Run', pause:'Pause simulation', resume:'Resume simulation', load:'Load', speed:'km/h',
    route:'Calculate route', riskRoute:'Compare dynamic-twin route', unreachable:'No route available', flowing:'Flowing', busy:'Busy', critical:'Critical', closed:'Closed',
    forecast:'Run forecast', dispatch:'Dispatch emergency unit', applied:'Simulated intervention applied', qcs:'Run simulated QCS analysis',
    twin:'Refresh twin and run unified decisions', predictive:'Run predictive orchestration'
  }
};

const arabicNodes = {
  N1:'البوابة الشمالية',N2:'طريق الملك',N3:'الجامعة',N4:'وصلة المطار',N5:'وسط المدينة الشرقي',N6:'وسط المدينة الغربي',
  N7:'مدخل الميناء',N8:'المنطقة الصناعية',N9:'المستشفى',N10:'منطقة المدارس',N11:'الطريق الدائري',N12:'المنطقة اللوجستية'
};

function ensurePredictiveUi(){
  if(document.getElementById('predictiveOrchestrationPanel')) return;
  const anchor=document.querySelector('.operations-grid');
  const section=document.createElement('section'); section.className='card'; section.id='predictiveOrchestrationPanel';
  section.innerHTML=`
    <div class="section-title"><div><h2 data-ar="Predictive Risk & Autonomous Orchestration" data-en="Predictive Risk & Autonomous Orchestration">Predictive Risk & Autonomous Orchestration</h2><p data-ar="تنبؤ حتمي 5–60 دقيقة وترتيب تلقائي لخطط التدخل دون تطبيق ميداني" data-en="Deterministic 5–60 minute forecasting and autonomous ranking of intervention plans without field actuation">تنبؤ حتمي 5–60 دقيقة وترتيب تلقائي لخطط التدخل دون تطبيق ميداني</p></div><button class="btn primary" id="predictiveBtn">شغّل التنبؤ والاستعراض الاستباقي</button></div>
    <div class="comparison-grid">
      <div class="comparison-card"><span data-ar="الخطة الموصى بها" data-en="Recommended plan">الخطة الموصى بها</span><div><b id="predictiveSelected">—</b></div></div>
      <div class="comparison-card"><span data-ar="تحسن مقابل المراقبة فقط" data-en="Improvement vs observe-only">تحسن مقابل المراقبة فقط</span><div><b id="predictiveImprovement">—</b></div></div>
      <div class="comparison-card"><span data-ar="أسوأ درجة عبر الآفاق" data-en="Worst horizon score">أسوأ درجة عبر الآفاق</span><div><b id="predictiveWorst">—</b></div></div>
      <div class="comparison-card"><span data-ar="Hotspots عند 60 دقيقة" data-en="60-minute hotspots">Hotspots عند 60 دقيقة</span><div><b id="predictiveHotspots">—</b></div></div>
    </div>
    <div id="predictiveResult" class="output">Predictive orchestrator ready.</div>
    <div class="notice" data-ar="autonomousRecommendation=true ولكن autoApply=false وhumanApprovalRequired=true. التنبؤ baseline حتمي وليس نموذج AI مدرباً أو تحكماً إنتاجياً." data-en="autonomousRecommendation=true, but autoApply=false and humanApprovalRequired=true. Forecasting is a deterministic baseline, not a trained AI model or production control loop.">autonomousRecommendation=true ولكن autoApply=false وhumanApprovalRequired=true. التنبؤ baseline حتمي وليس نموذج AI مدرباً أو تحكماً إنتاجياً.</div>
    <h3 data-ar="انتشار الخطر المتوقع" data-en="Predicted risk propagation">انتشار الخطر المتوقع</h3>
    <div class="table-wrap coverage-table"><table><thead><tr><th>Horizon</th><th>Avg Risk</th><th>Max Risk</th><th>High/Critical</th><th>Emerging</th></tr></thead><tbody id="predictiveForecastRows"></tbody></table></div>
    <h3 data-ar="ترتيب خطط التدخل" data-en="Intervention-plan ranking">ترتيب خطط التدخل</h3>
    <div class="table-wrap coverage-table"><table><thead><tr><th>Rank</th><th>Candidate</th><th>Robust Score</th><th>Mean</th><th>Worst</th><th>Penalty</th></tr></thead><tbody id="predictiveCandidateRows"></tbody></table></div>`;
  anchor?.insertAdjacentElement('beforebegin',section);
  document.title='Smart AI Traffic Platform | Engineering MVP v1.7';
  const brand=document.querySelector('.brand small'); if(brand) brand.textContent='Smart AI Traffic Platform | Engineering MVP v1.7';
  const firstBadge=document.querySelector('.hero .badge'); if(firstBadge) firstBadge.textContent='MVP v1.7';
  const badgeHolder=document.querySelector('.hero article.card > div');
  if(badgeHolder&&!badgeHolder.textContent.includes('Predictive Orchestration')){const badge=document.createElement('span');badge.className='badge';badge.textContent='Predictive Orchestration';badgeHolder.appendChild(badge);}
}

function rnd(seed){ const x=Math.sin(seed*999.91)*43758.5453; return x-Math.floor(x); }
function nodeLabel(id){ const node=state.networkModel?.nodes.find(n=>n.id===id); return state.lang==='ar'?(arabicNodes[id]||node?.name||id):(node?.name||id); }
function edgeName(edge){ return `${nodeLabel(edge.from)} ↔ ${nodeLabel(edge.to)}`; }
function congestionLabel(edge){
  if(edge.closed) return labels[state.lang].closed;
  const load=Number(edge.load||0); return load>78?labels[state.lang].critical:load>62?labels[state.lang].busy:labels[state.lang].flowing;
}
function twinEdge(edgeId){ return state.dynamicRiskTwin?.edges.find(edge=>edge.edgeId===edgeId); }

function refreshDynamicTwin(){
  const previousTwin=state.dynamicRiskTwin;
  state.dynamicRiskTwin=buildDynamicRiskTwin(state.networkModel,state.qcsObservations,{previousTwin,tick:state.tick,unknownQcsRisk:18});
  renderDynamicRiskTwin();
  return state.dynamicRiskTwin;
}

function renderDynamicRiskTwin(){
  if(!state.dynamicRiskTwin) return;
  const s=state.dynamicRiskTwin.summary;
  document.getElementById('twinAvgRisk').textContent=`${s.averageRiskScore}/100`;
  document.getElementById('twinMaxRisk').textContent=`${s.maxRiskScore}/100 · ${s.maxRiskEdge}`;
  document.getElementById('twinCritical').textContent=s.highOrCriticalCount;
  document.getElementById('twinRising').textContent=s.risingCount;
  document.getElementById('twinQcsCoverage').textContent=`${s.qcsCoveragePercent}%`;
  const tbody=document.getElementById('twinRiskRows'); tbody.innerHTML='';
  state.dynamicRiskTwin.edges.slice(0,8).forEach(item=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td class="id">${item.edgeId}</td><td>${item.score}</td><td>${item.level}</td><td>${item.trend}${item.delta?` (${item.delta>0?'+':''}${item.delta})`:''}</td><td>${Math.round(item.load)}%</td><td>${Math.round(item.incidentSeverity*100)}%</td><td>${item.qcsRiskScore}${item.qcsObserved?'':'*'}</td>`;
    tbody.appendChild(tr);
  });
}

function renderNetwork(){
  const el=document.getElementById('network'); el.innerHTML='';
  state.networkModel.edges.slice(0,12).forEach(edge=>{
    const minutes=edgeTravelMinutes(edge), load=Math.round(edge.load||0), risk=twinEdge(edge.id);
    const speed=Number.isFinite(minutes)?Math.max(8,Math.round(edge.distanceKm/(minutes/60))):0;
    const div=document.createElement('div'); div.className=`segment${edge.closed?' closed':''}`;
    const riskText=risk?` · Twin risk ${risk.score}/100 · ${risk.trend}`:'';
    div.innerHTML=`<h3>${edge.id} · ${edgeName(edge)}</h3><div class="metric">${load}%</div><div class="sub">${labels[state.lang].load} · ${speed} ${labels[state.lang].speed} · ${congestionLabel(edge)}${riskText}</div><div class="bar"><i style="width:${load}%"></i></div>`;
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
  refreshDynamicTwin(); renderNetwork();
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
  logEvent(`${state.lang==='ar'?'مسار زمني محسوب':'Time-only route calculated'}: ${route.edgeIds.join(' → ')}`);
}

function renderPreventiveCommandPlan(){
  const tbody=document.getElementById('riskCommandRows'); tbody.innerHTML='';
  const plan=state.lastCommandPlan;
  if(!plan){ document.getElementById('riskCommandResult').textContent='Command simulator ready.'; return; }
  plan.commands.slice(0,14).forEach(item=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td class="id">${item.edgeId}</td><td>${item.command}</td><td>${item.value}</td><td>${item.priority}</td><td>${item.actuatorConnected?'true':'false'}</td>`;
    tbody.appendChild(tr);
  });
  const s=plan.summary;
  document.getElementById('riskCommandResult').innerHTML=`<strong>${s.generatedCommands} ${state.lang==='ar'?'أمر وقائي محاكى':'simulated preventive commands'}</strong><br>${state.lang==='ar'?'مقاطع مرصودة':'Observed segments'}: ${s.observedSegments} · ${state.lang==='ar'?'غير مرصودة':'Unknown'}: ${s.unknownSegments} · ${state.lang==='ar'?'أعلى أولوية':'Highest priority'}: ${s.highestPriority}<br><small>actuatorConnected=false · safetyCertified=false</small>`;
}

function runRiskAwareRoute(){
  if(!state.dynamicRiskTwin) refreshDynamicTwin();
  const origin=document.getElementById('routeOrigin').value, destination=document.getElementById('routeDestination').value;
  const riskWeight=Number(document.getElementById('riskWeight').value||1.8);
  const result=compareConventionalAndTwinRoutes(state.networkModel,state.dynamicRiskTwin,origin,destination,{riskWeight,hardBlockRisk:98});
  state.lastRiskRouteComparison=result;
  const box=document.getElementById('riskRouteResult');
  if(!result.conventional.reachable||!result.twinRoute.reachable){ box.textContent=labels[state.lang].unreachable; state.lastCommandPlan=null; renderPreventiveCommandPlan(); return; }
  state.lastCommandPlan=buildPreventiveCommandPlan(result.twinRoute,state.qcsObservations);
  const c=result.conventional, r=result.twinRoute, d=result.delta;
  document.getElementById('riskTimeDelta').textContent=`${d.minutes>=0?'+':''}${d.minutes.toFixed(1)} min`;
  document.getElementById('riskScoreDelta').textContent=`${d.averageRiskScore>=0?'+':''}${d.averageRiskScore.toFixed(1)}`;
  document.getElementById('riskRouteMaxRisk').textContent=`${r.maxTwinRisk}/100`;
  document.getElementById('riskCommandCount').textContent=state.lastCommandPlan.summary.generatedCommands;
  box.innerHTML=`<strong>${state.lang==='ar'?'المسار التقليدي':'Conventional'}: ${c.minutes.toFixed(1)} min · twin risk ${c.averageTwinRisk}/100</strong><br>${c.edgeIds.join(' → ')}<br><strong>${state.lang==='ar'?'مسار التوأم الديناميكي':'Dynamic-twin route'}: ${r.minutes.toFixed(1)} min · twin risk ${r.averageTwinRisk}/100</strong><br>${r.edgeIds.join(' → ')}<br><span>riskWeight=${riskWeight} · ${r.method}</span><br><small>SIMULATION · shared dynamic twin state</small>`;
  renderPreventiveCommandPlan();
  logEvent(`${state.lang==='ar'?'مسار التوأم الديناميكي':'Dynamic-twin route'}: ${r.edgeIds.join(' → ')}`);
}

function runTwinDecisionBundle(){
  if(!state.dynamicRiskTwin) refreshDynamicTwin();
  const origin=document.getElementById('routeOrigin').value, destination=document.getElementById('routeDestination').value, target=document.getElementById('emergencyTarget').value;
  const riskWeight=Number(document.getElementById('riskWeight').value||1.8);
  const bundle=buildTwinDecisionBundle(state.networkModel,state.dynamicRiskTwin,state.fleet,origin,destination,target,{routeRiskWeight:riskWeight,emergencyRiskWeight:1.2});
  state.lastTwinDecisionBundle=bundle;
  const route=bundle.route.twinRoute;
  const signals=bundle.signals.phases.map(p=>`${p.id}:${p.greenSeconds.toFixed(0)}s`).join(' · ');
  const emergency=bundle.emergency.selected;
  document.getElementById('twinDecisionResult').innerHTML=`<strong>${state.lang==='ar'?'قرارات من حالة مخاطر واحدة':'Decisions from one shared risk state'}</strong><br>${state.lang==='ar'?'المسار':'Route'}: ${route.reachable?route.edgeIds.join(' → '):labels[state.lang].unreachable}<br>${state.lang==='ar'?'الإشارات':'Signals'}: ${signals}<br>${state.lang==='ar'?'الطوارئ':'Emergency'}: ${emergency?`${emergency.unit.id} · ${emergency.route.minutes.toFixed(1)} min · risk ${emergency.route.averageTwinRisk}/100`:'—'}<br><small>SIMULATION · ${state.dynamicRiskTwin.method}</small>`;
  logEvent(state.lang==='ar'?'تشغيل حزمة قرارات التوأم الديناميكي':'Dynamic twin decision bundle executed');
}

function runPredictiveOrchestration(){
  if(!state.dynamicRiskTwin) refreshDynamicTwin();
  const origin=document.getElementById('routeOrigin').value, destination=document.getElementById('routeDestination').value, target=document.getElementById('emergencyTarget').value;
  const riskWeight=Number(document.getElementById('riskWeight').value||1.8);
  const result=orchestratePredictiveRisk(state.networkModel,state.qcsObservations,state.fleet,origin,destination,target,{currentTwin:state.dynamicRiskTwin,routeRiskWeight:riskWeight,horizons:[5,15,30,60]});
  state.lastPredictiveOrchestration=result;
  const selected=result.selected;
  const finalFrame=result.forecast.timeline.at(-1);
  document.getElementById('predictiveSelected').textContent=selected.candidate.label;
  document.getElementById('predictiveImprovement').textContent=result.improvementVsBaseline===null?'—':`${result.improvementVsBaseline>=0?'+':''}${result.improvementVsBaseline}`;
  document.getElementById('predictiveWorst').textContent=selected.worstHorizonScore;
  document.getElementById('predictiveHotspots').textContent=finalFrame.hotspots.length;
  document.getElementById('predictiveResult').innerHTML=`<strong>${state.lang==='ar'?'التوصية الذاتية المحاكاة':'Simulated autonomous recommendation'}: ${selected.candidate.label}</strong><br>Robust score ${selected.robustScore} · mean ${selected.weightedMeanScore} · worst ${selected.worstHorizonScore}<br>${state.lang==='ar'?'لقطة التوأم':'Twin snapshot'}: tick ${result.forecast.currentTwin.tick} · horizons ${result.forecast.horizons.join('/')} min<br><small>trainedModel=false · autoApply=false · humanApprovalRequired=true · productionControlConnected=false</small>`;
  const forecastRows=document.getElementById('predictiveForecastRows'); forecastRows.innerHTML='';
  result.forecast.timeline.forEach(frame=>{
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${frame.horizonMinutes} min</td><td>${frame.summary.averageRiskScore}</td><td>${frame.summary.maxRiskScore}</td><td>${frame.summary.highOrCriticalCount}</td><td>${frame.summary.emergingHotspots}</td>`; forecastRows.appendChild(tr);
  });
  const candidateRows=document.getElementById('predictiveCandidateRows'); candidateRows.innerHTML='';
  result.rankedCandidates.forEach((item,index)=>{
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${index+1}</td><td>${item.label}</td><td>${item.robustScore}</td><td>${item.weightedMeanScore}</td><td>${item.worstHorizonScore}</td><td>${item.interventionPenalty}</td>`; candidateRows.appendChild(tr);
  });
  logEvent(`${state.lang==='ar'?'التنظيم الاستباقي أوصى':'Predictive orchestrator recommended'}: ${selected.candidate.id}`);
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
  refreshDynamicTwin(); renderNetwork(); renderComparison(comparison); populateEngineeringSelectors(); runRoute(); runRiskAwareRoute(); runTwinDecisionBundle();
  const name=state.lang==='ar'?scenario.name_ar:scenario.name_en;
  document.getElementById('scenarioResult').textContent=`${name} · Stress ${result.metrics.stressIndex.toFixed(1)} · Avg load ${result.metrics.avgLoad.toFixed(1)}% · Incidents ${result.metrics.incidentCount}`;
  document.getElementById('comparisonNote').textContent=state.lang==='ar'?'المقارنة أدناه بين حالة السيناريو وخطة تدخل محاكاة محددة وليست نتيجة ميدانية.':'The comparison below is between the scenario state and a deterministic simulated mitigation plan, not a field result.';
  logEvent(`${state.lang==='ar'?'تشغيل سيناريو':'Scenario executed'}: ${name}`);
}

function applyPendingIntervention(){
  if(!state.pendingIntervention) runScenario();
  state.networkModel=JSON.parse(JSON.stringify(state.pendingIntervention)); refreshDynamicTwin(); renderNetwork(); runRoute(); runRiskAwareRoute(); runTwinDecisionBundle();
  logEvent(labels[state.lang].applied);
}

function runForecast(){
  const horizon=Number(document.getElementById('forecastHorizon').value||15);
  const result=shortHorizonForecast(state.networkModel,{horizonMinutes:horizon}); state.lastForecast=result;
  document.getElementById('forecastResult').innerHTML=`<strong>${horizon} min</strong><br>Stress ${result.before.stressIndex.toFixed(1)} → ${result.forecast.stressIndex.toFixed(1)}<br>Avg load ${result.before.avgLoad.toFixed(1)}% → ${result.forecast.avgLoad.toFixed(1)}%<br><span>${result.method}</span>`;
  logEvent(`${state.lang==='ar'?'تنبؤ قصير المدى':'Short-horizon forecast'}: ${horizon} min`);
}

function dispatchEmergency(){
  if(!state.dynamicRiskTwin) refreshDynamicTwin();
  const target=document.getElementById('emergencyTarget').value;
  const dispatch=planTwinEmergencyDispatch(state.networkModel,state.fleet,target,state.dynamicRiskTwin,{riskWeight:1.2});
  const box=document.getElementById('dispatchResult');
  if(!dispatch.selected){ box.textContent=state.lang==='ar'?'لا توجد وحدة متاحة بمسار قابل للوصول.':'No available unit has a reachable route.'; return; }
  const {unit,route}=dispatch.selected;
  box.innerHTML=`<strong>${unit.id} · ${unit.type}</strong><br>${route.minutes.toFixed(1)} min · ${route.distanceKm.toFixed(1)} km · twin risk ${route.averageTwinRisk}/100<br>${route.nodes.map(nodeLabel).join(' → ')}<br><span>${dispatch.evaluatedUnits} units evaluated · ${dispatch.method} · SIMULATION</span>`;
  logEvent(`${state.lang==='ar'?'اختيار وحدة طوارئ واعٍ بالمخاطر':'Risk-aware emergency unit selected'}: ${unit.id}`);
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
  renderQcsRiskTable(); refreshDynamicTwin(); renderNetwork();
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
    if(!state.dynamicRiskTwin) refreshDynamicTwin();
    const plan=recommendTwinSignalPlan(state.networkModel,state.dynamicRiskTwin,{topCount:4,cycleSeconds:100,lostSeconds:12,minGreenSeconds:8});
    const text=plan.phases.map(p=>`${p.id}:${p.greenSeconds.toFixed(0)}s`).join(' · ');
    document.getElementById('engineeringOutput').textContent=`Dynamic-twin signal plan · ${text}`; logEvent(text); return;
  }
  if(action==='reroute'){ runRoute(); runRiskAwareRoute(); return; }
  if(action==='emergency'){ dispatchEmergency(); return; }
  if(action==='qtos'){ runPredictiveOrchestration(); document.getElementById('engineeringOutput').textContent=`Predictive orchestration · ${state.lastPredictiveOrchestration.selected.candidate.label} · robust ${state.lastPredictiveOrchestration.selected.robustScore}`; return; }
}

function injectIncident(){
  const edgeId=document.getElementById('incidentEdge').value;
  state.networkModel=applyIncident(state.networkModel,edgeId,{severity:.9,close:document.getElementById('closeEdge').checked,loadIncrease:18});
  refreshDynamicTwin(); renderNetwork(); runRoute(); runRiskAwareRoute(); runTwinDecisionBundle(); logEvent(`${state.lang==='ar'?'حادث محاكى':'Simulated incident'}: ${edgeId}`);
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
  snapshot.dynamicRiskTwin=state.dynamicRiskTwin?{simulation:true,method:state.dynamicRiskTwin.method,summary:state.dynamicRiskTwin.summary,topEdges:state.dynamicRiskTwin.edges.slice(0,8)}:null;
  snapshot.riskAwareRouting=state.lastRiskRouteComparison?{simulation:true,delta:state.lastRiskRouteComparison.delta,twinRoute:state.lastRiskRouteComparison.twinRoute}:null;
  snapshot.preventiveCommandPlan=state.lastCommandPlan?{simulation:true,actuatorConnected:false,summary:state.lastCommandPlan.summary}:null;
  snapshot.twinDecisionBundle=state.lastTwinDecisionBundle?{simulation:true,route:state.lastTwinDecisionBundle.route,signals:state.lastTwinDecisionBundle.signals,emergency:state.lastTwinDecisionBundle.emergency}:null;
  snapshot.predictiveOrchestration=state.lastPredictiveOrchestration?{simulation:true,method:state.lastPredictiveOrchestration.method,rankedCandidates:state.lastPredictiveOrchestration.rankedCandidates,selected:{candidate:state.lastPredictiveOrchestration.selected.candidate,robustScore:state.lastPredictiveOrchestration.selected.robustScore},forecast:state.lastPredictiveOrchestration.forecast.timeline.map(frame=>({horizonMinutes:frame.horizonMinutes,summary:frame.summary,hotspots:frame.hotspots.slice(0,5)})),autoApply:false,humanApprovalRequired:true}:null;
  downloadFile('smart-traffic-operational-snapshot.json',JSON.stringify(snapshot,null,2),'application/json'); logEvent('Operational snapshot exported');
}
function exportCoverage(){ downloadFile('smart-traffic-feature-coverage.csv',coverageToCsv(state.coverageRows),'text/csv;charset=utf-8'); logEvent('Coverage matrix exported'); }

function translate(){
  const isAr=state.lang==='ar'; document.documentElement.lang=state.lang; document.documentElement.dir=isAr?'rtl':'ltr';
  document.querySelectorAll('[data-ar][data-en]').forEach(el=>el.textContent=el.dataset[state.lang]);
  document.getElementById('langBtn').textContent=isAr?'English':'العربية'; document.getElementById('pauseBtn').textContent=state.running?labels[state.lang].pause:labels[state.lang].resume;
  document.querySelectorAll('[data-action]').forEach(b=>b.textContent=labels[state.lang].run); document.getElementById('routeBtn').textContent=labels[state.lang].route; document.getElementById('riskRouteBtn').textContent=labels[state.lang].riskRoute; document.getElementById('forecastBtn').textContent=labels[state.lang].forecast; document.getElementById('dispatchBtn').textContent=labels[state.lang].dispatch; document.getElementById('qcsRiskBtn').textContent=labels[state.lang].qcs; document.getElementById('twinDecisionBtn').textContent=labels[state.lang].twin; document.getElementById('predictiveBtn').textContent=labels[state.lang].predictive;
  rebuildCategories(); populateScenarios(); populateEngineeringSelectors(); renderFeatures(); renderCoverage(); renderDynamicRiskTwin(); renderNetwork(); if(state.qcsResult) runQcsRisk(); if(state.lastRiskRouteComparison) runRiskAwareRoute(); if(state.lastTwinDecisionBundle) runTwinDecisionBundle(); if(state.lastPredictiveOrchestration) runPredictiveOrchestration();
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
  populateScenarios(); populateEngineeringSelectors(); rebuildCategories(); renderFeatures(); renderCoverage(); refreshDynamicTwin(); renderNetwork(); runRoute(); runForecast(); dispatchEmergency(); runScenario(); runQcsRisk(); runRiskAwareRoute(); runTwinDecisionBundle(); runPredictiveOrchestration();
  logEvent(state.lang==='ar'?'تم تحميل التوأم الديناميكي وطبقة التنبؤ والتنظيم الاستباقي':'Dynamic risk twin, predictive risk and autonomous recommendation orchestration loaded'); setInterval(updateSim,1600);
}

ensurePredictiveUi();
document.getElementById('langBtn').onclick=()=>{state.lang=state.lang==='ar'?'en':'ar';translate()};
document.getElementById('pauseBtn').onclick=()=>{state.running=!state.running;translate();logEvent(state.running?'Simulation resumed':'Simulation paused')};
document.getElementById('optimizeBtn').onclick=()=>intervene('qtos');
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>intervene(b.dataset.action));
document.getElementById('routeBtn').onclick=runRoute; document.getElementById('riskRouteBtn').onclick=runRiskAwareRoute; document.getElementById('riskWeight').onchange=()=>{runRiskAwareRoute();runTwinDecisionBundle();runPredictiveOrchestration()}; document.getElementById('scenarioBtn').onclick=runScenario; document.getElementById('forecastBtn').onclick=runForecast; document.getElementById('dispatchBtn').onclick=dispatchEmergency; document.getElementById('qcsRiskBtn').onclick=runQcsRisk; document.getElementById('twinDecisionBtn').onclick=()=>{refreshDynamicTwin();renderNetwork();runRiskAwareRoute();runTwinDecisionBundle()}; document.getElementById('predictiveBtn').onclick=runPredictiveOrchestration;
document.getElementById('incidentBtn').onclick=injectIncident; document.getElementById('applyInterventionBtn').onclick=applyPendingIntervention;
document.getElementById('resetNetworkBtn').onclick=()=>{state.networkModel=JSON.parse(JSON.stringify(state.baseNetwork));state.pendingIntervention=null;state.lastComparison=null;state.dynamicRiskTwin=null;refreshDynamicTwin();populateEngineeringSelectors();renderNetwork();runRoute();runRiskAwareRoute();runTwinDecisionBundle();runPredictiveOrchestration();logEvent(state.lang==='ar'?'إعادة ضبط الشبكة والتوأم':'Network and twin reset')};
document.getElementById('exportSnapshotBtn').onclick=exportSnapshot; document.getElementById('exportCoverageBtn').onclick=exportCoverage;
['search','groupFilter','categoryFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='search'?'input':'change',renderFeatures));
document.getElementById('coverageSearch').addEventListener('input',renderCoverage); document.getElementById('coverageStatus').addEventListener('change',renderCoverage);
load().catch(err=>{console.error(err);document.getElementById('timeline').innerHTML=`<div class="event"><p>${err.message}</p></div>`});