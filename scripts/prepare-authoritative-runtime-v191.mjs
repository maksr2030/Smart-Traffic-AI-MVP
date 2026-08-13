import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.argv[2] || 'site';
const appPath = join(root, 'app.js');
let source = await readFile(appPath, 'utf8');

function replaceRegex(re, replacement, label) {
  if (!re.test(source)) throw new Error(`Missing authoritative migration anchor: ${label}`);
  source = source.replace(re, replacement);
}

const coverageImport = "import { buildCoverage, coverageSummary, coverageToCsv } from './coverage/coverageModel.js';";
if (!source.includes(coverageImport)) throw new Error('Missing authoritative migration anchor: coverage import');
source = source.replace(coverageImport, `${coverageImport}\nimport {\n  dispatchAuthoritativeEvent,\n  getAuthoritativeState,\n  initializeAuthoritativeRuntime,\n  isAuthoritativeRuntimeReady,\n  subscribeAuthoritativeState\n} from './engine/authoritativeRuntimeStore.js';`);

const rndAnchor = 'function rnd(seed){ const x=Math.sin(seed*999.91)*43758.5453; return x-Math.floor(x); }';
if (!source.includes(rndAnchor)) throw new Error('Missing authoritative migration anchor: rnd');
source = source.replace(rndAnchor, `function syncLegacyStateFromAuthority(){
  if(!isAuthoritativeRuntimeReady()) return null;
  const live=getAuthoritativeState();
  state.networkModel=live.network;
  state.baseNetwork=live.baseNetwork;
  state.qcsObservations=live.qcsObservations;
  state.fleet=live.fleet;
  state.dynamicRiskTwin=live.dynamicRiskTwin;
  state.lastPredictiveOrchestration=live.predictiveOrchestration;
  state.currentScenario=live.scenarioId;
  state.tick=live.tick;
  state.running=live.running;
  return live;
}

function dispatchRuntimeEvent(type,payload={},sourceName='app.js'){
  const live=dispatchAuthoritativeEvent({type,payload,source:sourceName});
  syncLegacyStateFromAuthority();
  window.dispatchEvent(new CustomEvent('smart-traffic:state-changed',{detail:{revision:live.revision,sequence:live.sequence,type}}));
  return live;
}

function syncDecisionInputsFromUi(sourceName='decision_inputs_ui'){
  if(!isAuthoritativeRuntimeReady()) return null;
  return dispatchRuntimeEvent('decision_inputs_updated',{
    routeParameters:{
      origin:document.getElementById('routeOrigin')?.value||'N1',
      destination:document.getElementById('routeDestination')?.value||'N8',
      routeRiskWeight:Number(document.getElementById('riskWeight')?.value||1.8)
    },
    emergencyTarget:document.getElementById('emergencyTarget')?.value||'N10'
  },sourceName);
}

${rndAnchor}`);

replaceRegex(/function refreshDynamicTwin\(\)\{[\s\S]*?\n\}\n\nfunction renderDynamicRiskTwin/,
`function refreshDynamicTwin(){
  const previousTwin=state.dynamicRiskTwin;
  const twin=buildDynamicRiskTwin(state.networkModel,state.qcsObservations,{previousTwin,tick:state.tick,unknownQcsRisk:18});
  if(isAuthoritativeRuntimeReady()) dispatchRuntimeEvent('twin_updated',{twin},'refreshDynamicTwin');
  else state.dynamicRiskTwin=twin;
  renderDynamicRiskTwin();
  return state.dynamicRiskTwin;
}

function renderDynamicRiskTwin`, 'refreshDynamicTwin');

replaceRegex(/function updateSim\(\)\{[\s\S]*?\n\}\n\nfunction logEvent/,
`function updateSim(){
  if(!state.running||!isAuthoritativeRuntimeReady()) return;
  const nextTick=Number(state.tick||0)+1;
  const deltas={};
  state.networkModel.edges.forEach((edge,i)=>{
    if(edge.closed) return;
    deltas[edge.id]=Math.round((rnd(nextTick*7+i)-.5)*5);
  });
  dispatchRuntimeEvent('traffic_drift_applied',{tick:nextTick,deltas},'simulation_tick');
  refreshDynamicTwin(); renderNetwork();
}

function logEvent`, 'updateSim');

