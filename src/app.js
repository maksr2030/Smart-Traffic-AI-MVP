import { SAMPLE_DATA, DATA_CLASSIFICATION } from './data.js';
import {
  congestionScore,
  congestionClass,
  routeCost,
  driverRisk,
  signalPlan,
  infrastructurePriority,
  weatherRisk,
  evaluateSnapshot
} from './traffic-engine.js';

let state = structuredClone(SAMPLE_DATA);
let language = 'ar';

const $ = (id) => document.getElementById(id);
const roadName = (road) => language === 'en' ? road.en : road.ar;
const intersectionName = (intersection) => language === 'en' ? intersection.en : intersection.ar;
const text = (ar, en) => language === 'en' ? en : ar;

function setLanguage(next) {
  language = next;
  const root = document.documentElement;
  root.classList.toggle('lang-en', next === 'en');
  root.lang = next;
  root.dir = next === 'en' ? 'ltr' : 'rtl';
  $('arButton').classList.toggle('active', next === 'ar');
  $('enButton').classList.toggle('active', next === 'en');
  render();
}

function weatherLabel(weather) {
  const labels = {
    clear: ['مستقر', 'Clear'],
    rain: ['أمطار', 'Rain'],
    fog: ['ضباب', 'Fog'],
    storm: ['عاصفة', 'Storm']
  };
  return labels[weather]?.[language === 'en' ? 1 : 0] ?? weather;
}

function statusMarkup(road) {
  const stateClass = congestionClass(road);
  const label = stateClass === 'high'
    ? text('مرتفع', 'High')
    : stateClass === 'medium'
      ? text('متوسط', 'Medium')
      : text('مستقر', 'Stable');
  return `<span class="status ${stateClass}">${label}</span>`;
}

function renderRoadTable() {
  $('roadTable').innerHTML = state.roads.map((road) => `
    <tr>
      <td>${roadName(road)}</td>
      <td>${road.density}%</td>
      <td>${road.speed} km/h</td>
      <td>${weatherLabel(road.weather)}</td>
      <td>${road.incident ? text('نعم', 'Yes') : text('لا', 'No')}</td>
      <td>${statusMarkup(road)} ${congestionScore(road)}/100</td>
    </tr>`).join('');
}

function card(number, titleAr, titleEn, descriptionAr, descriptionEn, output) {
  return `<article class="feature-card">
    <h3>${String(number).padStart(2, '0')}. ${text(titleAr, titleEn)}</h3>
    <p>${text(descriptionAr, descriptionEn)}</p>
    <pre>${output}</pre>
  </article>`;
}

