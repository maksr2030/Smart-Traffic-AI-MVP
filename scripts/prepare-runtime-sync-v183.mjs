import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.argv[2]||'site';
const file=name=>join(root,name);

async function patch(name,transform){
  const path=file(name); const before=await readFile(path,'utf8'); const after=transform(before);
  if(after===before) throw new Error(`${name}: synchronization patch made no change`);
  await writeFile(path,after,'utf8');
}

function replaceRegex(source,re,replacement,label){
  if(!re.test(source)) throw new Error(`Missing patch anchor: ${label}`);
  return source.replace(re,replacement);
}

await patch('app.js',source=>{
  source=replaceRegex(source,/function injectIncident\(\)\{[\s\S]*?\n\}\n\nfunction groupTag/,
`function injectIncident(){
  if(!state.networkModel) return false;
  const edgeId=document.getElementById('incidentEdge').value;
  state.networkModel=applyIncident(state.networkModel,edgeId,{severity:.9,close:document.getElementById('closeEdge').checked,loadIncrease:18});
  refreshDynamicTwin(); renderNetwork(); runRoute(); runRiskAwareRoute(); runTwinDecisionBundle(); runPredictiveOrchestration();
  logEvent(\`${'${'}state.lang==='ar'?'حادث محاكى':'Simulated incident'}: ${'${'}edgeId}\`);
  return true;
}

function resetNetworkRuntime(){
  if(!state.baseNetwork) return false;
  state.networkModel=JSON.parse(JSON.stringify(state.baseNetwork));
  state.pendingIntervention=null; state.lastComparison=null; state.dynamicRiskTwin=null; state.lastPredictiveOrchestration=null;
  refreshDynamicTwin(); populateEngineeringSelectors(); renderNetwork(); runRoute(); runRiskAwareRoute(); runTwinDecisionBundle(); runPredictiveOrchestration();
  logEvent(state.lang==='ar'?'إعادة ضبط الشبكة والتوأم':'Network and twin reset');
  return true;
}

function setSimulationRunning(running){
  const desired=Boolean(running);
  if(state.running===desired) return true;
  state.running=desired; translate(); logEvent(state.running?'Simulation resumed':'Simulation paused');
  return true;
}

function publishRuntimeApi(){
  window.smartTrafficRuntime={
    version:'1.8.3',
    isReady:()=>Boolean(state.baseNetwork&&state.networkModel&&state.features.length),
    getState:()=>({
      lang:state.lang,running:state.running,currentScenario:state.currentScenario,
      network:state.networkModel?JSON.parse(JSON.stringify(state.networkModel)):null,
      baseNetwork:state.baseNetwork?JSON.parse(JSON.stringify(state.baseNetwork)):null,
      scenarios:JSON.parse(JSON.stringify(state.scenarios||[])),
      fleet:JSON.parse(JSON.stringify(state.fleet||[])),
      qcsObservations:JSON.parse(JSON.stringify(state.qcsObservations||[])),
      dynamicRiskTwin:state.dynamicRiskTwin?JSON.parse(JSON.stringify(state.dynamicRiskTwin)):null,
      predictiveOrchestration:state.lastPredictiveOrchestration?JSON.parse(JSON.stringify(state.lastPredictiveOrchestration)):null
    }),
    setRunning:setSimulationRunning,
    resetNetwork:resetNetworkRuntime,
    injectIncident:(edgeId='E09',close=false)=>{
      if(!state.networkModel) return false;
      const edge=document.getElementById('incidentEdge');
      if(edge&&[...edge.options].some(option=>option.value===edgeId)) edge.value=edgeId;
      const closed=document.getElementById('closeEdge'); if(closed) closed.checked=Boolean(close);
      return injectIncident();
    },
    refreshTwin:()=>{if(!state.networkModel)return false;refreshDynamicTwin();renderNetwork();runRiskAwareRoute();runTwinDecisionBundle();return true;},
    runPredictive:()=>{if(!state.networkModel)return null;runPredictiveOrchestration();return state.lastPredictiveOrchestration;}
  };
}

function groupTag`, 'inject/live-state API');
  source=replaceRegex(source,/document\.getElementById\('pauseBtn'\)\.onclick=\(\)=>\{state\.running=!state\.running;translate\(\);logEvent\(state\.running\?'Simulation resumed':'Simulation paused'\)\};/,"document.getElementById('pauseBtn').onclick=()=>setSimulationRunning(!state.running);",'pause handler');
  source=replaceRegex(source,/document\.getElementById\('resetNetworkBtn'\)\.onclick=\(\)=>\{[^\n]+\};/,"document.getElementById('resetNetworkBtn').onclick=resetNetworkRuntime;",'reset handler');
  const readyAnchor="  logEvent(state.lang==='ar'?'تم تحميل التوأم الديناميكي وطبقة التنبؤ والتنظيم الاستباقي':'Dynamic risk twin, predictive risk and autonomous recommendation orchestration loaded'); setInterval(updateSim,1600);";
  if(!source.includes(readyAnchor)) throw new Error('Missing patch anchor: app ready');
  source=source.replace(readyAnchor,`  publishRuntimeApi();\n  window.smartTrafficAppReady=true; window.smartTrafficAppFailed=null;\n  window.dispatchEvent(new CustomEvent('smart-traffic:ready',{detail:{version:'1.8.3',features:state.features.length}}));\n${readyAnchor}`);
  source=replaceRegex(source,/load\(\)\.catch\(err=>\{console\.error\(err\);document\.getElementById\('timeline'\)\.innerHTML=`<div class="event"><p>\$\{err\.message\}<\/p><\/div>`\}\);/,
`publishRuntimeApi();
window.smartTrafficAppReady=false;
load().catch(err=>{
  console.error(err); window.smartTrafficAppReady=false; window.smartTrafficAppFailed=err.message;
  window.dispatchEvent(new CustomEvent('smart-traffic:failed',{detail:{message:err.message}}));
  document.getElementById('timeline').innerHTML=\`<div class="event"><p>${'${'}err.message}</p></div>\`;
});`,'load failure signal');
  return source;
});

