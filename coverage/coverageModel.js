const IMPLEMENTED = new Set([
  '1','2','7','10','200','201','203','209','211','213','217','218','228',
  'CR-14','CR-16','CR-18','CR-22',
  'QTOS-03','QTOS-04','QTOS-08','QTOS-15','QTOS-17','QTOS-21','QTOS-22',
  'QCS-80','QCS-85','QCS-86','QCS-87','QCS-88','QCS-92'
]);

const REPRESENTED = new Set([
  '4','5','6','202','215','232','CR-05','CR-15','CR-17',
  'QTOS-02','QTOS-05','QTOS-18','QTOS-23','QTOS-25',
  'QCS-93','QCS-94','QCS-95','QCS-101','QCS-103','QCS-104'
]);

const MODULES = new Map([
  ['1','forecast'],['2','routing'],['7','analytics-export'],['10','signals'],['200','signals'],['201','emergency-dispatch'],
  ['203','routing'],['209','signals'],['211','multi-incident'],['213','network-metrics'],['217','routing'],['218','signals'],['228','emergency-dispatch'],
  ['CR-14','network-metrics'],['CR-16','operations-engine'],['CR-18','digital-state'],['CR-22','analytics-export'],
  ['QTOS-03','forecast'],['QTOS-04','routing'],['QTOS-08','signals'],['QTOS-15','multi-incident'],['QTOS-17','graph-engine'],['QTOS-21','operations-engine'],['QTOS-22','scenario-engine'],
  ['4','signals-simulation'],['5','decision-log'],['6','weather-scenario'],['202','priority-routing'],['215','critical-area-scenario'],['232','weather-scenario'],
  ['CR-05','incident-input'],['CR-15','scenario-analysis'],['CR-17','connected-vehicle-design'],['QTOS-02','digital-twin-ui'],['QTOS-05','scenario-optimizer'],
  ['QTOS-18','classical-baseline-only'],['QTOS-23','scenario-analysis'],['QTOS-25','deployment-design'],
  ['QCS-80','qcs-risk-response'],['QCS-85','qcs-risk-response'],['QCS-86','qcs-risk-response'],['QCS-87','qcs-risk-response'],['QCS-88','qcs-risk-response'],['QCS-92','qcs-risk-response'],
  ['QCS-93','v2x-proxy-broadcast'],['QCS-94','hidden-hazard-input'],['QCS-95','adaptive-response-recommendation'],['QCS-101','deterministic-risk-proxy'],['QCS-103','weather-response-proxy'],['QCS-104','network-integration-design']
]);

export function capabilityStatus(id) {
  if (IMPLEMENTED.has(String(id))) return 'implemented_demo';
  if (REPRESENTED.has(String(id))) return 'represented_demo';
  return 'catalogued_only';
}

export function buildCoverage(features = []) {
  return features.map(feature => ({
    id: String(feature.id),
    title_ar: feature.title_ar,
    title_en: feature.title_en,
    group: feature.group,
    status: capabilityStatus(feature.id),
    module: MODULES.get(String(feature.id)) ?? null,
    production_verified: false
  }));
}

export function coverageSummary(rows = []) {
  const summary = { total: rows.length, implemented_demo: 0, represented_demo: 0, catalogued_only: 0, production_verified: 0 };
  rows.forEach(row => {
    if (row.status in summary) summary[row.status] += 1;
    if (row.production_verified) summary.production_verified += 1;
  });
  return summary;
}

export function coverageToCsv(rows = []) {
  const esc = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const header = ['id','title_ar','title_en','group','status','module','production_verified'];
  return [header.join(','), ...rows.map(row => header.map(key => esc(row[key])).join(','))].join('\n');
}
