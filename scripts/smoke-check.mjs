import { access, readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('data/features.json','utf8'));
const manifestFiles = manifest.files.map(name => `data/${name}`);
const requiredFiles = [
  'index.html','styles.css','app.js','v18Runtime.js','engine/trafficEngine.js','engine/operationsEngine.js','engine/qcsRiskEngine.js',
  'engine/riskAwareRoutingEngine.js','engine/preventiveCommandEngine.js','engine/dynamicRiskTwinEngine.js','engine/predictiveOrchestrationEngine.js','engine/explainableOrchestrationEngine.js','coverage/coverageModel.js',
  'data/network.json','data/operations_scenarios.json','data/emergency_fleet.json','data/qcs_demo_observations.json','data/orchestration_policy.json','data/features.json',
  ...manifestFiles
];
for (const file of new Set(requiredFiles)) await access(file);

const html = await readFile('index.html','utf8');
const app = await readFile('app.js','utf8');
const v18Runtime = await readFile('v18Runtime.js','utf8');
const predictiveEngine = await readFile('engine/predictiveOrchestrationEngine.js','utf8');
const explainableEngine = await readFile('engine/explainableOrchestrationEngine.js','utf8');
const policy = JSON.parse(await readFile('data/orchestration_policy.json','utf8'));
const network = JSON.parse(await readFile('data/network.json','utf8'));
const scenarios = JSON.parse(await readFile('data/operations_scenarios.json','utf8'));
const fleet = JSON.parse(await readFile('data/emergency_fleet.json','utf8'));
const qcsObservations = JSON.parse(await readFile('data/qcs_demo_observations.json','utf8'));

if (!html.includes('type="module" src="app.js"')) throw new Error('index.html must load app.js as an ES module');
if (!html.includes('type="module" src="v18Runtime.js"')) throw new Error('index.html must load v18Runtime.js as an ES module');
if (!html.includes('href="styles.css"')) throw new Error('styles.css is not linked');
for (const modulePath of ['./engine/operationsEngine.js','./engine/qcsRiskEngine.js','./engine/preventiveCommandEngine.js','./engine/dynamicRiskTwinEngine.js','./engine/predictiveOrchestrationEngine.js','./coverage/coverageModel.js']) {
  if (!app.includes(`'${modulePath}'`)) throw new Error(`app does not import ${modulePath}`);
}
if (!v18Runtime.includes("'./engine/explainableOrchestrationEngine.js'")) throw new Error('v18 runtime must import explainable orchestration engine');
if (!v18Runtime.includes("fetch('data/orchestration_policy.json')")) throw new Error('v18 runtime must load orchestration policy');
if (!app.includes("fetch('data/features.json')")) throw new Error('app must load registry manifest dynamically');
if (!app.includes('manifest.files.map')) throw new Error('app must load feature datasets from manifest.files');
if (app.includes("const featurePaths=['data/verified_1_10.json'")) throw new Error('hard-coded feature dataset list must not return');
for (const requiredSymbol of ['buildDynamicRiskTwin','compareConventionalAndTwinRoutes','recommendTwinSignalPlan','planTwinEmergencyDispatch','buildTwinDecisionBundle','buildPreventiveCommandPlan','orchestratePredictiveRisk','runPredictiveOrchestration']) {
  if (!app.includes(requiredSymbol)) throw new Error(`MVP symbol is not wired: ${requiredSymbol}`);
}
for (const requiredEngineSymbol of ['forecastRiskPropagation','projectNetworkRiskState','defaultOrchestrationCandidates','evaluateOrchestrationCandidate','orchestratePredictiveRisk']) {
  if (!predictiveEngine.includes(requiredEngineSymbol)) throw new Error(`predictive engine symbol missing: ${requiredEngineSymbol}`);
}
for (const requiredEngineSymbol of ['evaluatePolicyGuardrails','explainOrchestration','buildScenarioReplay','runOrchestrationSensitivity','buildExplainablePolicyOrchestration']) {
  if (!explainableEngine.includes(requiredEngineSymbol)) throw new Error(`explainable engine symbol missing: ${requiredEngineSymbol}`);
}
if (!html.includes('MVP v1.8') || !html.includes('Policy Guardrails') || !html.includes('Scenario Replay')) throw new Error('static MVP v1.8 identity missing');
if (!app.includes('horizons:[5,15,30,60]')) throw new Error('5/15/30/60 predictive horizons are not wired');
if (!app.includes('autoApply=false') || !app.includes('humanApprovalRequired=true')) throw new Error('predictive orchestration safety boundary missing');
if (!v18Runtime.includes('causalClaim=false') || !v18Runtime.includes('autoApply=false') || !v18Runtime.includes('humanApprovalRequired=true')) throw new Error('v1.8 explainability safety boundary missing');

