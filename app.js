import { applyIncident, chooseBestScenario, edgeTravelMinutes, networkMetrics, optimizeSignalPlan, shortestPath, simulateScenario } from './engine/trafficEngine.js';

const state={lang:'ar',running:true,features:[],baseNetwork:null,networkModel:null,tick:0};
const labels={
  ar:{run:'تشغيل',pause:'إيقاف المحاكاة',resume:'استئناف المحاكاة',load:'الحمل',speed:'كم/س',route:'احسب المسار',unreachable:'لا يوجد مسار متاح'},
  en:{run:'Run',pause:'Pause simulation',resume:'Resume simulation',load:'Load',speed:'km/h',route:'Calculate route',unreachable:'No route available'}
};
function rnd(seed){const x=Math.sin(seed*999.91)*43758.5453;return x-Math.floor(x)}
function edgeName(edge){const a=state.networkModel.nodes.find(n=>n.id===edge.from)?.name||edge.from;const b=state.networkModel.nodes.find(n=>n.id===edge.to)?.name||edge.to;return `${a} ↔ ${b}`}
function renderNetwork(){
  const el=document.getElementById('network');el.innerHTML='';
  state.networkModel.edges.slice(0,12).forEach(edge=>{
    const minutes=edgeTravelMinutes(edge);const load=Math.round(edge.load||0);
    const speed=Math.max(8,Math.round(edge.distanceKm/(minutes/60)));
    const congestion=edge.closed?'CLOSED':load>78?'Critical':load>62?'Busy':'Flowing';
    const div=document.createElement('div');div.className='segment';
    div.innerHTML=`<h3>${edgeName(edge)}</h3><div class="metric">${load}%</div><div class="sub">${labels[state.lang].load} · ${speed} ${labels[state.lang].speed} · ${congestion}</div><div class="bar"><i style="width:${load}%"></i></div>`;
    el.appendChild(div);
  });
  renderMetrics();
}
function renderMetrics(){
  const m=networkMetrics(state.networkModel);
  document.getElementById('networkLoad').textContent=`${Math.round(m.avgLoad)}%`;
  document.getElementById('predictedDelay').textContent=m.avgEdgeMinutes.toFixed(1);
  document.getElementById('activeIncidents').textContent=m.criticalEdges;
  const stress=document.getElementById('stressIndex');if(stress)stress.textContent=m.stressIndex.toFixed(1);
}
function updateSim(){
  if(!state.running)return;state.tick++;
  state.networkModel.edges.forEach((edge,i)=>{if(edge.closed)return;const drift=Math.round((rnd(state.tick*7+i)-.5)*7);edge.load=Math.max(15,Math.min(96,(edge.load||0)+drift));});
  renderNetwork();
}
function logEvent(text){const line=document.createElement('div');line.className='event';line.innerHTML=`<time>${new Date().toLocaleTimeString()}</time><p>${text}</p>`;const tl=document.getElementById('timeline');tl.prepend(line);while(tl.children.length>10)tl.lastChild.remove();}
function runRoute(){
  const origin=document.getElementById('routeOrigin').value;const destination=document.getElementById('routeDestination').value;
  const route=shortestPath(state.networkModel,origin,destination);
  const box=document.getElementById('routeResult');
  if(!route.reachable){box.textContent=labels[state.lang].unreachable;return;}
  const nodeMap=new Map(state.networkModel.nodes.map(n=>[n.id,n.name]));
  box.innerHTML=`<strong>${route.minutes.toFixed(1)} min · ${route.distanceKm.toFixed(1)} km</strong><br>${route.nodes.map(n=>nodeMap.get(n)).join(' → ')}<br><span>${route.edgeIds.join(' · ')}</span>`;
  logEvent(`${state.lang==='ar'?'مسار محسوب':'Route calculated'}: ${route.edgeIds.join(' → ')}`);
}
function runScenario(){
  const name=document.getElementById('scenarioSelect').value;
  const scenarios={normal:{demandMultiplier:1},rush:{demandMultiplier:1.35},event:{demandMultiplier:1.25,incidentEdgeId:'E04',incidentSeverity:.6},storm:{demandMultiplier:1.12,incidentEdgeId:'E09',incidentSeverity:.85}};
  const result=simulateScenario(state.baseNetwork,scenarios[name]);state.networkModel=result.network;renderNetwork();
  document.getElementById('scenarioResult').textContent=`Stress ${result.metrics.stressIndex.toFixed(1)} · Avg load ${result.metrics.avgLoad.toFixed(1)}% · Critical ${result.metrics.criticalEdges}`;
  populateEngineeringSelectors();logEvent(`${state.lang==='ar'?'تشغيل سيناريو':'Scenario executed'}: ${name}`);
}
function intervene(action){
  if(action==='signals'){
    const busiest=[...state.networkModel.edges].sort((a,b)=>(b.load||0)-(a.load||0)).slice(0,4);
    const plan=optimizeSignalPlan(busiest.map(e=>({id:e.id,load:e.load})),{cycleSeconds:100,lostSeconds:12,minGreenSeconds:8});
    const text=plan.phases.map(p=>`${p.id}:${p.greenSeconds.toFixed(0)}s`).join(' · ');document.getElementById('engineeringOutput').textContent=`Adaptive signal plan · ${text}`;logEvent(text);return;
  }
  if(action==='reroute'){runRoute();return;}
  if(action==='emergency'){
    const route=shortestPath(state.networkModel,'N9','N4',{priorityEdgeIds:['E11','E08','E17']});document.getElementById('engineeringOutput').textContent=`Emergency corridor · ${route.edgeIds.join(' → ')} · ${route.minutes.toFixed(1)} min`;logEvent('Emergency-priority route simulated');return;
  }
  if(action==='qtos'){
    const candidates=[.86,.92,1].map(multiplier=>simulateScenario(state.networkModel,{demandMultiplier:multiplier}));
    const best=chooseBestScenario(candidates);state.networkModel=best.network;renderNetwork();document.getElementById('engineeringOutput').textContent=`QTOS candidate selected · stress ${best.metrics.stressIndex.toFixed(1)}`;logEvent('QTOS scenario comparison completed');
  }
}
function injectIncident(){
  const edgeId=document.getElementById('incidentEdge').value;state.networkModel=applyIncident(state.networkModel,edgeId,{severity:.9,close:document.getElementById('closeEdge').checked,loadIncrease:18});renderNetwork();runRoute();logEvent(`${state.lang==='ar'?'حادث محاكى':'Simulated incident'}: ${edgeId}`);
}
function groupTag(g){return {verified_historical:['verified','Verified'],conversation_recovered:['recovered','Recovered'],additional_history:['history','History'],qtos:['qtos','QTOS']}[g]||['',''];}
function renderFeatures(){
  const q=document.getElementById('search').value.trim().toLowerCase(),g=document.getElementById('groupFilter').value,c=document.getElementById('categoryFilter').value,rows=document.getElementById('featureRows');rows.innerHTML='';
  state.features.filter(f=>{const hay=`${f.id} ${f.title_ar} ${f.title_en} ${f.category_ar} ${f.category_en} ${f.description_ar} ${f.description_en}`.toLowerCase();return(!q||hay.includes(q))&&(!g||f.group===g)&&(!c||(state.lang==='ar'?f.category_ar:f.category_en)===c)}).forEach(f=>{const[cls,txt]=groupTag(f.group);const tr=document.createElement('tr');tr.innerHTML=`<td class="id">${f.id}</td><td class="title-ar">${f.title_ar}</td><td>${f.title_en}</td><td>${state.lang==='ar'?f.category_ar:f.category_en}</td><td class="desc">${state.lang==='ar'?f.description_ar:f.description_en}</td><td><span class="tag ${cls}">${txt}</span></td>`;rows.appendChild(tr)});
  document.getElementById('featureCount').textContent=state.features.length;
}
function rebuildCategories(){const sel=document.getElementById('categoryFilter'),current=sel.value,cats=[...new Set(state.features.map(f=>state.lang==='ar'?f.category_ar:f.category_en))].sort((a,b)=>a.localeCompare(b));sel.innerHTML=`<option value="">${state.lang==='ar'?'كل الفئات':'All categories'}</option>`+cats.map(c=>`<option>${c}</option>`).join('');if(cats.includes(current))sel.value=current;}
function populateEngineeringSelectors(){
  const opts=state.networkModel.nodes.map(n=>`<option value="${n.id}">${n.name}</option>`).join('');
  const origin=document.getElementById('routeOrigin'),dest=document.getElementById('routeDestination');const oldO=origin.value||'N1',oldD=dest.value||'N8';origin.innerHTML=opts;dest.innerHTML=opts;origin.value=oldO;dest.value=oldD;
  const edgeSel=document.getElementById('incidentEdge');const oldE=edgeSel.value||'E09';edgeSel.innerHTML=state.networkModel.edges.map(e=>`<option value="${e.id}">${e.id} · ${edgeName(e)}</option>`).join('');edgeSel.value=oldE;
}
function translate(){const isAr=state.lang==='ar';document.documentElement.lang=state.lang;document.documentElement.dir=isAr?'rtl':'ltr';document.querySelectorAll('[data-ar][data-en]').forEach(el=>el.textContent=el.dataset[state.lang]);document.getElementById('langBtn').textContent=isAr?'English':'العربية';document.getElementById('pauseBtn').textContent=state.running?labels[state.lang].pause:labels[state.lang].resume;document.querySelectorAll('[data-action]').forEach(b=>b.textContent=labels[state.lang].run);document.getElementById('routeBtn').textContent=labels[state.lang].route;rebuildCategories();renderFeatures();renderNetwork();}
async function load(){
  const featurePaths=['data/verified_1_10.json','data/verified_200_237.json','data/conversation_recovered.json','data/additional_history.json','data/qtos.json'];
  const [datasets,network]=await Promise.all([Promise.all(featurePaths.map(async p=>{const r=await fetch(p);if(!r.ok)throw new Error(`Failed ${p}`);return r.json()})),fetch('data/network.json').then(r=>r.json())]);
  state.features=datasets.flat();state.baseNetwork=JSON.parse(JSON.stringify(network));state.networkModel=network;populateEngineeringSelectors();rebuildCategories();renderFeatures();renderNetwork();runRoute();logEvent(state.lang==='ar'?'تم تحميل محرك الشبكة والسجل الموحد':'Traffic engine and registry loaded');setInterval(updateSim,1600);
}
document.getElementById('langBtn').onclick=()=>{state.lang=state.lang==='ar'?'en':'ar';translate()};
document.getElementById('pauseBtn').onclick=()=>{state.running=!state.running;translate();logEvent(state.running?'Simulation resumed':'Simulation paused')};
document.getElementById('optimizeBtn').onclick=()=>intervene('qtos');
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>intervene(b.dataset.action));
document.getElementById('routeBtn').onclick=runRoute;document.getElementById('scenarioBtn').onclick=runScenario;document.getElementById('incidentBtn').onclick=injectIncident;document.getElementById('resetNetworkBtn').onclick=()=>{state.networkModel=JSON.parse(JSON.stringify(state.baseNetwork));populateEngineeringSelectors();renderNetwork();runRoute();logEvent('Network reset')};
['search','groupFilter','categoryFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='search'?'input':'change',renderFeatures));
load().catch(err=>{console.error(err);document.getElementById('timeline').innerHTML=`<div class="event"><p>${err.message}</p></div>`});