replaceRegex(/const result=orchestratePredictiveRisk\(([^\n]+)\);\n  state\.lastPredictiveOrchestration=result;/,
`const result=orchestratePredictiveRisk($1);\n  dispatchRuntimeEvent('predictive_updated',{orchestration:result},'runPredictiveOrchestration');`, 'predictive assignment');

replaceRegex(/state\.currentScenario=id; state\.networkModel=result\.network; state\.pendingIntervention=intervention; state\.lastComparison=comparison;/,
`dispatchRuntimeEvent('scenario_loaded',{network:result.network,scenarioId:id,tick:0},'runScenario'); state.pendingIntervention=intervention; state.lastComparison=comparison;`, 'scenario mutation');

replaceRegex(/function applyPendingIntervention\(\)\{[\s\S]*?\n\}\n\nfunction runForecast/,
`function applyPendingIntervention(){
  if(!state.pendingIntervention) runScenario();
  if(!state.pendingIntervention) return false;
  dispatchRuntimeEvent('intervention_applied',{network:state.pendingIntervention},'applyPendingIntervention');
  refreshDynamicTwin(); renderNetwork(); runRoute(); runRiskAwareRoute(); runTwinDecisionBundle(); runPredictiveOrchestration();
  logEvent(labels[state.lang].applied);
  return true;
}

function runForecast`, 'pending intervention');

replaceRegex(/function injectIncident\(\)\{[\s\S]*?\n\}\n\nfunction resetNetworkRuntime/,
`function injectIncident(){
  if(!state.networkModel||!isAuthoritativeRuntimeReady()) return false;
  const edgeId=document.getElementById('incidentEdge').value;
  dispatchRuntimeEvent('incident_injected',{edgeId,severity:.9,closed:document.getElementById('closeEdge').checked,loadIncrease:18},'injectIncident');
  refreshDynamicTwin(); renderNetwork(); runRoute(); runRiskAwareRoute(); runTwinDecisionBundle(); runPredictiveOrchestration();
  logEvent(\`${'${'}state.lang==='ar'?'حادث محاكى':'Simulated incident'}: ${'${'}edgeId}\`);
  return true;
}

function resetNetworkRuntime`, 'incident mutation');

replaceRegex(/function resetNetworkRuntime\(\)\{[\s\S]*?\n\}\n\nfunction setSimulationRunning/,
`function resetNetworkRuntime(){
  if(!state.baseNetwork||!isAuthoritativeRuntimeReady()) return false;
  dispatchRuntimeEvent('manual_reset',{network:state.baseNetwork,scenarioId:'normal',tick:0},'resetNetworkRuntime');
  state.pendingIntervention=null; state.lastComparison=null;
  refreshDynamicTwin(); populateEngineeringSelectors(); renderNetwork(); runRoute(); runRiskAwareRoute(); runTwinDecisionBundle(); runPredictiveOrchestration();
  logEvent(state.lang==='ar'?'إعادة ضبط الشبكة والتوأم':'Network and twin reset');
  return true;
}

function setSimulationRunning`, 'reset mutation');

replaceRegex(/function setSimulationRunning\(running\)\{[\s\S]*?\n\}\n\nfunction publishRuntimeApi/,
`function setSimulationRunning(running){
  const desired=Boolean(running);
  if(state.running===desired) return true;
  if(isAuthoritativeRuntimeReady()) dispatchRuntimeEvent('simulation_running_changed',{running:desired},'setSimulationRunning');
  else state.running=desired;
  translate(); logEvent(state.running?'Simulation resumed':'Simulation paused');
  return true;
}

function publishRuntimeApi`, 'running mutation');

