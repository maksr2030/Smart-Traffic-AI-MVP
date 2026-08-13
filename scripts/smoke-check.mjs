import { access, readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('data/features.json','utf8'));
const manifestFiles = manifest.files.map(name => `data/${name}`);
const requiredFiles = [
  'index.html','styles.css','app.js','engine/trafficEngine.js','engine/operationsEngine.js','engine/qcsRiskEngine.js',
  'engine/riskAwareRoutingEngine.js','engine/preventiveCommandEngine.js','engine/dynamicRiskTwinEngine.js','coverage/coverageModel.js',
  'data/network.json','data/operations_scenarios.json','data/emergency_fleet.json','data/qcs_demo_observations.json','data/features.json',
  ...manifestFiles
];
for (const file of new Set(requiredFiles)) await access(file);

const html = await readFile('index.html','utf8');
const app = await readFile('app.js','utf8');
const network = JSON.parse(await readFile('data/network.json','utf8'));
const scenarios = JSON.parse(await readFile('data/operations_scenarios.json','utf8'));
const fleet = JSON.parse(await readFile('data/emergency_fleet.json','utf8'));
const qcsObservations = JSON.parse(await readFile('data/qcs_demo_observations.json','utf8'));

if (!html.includes('type="module" src="app.js"')) throw new Error('index.html must load app.js as an ES module');
if (!html.includes('href="styles.css"')) throw new Error('styles.css is not linked');
for (const modulePath of ['./engine/operationsEngine.js','./engine/qcsRiskEngine.js','./engine/preventiveCommandEngine.js','./engine/dynamicRiskTwinEngine.js','./coverage/coverageModel.js']) {
  if (!app.includes(`'${modulePath}'`)) throw new Error(`app does not import ${modulePath}`);
}
if (!app.includes("fetch('data/features.json')")) throw new Error('app must load registry manifest dynamically');
if (!app.includes('manifest.files.map')) throw new Error('app must load feature datasets from manifest.files');
if (app.includes("const featurePaths=['data/verified_1_10.json'")) throw new Error('hard-coded feature dataset list must not return');
for (const requiredSymbol of ['buildDynamicRiskTwin','compareConventionalAndTwinRoutes','recommendTwinSignalPlan','planTwinEmergencyDispatch','buildTwinDecisionBundle','buildPreventiveCommandPlan']) {
  if (!app.includes(requiredSymbol)) throw new Error(`dynamic twin symbol is not wired: ${requiredSymbol}`);
}
if (!html.includes('MVP v1.6') || !html.includes('Dynamic Risk Digital Twin')) throw new Error('MVP v1.6 dynamic twin identity missing');

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

if (network.nodes.length !== 12) throw new Error(`expected 12 demo nodes, got ${network.nodes.length}`);
if (network.edges.length !== 17) throw new Error(`expected 17 demo edges, got ${network.edges.length}`);
if (scenarios.length < 5 || !scenarios.some(s=>s.id==='multi' && s.incidents?.length>=2)) throw new Error('multi-incident scenario missing');
if (fleet.length < 3 || !fleet.every(unit=>unit.currentNode && unit.status)) throw new Error('emergency fleet fixture invalid');
if (qcsObservations.length < 5 || !qcsObservations.every(row=>row.edgeId && Number.isFinite(row.vehicleSpeedKph))) throw new Error('QCS observation fixture invalid');

console.log(`Static smoke check passed: ${new Set(requiredFiles).size} files, ${requiredIds.length} DOM bindings, ${network.nodes.length} nodes, ${network.edges.length} edges, ${scenarios.length} scenarios, ${fleet.length} fleet units, ${qcsObservations.length} QCS observations, Dynamic Risk Digital Twin wired.`);
