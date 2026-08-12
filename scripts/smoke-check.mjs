import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'index.html','styles.css','app.js','engine/trafficEngine.js','engine/operationsEngine.js','coverage/coverageModel.js',
  'data/network.json','data/operations_scenarios.json','data/emergency_fleet.json','data/features.json',
  'data/verified_1_10.json','data/verified_200_237.json','data/conversation_recovered.json','data/additional_history.json','data/qtos.json'
];
for (const file of requiredFiles) await access(file);

const html = await readFile('index.html','utf8');
const app = await readFile('app.js','utf8');
const network = JSON.parse(await readFile('data/network.json','utf8'));
const scenarios = JSON.parse(await readFile('data/operations_scenarios.json','utf8'));
const fleet = JSON.parse(await readFile('data/emergency_fleet.json','utf8'));

if (!html.includes('type="module" src="app.js"')) throw new Error('index.html must load app.js as an ES module');
if (!html.includes('href="styles.css"')) throw new Error('styles.css is not linked');
if (!app.includes("'./engine/operationsEngine.js'")) throw new Error('operations engine is not imported');
if (!app.includes("'./coverage/coverageModel.js'")) throw new Error('coverage model is not imported');

const requiredIds = [
  'network','networkLoad','predictedDelay','activeIncidents','featureCount','timeline','engineeringOutput',
  'routeOrigin','routeDestination','routeBtn','routeResult','incidentEdge','incidentBtn','resetNetworkBtn',
  'scenarioSelect','scenarioBtn','scenarioResult','stressIndex','applyInterventionBtn','forecastHorizon','forecastBtn','forecastResult',
  'emergencyTarget','dispatchBtn','dispatchResult','beforeStress','afterStress','stressDelta','beforeLoad','afterLoad','loadDelta',
  'beforeTime','afterTime','timeDelta','beforeCritical','afterCritical','criticalDelta','comparisonNote',
  'coverageRows','coverageSearch','coverageStatus','coverageTotal','coverageImplemented','coverageRepresented','coverageCatalogued','coverageProduction',
  'exportSnapshotBtn','exportCoverageBtn','featureRows','search','groupFilter','categoryFilter','langBtn','pauseBtn','optimizeBtn'
];
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) throw new Error(`missing required DOM id: ${id}`);
  if (!app.includes(`'${id}'`) && !app.includes(`"${id}"`)) throw new Error(`app.js does not reference required DOM id: ${id}`);
}

if (network.nodes.length !== 12) throw new Error(`expected 12 demo nodes, got ${network.nodes.length}`);
if (network.edges.length !== 17) throw new Error(`expected 17 demo edges, got ${network.edges.length}`);
if (scenarios.length < 5 || !scenarios.some(s=>s.id==='multi' && s.incidents?.length>=2)) throw new Error('multi-incident scenario missing');
if (fleet.length < 3 || !fleet.every(unit=>unit.currentNode && unit.status)) throw new Error('emergency fleet fixture invalid');

console.log(`Static smoke check passed: ${requiredFiles.length} files, ${requiredIds.length} DOM bindings, ${network.nodes.length} nodes, ${network.edges.length} edges, ${scenarios.length} scenarios, ${fleet.length} fleet units.`);
