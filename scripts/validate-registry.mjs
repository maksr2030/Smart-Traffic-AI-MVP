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

const qtos = groups.filter(feature => feature.group === 'qtos');
if (qtos.length !== 25) throw new Error(`QTOS evidence mapping expects 25 records, got ${qtos.length}`);
const expectedQtosIds = Array.from({length:25}, (_,i) => `QTOS-${String(i + 1).padStart(2,'0')}`);
for (const expectedId of expectedQtosIds) {
  if (!qtos.some(feature => feature.id === expectedId)) throw new Error(`missing QTOS evidence-linked record: ${expectedId}`);
}
if (qtos.some(feature => feature.source !== 'QTOS Additional Features Bilingual Standard')) {
  throw new Error('QTOS source provenance drift detected');
}

const qtosArtifactPath = 'evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html';
const qtosEvidenceRegisterPath = 'evidence/QTOS_SOURCE_EVIDENCE.md';
const qtosArtifact = await readFile(qtosArtifactPath);
await readFile(qtosEvidenceRegisterPath, 'utf8');
const qtosArtifactSha256 = createHash('sha256').update(qtosArtifact).digest('hex');
const expectedQtosArtifactSha256 = 'a0e7bf1e78e2fb271012dbca722b4d03a2a9e957c0a19778353a23e680472d9f';
if (qtosArtifactSha256 !== expectedQtosArtifactSha256) {
  throw new Error(`QTOS source artifact hash mismatch: ${qtosArtifactSha256}`);
}

const coverage = buildCoverage(groups);
const coverageStats = coverageSummary(coverage);
if (coverage.length !== groups.length) throw new Error('coverage matrix must contain exactly one row per registry record');
if (coverageStats.production_verified !== 0) throw new Error('production verification cannot be asserted without separate evidence');
for (const row of coverage) {
  if (!['implemented_demo','represented_demo','catalogued_only'].includes(row.status)) throw new Error(`invalid coverage status: ${row.id}`);
}

console.log(`Registry valid: ${groups.length} records, ${ids.size} unique IDs.`);
console.log(`QTOS source evidence valid: ${qtos.length} linked records, SHA-256 ${qtosArtifactSha256}.`);
console.log(`Coverage valid: ${coverageStats.implemented_demo} implemented demo, ${coverageStats.represented_demo} represented demo, ${coverageStats.catalogued_only} catalogued only, ${coverageStats.production_verified} production verified.`);
console.log(`Reserved historical gap preserved: ${manifest.historical_gap}`);
