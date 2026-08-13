import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDynamicRiskTwin,
  buildTwinDecisionBundle,
  compareConventionalAndTwinRoutes,
  planTwinEmergencyDispatch,
  recommendTwinSignalPlan,
  routeWithDynamicRiskTwin
} from '../engine/dynamicRiskTwinEngine.js';

const network = {
  nodes:[{id:'A'},{id:'B'},{id:'C'},{id:'D'}],
  edges:[
    {id:'AB',from:'A',to:'B',distanceKm:1,speedLimitKph:60,load:25,incidentSeverity:0,directed:false},
    {id:'BD',from:'B',to:'D',distanceKm:1,speedLimitKph:60,load:25,incidentSeverity:0,directed:false},
    {id:'AC',from:'A',to:'C',distanceKm:1.3,speedLimitKph:60,load:35,incidentSeverity:0,directed:false},
    {id:'CD',from:'C',to:'D',distanceKm:1.3,speedLimitKph:60,load:35,incidentSeverity:0,directed:false}
  ]
};

const qcs = [
  {edgeId:'AB',roadQuality:.2,roughness:.9,visibility:.25,weatherSeverity:.85,blindSpotRisk:.8,curvatureRisk:.75,friction:.3,hiddenHazardConfidence:.8,vehicleSpeedKph:95},
  {edgeId:'BD',roadQuality:.3,roughness:.8,visibility:.3,weatherSeverity:.75,blindSpotRisk:.7,curvatureRisk:.7,friction:.35,hiddenHazardConfidence:.75,vehicleSpeedKph:90},
  {edgeId:'AC',roadQuality:.9,roughness:.1,visibility:.95,weatherSeverity:.05,blindSpotRisk:.05,curvatureRisk:.05,friction:.95,hiddenHazardConfidence:.05,vehicleSpeedKph:55},
  {edgeId:'CD',roadQuality:.9,roughness:.1,visibility:.95,weatherSeverity:.05,blindSpotRisk:.05,curvatureRisk:.05,friction:.95,hiddenHazardConfidence:.05,vehicleSpeedKph:55}
];

test('dynamic twin fuses load, incidents and QCS proxy risk', () => {
  const twin = buildDynamicRiskTwin(network,qcs,{tick:1});
  assert.equal(twin.edges.length,4);
  assert.equal(twin.summary.qcsObservedEdges,4);
  assert.ok(twin.edges.find(e=>e.edgeId==='AB').score > twin.edges.find(e=>e.edgeId==='AC').score);
  assert.equal(twin.simulation,true);
});

test('dynamic twin records risk trend from previous state', () => {
  const first = buildDynamicRiskTwin(network,qcs,{tick:1});
  const stressed = structuredClone(network);
  stressed.edges.find(e=>e.id==='AC').load = 95;
  stressed.edges.find(e=>e.id==='AC').incidentSeverity = .8;
  const second = buildDynamicRiskTwin(stressed,qcs,{tick:2,previousTwin:first});
  const edge = second.edges.find(e=>e.edgeId==='AC');
  assert.equal(edge.trend,'rising');
  assert.ok(edge.delta >= 5);
});

test('twin-aware route may select longer lower-risk path', () => {
  const twin = buildDynamicRiskTwin(network,qcs);
  const result = compareConventionalAndTwinRoutes(network,twin,'A','D',{riskWeight:3});
  assert.deepEqual(result.conventional.edgeIds,['AB','BD']);
  assert.deepEqual(result.twinRoute.edgeIds,['AC','CD']);
  assert.ok(result.twinRoute.minutes > result.conventional.minutes);
  assert.ok(result.twinRoute.averageTwinRisk < result.conventional.averageTwinRisk);
});

test('signal plan is derived from twin risk-weighted load', () => {
  const stressed = structuredClone(network);
  stressed.edges.find(e=>e.id==='AB').load = 90;
  const twin = buildDynamicRiskTwin(stressed,qcs);
  const plan = recommendTwinSignalPlan(stressed,twin,{topCount:3});
  assert.equal(plan.simulation,true);
  assert.equal(plan.selectedEdges.length,3);
  assert.ok(plan.phases.length >= 2);
  assert.ok(plan.selectedEdges.some(e=>e.id==='AB'));
});

test('emergency dispatch evaluates the same dynamic twin risk state', () => {
  const twin = buildDynamicRiskTwin(network,qcs);
  const fleet = [
    {id:'U1',type:'ambulance',currentNode:'A',status:'available'},
    {id:'U2',type:'ambulance',currentNode:'C',status:'available'}
  ];
  const dispatch = planTwinEmergencyDispatch(network,fleet,'D',twin,{riskWeight:2});
  assert.equal(dispatch.simulation,true);
  assert.equal(dispatch.selected.unit.id,'U2');
  assert.deepEqual(dispatch.selected.route.edgeIds,['CD']);
});

test('decision bundle shares one twin across route, signals and emergency', () => {
  const twin = buildDynamicRiskTwin(network,qcs);
  const fleet = [{id:'U2',type:'ambulance',currentNode:'C',status:'available'}];
  const bundle = buildTwinDecisionBundle(network,twin,fleet,'A','D','D',{routeRiskWeight:2.5});
  assert.equal(bundle.simulation,true);
  assert.equal(bundle.route.twinRoute.simulation,true);
  assert.equal(bundle.signals.simulation,true);
  assert.equal(bundle.emergency.simulation,true);
});

test('closed edges remain unavailable to twin-aware routing', () => {
  const closed = structuredClone(network);
  closed.edges.find(e=>e.id==='AC').closed = true;
  const twin = buildDynamicRiskTwin(closed,qcs);
  const route = routeWithDynamicRiskTwin(closed,twin,'A','D',{riskWeight:3});
  assert.ok(!route.edgeIds.includes('AC'));
});
