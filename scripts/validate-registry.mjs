import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildCoverage, coverageSummary } from '../coverage/coverageModel.js';

const manifest = JSON.parse(await readFile('data/features.json','utf8'));
const files = manifest.files.map(name => `data/${name}`);
const datasets = await Promise.all(files.map(async file => JSON.parse(await readFile(file,'utf8'))));
const groups = datasets.flat();

if (groups.length !== manifest.total) throw new Error(`registry count mismatch: ${groups.length} != ${manifest.total}`);

const ids = new Set();
for (const feature of groups) {
  if (!feature.id || !feature.group || !feature.title_ar || !feature.title_en || !feature.source) {
    throw new Error(`incomplete feature record: ${JSON.stringify(feature)}`);
  }
  if (ids.has(feature.id)) throw new Error(`duplicate canonical/source id: ${feature.id}`);
  ids.add(feature.id);
  if (feature.group === 'verified_historical') {
    const n = Number(feature.legacy_id);
    const allowed = (n >= 1 && n <= 10) || (n >= 200 && n <= 237);
    if (!allowed) throw new Error(`unverified historical id entered verified group: ${feature.id}`);
  }
}

const actual = {};
for (const feature of groups) actual[feature.group] = (actual[feature.group] || 0) + 1;
for (const [group,count] of Object.entries(manifest.groups)) {
  if (actual[group] !== count) throw new Error(`group count mismatch for ${group}: ${actual[group]} != ${count}`);
}

const evidenceRegisterPath = 'evidence/EVIDENCE_REGISTER.json';
const evidenceRegister = JSON.parse(await readFile(evidenceRegisterPath,'utf8'));
if (evidenceRegister.registry_total !== manifest.total) {
  throw new Error(`evidence register count mismatch: ${evidenceRegister.registry_total} != ${manifest.total}`);
}
if (!Array.isArray(evidenceRegister.evidence_items) || !evidenceRegister.evidence_items.length) {
  throw new Error('evidence register must contain at least one archived evidence item');
}

const evidenceIds = new Set();
let evidenceCoveredRecords = 0;
for (const item of evidenceRegister.evidence_items) {
  if (!item.evidence_id || !item.path || !item.sha256 || !Array.isArray(item.covers)) {
    throw new Error(`incomplete evidence item: ${JSON.stringify(item)}`);
  }
  if (evidenceIds.has(item.evidence_id)) throw new Error(`duplicate evidence id: ${item.evidence_id}`);
  evidenceIds.add(item.evidence_id);

  const artifact = await readFile(item.path);
  const digest = createHash('sha256').update(artifact).digest('hex');
  if (digest !== item.sha256) throw new Error(`source artifact hash mismatch for ${item.evidence_id}: ${digest}`);

  if (item.mapping_document) await readFile(item.mapping_document,'utf8');
  const covered = new Set();
  for (const id of item.covers) {
    if (covered.has(id)) throw new Error(`duplicate covered record ${id} in ${item.evidence_id}`);
    covered.add(id);
    if (!ids.has(id)) throw new Error(`evidence ${item.evidence_id} references missing registry record: ${id}`);
  }
  evidenceCoveredRecords += covered.size;
  if (Number(item.count_effect ?? 0) !== 0 && item.status === 'verified_archived_source') {
    throw new Error(`archived evidence ${item.evidence_id} cannot alter registry count without explicit registry review`);
  }
}

const locatedSources = evidenceRegister.located_sources ?? [];
const locatedSourceIds = new Set();
let locatedLinks = 0;
for (const source of locatedSources) {
  if (!source.source_id || !source.library_file_id || !source.title || !Array.isArray(source.covers) || !source.covers.length) {
    throw new Error(`incomplete located source: ${JSON.stringify(source)}`);
  }
  if (locatedSourceIds.has(source.source_id)) throw new Error(`duplicate located source id: ${source.source_id}`);
  locatedSourceIds.add(source.source_id);
  if (source.status !== 'located_library_source_not_byte_archived') {
    throw new Error(`unexpected located source status: ${source.source_id}`);
  }
  if (Number(source.count_effect ?? 0) !== 0) {
    throw new Error(`located source ${source.source_id} cannot alter registry count`);
  }
  const covered = new Set();
  for (const id of source.covers) {
    if (covered.has(id)) throw new Error(`duplicate located-source mapping ${id} in ${source.source_id}`);
    covered.add(id);
    if (!ids.has(String(id))) throw new Error(`located source ${source.source_id} references missing registry record: ${id}`);
  }
  locatedLinks += covered.size;
}

const expectedInitialIds = Array.from({length:10}, (_,i) => String(i + 1));
for (const sourceId of ['LOC-TRAFFIC-AR-001','LOC-TRAFFIC-EN-001']) {
  const source = locatedSources.find(item => item.source_id === sourceId);
  if (!source || expectedInitialIds.some(id => !source.covers.map(String).includes(id))) {
    throw new Error(`${sourceId} must map the complete historical 1-10 block`);
  }
}

const reserved = evidenceRegister.historical_recovery?.reserved_ranges ?? [];
if (!reserved.some(range => range.from === 11 && range.to === 199 && range.status === 'open_pending_original_evidence')) {
  throw new Error('historical recovery register must preserve open reserved range 11-199');
}

const qtos = groups.filter(feature => feature.group === 'qtos');
if (qtos.length !== 25) throw new Error(`QTOS evidence mapping expects 25 records, got ${qtos.length}`);
const expectedQtosIds = Array.from({length:25}, (_,i) => `QTOS-${String(i + 1).padStart(2,'0')}`);
for (const expectedId of expectedQtosIds) {
  if (!qtos.some(feature => feature.id === expectedId)) throw new Error(`missing QTOS evidence-linked record: ${expectedId}`);
}
if (qtos.some(feature => feature.source !== 'QTOS Additional Features Bilingual Standard')) {
  throw new Error('QTOS source provenance drift detected');
}
const qtosEvidence = evidenceRegister.evidence_items.find(item => item.evidence_id === 'SRC-QTOS-001');
if (!qtosEvidence || expectedQtosIds.some(id => !qtosEvidence.covers.includes(id))) {
  throw new Error('central evidence register must map SRC-QTOS-001 to all QTOS-01 through QTOS-25 records');
}

const coverage = buildCoverage(groups);
const coverageStats = coverageSummary(coverage);
if (coverage.length !== groups.length) throw new Error('coverage matrix must contain exactly one row per registry record');
if (coverageStats.production_verified !== 0) throw new Error('production verification cannot be asserted without separate evidence');
for (const row of coverage) {
  if (!['implemented_demo','represented_demo','catalogued_only'].includes(row.status)) throw new Error(`invalid coverage status: ${row.id}`);
}

console.log(`Registry valid: ${groups.length} records, ${ids.size} unique IDs.`);
console.log(`Archived evidence valid: ${evidenceRegister.evidence_items.length} source(s), ${evidenceCoveredRecords} linked registry record(s).`);
console.log(`Located library sources valid: ${locatedSources.length} source(s), ${locatedLinks} source-to-registry links; byte-identical archival not claimed.`);
console.log(`QTOS source evidence valid: ${qtos.length} linked records through SRC-QTOS-001.`);
console.log(`Coverage valid: ${coverageStats.implemented_demo} implemented demo, ${coverageStats.represented_demo} represented demo, ${coverageStats.catalogued_only} catalogued only, ${coverageStats.production_verified} production verified.`);
console.log(`Reserved historical gap preserved: ${manifest.historical_gap}`);
