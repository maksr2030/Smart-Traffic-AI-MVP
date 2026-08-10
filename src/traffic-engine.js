const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function weatherRisk(weather) {
  return ({ clear: 0, rain: 35, fog: 55, storm: 85 }[weather] ?? 20);
}

export function congestionScore(road) {
  const densityTerm = road.density * 0.62;
  const speedTerm = Math.max(0, 70 - road.speed) * 0.42;
  const incidentTerm = road.incident ? 18 : 0;
  const weatherTerm = road.weather === 'storm' || road.weather === 'fog' ? 8 : road.weather === 'rain' ? 4 : 0;
  return Math.round(clamp(densityTerm + speedTerm + incidentTerm + weatherTerm));
}

export function congestionClass(road) {
  const score = congestionScore(road);
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

export function routeCost(road) {
  const weatherPenalty = ({ clear: 0, rain: 15, fog: 28, storm: 45 }[road.weather] ?? 10);
  return Math.round(road.density + weatherPenalty + (road.incident ? 60 : 0) + Math.max(0, 55 - road.speed));
}

export function bestRoute(roads, excludeId = null, options = {}) {
  const maxWeatherRisk = options.maxWeatherRisk ?? 100;
  const candidates = roads
    .filter((road) => road.id !== excludeId)
    .filter((road) => weatherRisk(road.weather) <= maxWeatherRisk)
    .filter((road) => !road.incident)
    .sort((a, b) => routeCost(a) - routeCost(b));
  return candidates[0] ?? null;
}

export function driverRisk(driver) {
  const speedRisk = driver.speed > 120 ? 50 : driver.speed > 100 ? 25 : 0;
  const brakeRisk = driver.hardBrakes > 5 ? 45 : driver.hardBrakes > 3 ? 20 : 0;
  return clamp(speedRisk + brakeRisk);
}

export function signalPlan(intersection) {
  const greenSeconds = clamp(Math.round(25 + intersection.density * 0.55), 25, 75);
  return {
    greenSeconds,
    adaptive: intersection.density >= 65,
    basis: 'SIMULATED_DENSITY_RULE'
  };
}

export function infrastructurePriority(road) {
  return Math.round(clamp(road.density * 0.65 + (100 - road.speed) * 0.2 + (road.incident ? 15 : 0)));
}

export function detectTrafficEvents(roads) {
  return roads.filter((road) => road.incident).map((road) => ({
    type: 'incident',
    roadId: road.id,
    severity: congestionScore(road) >= 75 ? 'high' : 'moderate'
  }));
}

export function weatherAlerts(roads) {
  return roads
    .map((road) => ({ roadId: road.id, risk: weatherRisk(road.weather), weather: road.weather }))
    .filter((item) => item.risk >= 35);
}

export function autonomousVehicleRecommendation(vehicle, roads) {
  const current = roads.find((road) => road.id === vehicle.road);
  if (!current) return { vehicleId: vehicle.id, action: 'hold', reason: 'unknown-road' };

  const unsafe = current.incident || congestionClass(current) === 'high' || weatherRisk(current.weather) >= 50;
  if (!unsafe) {
    return { vehicleId: vehicle.id, action: 'continue', roadId: current.id, reason: 'route-acceptable' };
  }

  const alternative = bestRoute(roads, current.id, { maxWeatherRisk: 49 });
  if (!alternative) return { vehicleId: vehicle.id, action: 'hold', roadId: current.id, reason: 'no-safe-alternative' };
  return { vehicleId: vehicle.id, action: 'reroute', roadId: alternative.id, reason: 'current-route-risk' };
}

export function evaluateSnapshot(data) {
  const congestedRoads = data.roads.filter((road) => congestionClass(road) === 'high');
  const riskyDrivers = data.drivers.filter((driver) => driverRisk(driver) >= 40);
  const adaptiveSignals = data.intersections.filter((intersection) => signalPlan(intersection).adaptive);
  const events = detectTrafficEvents(data.roads);
  const climateAlerts = weatherAlerts(data.roads);
  const safeRoute = bestRoute(data.roads, null, { maxWeatherRisk: 49 });
  const infrastructureRanking = [...data.roads].sort((a, b) => infrastructurePriority(b) - infrastructurePriority(a));
  const autonomousRecommendations = data.vehicles.map((vehicle) => autonomousVehicleRecommendation(vehicle, data.roads));

  return {
    congestedRoads,
    riskyDrivers,
    adaptiveSignals,
    events,
    climateAlerts,
    safeRoute,
    infrastructureRanking,
    autonomousRecommendations,
    signalPlans: data.intersections.map((intersection) => ({ id: intersection.id, ...signalPlan(intersection) }))
  };
}