await patch('v18Runtime.js',source=>{
  source=replaceRegex(source,/async function waitForBaseUi\(\) \{[\s\S]*?\n\}\n\nfunction ensureV18Ui/,
`async function waitForBaseUi() {
  for (let attempt=0;attempt<150;attempt+=1) {
    const scenario=document.getElementById('scenarioSelect');
    const origin=document.getElementById('routeOrigin');
    const destination=document.getElementById('routeDestination');
    const target=document.getElementById('emergencyTarget');
    const runtimeReady=window.smartTrafficRuntime?.isReady?.()===true&&window.smartTrafficAppReady===true;
    if(runtimeReady&&scenario?.options.length&&origin?.options.length&&destination?.options.length&&target?.options.length)return true;
    if(window.smartTrafficAppFailed)throw new Error(\`Base traffic runtime failed: ${'${'}window.smartTrafficAppFailed}\`);
    await sleep(100);
  }
  throw new Error('Base traffic runtime did not become ready in time');
}

function ensureV18Ui`, 'v18 readiness');
  source=replaceRegex(source,/async function runV18\(\) \{[\s\S]*?\n\}\n\nasync function init/,
`async function runV18() {
  const fallback=await loadResources();
  const live=window.smartTrafficRuntime?.getState?.();
  const useLive=window.smartTrafficRuntime?.isReady?.()===true&&live?.network;
  const network=useLive?live.network:selectedScenarioNetwork(fallback.network,fallback.scenarios).network;
  const fleet=useLive&&live.fleet?.length?live.fleet:fallback.fleet;
  const observations=useLive&&live.qcsObservations?.length?live.qcsObservations:fallback.observations;
  const policy=fallback.policy;
  const origin=document.getElementById('routeOrigin')?.value||'N1';
  const destination=document.getElementById('routeDestination')?.value||'N8';
  const emergencyTarget=document.getElementById('emergencyTarget')?.value||'N10';
  const riskWeight=Number(document.getElementById('riskWeight')?.value||1.8);
  lastResult=buildExplainablePolicyOrchestration(network,observations,fleet,origin,destination,emergencyTarget,policy,{horizons:[5,15,30,60],routeRiskWeight:riskWeight});
  lastSensitivity=runOrchestrationSensitivity(network,observations,fleet,origin,destination,emergencyTarget,{riskWeights:[0.8,1.8,3.5],horizonSets:[[5,15],[5,15,30,60]]});
  render(lastResult,lastSensitivity);
  window.smartTrafficV18Ready=true;
  window.dispatchEvent(new CustomEvent('smart-traffic:v18-ready',{detail:{liveState:Boolean(useLive)}}));
  return lastResult;
}

async function init`, 'v18 live state');
  source=source.replace("  const ready = await waitForBaseUi();\n  if (!ready) return;","  await waitForBaseUi();");
  source=source.replace("init().catch(error => {\n  console.error(error);","init().catch(error => {\n  window.smartTrafficV18Ready=false;\n  console.error(error);");
  return source;
});

await patch('acquisitionRuntime.js',source=>{
  const marker='async function initAcquisition() {';
  if(!source.includes(marker)) throw new Error('Missing patch anchor: acquisition init');
  source=source.replace(marker,`async function waitForCoreReady(timeoutMs=15000) {
  if(window.smartTrafficRuntime?.isReady?.()===true&&window.smartTrafficAppReady===true)return true;
  const started=Date.now();
  while(Date.now()-started<timeoutMs){
    if(window.smartTrafficRuntime?.isReady?.()===true&&window.smartTrafficAppReady===true)return true;
    if(window.smartTrafficAppFailed)throw new Error(\`Core runtime failed: ${'${'}window.smartTrafficAppFailed}\`);
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error('Core runtime did not become ready in time');
}

${marker}`);
  source=replaceRegex(source,/async function initAcquisition\(\) \{[\s\S]*?initAcquisition\(\)\.catch\(error=>\{ console\.error\('Acquisition presentation layer failed:',error\); \}\);/,
`async function initAcquisition() {
  await Promise.all([loadPortfolio(),waitForCoreReady()]);
  const summary=coverageSummary(ui.coverage);
  addExecutiveNav();addDashboard(summary);addFeatureExplorer();addEntryGate(summary);
  document.querySelectorAll('.acq-jump').forEach(bindJump);
  document.getElementById('langBtn')?.addEventListener('click',()=>setTimeout(translateAcquisition,0));
  new MutationObserver(translateAcquisition).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.smartTrafficAcquisitionReady=true;
  window.dispatchEvent(new CustomEvent('smart-traffic:acquisition-ready',{detail:{features:summary.total}}));
}

initAcquisition().catch(error=>{window.smartTrafficAcquisitionReady=false;console.error('Acquisition presentation layer failed:',error);});`,'acquisition readiness');
  return source;
});

for(const [name,needles] of Object.entries({
  'app.js':['window.smartTrafficRuntime','smart-traffic:ready','resetNetworkRuntime'],
  'v18Runtime.js':['useLive?live.network','smart-traffic:v18-ready'],
  'acquisitionRuntime.js':['waitForCoreReady','smart-traffic:acquisition-ready']
})){
  const text=await readFile(file(name),'utf8');
  for(const needle of needles) if(!text.includes(needle)) throw new Error(`${name}: missing built contract ${needle}`);
}
console.log('v1.8.3 live-state synchronization patch applied successfully.');