function renderFeatures(snapshot) {
  const best = snapshot.safeRoute;
  const riskyDrivers = snapshot.riskyDrivers.map((driver) => `${driver.id}: ${driverRisk(driver)}/100`).join('\n') || text('لا توجد مخاطر مرتفعة', 'No high-risk drivers');
  const signalIntegration = state.intersections.map((intersection) => `${intersectionName(intersection)}: ${signalPlan(intersection).adaptive ? text('تكيّف مطلوب', 'Adaptation required') : text('اعتيادي', 'Standard')}`).join('\n');
  const incidentLines = snapshot.events.map((event) => `${event.roadId}: ${text('حادث محاكى', 'Simulated incident')} | ${event.severity}`).join('\n') || text('لا توجد حوادث', 'No incidents');
  const safeRouteLine = best ? `${roadName(best)} | cost=${routeCost(best)}` : text('لا يوجد مسار آمن', 'No safe route available');
  const infraLines = snapshot.infrastructureRanking.map((road, index) => `${index + 1}. ${roadName(road)}: ${infrastructurePriority(road)}/100`).join('\n');
  const weatherLines = snapshot.climateAlerts.map((item) => {
    const road = state.roads.find((candidate) => candidate.id === item.roadId);
    return `${roadName(road)}: ${weatherLabel(item.weather)} | ${item.risk}/100`;
  }).join('\n') || text('لا توجد مخاطر مناخية', 'No weather risks');
  const avLines = snapshot.autonomousRecommendations.map((item) => `${item.vehicleId}: ${item.action} -> ${item.roadId ?? '-'} (${item.reason})`).join('\n');
  const signalLines = snapshot.signalPlans.map((item) => {
    const intersection = state.intersections.find((candidate) => candidate.id === item.id);
    return `${intersectionName(intersection)}: ${item.greenSeconds}s`;
  }).join('\n');

  const cards = [
    card(1, 'التنبؤ بالازدحام', 'Congestion prediction', 'حساب درجة ضغط مروري قابلة للتتبع.', 'Traceable congestion scoring.', snapshot.congestedRoads.map((road) => `${roadName(road)}: ${congestionScore(road)}/100`).join('\n') || text('لا يوجد ازدحام مرتفع', 'No high congestion')),
    card(2, 'التوجيه البديل', 'Alternate routing', 'اختيار أفضل مسار غير متأثر بحادث أو خطر مناخي مرتفع.', 'Selects the lowest-cost route without an incident or excessive weather risk.', safeRouteLine),
    card(3, 'تحليل سلوك السائق', 'Driver behavior analysis', 'تقييم خطر السرعة والكبح المفاجئ.', 'Scores overspeeding and hard-braking behavior.', riskyDrivers),
    card(4, 'تكامل الإشارات الذكية', 'Smart-signal integration', 'تحديد التقاطعات التي تحتاج توقيتاً تكيفياً.', 'Identifies intersections requiring adaptive timing.', signalIntegration),
    card(5, 'تنبيهات الحوادث', 'Traffic-event alerts', 'كشف أحداث الطرق المسجلة في لقطة البيانات.', 'Detects road events present in the current snapshot.', incidentLines),
    card(6, 'المسارات الآمنة مناخياً', 'Weather-safe routing', 'استبعاد المسارات ذات المخاطر المناخية المرتفعة.', 'Excludes routes with elevated weather risk.', safeRouteLine),
    card(7, 'تحليل البنية التحتية', 'Infrastructure analytics', 'ترتيب أولويات التدخل من ضغط الحركة والحوادث.', 'Ranks intervention priority from traffic pressure and incidents.', infraLines),
    card(8, 'التنبيه المناخي المروري', 'Traffic-weather alerts', 'ربط حالة الطقس بدرجة مخاطر مرورية.', 'Maps weather state to traffic-risk score.', weatherLines),
    card(9, 'دعم المركبات ذاتية القيادة', 'Autonomous-vehicle support', 'توصية استمرارية أو إعادة توجيه أو توقف.', 'Recommends continue, reroute, or hold.', avLines),
    card(10, 'الإشارات الديناميكية', 'Dynamic traffic signals', 'حساب مدة خضراء محاكاة ضمن حدود محددة.', 'Calculates a bounded simulated green phase.', signalLines)
  ];

  $('featureGrid').innerHTML = cards.join('');
}

function updateKpis(snapshot) {
  $('congestedKpi').textContent = snapshot.congestedRoads.length;
  $('safetyKpi').textContent = snapshot.riskyDrivers.length + snapshot.climateAlerts.length;
  $('incidentKpi').textContent = snapshot.events.length;
  $('signalKpi').textContent = snapshot.adaptiveSignals.length;
}

function logExecution(snapshot, reason = 'ENGINE_RUN') {
  const row = document.createElement('div');
  row.className = 'audit-row';
  row.textContent = `${new Date().toISOString()} | ${reason} | source=${DATA_CLASSIFICATION.source} | roads=${state.roads.length} | incidents=${snapshot.events.length} | congested=${snapshot.congestedRoads.length}`;
  $('auditLog').prepend(row);
}

function render(reason = 'ENGINE_RUN') {
  const snapshot = evaluateSnapshot(state);
  renderRoadTable();
  renderFeatures(snapshot);
  updateKpis(snapshot);
  logExecution(snapshot, reason);
}

function refreshSimulation() {
  const weatherOptions = ['clear', 'clear', 'rain', 'fog'];
  state.roads = state.roads.map((road) => ({
    ...road,
    density: Math.max(18, Math.min(96, road.density + Math.round((Math.random() - 0.5) * 24))),
    speed: Math.max(18, Math.min(92, road.speed + Math.round((Math.random() - 0.5) * 18))),
    weather: weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
    incident: Math.random() < 0.18
  }));
  state.intersections = state.intersections.map((intersection) => ({
    ...intersection,
    density: Math.max(20, Math.min(95, intersection.density + Math.round((Math.random() - 0.5) * 22)))
  }));
  render('SIMULATION_REFRESH');
}

$('arButton').addEventListener('click', () => setLanguage('ar'));
$('enButton').addEventListener('click', () => setLanguage('en'));
$('refreshButton').addEventListener('click', refreshSimulation);

setLanguage('ar');
