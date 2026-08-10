import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_DATA } from '../src/data.js';
import {
  weatherRisk,
  congestionScore,
  congestionClass,
  routeCost,
  bestRoute,
  driverRisk,
  signalPlan,
  infrastructurePriority,
  detectTrafficEvents,
  weatherAlerts,
  autonomousVehicleRecommendation,
  evaluateSnapshot
} from '../src/traffic-engine.js';

const data = structuredClone(SAMPLE_DATA);

test('F1 congestion prediction identifies a high-congestion road', () => {
  const road = { density: 90, speed: 20, incident: false, weather: 'clear' };
  assert.equal(congestionClass(road), 'high');
  assert.ok(congestionScore(road) >= 75);
});

test('F2 alternate routing chooses an eligible low-cost route', () => {
  const route = bestRoute(data.roads, null, { maxWeatherRisk: 49 });
  assert.equal(route.id, 'R3');
  assert.ok(Number.isFinite(routeCost(route)));
});

test('F3 driver behavior analysis flags high-risk behavior', () => {
  assert.ok(driverRisk({ speed: 130, hardBrakes: 1 }) >= 40);
  assert.ok(driverRisk({ speed: 80, hardBrakes: 1 }) < 40);
});

test('F4 smart-signal integration identifies adaptive intersections', () => {
  assert.equal(signalPlan({ density: 80 }).adaptive, true);
  assert.equal(signalPlan({ density: 40 }).adaptive, false);
});

test('F5 traffic-event alert engine detects incidents', () => {
  const events = detectTrafficEvents(data.roads);
  assert.equal(events.length, 1);
  assert.equal(events[0].roadId, 'R1');
});

test('F6 weather-safe routing excludes elevated weather risk', () => {
  const route = bestRoute(data.roads, 'R3', { maxWeatherRisk: 49 });
  assert.ok(route);
  assert.ok(weatherRisk(route.weather) <= 49);
  assert.equal(route.incident, false);
});

test('F7 infrastructure analytics returns bounded priority scores', () => {
  for (const road of data.roads) {
    const score = infrastructurePriority(road);
    assert.ok(score >= 0 && score <= 100);
  }
});

test('F8 weather alert risk is ordered by severity', () => {
  assert.ok(weatherRisk('storm') > weatherRisk('fog'));
  assert.ok(weatherRisk('fog') > weatherRisk('rain'));
  assert.ok(weatherAlerts(data.roads).length >= 1);
});

test('F9 autonomous-vehicle support returns a controlled recommendation', () => {
  const result = autonomousVehicleRecommendation(data.vehicles[0], data.roads);
  assert.ok(['continue', 'reroute', 'hold'].includes(result.action));
  assert.equal(result.vehicleId, 'AV-01');
});

test('F10 dynamic traffic-signal timing remains inside model bounds', () => {
  const low = signalPlan({ density: 0 });
  const high = signalPlan({ density: 100 });
  assert.ok(low.greenSeconds >= 25);
  assert.ok(high.greenSeconds <= 75);
});

test('integrated snapshot preserves all ten engine output groups', () => {
  const snapshot = evaluateSnapshot(data);
  for (const key of ['congestedRoads','riskyDrivers','adaptiveSignals','events','climateAlerts','safeRoute','infrastructureRanking','autonomousRecommendations','signalPlans']) {
    assert.ok(key in snapshot);
  }
});