const requiredIds = [
  'network','networkLoad','predictedDelay','activeIncidents','featureCount','timeline','engineeringOutput',
  'twinDecisionBtn','twinAvgRisk','twinMaxRisk','twinCritical','twinRising','twinQcsCoverage','twinDecisionResult','twinRiskRows',
  'routeOrigin','routeDestination','routeBtn','routeResult','riskWeight','riskRouteBtn','riskRouteResult','riskTimeDelta','riskScoreDelta','riskRouteMaxRisk','riskCommandCount','riskCommandResult','riskCommandRows',
  'incidentEdge','incidentBtn','resetNetworkBtn','scenarioSelect','scenarioBtn','scenarioResult','stressIndex','applyInterventionBtn','forecastHorizon','forecastBtn','forecastResult',
  'emergencyTarget','dispatchBtn','dispatchResult','beforeStress','afterStress','stressDelta','beforeLoad','afterLoad','loadDelta',
  'beforeTime','afterTime','timeDelta','beforeCritical','afterCritical','criticalDelta','comparisonNote',
  'qcsRiskBtn','qcsRiskScore','qcsRiskEdge','qcsTargetSpeed','qcsBroadcasts','qcsRiskResult','qcsRiskRows',
  'coverageRows','coverageSearch','coverageStatus','coverageTotal','coverageImplemented','coverageRepresented','coverageCatalogued','coverageProduction',
  'registryBadge','registryStats','exportSnapshotBtn','exportCoverageBtn','featureRows','search','groupFilter','categoryFilter','langBtn','pauseBtn','optimizeBtn'
];
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) throw new Error(`missing required DOM id: ${id}`);
  if (!app.includes(`'${id}'`) && !app.includes(`"${id}"`)) throw new Error(`app.js does not reference required DOM id: ${id}`);
}

const predictiveIds = ['predictiveOrchestrationPanel','predictiveBtn','predictiveSelected','predictiveImprovement','predictiveWorst','predictiveHotspots','predictiveResult','predictiveForecastRows','predictiveCandidateRows'];
for (const id of predictiveIds) {
  if (!app.includes(`id="${id}"`) && !app.includes(`'${id}'`) && !app.includes(`"${id}"`)) throw new Error(`runtime predictive DOM id missing: ${id}`);
}

const v18Ids = ['explainableOrchestrationPanel','explainableBtn','policyStatus','policySelected','explainScore','replayImprovement','explainableResult','explanationRows','policyRows','replayRows','sensitivityRows'];
for (const id of v18Ids) {
  if (!v18Runtime.includes(`id="${id}"`) && !v18Runtime.includes(`'${id}'`) && !v18Runtime.includes(`"${id}"`)) throw new Error(`runtime v1.8 DOM id missing: ${id}`);
}

if (policy.simulationOnly !== true || policy.autoApplyAllowed !== false || policy.requireHumanApproval !== true || policy.productionControlAllowed !== false) throw new Error('orchestration policy safety boundary invalid');
if (Number(policy.maxLoadReduction) > 20 || Number(policy.maxIncidentRelief) > 0.5) throw new Error('demo policy limits unexpectedly permissive');
if (network.nodes.length !== 12) throw new Error(`expected 12 demo nodes, got ${network.nodes.length}`);
if (network.edges.length !== 17) throw new Error(`expected 17 demo edges, got ${network.edges.length}`);
if (scenarios.length < 5 || !scenarios.some(s=>s.id==='multi' && s.incidents?.length>=2)) throw new Error('multi-incident scenario missing');
if (fleet.length < 3 || !fleet.every(unit=>unit.currentNode && unit.status)) throw new Error('emergency fleet fixture invalid');
if (qcsObservations.length < 5 || !qcsObservations.every(row=>row.edgeId && Number.isFinite(row.vehicleSpeedKph))) throw new Error('QCS observation fixture invalid');

console.log(`Static smoke check passed: ${new Set(requiredFiles).size} files, ${requiredIds.length} static DOM bindings + ${predictiveIds.length} predictive + ${v18Ids.length} explainability/policy/replay bindings, ${network.nodes.length} nodes, ${network.edges.length} edges, ${scenarios.length} scenarios, ${fleet.length} fleet units, ${qcsObservations.length} QCS observations, v1.8 explainable orchestration wired.`);
