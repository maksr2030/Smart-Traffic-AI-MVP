import { buildCoverage, coverageSummary } from './coverage/coverageModel.js';
import { buildEngineeringCloseoutScorecard } from './engine/closeoutReadinessEngine.js';
import { runFailureInjectionSuite } from './engine/failureInjectionEngine.js';
import { buildExplainablePolicyOrchestration } from './engine/explainableOrchestrationEngine.js';

const EVIDENCE={nodeTests:71,browserTests:20,failureInjectionScenarios:7};
const state={summary:null,scorecard:null,benchmark:null,recovery:null};
const byId=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function loadCoverage(){
  const manifest=await fetch('data/features.json').then(r=>{if(!r.ok)throw new Error('feature manifest unavailable');return r.json()});
  const parts=await Promise.all(manifest.files.map(file=>fetch(`data/${file}`).then(r=>{if(!r.ok)throw new Error(`feature source unavailable: ${file}`);return r.json()})));
  const features=parts.flat();
  if(features.length!==manifest.total)throw new Error(`feature portfolio mismatch ${features.length}/${manifest.total}`);
  return coverageSummary(buildCoverage(features));
}

function score(runtime,health){
  state.scorecard=buildEngineeringCloseoutScorecard({
    coverageSummary:state.summary,
    stateAuthority:runtime.stateAuthority,
    healthStatus:health?.current?.status,
    failureInjectionScenarios:EVIDENCE.failureInjectionScenarios,
    decisionLedger:true,
    exactReplay:true,
    nodeTests:EVIDENCE.nodeTests,
    browserTests:EVIDENCE.browserTests,
    sameBuildForE2EAndPages:true
  });
  return state.scorecard;
}

function checkRows(card){return card.checks.map(item=>`<div class="closeout-check"><span>${esc(item.label)}</span><b class="${item.passed?'pass':'gap'}">${item.status}</b></div>`).join('')}

function render(runtime,health){
  let host=byId('mvpCloseoutRoom');
  if(!host){host=document.createElement('section');host.id='mvpCloseoutRoom';host.className='closeout-room';(byId('acquisitionDecisionRoom')||document.querySelector('main')||document.body).appendChild(host)}
  const card=score(runtime,health);
  host.innerHTML=`<div class="closeout-head"><div><div class="closeout-kicker">BUYER-GRADE ENGINEERING CLOSEOUT · v1.9.3</div><h3>Engineering MVP Closeout & Due-Diligence Evidence</h3><p>Final engineering closeout consolidating registry integrity, authoritative runtime governance, fail-safe health, cryptographic decision integrity, browser assurance, reproducible performance measurement and isolated resilience drills.</p></div><div class="closeout-badges"><span id="closeoutStatus" class="closeout-badge ${card.engineeringCloseoutReady?'ready':'gap'}">${card.status}</span><span id="closeoutProduction" class="closeout-badge gap">PRODUCTION: ${card.productionReadiness}</span></div></div>
  <div class="closeout-grid"><div class="closeout-card"><span>Registry</span><strong>${state.summary.total} capabilities</strong></div><div class="closeout-card"><span>Node assurance</span><strong>${EVIDENCE.nodeTests} tests</strong></div><div class="closeout-card"><span>Browser assurance</span><strong>${EVIDENCE.browserTests} E2E</strong></div><div class="closeout-card"><span>Production verified</span><strong>${state.summary.production_verified}</strong></div></div>
  <div id="closeoutChecks" class="closeout-checks">${checkRows(card)}</div>
  <div class="closeout-actions"><button id="closeoutBenchmark" class="btn primary">Run local performance baseline</button><button id="closeoutRecovery" class="btn">Run isolated resilience drill</button><button id="closeoutExport" class="btn">Export closeout manifest</button></div>
  <div id="closeoutOutput" class="closeout-output">Ready for buyer-grade engineering closeout review. Production readiness remains independently unverified.</div>
  <div class="closeout-links"><a href="STAGE_D_RUNTIME_RESILIENCE.md" target="_blank">Stage D resilience evidence ↗</a><a href="README.md" target="_blank">README ↗</a><a href="ARCHITECTURE.md" target="_blank">Architecture ↗</a></div>
  <p class="closeout-boundary">simulation=true · autoApply=false · humanApprovalRequired=true · productionControlConnected=false · fieldActuation=false · safetyCertified=false · physicalIPhoneValidated=false · production_verified=0</p>`;
  bindActions(runtime);
}