replaceRegex(/function publishRuntimeApi\(\)\{[\s\S]*?\n\}\n\nfunction groupTag/,
`function publishRuntimeApi(){
  window.smartTrafficRuntime={
    version:'1.9.1',
    stateAuthority:'unified-state-bus',
    isReady:()=>Boolean(state.baseNetwork&&state.networkModel&&state.features.length&&isAuthoritativeRuntimeReady()),
    getState:()=>{
      if(!isAuthoritativeRuntimeReady()) return {lang:state.lang,running:state.running,currentScenario:state.currentScenario,network:null,baseNetwork:null,scenarios:[],fleet:[],qcsObservations:[],dynamicRiskTwin:null,predictiveOrchestration:null};
      const live=getAuthoritativeState();
      return {
        lang:state.lang,running:live.running,currentScenario:live.scenarioId,tick:live.tick,unifiedRevision:live.revision,
        network:live.network,baseNetwork:live.baseNetwork,scenarios:JSON.parse(JSON.stringify(state.scenarios||[])),
        fleet:live.fleet,qcsObservations:live.qcsObservations,dynamicRiskTwin:live.dynamicRiskTwin,
        predictiveOrchestration:live.predictiveOrchestration,routeParameters:live.routeParameters,
        emergencyTarget:live.emergencyTarget,policy:live.policy
      };
    },
    getUnifiedState:()=>getAuthoritativeState(),
    dispatch:event=>dispatchRuntimeEvent(event.type,event.payload||{},event.source||'external_runtime'),
    subscribe:subscribeAuthoritativeState,
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

function groupTag`, 'runtime API');

const stateAssignment = 'state.coverageRows=buildCoverage(state.features); state.baseNetwork=JSON.parse(JSON.stringify(network)); state.networkModel=network; state.scenarios=scenarios; state.fleet=fleet; state.qcsObservations=qcsObservations;';
if (!source.includes(stateAssignment)) throw new Error('Missing authoritative migration anchor: load state assignment');
source = source.replace(stateAssignment, `${stateAssignment}\n  initializeAuthoritativeRuntime({network,stateAuthority:'unified-state-bus',baseNetwork:state.baseNetwork,qcsObservations,fleet,scenarioId:'normal',tick:0,running:state.running,routeParameters:{origin:'N1',destination:'N8',routeRiskWeight:1.8},emergencyTarget:'N10'}); syncLegacyStateFromAuthority();`);

const riskHandler = "document.getElementById('routeBtn').onclick=runRoute; document.getElementById('riskRouteBtn').onclick=runRiskAwareRoute; document.getElementById('riskWeight').onchange=()=>{runRiskAwareRoute();runTwinDecisionBundle();runPredictiveOrchestration()};";
if (!source.includes(riskHandler)) throw new Error('Missing authoritative migration anchor: risk handler');
source = source.replace(riskHandler, "document.getElementById('routeBtn').onclick=()=>{syncDecisionInputsFromUi('route_button');runRoute()}; document.getElementById('riskRouteBtn').onclick=()=>{syncDecisionInputsFromUi('risk_route_button');runRiskAwareRoute()}; document.getElementById('riskWeight').onchange=()=>{syncDecisionInputsFromUi('risk_weight_changed');runRiskAwareRoute();runTwinDecisionBundle();runPredictiveOrchestration()};");

const incidentHandler = "document.getElementById('incidentBtn').onclick=injectIncident; document.getElementById('applyInterventionBtn').onclick=applyPendingIntervention;";
if (!source.includes(incidentHandler)) throw new Error('Missing authoritative migration anchor: incident handler');
source = source.replace(incidentHandler, `${incidentHandler}\n['routeOrigin','routeDestination','emergencyTarget'].forEach(id=>document.getElementById(id).addEventListener('change',()=>syncDecisionInputsFromUi(\`ui_${'${'}id}_changed\`)));`);

source = source.replaceAll("version:'1.8.3'", "version:'1.9.1'");
source = source.replaceAll("detail:{version:'1.8.3'", "detail:{version:'1.9.1'");

await writeFile(appPath, source, 'utf8');

const built = await readFile(appPath, 'utf8');
for (const contract of [
  'authoritativeRuntimeStore.js',
  "stateAuthority:'unified-state-bus'",
  "'traffic_drift_applied'",
  "'incident_injected'",
  "'scenario_loaded'",
  "'intervention_applied'",
  "'decision_inputs_updated'",
  "'manual_reset'",
  'getUnifiedState',
  'subscribe:subscribeAuthoritativeState'
]) {
  if (!built.includes(contract)) throw new Error(`Authoritative executable contract missing: ${contract}`);
}
if (/state\.networkModel=applyIncident\(/.test(built)) throw new Error('Direct incident mutation survived authoritative migration');
console.log('v1.9.1 authoritative live-state migration applied successfully.');