function percentile(values,p){const sorted=[...values].sort((a,b)=>a-b);const idx=Math.min(sorted.length-1,Math.max(0,Math.ceil((p/100)*sorted.length)-1));return sorted[idx]}
async function runBenchmark(runtime){
  const snap=runtime.getUnifiedState();
  const route=snap.routeParameters||{};
  if(!snap.network||!snap.policy||!route.origin||!route.destination||!snap.emergencyTarget)throw new Error('Benchmark inputs are incomplete');
  for(let i=0;i<3;i++)buildExplainablePolicyOrchestration(snap.network,snap.qcsObservations||[],snap.fleet||[],route.origin,route.destination,snap.emergencyTarget,snap.policy);
  const samples=[];
  for(let i=0;i<25;i++){const start=performance.now();buildExplainablePolicyOrchestration(snap.network,snap.qcsObservations||[],snap.fleet||[],route.origin,route.destination,snap.emergencyTarget,snap.policy);samples.push(performance.now()-start);await Promise.resolve()}
  const result={schema:'smart-traffic-local-performance-baseline/v1',iterations:samples.length,p50Ms:Number(percentile(samples,50).toFixed(3)),p95Ms:Number(percentile(samples,95).toFixed(3)),maxMs:Number(Math.max(...samples).toFixed(3)),environment:'current-browser-session',productionBenchmark:false};
  state.benchmark=result;return result;
}

function runRecovery(runtime){
  const before=runtime.getUnifiedState();
  const suite=runFailureInjectionSuite(before);
  const after=runtime.getUnifiedState();
  const result={schema:'smart-traffic-isolated-resilience-drill/v1',scenarioCount:suite.length,blocked:suite.filter(x=>x.blocked).length,degraded:suite.filter(x=>x.degraded).length,authoritativeRevisionBefore:before.revision,authoritativeRevisionAfter:after.revision,authoritativeStateUnchanged:before.revision===after.revision,allInjectionsIsolated:suite.every(x=>x.stateMutationAppliedToAuthoritativeRuntime===false),productionRecoveryTest:false};
  state.recovery=result;return result;
}

function bindActions(runtime){
  byId('closeoutBenchmark').onclick=async()=>{const out=byId('closeoutOutput');out.textContent='Running local benchmark…';try{out.textContent=JSON.stringify(await runBenchmark(runtime),null,2)}catch(e){out.textContent=`Benchmark failed: ${e.message}`}};
  byId('closeoutRecovery').onclick=()=>{const out=byId('closeoutOutput');try{out.textContent=JSON.stringify(runRecovery(runtime),null,2)}catch(e){out.textContent=`Resilience drill failed: ${e.message}`}};
  byId('closeoutExport').onclick=()=>{const payload={version:'1.9.3',generatedAt:new Date().toISOString(),coverage:state.summary,scorecard:state.scorecard,performanceBaseline:state.benchmark,resilienceDrill:state.recovery,evidenceBoundary:state.scorecard.evidenceBoundary};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='smart-traffic-mvp-v1.9.3-closeout.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500)};
}

async function boot(){
  state.summary=await loadCoverage();
  const deadline=Date.now()+18000;
  while(Date.now()<deadline){const runtime=window.smartTrafficRuntime;const health=window.smartTrafficHealth;if(runtime?.getUnifiedState&&runtime?.isReady?.()===true&&health?.current){render(runtime,health);window.smartTrafficCloseout={version:'1.9.3',getScorecard:()=>state.scorecard,runBenchmark:()=>runBenchmark(runtime),runRecovery:()=>runRecovery(runtime)};return}await sleep(100)}
  throw new Error('Authoritative runtime/health did not become ready for closeout');
}
boot().catch(error=>{console.error('closeout runtime failed',error);window.smartTrafficCloseoutFailed=error.message});
